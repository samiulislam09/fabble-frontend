import { getAccessToken, getApiBaseUrl, refreshAccessToken } from './auth';

export const authFetch = async (path: string, init: RequestInit = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers = new Headers(init.headers || {});
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      headers.set('Authorization', `Bearer ${refreshedToken}`);
      return fetch(url, { ...init, headers });
    }
  }

  return response;
};
