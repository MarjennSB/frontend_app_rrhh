export interface Department {
  id: string;
  description: string;
  status: boolean;
  provinces?: any[]; // Replaced with Province[] later if needed
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
