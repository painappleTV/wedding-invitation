/**
 * ゲストデータをDynamoDBに投入するスクリプト
 * 実行: cd scripts && npm install && npx tsx seed-guests.ts
 * 環境変数: AWS_REGION, TABLE_NAME (default: wedding-guests)
 * 事前に sam deploy でDynamoDBテーブルを作成してください
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomBytes } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'wedding-guests';

function generateInviteCode(): string {
  return randomBytes(6).toString('base64url').toLowerCase();
}

interface GuestInput {
  name: string;
  message: string;
  inviteCode?: string;
  customText?: {
    headerTitle?: string;
    sectionTitle?: string;
    venueName?: string;
    venueAddress?: string;
    date?: string;
    time?: string;
    footerText?: string;
  };
}

const SAMPLE_GUESTS: GuestInput[] = [
  {
    name: '山田太郎',
    message: 'いつもお世話になっております。ぜひお越しください。',
  },
  {
    name: '佐藤花子',
    message: 'お二人の門出を心よりお祝い申し上げます。',
    customText: {
      headerTitle: '披露宴のご案内',
      footerText: '田中 太郎 & 山田 花子',
    },
  },
  {
    name: '鈴木一郎',
    message: 'この度はお招きいただきありがとうございます。',
  },
];

async function seed() {
  console.log(`Seeding table: ${TABLE_NAME}`);

  for (const guest of SAMPLE_GUESTS) {
    const inviteCode = guest.inviteCode || generateInviteCode();
    const item: Record<string, unknown> = {
      inviteCode,
      name: guest.name,
      message: guest.message,
      rsvpStatus: 'pending',
      plusOneCount: 0,
      rsvpMessage: null,
      updatedAt: new Date().toISOString(),
    };
    if (guest.customText) {
      item.customText = guest.customText;
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    console.log(`  Added: ${guest.name} -> /invite/${inviteCode}`);
  }

  console.log('Done!');
}

seed().catch(console.error);
