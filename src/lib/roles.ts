export type StaffRole = 'admin' | 'clerk' | 'dsw';

export const STAFF_ROLES: StaffRole[] = ['admin', 'clerk', 'dsw'];

export function isStaffRole(role?: string): role is StaffRole {
  return role === 'admin' || role === 'clerk' || role === 'dsw';
}

/** Only students (and unauthenticated visitors) may file grievances. */
export function canFileGrievance(role?: string): boolean {
  if (!role) return true;
  return role === 'student';
}

export function getDashboardPathForRole(role?: string): string {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'clerk') return '/clerk/dashboard';
  return '/dashboard';
}

export function getStaffPanelLabel(role?: string): string {
  if (role === 'admin') return 'Admin Dashboard';
  if (role === 'clerk') return 'Clerk Control Panel';
  if (role === 'dsw') return 'DSW Dashboard';
  return 'Dashboard';
}
