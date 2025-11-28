import { v2 as cloudinary } from 'cloudinary';
import { userProcedure, router } from '../trpc';
import { DateTime } from 'luxon';

export const imageRouter = router({
  getImageUploadSignature: userProcedure.mutation(async () => {
    const timestamp = Math.round(DateTime.now().toSeconds());

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
