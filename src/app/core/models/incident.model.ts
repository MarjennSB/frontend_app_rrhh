export interface Incident {
  id: number;
  personal_id: number;
  personal?: any;
  incident_type_id: number;
  incident_type?: any;
  start_date: string;
  end_date?: string;
  description?: string;
  attachment?: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
