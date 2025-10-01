"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageRouter = void 0;
const cloudinary_1 = require("cloudinary");
const trpc_1 = require("../trpc");
exports.imageRouter = (0, trpc_1.router)({
    getImageUploadSignature: trpc_1.userProcedure.mutation(async () => {
        // TODO: use luxon here
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary_1.v2.utils.api_sign_request({ timestamp }, process.env.CLOUDINARY_API_SECRET);
        return {
            timestamp,
            signature,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
        };
    }),
});
