import { Router } from 'express';
import { Tool } from '@mcp-aas/shared';

const router = Router();

// Get all tools
router.get('/', (req, res) => {
  // Mock data
  const tools: Tool[] = [
    {
      id: 'tool-1',
      name: 'MCP Code Assistant',
      description: 'AI-powered code assistant',
      category: 'developer',
      icon: 'code-icon.png',
      version: '1.0.0',
      status: 'active'
    },
    {
      id: 'tool-2',
      name: 'MCP Chat',
      description: 'AI chat interface',
      category: 'communication',
      icon: 'chat-icon.png',
      version: '1.0.0',
      status: 'active'
    }
  ];
  
  res.status(200).json({
    success: true,
    data: tools
  });
});

// Get tool by ID
router.get('/:id', (req, res) => {
  // Mock data
  const tool: Tool = {
    id: req.params.id,
    name: 'MCP Code Assistant',
    description: 'AI-powered code assistant',
    category: 'developer',
    icon: 'code-icon.png',
    version: '1.0.0',
    status: 'active'
  };
  
  res.status(200).json({
    success: true,
    data: tool
  });
});

// Launch a tool
router.post('/:id/launch', (req, res) => {
  const toolId = req.params.id;
  const userId = req.body.userId;
  
  // Mock connection URL
  const connectionUrl = `wss://api.mcp-aas.com/tools/${toolId}/connect?token=mock-token`;
  
  res.status(200).json({
    success: true,
    data: {
      connectionUrl,
      token: 'mock-token',
      expiresAt: new Date(Date.now() + 3600 * 1000)
    }
  });
});

// Stop a tool
router.post('/:id/stop', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Tool stopped successfully'
    }
  });
});

export const toolRoutes = router;