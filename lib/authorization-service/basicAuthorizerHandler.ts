export async function basicAuthorizer(event: any) {
  console.log("basicAuthorizer event: ", JSON.stringify(event, null, 2));

  const testUserCredentialsString = process.env.TEST_USER_CREDENTIALS;

  if (!testUserCredentialsString) {
    throw new Error("TEST_USER_CREDENTIALS environment variable is not set");
  }

  const [testUsername, testPassword] = testUserCredentialsString.split("=");

  const authHeader =
    event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: "Unauthorized: No Authorization header provided",
      }),
    };
  }

  const tokenMatch = authHeader.match(/^Basic (.+)$/);
  if (!tokenMatch) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Forbidden: Invalid authorization token format",
      }),
    };
  }

  let credentials;
  try {
    credentials = Buffer.from(tokenMatch[1], "base64").toString();
  } catch {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Forbidden: Unable to decode token" }),
    };
  }

  const [username, password] = credentials.split(":");
  if (username !== testUsername || password !== testPassword) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Forbidden: Invalid credentials" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `SUCCESS: Authorized as ${username}` }),
  };
}
