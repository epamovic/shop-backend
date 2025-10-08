import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export default function createApi(
  scope: Construct,
  name: string,
  options?: apigateway.RestApiProps
) {
  const api = new apigateway.RestApi(scope, "my-api", {
    restApiName: name,
    description: `This API serves the Lambda functions for ${name}.`,
    ...options,
  });

  return api;
}
