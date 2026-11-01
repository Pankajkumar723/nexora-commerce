import { createAuthClient } from 'better-auth/react';

const rawUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
const API_BASE_URL = rawUrl.endsWith('/api/v1') ? rawUrl : `${rawUrl}/api/v1`;

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/auth`,
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export default authClient;
