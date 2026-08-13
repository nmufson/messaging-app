import z from 'zod';
import { BaseProfileDTO } from './profile';

export const BaseParticipantWithProfile = z.object({
  profile: BaseProfileDTO,
});
export type BaseParticipantWithProfile = z.infer<
  typeof BaseParticipantWithProfile
>;
