import { Handler } from "aws-lambda";
import { S3, SQS } from "aws-sdk";
import csv from "csv-parser";
const s3 = new S3({ region: process.env.AWS_REGION });
const sqs = new SQS({ region: process.env.AWS_REGION });

export const importFileParser: Handler = async (event) => {
  console.log("importFileParser: ", JSON.stringify(event, null, 2));

  const key = event.Records[0]?.s3?.object?.key;
  const name = key?.split("/").pop();

  const bucketName = process.env.BUCKET_NAME!;
  const queueUrl = process.env.CATALOG_ITEMS_QUEUE_URL;

  if (!key || !name) {
    throw new Error("Invalid S3 event data");
  }

  if (!bucketName) {
    throw new Error("BUCKET_NAME environment variable is not set");
  }
  
  if (!queueUrl) {
    throw new Error("CATALOG_ITEMS_QUEUE_URL environment variable is not set");
  }

  try {
    const s3Stream = s3
      .getObject({
        Bucket: bucketName,
        Key: key,
      })
      .createReadStream();

    return new Promise((resolve, reject) => {
      const results = [];

      s3Stream
        .pipe(csv())
        .on("data", async (record) => {
          // Send record to SQS instead of logging to CloudWatch
          const queueUrl = process.env.CATALOG_ITEMS_QUEUE_URL;
          
          if (!queueUrl) {
            throw new Error("CATALOG_ITEMS_QUEUE_URL environment variable is not set");
          }
          
          try {
            await sqs.sendMessage({
              QueueUrl: queueUrl,
              MessageBody: JSON.stringify(record),
            }).promise();
            
            console.log(`Record sent to SQS: ${name}`);
            results.push(record);
          } catch (err) {
            console.error("Error sending message to SQS:", err);
            throw err;
          }
        })
        .on("error", (error) => {
          console.error("Error parsing CSV:", error);
          reject(error);
        })
        .on("end", async () => {
          console.log(
            `Successfully parsed ${results.length} records from ${key}`
          );

          try {
            // Move the file from uploaded to parsed folder
            await s3
              .copyObject({
                Bucket: bucketName,
                CopySource: `${bucketName}/${key}`,
                Key: `parsed/${name}`,
              })
              .promise();

            await s3
              .deleteObject({
                Bucket: bucketName,
                Key: key,
              })
              .promise();

            console.log(
              `File ${name} moved from 'uploaded' to 'parsed' folder`
            );
            resolve({ message: "CSV parsing completed successfully" });
          } catch (err) {
            console.error("Error moving file:", err);
            reject(err);
          }
        });
    });
  } catch (error) {
    throw new Error(`Error generating signed URL: ${error}`);
  }
};
