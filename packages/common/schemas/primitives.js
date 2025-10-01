"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeSchema = exports.ObjectId = void 0;
var luxon_1 = require("luxon");
var zod_1 = require("zod");
exports.ObjectId = zod_1.z.uuid();
exports.DateTimeSchema = zod_1.z.string().transform(function (str, ctx) {
    var dt = luxon_1.DateTime.fromISO(str);
    if (!dt.isValid) {
        return zod_1.z.NEVER;
    }
    return dt;
});
