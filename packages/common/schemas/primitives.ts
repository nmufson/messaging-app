import { DateTime } from 'luxon';
import { z } from 'zod';

export const ObjectId = z.uuid();
export type ObjectId = z.infer<typeof ObjectId>;

const dateTime = z.custom<DateTime>(DateTime.isDateTime, {
  params: { name: 'DateTime' },
});
const dateToDateTime = z.date().transform((date) => DateTime.fromJSDate(date));

export const DateTimeSchema = z
  .union([dateTime, dateToDateTime])
  .pipe(dateTime);
export type DateTimeSchema = z.infer<typeof DateTimeSchema>;
