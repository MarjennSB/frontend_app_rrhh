export interface Personal {
  id: number;
  person_id: number;
  person?: any;
  position_id: number;
  position?: any;
  organizational_unit_id: number;
  organizational_unit?: any;
  schedule_id: number;
  schedule?: any;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
