import { DateTime } from 'luxon';
import { z } from 'zod';

export const ObjectId = z.uuid();
export type ObjectId = z.infer<typeof ObjectId>;

const dateTime = z.custom<DateTime>(DateTime.isDateTime, {
  params: { name: 'DateTime' },
});
const dateToDateTime = z.date().transform((date) => DateTime.fromJSDate(date));
const stringToDateTime = z.string().transform((str) => DateTime.fromISO(str));
export const DateTimeSchema = z
  .union([dateTime, dateToDateTime, stringToDateTime])
  .pipe(dateTime);
export type DateTimeSchema = z.infer<typeof DateTimeSchema>;

export const DurationUnit = z.enum(['seconds', 'minutes', 'hours', 'days']);
export type DurationUnit = z.infer<typeof DurationUnit>;

export const DurationObject = z.partialRecord(DurationUnit, z.number().min(0));
export type DurationObject = z.infer<typeof DurationObject>;
