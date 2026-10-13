import { query } from '../../config/db';
import { GeoPoint, RoutingDecision } from '../../models';
import {
  DEFAULT_PILOT_CATEGORIES,
  DEFAULT_PILOT_INSTITUTIONS,
  JIMMA_SERVICE_BOUNDS,
  PolygonBoundingBox,
} from './routing.constants';

export interface RouteReportInput {
  category_id: string;
  latitude?: number | null;
  longitude?: number | null;
  address_text?: string | null;
}

export class RoutingService {
  /**
   * Helper to test if a GPS point falls within a lat/lng bounding box
   */
  static isPointInBoundingBox(point: GeoPoint, bbox: PolygonBoundingBox): boolean {
    return (
      point.latitude >= bbox.minLat &&
      point.latitude <= bbox.maxLat &&
      point.longitude >= bbox.minLng &&
      point.longitude <= bbox.maxLng
    );
  }

  /**
   * Resolves category details by UUID, slug, or ID string
   */
  static resolveCategory(categoryId: string) {
    return DEFAULT_PILOT_CATEGORIES.find(
      (c) =>
        c.id === categoryId ||
        c.uuid.toLowerCase() === categoryId.toLowerCase() ||
        c.slug.toLowerCase() === categoryId.toLowerCase()
    );
  }

  /**
   * Resolves institution details by ID or code
   */
  static resolveInstitution(institutionId: string) {
    return DEFAULT_PILOT_INSTITUTIONS.find(
      (inst) =>
        inst.id.toLowerCase() === institutionId.toLowerCase() ||
        inst.code.toLowerCase() === institutionId.toLowerCase()
    );
  }

  /**
   * Returns the central municipal fallback triage desk
   */
  static getFallbackInstitution() {
    const fallback = DEFAULT_PILOT_INSTITUTIONS.find((i) => i.code === 'JCCM-FALLBACK')!;
    return {
      id: fallback.id,
      name: fallback.name,
      code: fallback.code,
    };
  }

  /**
   * Evaluates routing rules in PostgreSQL / PostGIS if available
   */
  private static async evaluateDbRules(
    categoryId: string,
    latitude: number,
    longitude: number
  ): Promise<RoutingDecision | null> {
    try {
      // 1. Check for specific PostGIS boundary match
      const spatialQuery = `
        SELECT 
          r.id AS rule_id,
          r.jurisdiction_name,
          r.priority_weight,
          i.id AS institution_id,
          i.name AS institution_name,
          i.code AS institution_code
        FROM routing_rules r
        JOIN institutions i ON r.target_institution_id = i.id
        WHERE (r.category_id::text = $1 OR r.category_id::text = (
          SELECT id::text FROM categories WHERE slug = $1 OR id::text = $1 LIMIT 1
        ))
          AND r.is_active = TRUE
          AND i.is_active = TRUE
          AND ST_Contains(r.location_bounds, ST_SetSRID(ST_MakePoint($3, $2), 4326))
        ORDER BY r.priority_weight DESC, r.created_at DESC
        LIMIT 1;
      `;

      const spatialRes = await query(spatialQuery, [categoryId, latitude, longitude]);
      if (spatialRes.rows && spatialRes.rows.length > 0) {
        const row = spatialRes.rows[0];
        return {
          target_institution: {
            id: row.institution_id,
            name: row.institution_name,
            code: row.institution_code,
          },
          matched_rule_id: row.rule_id,
          is_fallback: false,
          routing_reason: `Report matched spatial boundary rule for jurisdiction: "${row.jurisdiction_name}"`,
          jurisdiction_name: row.jurisdiction_name,
          confidence: 'direct_boundary_match',
        };
      }

      // 2. Check for category default rule in database (rules without location_bounds or wide bounds)
      const categoryDefaultQuery = `
        SELECT 
          r.id AS rule_id,
          r.jurisdiction_name,
          i.id AS institution_id,
          i.name AS institution_name,
          i.code AS institution_code
        FROM routing_rules r
        JOIN institutions i ON r.target_institution_id = i.id
        WHERE (r.category_id::text = $1 OR r.category_id::text = (
          SELECT id::text FROM categories WHERE slug = $1 OR id::text = $1 LIMIT 1
        ))
          AND r.location_bounds IS NULL
          AND r.is_active = TRUE
          AND i.is_active = TRUE
        ORDER BY r.priority_weight DESC
        LIMIT 1;
      `;

      const catRes = await query(categoryDefaultQuery, [categoryId]);
      if (catRes.rows && catRes.rows.length > 0) {
        const row = catRes.rows[0];
        return {
          target_institution: {
            id: row.institution_id,
            name: row.institution_name,
            code: row.institution_code,
          },
          matched_rule_id: row.rule_id,
          is_fallback: false,
          routing_reason: `Report matched category default rule for "${row.jurisdiction_name}"`,
          jurisdiction_name: row.jurisdiction_name,
          confidence: 'category_default_match',
        };
      }

      return null;
    } catch {
      // Database is unavailable or tables not yet migrated
      return null;
    }
  }

