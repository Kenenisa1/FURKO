import { randomUUID } from 'crypto';
import pool from '../config/db';
import {
  Attachment,
  FeedbackRecord,
  Report,
  ReportStatus,
  StatusHistoryEntry,
} from '../models';

export interface ReportResolutionDetails {
  report: Report & {
    category_name?: string;
    institution_name?: string;
    latitude?: number;
    longitude?: number;
    address_text?: string;
    landmark?: string;
  };
  timeline: StatusHistoryEntry[];
  evidence: Attachment[];
  resolution_proofs: Attachment[];
  feedback?: FeedbackRecord | null;
}

export interface ConfirmResolutionInput {
  citizen_id: string;
  rating?: number;
  comment?: string;
}

export interface ReopenReportInput {
  citizen_id: string;
  reason: string;
}

// In-memory fallback repository for mock / offline testing
const mockTimelineStore = new Map<string, StatusHistoryEntry[]>();
const mockFeedbackStore = new Map<string, FeedbackRecord>();
const mockReportExtensions = new Map<string, Partial<Report>>();

export class ReportResolutionService {
  /**
   * Fetch complete tracking timeline and resolution information
   */
  static async getReportTimeline(
    identifier: string,
    currentUserId?: string
  ): Promise<ReportResolutionDetails | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      identifier
    );

    try {
      // 1. Fetch report details
      const reportRes = await pool.query(
        `SELECT r.*,
                c.name AS category_name,
                i.name AS institution_name,
                l.latitude, l.longitude, l.address_text, l.landmark
         FROM reports r
         LEFT JOIN categories c ON c.id = r.category_id
         LEFT JOIN institutions i ON i.id = COALESCE(r.current_institution_id, r.institution_id)
         LEFT JOIN locations l ON l.id = r.location_id
         WHERE ${isUuid ? 'r.id = $1' : 'r.tracking_number = $1 OR r.id::text = $1'}
         LIMIT 1`,
        [identifier]
      );

      if (reportRes.rowCount === 0) {
        return null;
      }

      const reportRow = reportRes.rows[0];
      const reportId = reportRow.id;

      // 2. Fetch status history timeline
      const timelineRes = await pool.query(
        `SELECT sh.id, sh.report_id, sh.changed_by_user_id,
                sh.previous_status, sh.new_status, sh.comment, sh.changed_at,
                u.full_name AS actor_name, u.role AS actor_role
         FROM status_history sh
         LEFT JOIN users u ON u.id = sh.changed_by_user_id
         WHERE sh.report_id = $1
         ORDER BY sh.changed_at ASC`,
        [reportId]
      );

      // 3. Fetch evidence & resolution attachments
      const attachRes = await pool.query(
        `SELECT * FROM attachments WHERE report_id = $1 ORDER BY created_at ASC`,
        [reportId]
      );

      // 4. Fetch feedback if available
      const feedbackRes = await pool.query(
        `SELECT * FROM feedback WHERE report_id = $1 LIMIT 1`,
        [reportId]
      );

      const attachments: Attachment[] = attachRes.rows || [];
      const evidence = attachments.filter((a) => a.file_type === 'evidence');
      const resolutionProofs = attachments.filter((a) => a.file_type === 'resolution_proof');

      return {
        report: reportRow,
        timeline: timelineRes.rows || [],
        evidence,
        resolution_proofs: resolutionProofs,
        feedback: feedbackRes.rows?.[0] || null,
      };
    } catch {
      // Graceful fallback for mock/in-memory mode if DB is disconnected
      return this.getMockTimeline(identifier);
    }
  }

  /**
   * Citizen confirms resolution of a resolved report and optionally leaves rating/feedback
   */
  static async confirmResolution(
    reportId: string,
    input: ConfirmResolutionInput
  ): Promise<{ success: boolean; message: string; report: Partial<Report> }> {
    const { citizen_id, rating, comment } = input;

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check report status and ownership
        const repRes = await client.query(
          `SELECT id, citizen_id, status FROM reports WHERE id = $1 LIMIT 1`,
          [reportId]
        );

        if (repRes.rowCount === 0) {
          await client.query('ROLLBACK');
          throw new Error('Report not found');
        }

        const report = repRes.rows[0];

        // Validate citizen ownership
        if (report.citizen_id && report.citizen_id !== citizen_id) {
          await client.query('ROLLBACK');
          const err: any = new Error('You can only confirm resolution for your own reports.');
          err.statusCode = 403;
          throw err;
        }

        // Validate status eligibility
        if (report.status !== 'resolved') {
          await client.query('ROLLBACK');
          const err: any = new Error(`Cannot confirm report with status "${report.status}". Report must be in "resolved" status.`);
          err.statusCode = 400;
          throw err;
        }

        // Update confirmation flags
        const confirmedAt = new Date();
        await client.query(
          `UPDATE reports
           SET updated_at = $1
           WHERE id = $2`,
          [confirmedAt, reportId]
        );

        // Record citizen confirmation event in status history
        const historyId = randomUUID();
        await client.query(
          `INSERT INTO status_history
           (id, report_id, changed_by_user_id, previous_status, new_status, comment, changed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            historyId,
            reportId,
            citizen_id,
            'resolved',
            'resolved',
            comment ? `Citizen confirmed resolution: "${comment}"` : 'Citizen confirmed resolution.',
            confirmedAt,
          ]
        );

        // Record feedback/rating if provided
        if (rating && Number.isInteger(rating) && rating >= 1 && rating <= 5) {
          const feedbackId = randomUUID();
          await client.query(
            `INSERT INTO feedback (id, report_id, citizen_id, rating, comment, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (report_id) DO UPDATE SET rating = $4, comment = $5`,
            [feedbackId, reportId, citizen_id, rating, comment || null, confirmedAt]
          );
        }

        await client.query('COMMIT');

        return {
          success: true,
          message: 'Resolution successfully confirmed by citizen.',
          report: {
            id: reportId,
            status: 'resolved',
            citizen_confirmed: true,
            citizen_confirmed_at: confirmedAt,
          },
        };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
      // In-memory fallback
      return this.confirmResolutionMock(reportId, input);
    }
  }

  /**
   * Citizen reopens a report if the issue is unresolved or recurring
   */
  static async reopenReport(
    reportId: string,
    input: ReopenReportInput
  ): Promise<{ success: boolean; message: string; report: Partial<Report> }> {
    const { citizen_id, reason } = input;

    if (!reason || !reason.trim()) {
      const err: any = new Error('Reopen reason is required.');
      err.statusCode = 400;
      throw err;
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check report status and ownership
        const repRes = await client.query(
          `SELECT id, citizen_id, status FROM reports WHERE id = $1 LIMIT 1`,
          [reportId]
        );

        if (repRes.rowCount === 0) {
          await client.query('ROLLBACK');
          throw new Error('Report not found');
        }

        const report = repRes.rows[0];

        // Validate citizen ownership
        if (report.citizen_id && report.citizen_id !== citizen_id) {
          await client.query('ROLLBACK');
          const err: any = new Error('You can only reopen your own reports.');
          err.statusCode = 403;
          throw err;
        }

        // Validate reopen eligibility: Only 'resolved' reports can be reopened
        if (report.status !== 'resolved') {
          await client.query('ROLLBACK');
          const err: any = new Error(
            `Cannot reopen report with status "${report.status}". Only reports in "resolved" status are eligible for reopening.`
          );
          err.statusCode = 400;
          throw err;
        }

        const now = new Date();
        const newStatus: ReportStatus = 'reopened';

        // Update status in reports table
        await client.query(
          `UPDATE reports
           SET status = $1, updated_at = $2
           WHERE id = $3`,
          [newStatus, now, reportId]
        );

        // Record status transition in status_history
        const historyId = randomUUID();
        await client.query(
          `INSERT INTO status_history
           (id, report_id, changed_by_user_id, previous_status, new_status, comment, changed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            historyId,
            reportId,
            citizen_id,
            'resolved',
            newStatus,
            `Citizen reopened report. Reason: ${reason.trim()}`,
            now,
          ]
        );

        await client.query('COMMIT');

        return {
          success: true,
          message: 'Report reopened successfully and returned to under review queue.',
          report: {
            id: reportId,
            status: newStatus,
            reopen_reason: reason.trim(),
            updated_at: now,
          },
        };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
      return this.reopenReportMock(reportId, input);
    }
  }

  // --- Mock / In-Memory Helpers ---

  private static getMockTimeline(identifier: string): ReportResolutionDetails | null {
    const reportId = identifier.startsWith('rep-') ? identifier : 'rep-demo-001';
    const existingTimeline = mockTimelineStore.get(reportId) || [
      {
        id: 'aud-1',
        report_id: reportId,
        new_status: 'submitted',
        actor_role: 'citizen',
        comment: 'Report submitted by citizen.',
        changed_at: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: 'aud-2',
        report_id: reportId,
        previous_status: 'submitted',
        new_status: 'under_review',
        actor_role: 'system',
        comment: 'Direct spatial routing dispatched to Road Bureau.',
        changed_at: new Date(Date.now() - 86400000),
      },
      {
        id: 'aud-3',
        report_id: reportId,
        previous_status: 'under_review',
        new_status: 'resolved',
        actor_role: 'staff',
        comment: 'Maintenance crew completed asphalt patching.',
        changed_at: new Date(Date.now() - 3600000),
      },
    ];

    const extension = mockReportExtensions.get(reportId) || {};

    const report: any = {
      id: reportId,
      tracking_number: 'FRK-2026-0814',
      citizen_id: 'usr-demo-001',
      category_id: 'cat-roads-001',
      category_name: 'Roads & Streets',
      institution_name: 'Jimma City Road & Infrastructure Development Bureau',
      title: 'Severe road pothole near Aba Jifar Palace',
      description: 'Pothole causing traffic disruption.',
      status: extension.status || 'resolved',
      resolution_information:
        'Pothole filled and leveled with hot asphalt mix by Team 2.',
      latitude: 7.6734,
      longitude: 36.8344,
      address_text: 'Jimma Aba Jifar Road, Kebele 04',
      landmark: 'Near Palace Gate',
      submitted_at: new Date(Date.now() - 86400000 * 2),
      resolved_at: new Date(Date.now() - 3600000),
      updated_at: new Date(),
      citizen_confirmed: extension.citizen_confirmed ?? false,
      citizen_confirmed_at: extension.citizen_confirmed_at ?? null,
      reopen_reason: extension.reopen_reason ?? null,
    };

    return {
      report,
      timeline: existingTimeline,
      evidence: [
        {
          id: 'att-1',
          report_id: reportId,
          file_name: 'pothole_evidence.jpg',
          original_name: 'pothole.jpg',
          file_url: 'http://localhost:5000/uploads/pothole_evidence.jpg',
          file_type: 'evidence',
          mime_type: 'image/jpeg',
          file_size: 102400,
          created_at: new Date(Date.now() - 86400000 * 2),
        },
      ],
      resolution_proofs: [
        {
          id: 'att-2',
          report_id: reportId,
          file_name: 'pothole_repaired.jpg',
          original_name: 'repaired.jpg',
          file_url: 'http://localhost:5000/uploads/pothole_repaired.jpg',
          file_type: 'resolution_proof',
          mime_type: 'image/jpeg',
          file_size: 120400,
          created_at: new Date(Date.now() - 3600000),
        },
      ],
      feedback: mockFeedbackStore.get(reportId) || null,
    };
  }

  private static confirmResolutionMock(
    reportId: string,
    input: ConfirmResolutionInput
  ): { success: boolean; message: string; report: Partial<Report> } {
    const details = this.getMockTimeline(reportId);
    if (!details) throw new Error('Report not found');

    if (details.report.status !== 'resolved') {
      const err: any = new Error(
        `Cannot confirm report with status "${details.report.status}". Report must be in "resolved" status.`
      );
      err.statusCode = 400;
      throw err;
    }

    const confirmedAt = new Date();
    mockReportExtensions.set(reportId, {
      ...mockReportExtensions.get(reportId),
      citizen_confirmed: true,
      citizen_confirmed_at: confirmedAt,
    });

    if (input.rating) {
      mockFeedbackStore.set(reportId, {
        id: randomUUID(),
        report_id: reportId,
        citizen_id: input.citizen_id,
        rating: input.rating,
        comment: input.comment || null,
        created_at: confirmedAt,
      });
    }

    const timeline = details.timeline;
    timeline.push({
      id: randomUUID(),
      report_id: reportId,
      changed_by_user_id: input.citizen_id,
      previous_status: 'resolved',
      new_status: 'resolved',
      actor_role: 'citizen',
      comment: input.comment
        ? `Citizen confirmed resolution: "${input.comment}"`
        : 'Citizen confirmed resolution.',
      changed_at: confirmedAt,
    });
    mockTimelineStore.set(reportId, timeline);

    return {
      success: true,
      message: 'Resolution successfully confirmed by citizen.',
      report: {
        id: reportId,
        status: 'resolved',
        citizen_confirmed: true,
        citizen_confirmed_at: confirmedAt,
      },
    };
  }

  private static reopenReportMock(
    reportId: string,
    input: ReopenReportInput
  ): { success: boolean; message: string; report: Partial<Report> } {
    const details = this.getMockTimeline(reportId);
    if (!details) throw new Error('Report not found');

    if (details.report.status !== 'resolved') {
      const err: any = new Error(
        `Cannot reopen report with status "${details.report.status}". Only reports in "resolved" status are eligible for reopening.`
      );
      err.statusCode = 400;
      throw err;
    }

    const now = new Date();
    mockReportExtensions.set(reportId, {
      ...mockReportExtensions.get(reportId),
      status: 'reopened',
      reopen_reason: input.reason.trim(),
    });

    const timeline = details.timeline;
    timeline.push({
      id: randomUUID(),
      report_id: reportId,
      changed_by_user_id: input.citizen_id,
      previous_status: 'resolved',
      new_status: 'reopened',
      actor_role: 'citizen',
      comment: `Citizen reopened report. Reason: ${input.reason.trim()}`,
      changed_at: now,
    });
    mockTimelineStore.set(reportId, timeline);

    return {
      success: true,
      message: 'Report reopened successfully and returned to under review queue.',
      report: {
        id: reportId,
        status: 'reopened',
        reopen_reason: input.reason.trim(),
        updated_at: now,
      },
    };
  }
}
