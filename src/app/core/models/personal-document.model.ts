export interface PersonalDocument {
  id: number;
  personal_id: number;
  personal?: any;
  personal_document_type_id: number;
  personal_document_type?: any;
  file_name?: string;
  file_path?: string;
  document_date?: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
