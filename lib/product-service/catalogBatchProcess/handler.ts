import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { Handler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import IAvailableProduct from "../types/IAvailableProduct";
import { PRODUCT_TABLE_NAME, STOCK_TABLE_NAME } from "../model";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const sns = new SNSClient({ region: process.env.AWS_REGION });

// The lambda function should iterate over all SQS messages and create corresponding products in the products table.
export const catalogBatchProcess: Handler = async (event): Promise<any> => {
  console.log("catalogBatchProcess event: ", JSON.stringify(event, null, 2));

  // Iterate over SQS messages
  for (const record of event.Records) {
    console.log("Processing record: ", JSON.stringify(record, null, 2));

    const recordBody = JSON.parse(record.body) as IAvailableProduct;

    try {
      const id = uuidv4();

      console.log("Event:", { ...recordBody });

      const putProductCommand = new PutItemCommand({
        TableName: PRODUCT_TABLE_NAME,
        Item: {
          id: { S: id },
          title: { S: recordBody.title },
          description: { S: recordBody.description },
          price: { N: recordBody.price.toString() },
        },
      });

      const putStockCommand = new PutItemCommand({
        TableName: STOCK_TABLE_NAME,
        Item: {
          product_id: { S: id },
          count: { N: recordBody.count.toString() },
        },
      });

      const [productResult, stockResult] = await Promise.all([
        dynamoDB.send(putProductCommand),
        dynamoDB.send(putStockCommand),
      ]);

      const result: IAvailableProduct = {
        id,
        title: recordBody.title,
        description: recordBody.description,
        price: recordBody.price,
        count: recordBody.count,
      };

      console.log("PutItem succeeded:", JSON.stringify(result, null, 2));

      const topic = process.env.PRODUCT_SNS_TOPIC_ARN;
      console.log("SNS Topic ARN:", topic);

      // Send notification to SNS topic if topic ARN is provided
      if (topic) {
        const productPrice = Number(recordBody.price);

        await sns.send(
          new PublishCommand({
            TopicArn: topic,
            Subject: recordBody.title + " Created",
            Message: JSON.stringify({
              message: `Product with ID ${id} has been created`,
              product: result,
              timestamp: new Date().toISOString(),
            }),
            MessageAttributes: {
              price: {
                DataType: "Number",
                StringValue: productPrice.toString(),
              },
              count: {
                DataType: "Number",
                StringValue: recordBody.count.toString(),
              },
            },
          })
        );
        console.log(`Notification sent to SNS topic: ${topic}`);
      }
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Error adding item to DynamoDB table");
    }
  }
};
