import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'wedding-guests';

interface APIGatewayEvent {
  pathParameters?: { inviteCode?: string };
}

interface APIGatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function handler(
  event: APIGatewayEvent
): Promise<APIGatewayResponse> {
  const inviteCode = event.pathParameters?.inviteCode;
  if (!inviteCode) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'inviteCode is required' }),
    };
  }

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { inviteCode },
      })
    );

    const item = result.Item;
    if (!item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Guest not found' }),
      };
    }

    const guest: Record<string, unknown> = {
      inviteCode: item.inviteCode,
      name: item.name,
      message: item.message || '',
      rsvpStatus: item.rsvpStatus || 'pending',
      plusOneCount: item.plusOneCount ?? 0,
      rsvpMessage: item.rsvpMessage ?? null,
      updatedAt: item.updatedAt,
    };
    if (item.customText && typeof item.customText === 'object') {
      guest.customText = item.customText;
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(guest),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