  /**
   * In-memory routing engine evaluation (used as standard or when DB is offline)
   */
  private static evaluateMemoryRules(
    categoryId: string,
    latitude?: number | null,
    longitude?: number | null
  ): RoutingDecision {
    const matchedCategory = this.resolveCategory(categoryId);

    // 1. If category itself is not recognized -> Route to municipal fallback review queue
    if (!matchedCategory) {
      return {
        target_institution: this.getFallbackInstitution(),
        matched_rule_id: null,
        is_fallback: true,
        routing_reason: `Unknown or unmapped problem category "${categoryId}". Routed to Jimma City Fallback Review Queue.`,
        jurisdiction_name: 'Central Fallback Queue',
        confidence: 'fallback_review_queue',
      };
    }

    const defaultInst = this.resolveInstitution(matchedCategory.default_institution_id);
    if (!defaultInst) {
      return {
        target_institution: this.getFallbackInstitution(),
        matched_rule_id: null,
        is_fallback: true,
        routing_reason: `No institution mapped for category "${matchedCategory.name}". Routed to Fallback Review Queue.`,
        jurisdiction_name: 'Central Fallback Queue',
        confidence: 'fallback_review_queue',
      };
    }

    // 2. Validate GPS coordinates if present
    const hasCoordinates =
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude);

    if (hasCoordinates) {
      const point: GeoPoint = { latitude: latitude!, longitude: longitude! };

      // Check if location falls inside Jimma Greater Metropolitan boundary
      const inMetro = this.isPointInBoundingBox(point, JIMMA_SERVICE_BOUNDS.METROPOLITAN);

      if (!inMetro) {
        // Point is completely outside Jimma service jurisdiction
        return {
          target_institution: this.getFallbackInstitution(),
          matched_rule_id: null,
          is_fallback: true,
          routing_reason: `GPS coordinates (${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}) fall outside Jimma City municipal service territory. Dispatched to Fallback Queue for boundary verification.`,
          jurisdiction_name: 'Out-of-Jurisdiction Fallback',
          confidence: 'fallback_review_queue',
        };
      }

      // Check sub-jurisdiction: Central District
      if (this.isPointInBoundingBox(point, JIMMA_SERVICE_BOUNDS.CENTRAL_DISTRICT)) {
        return {
          target_institution: {
            id: defaultInst.id,
            name: defaultInst.name,
            code: defaultInst.code,
          },
          matched_rule_id: `mem-rule-${matchedCategory.slug}-central`,
          is_fallback: false,
          routing_reason: `Direct spatial match: Located in Jimma Central District for category "${matchedCategory.name}". Dispatched to ${defaultInst.name}.`,
          jurisdiction_name: 'Jimma Central District',
          confidence: 'direct_boundary_match',
        };
      }

      // Check sub-jurisdiction: North Corridor / Agaro Road
      if (this.isPointInBoundingBox(point, JIMMA_SERVICE_BOUNDS.NORTH_CORRIDOR)) {
        return {
          target_institution: {
            id: defaultInst.id,
            name: defaultInst.name,
            code: defaultInst.code,
          },
          matched_rule_id: `mem-rule-${matchedCategory.slug}-north`,
          is_fallback: false,
          routing_reason: `Direct spatial match: Located in Jimma North Corridor for category "${matchedCategory.name}". Dispatched to ${defaultInst.name}.`,
          jurisdiction_name: 'Jimma North Corridor',
          confidence: 'direct_boundary_match',
        };
      }
    }

    // 3. Fallback to default institutional responsibility for known category
    return {
      target_institution: {
        id: defaultInst.id,
        name: defaultInst.name,
        code: defaultInst.code,
      },
      matched_rule_id: `mem-rule-${matchedCategory.slug}-default`,
      is_fallback: false,
      routing_reason: `Category-based responsibility: Dispatched to ${defaultInst.name} as primary authority for "${matchedCategory.name}".`,
      jurisdiction_name: 'Jimma Metropolitan Jurisdiction',
      confidence: 'category_default_match',
    };
  }

  /**
   * Main entry point to determine responsible institution for a report
   */
  static async determineRouting(input: RouteReportInput): Promise<RoutingDecision> {
    const { category_id, latitude, longitude } = input;

    // Try PostGIS database routing rules first if coordinates provided
    if (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      const dbDecision = await this.evaluateDbRules(category_id, latitude, longitude);
      if (dbDecision) {
        return dbDecision;
      }
    }

    // Evaluate rule-based routing engine
    return this.evaluateMemoryRules(category_id, latitude, longitude);
  }
}
