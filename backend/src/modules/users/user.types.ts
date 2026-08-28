export type UserRole = 'ADMIN' | 'WATCHMAN';

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  blockId: string | null;
  isActive: boolean;
};
