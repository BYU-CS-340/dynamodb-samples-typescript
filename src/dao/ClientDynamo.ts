import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"; // ES6 import
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES6 import

// Bare-bones DynamoDB Client
const client = new DynamoDBClient({});
const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };
export let ddbDocClient = DynamoDBDocumentClient.from(client, translateConfig); // client is DynamoDB client
