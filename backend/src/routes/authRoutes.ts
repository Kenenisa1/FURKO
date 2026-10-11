import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// POST /api/v1/auth/register -> Register a new citizen
router.post('/register', authController.register);

// POST /api/v1/auth/login -> Authenticate user and return JWT token
router.post('/login', authController.login);

// POST /api/v1/auth/send-verification-otp -> Send 6-digit OTP code for phone verification
router.post('/send-verification-otp', authController.sendVerificationOtp);

// POST /api/v1/auth/verify-phone -> Verify phone using OTP code
router.post('/verify-phone', authController.verifyPhone);

export default router;