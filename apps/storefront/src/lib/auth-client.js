import { createAuthClient } from 'better-auth/react';

function getAuthApiUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  const isBrowser = typeof window !== 'undefined';
  const isRender = isBrowser && window.location.hostname.includes('onrender.com');

  let raw = envUrl;
  if (isRender && (!raw || raw.includes('localhost') || raw.includes('nexora-api.onrender.com'))) {
    raw = 'https://nexora-api-hizw.onrender.com';
  }
  raw = raw || (isRender ? 'https://nexora-api-hizw.onrender.com' : 'http://localhost:4000');
  const clean = raw.replace(/\/+$/, '');
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
}

const API_BASE_URL = getAuthApiUrl();

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/auth`,
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export default authClient;
