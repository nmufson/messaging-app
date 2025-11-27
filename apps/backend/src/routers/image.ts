import { v2 as cloudinary } from 'cloudinary';
import { userProcedure, router, profileProcedure } from '../trpc';

export const imageRouter = router({
  getImageUploadSignature: profileProcedure.mutation(async () => {
    // TODO: use luxon here
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      process.env.CLOUDINARY_API_SECRET!
    );

    return {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    };
  }),
});
