import { ObjectId } from '@repo/common';

export interface SelectedProfile {
  id: ObjectId;
  firstName: string;
  lastName: string;
}
