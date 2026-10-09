export interface Contract {
  id: number;
  personal_id: number;
  personal?: any;
  contract_type_id: number;
  contract_type?: any;
  start_date: string;
  end_date?: string;
  salary?: number;
  observation?: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
