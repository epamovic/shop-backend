import { Handler } from "aws-lambda";
import { S3 } from "aws-sdk";
const s3 = new S3({ region: process.env.AWS_REGION });

export const importProductsFile: Handler = async (event) => {
  console.log("importProductsFile: ", event);

  const name = event.name || {};

  if (!name) {
    throw new Error("Missing 'name' query parameter");
  }

  const bucketName = process.env.BUCKET_NAME;

  try {
    const params = {
      Bucket: bucketName,
      Key: `uploaded/${name}`,
      ContentType: "text/csv",
      Expires: 60,
    };

    const signedUrl = await s3.getSignedUrlPromise("putObject", params);

    return signedUrl;
  } catch (error) {
    throw new Error(`Error generating signed URL: ${error}`);
  }
};
