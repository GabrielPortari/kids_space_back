import { UserType } from "src/models/base-user.model";

export class CreateAdminDto {
  userType: UserType;  
  photoUrl?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}
