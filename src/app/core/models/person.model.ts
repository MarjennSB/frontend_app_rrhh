export interface Person {
  id: number;
  identity_document_type_id: number;
  identity_document_type?: any; 
  document_number: string;
  first_name: string;
  last_name?: string;
  second_last_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  district_id: string;
  district?: any;
  birth_date?: string;
  gender_id: number;
  gender?: any;
  profile_photo_path?: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}
