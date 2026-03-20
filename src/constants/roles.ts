export const Role = {
  COMPANY: 'company',
  COLLABORATOR: 'collaborator',
  ADMIN: 'admin',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];
