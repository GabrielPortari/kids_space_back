export const Role = {
  COMPANY: 'company',
  COLLABORATOR: 'collaborator',
  ADMIN: 'admin',
  MASTER: 'master',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export function hasAdminPrivileges(roles: string[] = []) {
  return roles.includes(Role.ADMIN) || roles.includes(Role.MASTER);
}
