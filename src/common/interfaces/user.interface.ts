import { Role } from '../enums/role.enum';

export interface User {
  id: number;
  email: string;
  password: string;
  role: Role;
}