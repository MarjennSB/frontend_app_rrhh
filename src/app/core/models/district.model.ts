export interface District {
  id: string;
  description: string;
  province_id: string;
  province?: any;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
