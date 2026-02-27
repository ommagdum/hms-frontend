export type UserRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  route: string;
  roles: UserRole[];
}

export const hasRole = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const canAccessRoute = (userRole: UserRole, route: string, navItems: NavItem[]): boolean => {
  const navItem = navItems.find(item => item.route === route);
  if (!navItem) return false;
  return hasRole(userRole, navItem.roles);
};

export const getFirstAccessibleRoute = (userRole: UserRole, navItems: NavItem[]): string => {
  const accessibleItem = navItems.find(item => hasRole(userRole, item.roles));
  return accessibleItem?.route || '/dashboard';
};
