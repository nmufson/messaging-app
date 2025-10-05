import { DateTime } from 'luxon';
import { z } from 'zod';

export const ObjectId = z.uuid();
export type ObjectId = z.infer<typeof ObjectId>;

export const DateTimeSchema = z.preprocess(
  (val) => {
    if (val instanceof DateTime) {
      return val;
    }

    if (val instanceof Date) {
      return DateTime.fromJSDate(val);
    }

    if (typeof val === 'string') {
      const parsed = DateTime.fromISO(val);
      return parsed.isValid ? parsed : undefined;
    }

    return undefined;
  },
  z.any().refine((dt) => dt.isValid, { message: 'Invalid DateTime' })
);
