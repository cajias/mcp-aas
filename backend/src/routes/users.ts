import { Router } from 'express';
import { User, UserTool } from '@mcp-aas/shared';

const router = Router();

// Get user profile
router.get('/profile', (req, res) => {
  // Mock user data
  const user: User = {
    id: 'user-1',
    username: 'johndoe',
    email: 'john@example.com',
    displayName: 'John Doe',
    avatar: 'avatar.png',
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  };
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// Get user tools
router.get('/tools', (req, res) => {
  // Mock user tools
  const userTools: UserTool[] = [
    {
      id: 'user-tool-1',
      userId: 'user-1',
      toolId: 'tool-1',
      status: 'running',
      createdAt: new Date('2024-02-01'),
      lastUsed: new Date('2024-02-15'),
      connectionDetails: {
        url: 'wss://api.mcp-aas.com/tools/tool-1/connect?token=mock-token',
        token: 'mock-token',
        expiresAt: new Date(Date.now() + 3600 * 1000)
      }
    },
    {
      id: 'user-tool-2',
      userId: 'user-1',
      toolId: 'tool-2',
      status: 'stopped',
      createdAt: new Date('2024-02-10'),
      lastUsed: new Date('2024-02-10')
    }
  ];
  
  res.status(200).json({
    success: true,
    data: userTools
  });
});

// Update user profile
router.put('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Profile updated successfully'
    }
  });
});

export const userRoutes = router;