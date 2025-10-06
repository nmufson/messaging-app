"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const superjson_1 = __importDefault(require("superjson"));
const luxon_1 = require("luxon");
superjson_1.default.registerCustom({
    isApplicable: (v) => luxon_1.DateTime.isDateTime(v),
    serialize: (v) => {
        const iso = v.toISO();
        if (!iso)
            throw new Error('Cannot serialize invalid Luxon DateTime');
        return iso;
    },
    deserialize: (v) => luxon_1.DateTime.fromISO(v),
}, 'luxon-DateTime');
exports.default = superjson_1.default;
