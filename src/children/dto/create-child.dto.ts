export class CreateChildDto {
  userType?: string;
  photoUrl?: string;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  document?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  companyId?: string;
  responsibleUserIds?: string[];
  isActive?: boolean;
}
