export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const generateUrlPath = (toolId: string, userId: string): string => {
  return `/api/tools/${toolId}/users/${userId}/connect`;
};

export const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt);
};