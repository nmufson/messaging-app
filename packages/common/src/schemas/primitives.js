import { DateTime } from 'luxon';
import { z } from 'zod';
export const ObjectId = z.uuid();
export const UserRole = z.enum(['USER', 'ADMIN']);
const dateTime = z.custom(DateTime.isDateTime, {
    params: { name: 'DateTime' },
});
const dateToDateTime = z.date().transform((date) => DateTime.fromJSDate(date));
export const DateTimeSchema = z
    .union([dateTime, dateToDateTime])
    .pipe(dateTime);
