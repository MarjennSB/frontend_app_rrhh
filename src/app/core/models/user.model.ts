import { Role } from './role.model';

export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  second_last_name?: string;
  email: string;
  role_id: number;
  role?: Role;
  profile_photo_path?: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  first_name: string;
  last_name?: string;
  second_last_name?: string;
  email: string;
  role_id: number;
  password?: string;
  status?: boolean;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}
