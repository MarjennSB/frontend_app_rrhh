export interface TypeContract {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
