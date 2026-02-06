// 末尾スラッシュを除いて二重スラッシュを防ぐ
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

/** 世帯内の招待メンバー（1世帯＝1招待＝複数メンバー） */
export interface GuestMember {
  name: string;
  attending?: boolean;
  /** アレルギー・食物制限など */
  allergy?: string;
  /** 備考 */
  note?: string;
}

export interface Guest {
  inviteCode: string;
  /** 世帯名（表示用） */
  name: string;
  message: string;
  /** 世帯全体のステータス（members があれば members から算出） */
  rsvpStatus: 'pending' | 'attending' | 'declined';
  /** 招待メンバー一覧（1世帯に複数人）※未指定時は従来通り1名扱い */
  members?: GuestMember[];
  /** @deprecated members 使用時は不要 */
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
  /** メンバーごとの出欠・アレルギー・備考 */
  members: { name: string; attending: boolean; allergy?: string; note?: string }[];
  /** 世帯宛てメッセージ（任意） */
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
