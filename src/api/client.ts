const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface Guest {
  inviteCode: string;
  name: string;
  message: string;
  rsvpStatus: 'pending' | 'attending' | 'declined';
  plusOneCount?: number;
  rsvpMessage?: string | null;
  updatedAt?: string;
  /** 人ごとに変えたい文言（未指定なら config のデフォルトを使用） */
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

export interface RSVPRequest {
  rsvpStatus: 'attending' | 'declined';
  plusOneCount?: number;
  rsvpMessage?: string;
}

export async function getGuest(inviteCode: string): Promise<Guest> {
  const res = await fetch(`${API_BASE}/guests/${inviteCode}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('招待が見つかりません');
    throw new Error('データの取得に失敗しました');
  }
  return res.json();
}

export async function submitRSVP(
  inviteCode: string,
  data: RSVPRequest
): Promise<Guest> {
  const res = await fetch(`${API_BASE}/guests/${inviteCode}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('出欠の送信に失敗しました');
  }
  return res.json();
}
