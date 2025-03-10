export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  version: string;
  status: 'active' | 'inactive' | 'deprecated';
  connectionUrl?: string;
}

export interface UserTool {
  id: string;
  userId: string;
  toolId: string;
  status: 'running' | 'stopped' | 'error';
  createdAt: Date;
  lastUsed?: Date;
  connectionDetails?: {
    url: string;
    token: string;
    expiresAt: Date;
  };
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}