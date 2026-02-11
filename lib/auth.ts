const ACCESS_TOKEN_KEY = 'fabble_access_token';
const REFRESH_TOKEN_KEY = 'fabble_refresh_token';
const TOKEN_EXPIRES_AT_KEY = 'fabble_token_expires_at';

export const getApiBaseUrl = () => {
  const apiUrl = process.env.APP_API_URL || 'http://localhost:5001/api';
  return apiUrl.startsWith('http') ? apiUrl : `http://${apiUrl}`;
};

export const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken?: string, expiresIn?: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (typeof expiresIn === 'number') {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
  }
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    clearTokens();
    return null;
  }

  const data = await response.json();
  if (!data?.accessToken) {
    clearTokens();
    return null;
  }

  setTokens(data.accessToken, data.refreshToken || refreshToken, data.expiresIn);
  return data.accessToken as string;
};
