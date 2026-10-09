export interface Province {
  id: string;
  description: string;
  department_id: string;
  department?: any;
  districts?: any[];
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
