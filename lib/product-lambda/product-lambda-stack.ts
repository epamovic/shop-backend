// Filename: hello-lambda-stack.ts
import * as cdk from "aws-cdk-lib";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import createGetProductListIntegration from "./getProductList";
import createGetProductsByIdIntegration from "./getProductById";
import createApi from "./stack/api";
import { WHITELISTED_ORIGINS } from "../constants";

export class ProductLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const logGroup = new logs.LogGroup(this, "ProductApiLogs", {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN in production
    });

    const getProductListIntegration = createGetProductListIntegration(
      this,
      logGroup
    );

    const getProductByIdIntegration = createGetProductsByIdIntegration(this);

    const api = createApi(this, {
      cloudWatchRole: true, // Creates a role for API Gateway to write to CloudWatch
      deployOptions: {
        accessLogDestination: new cdk.aws_apigateway.LogGroupLogDestination(
          logGroup
        ),
        accessLogFormat:
          cdk.aws_apigateway.AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: cdk.aws_apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    });

    const productResource = api.root.addResource("product");

    const productAvailableResource = productResource.addResource("available");
    productAvailableResource.addMethod(
      "GET",
      getProductListIntegration.integration,
      {
        methodResponses: getProductListIntegration.methodResponses,
      }
    );
    productAvailableResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
    });

    const productByIdResource = productResource.addResource("{id}");

    productByIdResource.addMethod("GET", getProductByIdIntegration);
    productByIdResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
    });
  }
}
