"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeSchema = exports.UserRole = exports.ObjectId = void 0;
const luxon_1 = require("luxon");
const zod_1 = require("zod");
exports.ObjectId = zod_1.z.uuid();
exports.UserRole = zod_1.z.enum(['USER', 'ADMIN']);
const dateTime = zod_1.z.custom(luxon_1.DateTime.isDateTime, {
    params: { name: 'DateTime' },
});
const dateToDateTime = zod_1.z.date().transform((date) => luxon_1.DateTime.fromJSDate(date));
exports.DateTimeSchema = zod_1.z
    .union([dateTime, dateToDateTime])
    .pipe(dateTime);
