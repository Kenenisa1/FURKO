import pool from '../config/db';

export interface User {
  id?: string;
  institution_id?: string | null;
  full_name: string;
  email: string;
  phone_number?: string;
  password_hash: string;
  role: 'citizen' | 'staff' | 'admin';
  is_active?: boolean;
  is_verified?: boolean;
  verification_code?: string | null;
  verification_expires_at?: Date | null;
  created_at?: Date;
}

export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    const queryText = 'SELECT * FROM users WHERE email = \$1';
    const result = await pool.query(queryText, [email]);
    return result.rows[0] || null;
  },

  async findById(id: string): Promise<User | null> {
    const queryText = 'SELECT id, institution_id, full_name, email, phone_number, role, is_active, is_verified, created_at FROM users WHERE id = \$1';
    const result = await pool.query(queryText, [id]);
    return result.rows[0] || null;
  },

  async create(userData: {
    full_name: string;
    email: string;
    phone_number?: string;
    password_hash: string;
    role?: 'citizen' | 'staff' | 'admin';
  }): Promise<User> {
    const { full_name, email, phone_number, password_hash, role = 'citizen' } = userData;
    const queryText = `
      INSERT INTO users (full_name, email, phone_number, password_hash, role, is_active, is_verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, full_name, email, phone_number, role, is_active, is_verified, created_at;
    `;
    const result = await pool.query(queryText, [full_name, email, phone_number || null, password_hash, role]);
    return result.rows[0];
  },

  // Save OTP code and expiration for phone verification
  async setVerificationOtp(email: string, otpHash: string, expiresAt: Date): Promise<void> {
    const queryText = `
      UPDATE users 
      SET verification_code = $1, verification_expires_at = $2, updated_at = CURRENT_TIMESTAMP
      WHERE email = $3
    `;
    await pool.query(queryText, [otpHash, expiresAt, email]);
  },

  // Verify and mark user phone as verified
  async verifyUserPhone(email: string): Promise<boolean> {
    const queryText = `
      UPDATE users 
      SET is_verified = TRUE, verification_code = NULL, verification_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id;
    `;
    const result = await pool.query(queryText, [email]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
};