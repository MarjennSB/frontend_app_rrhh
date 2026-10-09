import { OrganizationalUnit } from './organizational-unit.model';

export interface Position {
  id: number;
  name: string;
  organizational_unit_id: number;
  organizational_unit?: OrganizationalUnit;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
