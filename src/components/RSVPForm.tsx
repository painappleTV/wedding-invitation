import { useState } from 'react';
import type { Guest, GuestMember, RSVPRequest } from '../api/client';

interface RSVPFormProps {
  guest: Guest;
  onSubmit: (data: RSVPRequest) => Promise<void>;
}

/** 従来形式のゲストを members 形式に変換 */
function getMembers(guest: Guest): GuestMember[] {
  if (guest.members && guest.members.length > 0) {
    return guest.members.map((m) => ({
      name: m.name,
      attending: m.attending ?? (guest.rsvpStatus !== 'declined'),
      allergy: m.allergy ?? '',
      note: m.note ?? '',
    }));
  }
  return [
    {
      name: guest.name,
      attending: guest.rsvpStatus !== 'declined',
      allergy: '',
      note: '',
    },
  ];
}

export function RSVPForm({ guest, onSubmit }: RSVPFormProps) {
  const [members, setMembers] = useState<GuestMember[]>(() => getMembers(guest));
  const [message, setMessage] = useState(guest.rsvpMessage ?? '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setMember = (index: number, update: Partial<GuestMember>) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...update } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        members: members.map((m) => ({
          name: m.name,
          attending: m.attending ?? false,
          allergy: m.allergy?.trim() || undefined,
          note: m.note?.trim() || undefined,
        })),
        rsvpMessage: message.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium">
          出欠のご回答ありがとうございます
        </p>
        <p className="text-green-700 mt-2 text-sm">
          お手数ですが、内容に変更がある場合はお知らせください。
        </p>
      </div>
    );
  }

  return (
    <section className="py-8 sm:py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-serif text-amber-900 mb-6 text-center tracking-wider">
          出欠のご返答
        </h2>
        <p className="text-amber-800 text-sm mb-4 text-center">
          ご招待の皆様それぞれに出欠をご選択ください
        </p>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6"
        >
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {members.map((member, index) => (
              <div
                key={member.name}
                className="border border-amber-100 rounded-lg p-4 space-y-3"
              >
                <p className="font-medium text-amber-900">{member.name} 様</p>
                <div>
                  <span className="block text-sm text-amber-800 mb-2">
                    ご出欠
                  </span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer min-h-[44px] min-w-[44px] py-2 -my-2">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        checked={member.attending !== false}
                        onChange={() =>
                          setMember(index, { attending: true })
                        }
                        className="text-amber-600 w-5 h-5"
                      />
                      <span>出席</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer min-h-[44px] min-w-[44px] py-2 -my-2">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        checked={member.attending === false}
                        onChange={() =>
                          setMember(index, { attending: false })
                        }
                        className="text-amber-600 w-5 h-5"
                      />
                      <span>欠席</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-amber-800 mb-1">
                    アレルギー・食物制限（任意）
                  </label>
                  <input
                    type="text"
                    value={member.allergy ?? ''}
                    onChange={(e) =>
                      setMember(index, { allergy: e.target.value })
                    }
                    placeholder="例：エビ、卵"
                    className="w-full border border-amber-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-800 mb-1">
                    備考（任意）
                  </label>
                  <input
                    type="text"
                    value={member.note ?? ''}
                    onChange={(e) =>
                      setMember(index, { note: e.target.value })
                    }
                    placeholder="ご要望など"
                    className="w-full border border-amber-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-amber-900 font-medium mb-2">
              メッセージ（任意）
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full border border-amber-200 rounded px-3 py-2 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 resize-none"
              placeholder="お祝いのメッセージやご連絡事項をご記入ください"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 min-h-[48px] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '送信中...' : '送信する'}
          </button>
        </form>
      </div>
    </section>
  );
}
