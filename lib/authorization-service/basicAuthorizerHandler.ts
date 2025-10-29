export async function basicAuthorizer(event: any, context: any, callback: any) {
  console.log("basicAuthorizer event: ", JSON.stringify(event, null, 2));

  const testUserCredentialsString = process.env.TEST_USER_CREDENTIALS;

  if (!testUserCredentialsString) {
    throw new Error("TEST_USER_CREDENTIALS environment variable is not set");
  }

  const [testUsername, testPassword] = testUserCredentialsString.split("=");
  console.log(`Test user credentials: ${testUsername}:${testPassword}`);

  const authHeader = event.authorizationToken;
  if (!authHeader) {
    console.log("No Authorization header provided");
    callback("Unauthorized");
    return;
  }

  const tokenMatch = authHeader.match(/^Basic (.+)$/);
  if (!tokenMatch) {
    console.log("Invalid Authorization header format", authHeader, tokenMatch);
    callback("Forbidden");
    return;
  }

  let credentials;
  try {
    credentials = Buffer.from(tokenMatch[1], "base64").toString();
  } catch {
    console.log("Unable to decode token", tokenMatch, credentials);
    callback("Forbidden");
    return;
  }

  const [username, password] = credentials.split(":");
  if (username !== testUsername || password !== testPassword) {
    console.log("Invalid username or password", username, password);
    callback("Forbidden");
    return;
  }

  console.log(`User ${username} authorized successfully`);
  callback(null, generateAllow("user", event.methodArn));
}

// Help function to generate an IAM policy
function generatePolicy(principalId: string, effect: string, resource: string) {
  // Required output:
  const authResponse: Record<string, any> = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument: Record<string, any> = {};
    policyDocument.Version = "2012-10-17"; // default version
    policyDocument.Statement = [];
    const statementOne: Record<string, any> = {};
    statementOne.Action = "execute-api:Invoke"; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    stringKey: "stringval",
    numberKey: 123,
    booleanKey: true,
  };
  return authResponse;
}

function generateAllow(principalId: string, resource: string) {
  return generatePolicy(principalId, "Allow", resource);
}

function generateDeny(principalId: string, resource: string) {
  return generatePolicy(principalId, "Deny", resource);
}
