import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'wedding-guests';

interface RSVPBody {
  rsvpStatus: 'attending' | 'declined';
  plusOneCount?: number;
  rsvpMessage?: string;
}

interface APIGatewayEvent {
  pathParameters?: { inviteCode?: string };
  body?: string;
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

  let body: RSVPBody;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { rsvpStatus, plusOneCount = 0, rsvpMessage } = body;
  if (!rsvpStatus || !['attending', 'declined'].includes(rsvpStatus)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'rsvpStatus must be attending or declined' }),
    };
  }

  try {
    const getResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { inviteCode },
      })
    );

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Guest not found' }),
      };
    }

    const now = new Date().toISOString();
    const count = rsvpStatus === 'attending' ? (plusOneCount ?? 0) : 0;

    const updateResult = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { inviteCode },
        UpdateExpression:
          'SET rsvpStatus = :status, plusOneCount = :count, rsvpMessage = :msg, updatedAt = :now',
        ExpressionAttributeValues: {
          ':status': rsvpStatus,
          ':count': count,
          ':msg': rsvpMessage || null,
          ':now': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    const item = updateResult.Attributes || getResult.Item;
    const guest: Record<string, unknown> = {
      inviteCode,
      name: item?.name || getResult.Item!.name,
      message: item?.message || getResult.Item!.message || '',
      rsvpStatus,
      plusOneCount: count,
      rsvpMessage: rsvpMessage || null,
      updatedAt: now,
    };
    if (item?.customText && typeof item.customText === 'object') {
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
