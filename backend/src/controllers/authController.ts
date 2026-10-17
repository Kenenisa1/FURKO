import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

export const authController = {
  // Register a new citizen/user
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { full_name, email, password, phone_number } = req.body;

      // 1. Validate inputs
      if (!full_name || !email || !password) {
        res.status(400).json({ error: 'Missing required fields (full_name, email, password)' });
        return;
      }

      // 2. Check for duplicate accounts
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }

      // 3. Hash the password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // 4. Create user in database (default role: citizen)
      const newUser = await UserModel.create({
        full_name,
        email,
        phone_number,
        password_hash,
        role: 'citizen'
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          phone_number: newUser.phone_number,
          role: newUser.role,
          created_at: newUser.created_at
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error during registration' });
    }
  },

  // Login user and return JWT token
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 1. Validate inputs
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // 2. Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // 3. Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // 4. Generate JWT Token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  },

  // Send phone verification OTP code
  async sendVerificationOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required to send verification code.' });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      // Generate a 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otpCode, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      await UserModel.setVerificationOtp(email, hashedOtp, expiresAt);

      res.status(200).json({
        message: 'Verification code sent successfully',
        dev_otp_preview: otpCode // Handy for testing locally without SMS gateway
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: 'Internal server error while sending verification code.' });
    }
  },

  // Verify phone using OTP code
  async verifyPhone(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(400).json({ error: 'Email and verification code (otp) are required.' });
        return;
      }

      const user: any = await UserModel.findByEmail(email);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      if (!user.verification_code || !user.verification_expires_at) {
        res.status(400).json({ error: 'No active verification request found. Please request a new code.' });
        return;
      }

      // Check if code has expired
      if (new Date() > new Date(user.verification_expires_at)) {
        res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
        return;
      }

      // Validate OTP match
      const isMatch = await bcrypt.compare(otp, user.verification_code);
      if (!isMatch) {
        res.status(400).json({ error: 'Invalid verification code.' });
        return;
      }

      // Mark user phone as verified
      await UserModel.verifyUserPhone(email);

      res.status(200).json({ message: 'Phone number verified successfully!' });
    } catch (error) {
      console.error('Verify phone error:', error);
      res.status(500).json({ error: 'Internal server error during phone verification.' });
    }
  }
};