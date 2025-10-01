import { DateTime } from 'luxon';
import { z } from 'zod';

export const ObjectId = z.uuid();
export type ObjectId = z.infer<typeof ObjectId>;

export const DateTimeSchema = z.string().transform((str, ctx) => {
  const dt = DateTime.fromISO(str);
  if (!dt.isValid) {
    return z.NEVER;
  }
  return dt;
});
