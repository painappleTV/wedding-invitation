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

interface GuestMemberInput {
  name: string;
}

interface GuestInput {
  /** 世帯名（表示用） */
  name: string;
  message: string;
  inviteCode?: string;
  /** 招待メンバー一覧（1世帯に複数人）。未指定時は name を1名として扱う */
  members?: GuestMemberInput[];
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
    name: '山田家',
    message: 'いつもお世話になっております。ぜひお越しください。',
    members: [
      { name: '山田太郎' },
      { name: '山田花子' },
      { name: '山田一郎' },
    ],
  },
  {
    name: '佐藤家',
    message: 'お二人の門出を心よりお祝い申し上げます。',
    members: [
      { name: '佐藤花子' },
      { name: '佐藤健一' },
    ],
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
    const members = guest.members?.length
      ? guest.members.map((m) => ({ name: m.name }))
      : undefined;
    const item: Record<string, unknown> = {
      inviteCode,
      name: guest.name,
      message: guest.message,
      rsvpStatus: 'pending',
      rsvpMessage: null,
      updatedAt: new Date().toISOString(),
    };
    if (members) {
      item.members = members;
    }
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
