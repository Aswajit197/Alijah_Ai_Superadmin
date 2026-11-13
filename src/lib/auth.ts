export interface SuperAdminUser {
  id: string;
  email: string;
  name: string;
}

export function getStoredAdmin(): SuperAdminUser | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('superadmin_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function setAdminAuth(token: string, admin: SuperAdminUser) {
  localStorage.setItem('superadmin_token', token);
  localStorage.setItem('superadmin_user', JSON.stringify(admin));
}

export function clearAdminAuth() {
  localStorage.removeItem('superadmin_token');
  localStorage.removeItem('superadmin_user');
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('superadmin_token');
}

