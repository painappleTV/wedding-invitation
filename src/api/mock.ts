import type { Guest } from './client';

export const MOCK_GUESTS: Record<string, Guest> = {
  abc123: {
    inviteCode: 'abc123',
    name: '山田家',
    message: 'いつもお世話になっております。ぜひお越しください。',
    rsvpStatus: 'pending',
    rsvpMessage: null,
    members: [
      { name: '山田太郎', attending: undefined },
      { name: '山田花子', attending: undefined },
      { name: '山田一郎', attending: undefined },
    ],
  },
  xyz789: {
    inviteCode: 'xyz789',
    name: '佐藤家',
    message: 'お二人の門出を心よりお祝い申し上げます。',
    rsvpStatus: 'pending',
    rsvpMessage: null,
    members: [
      { name: '佐藤花子', attending: undefined },
      { name: '佐藤健一', attending: undefined },
    ],
    customText: {
      headerTitle: '披露宴のご案内',
      footerText: '田中 太郎 & 山田 花子',
    },
  },
};

export function getMockGuest(inviteCode: string): Guest | null {
  return MOCK_GUESTS[inviteCode] ?? null;
}
