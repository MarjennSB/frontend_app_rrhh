export interface Schedule {
  id: number;
  organizational_unit_id: number;
  organizational_unit?: any;
  name: string;
  start_time: string;
  end_time: string;
  tolerance_minutes: number;
  workday_monday?: boolean;
  workday_tuesday?: boolean;
  workday_wednesday?: boolean;
  workday_thursday?: boolean;
  workday_friday?: boolean;
  workday_saturday?: boolean;
  workday_sunday?: boolean;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
