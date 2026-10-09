export interface Attendance {
  id: number;
  personal_id: number;
  personal?: any;
  attendance_type_id: number;
  attendance_type?: any;
  date: string;
  entry_time?: string;
  exit_time?: string;
  observation?: string;
  status?: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
