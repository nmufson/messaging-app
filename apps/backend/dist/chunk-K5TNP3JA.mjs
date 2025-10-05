import {
  userProcedure
} from "./chunk-ZAYRUBIM.mjs";
import {
  router
} from "./chunk-XI2LZ4T3.mjs";

// src/routers/image.ts
import { v2 as cloudinary } from "cloudinary";
var imageRouter = router({
  getImageUploadSignature: userProcedure.mutation(async () => {
    const timestamp = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      process.env.CLOUDINARY_API_SECRET
    );
    return {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    };
  })
});

export {
  imageRouter
};
