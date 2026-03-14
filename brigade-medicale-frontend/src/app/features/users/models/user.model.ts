export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleIds: number[];
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roleIds?: number[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
