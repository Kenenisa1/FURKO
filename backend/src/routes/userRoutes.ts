import { Router, Response } from 'express';
import { verifyToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserModel } from '../models/userModel';

const router = Router();

// GET /api/v1/users/me -> Get current authenticated user profile
router.get('/me', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;