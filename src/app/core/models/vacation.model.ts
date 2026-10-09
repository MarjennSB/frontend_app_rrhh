export interface Vacation {
  id: number;
  personal_id: number;
  personal?: any;
  vacation_type_id: number;
  vacation_type?: any;
  start_date: string;
  end_date: string;
  days_quantity: number;
  observation?: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
