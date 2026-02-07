import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});
const TABLE_NAME = process.env.TABLE_NAME || 'wedding-guests';

interface RSVPMember {
  name: string;
  attending: boolean;
  allergy?: string;
  note?: string;
}

interface RSVPBody {
  members: RSVPMember[];
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

  const { members, rsvpMessage } = body;
  if (!members || !Array.isArray(members) || members.length === 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'members array is required' }),
    };
  }
  for (const m of members) {
    if (typeof m.name !== 'string' || typeof m.attending !== 'boolean') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'each member must have name and attending' }),
      };
    }
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
    const membersToSave = members.map((m) => {
      const item: { name: string; attending: boolean; allergy?: string; note?: string } = {
        name: m.name,
        attending: m.attending,
      };
      if (m.allergy?.trim()) item.allergy = m.allergy.trim();
      if (m.note?.trim()) item.note = m.note.trim();
      return item;
    });
    const anyAttending = membersToSave.some((m) => m.attending);
    const allDeclined = membersToSave.every((m) => !m.attending);
    const rsvpStatus = allDeclined ? 'declined' : anyAttending ? 'attending' : 'pending';

    const updateResult = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { inviteCode },
        UpdateExpression:
          'SET members = :members, rsvpStatus = :status, rsvpMessage = :msg, updatedAt = :now',
        ExpressionAttributeValues: {
          ':members': membersToSave,
          ':status': rsvpStatus,
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
      members: membersToSave,
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
