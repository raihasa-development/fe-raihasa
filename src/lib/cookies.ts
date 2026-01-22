import Cookies from 'universal-cookie';

const cookies = new Cookies();

// Login
export const getToken = (): string => {
  return cookies.get('@raihasa/token');
};

export const setToken = (token: string) => {
  cookies.set('@raihasa/token', token, { path: '/' });
};

export const removeToken = () => {
  cookies.remove('@raihasa/token', { path: '/' });
};

// NEW: Parse JWT token payload
export const parseJWT = (token: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('❌ Failed to parse JWT:', error);
    return null;
  }
};

// NEW: Get user_id from token
export const getUserIdFromToken = (): string | null => {
  const token = getToken();
  if (!token) {
    // console.log('❌ No token found in cookies');
    return null;
  }

  const payload = parseJWT(token);
  if (!payload) {
    // console.log('❌ Failed to parse token payload');
    return null;
  }

  // console.log('🔍 JWT Payload:', payload);

  // Try different possible field names for user_id in JWT
  const userId = payload.id || payload.user_id || payload.userId || payload.sub;

  if (userId) {
    // console.log('✅ Extracted user_id from token:', userId);
    return userId;
  }

  // console.log('❌ user_id not found in token payload');
  return null;
};

// NEW: Get user data from token
export const getUserFromToken = (): any | null => {
  const token = getToken();
  if (!token) return null;

  return parseJWT(token);
};
