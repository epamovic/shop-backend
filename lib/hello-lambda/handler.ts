import { Context } from "aws-lambda";

// Filename: handler.ts
export async function main(event: any, context: Context) {
  return {
    message: `SUCCESS with message ${event.message} 🎉`,
  };
}
