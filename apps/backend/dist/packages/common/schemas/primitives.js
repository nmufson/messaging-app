"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeSchema = exports.ObjectId = void 0;
const luxon_1 = require("luxon");
const zod_1 = require("zod");
exports.ObjectId = zod_1.z.uuid();
exports.DateTimeSchema = zod_1.z.string().transform((str, ctx) => {
    const dt = luxon_1.DateTime.fromISO(str);
    if (!dt.isValid) {
        return zod_1.z.NEVER;
    }
    return dt;
});
