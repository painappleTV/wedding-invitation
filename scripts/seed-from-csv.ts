/**
 * CSV からゲストを DynamoDB に一括投入するスクリプト
 *
 * 使い方:
 *   npx tsx seed-from-csv.ts <CSVファイルパス>
 * 例:
 *   npx tsx seed-from-csv.ts guests.csv
 *   npx tsx seed-from-csv.ts ./guests-example.csv
 *
 * 環境変数: AWS_REGION, TABLE_NAME (default: wedding-guests)
 * CSV フォーマット: scripts/CSV_FORMAT.md を参照
 */

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomBytes } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'wedding-guests';

function generateInviteCode(): string {
  return randomBytes(6).toString('base64url').toLowerCase();
}

function normalizeInviteCode(value: string | undefined): string {
  const s = (value ?? '').trim();
  return s || generateInviteCode();
}

function parseMembers(value: string | undefined): { name: string }[] | undefined {
  const s = (value ?? '').trim();
  if (!s) return undefined;
  const names = s.split(';').map((n) => n.trim()).filter(Boolean);
  return names.length ? names.map((name) => ({ name })) : undefined;
}

async function seedFromCsv(csvPath: string) {
  const raw = readFileSync(csvPath, 'utf-8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  if (rows.length === 0) {
    console.log('CSV にデータ行がありません。');
    return;
  }

  console.log(`Seeding table: ${TABLE_NAME} (${rows.length} rows)`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = (row.name ?? '').trim();
    const message = (row.message ?? '').trim();

    if (!name) {
      console.warn(`  Skip row ${i + 2}: name は必須です。`);
      continue;
    }

    const inviteCode = normalizeInviteCode(row.inviteCode);
    const guestType = (row.guestType ?? '').trim();
    const members = parseMembers(row.members);

    const item: Record<string, unknown> = {
      inviteCode,
      name,
      message,
      rsvpStatus: 'pending',
      rsvpMessage: null,
      updatedAt: new Date().toISOString(),
    };

    if (guestType === '親族' || guestType === '友人') {
      item.guestType = guestType;
    }
    if (members && members.length > 0) {
      item.members = members;
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    console.log(`  Added: ${name} -> /invite/${inviteCode}`);
  }

  console.log('Done!');
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: npx tsx seed-from-csv.ts <CSVファイルパス>');
  console.error('例: npx tsx seed-from-csv.ts guests-example.csv');
  process.exit(1);
}

seedFromCsv(csvPath).catch((err) => {
  console.error(err);
  process.exit(1);
});
