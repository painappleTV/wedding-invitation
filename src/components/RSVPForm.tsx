import { useState } from 'react';
import type { Guest, RSVPRequest } from '../api/client';

interface RSVPFormProps {
  guest: Guest;
  onSubmit: (data: RSVPRequest) => Promise<void>;
}

export function RSVPForm({ guest, onSubmit }: RSVPFormProps) {
  const [status, setStatus] = useState<'attending' | 'declined'>(
    guest.rsvpStatus === 'declined' ? 'declined' : 'attending'
  );
  const [plusOneCount, setPlusOneCount] = useState(guest.plusOneCount ?? 0);
  const [message, setMessage] = useState(guest.rsvpMessage ?? '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        rsvpStatus: status,
        plusOneCount: status === 'attending' ? plusOneCount : 0,
        rsvpMessage: message || undefined,
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
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6"
        >
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-amber-900 font-medium mb-2">
              ご出欠
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px] min-w-[44px] py-2 -my-2">
                <input
                  type="radio"
                  name="status"
                  value="attending"
                  checked={status === 'attending'}
                  onChange={() => setStatus('attending')}
                  className="text-amber-600 w-5 h-5"
                />
                <span>出席</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px] min-w-[44px] py-2 -my-2">
                <input
                  type="radio"
                  name="status"
                  value="declined"
                  checked={status === 'declined'}
                  onChange={() => setStatus('declined')}
                  className="text-amber-600 w-5 h-5"
                />
                <span>欠席</span>
              </label>
            </div>
          </div>

          {status === 'attending' && (
            <div>
              <label className="block text-amber-900 font-medium mb-2">
                同伴者人数
              </label>
              <select
                value={plusOneCount}
                onChange={(e) => setPlusOneCount(Number(e.target.value))}
                className="w-full border border-amber-200 rounded px-3 py-2 focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}名
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-amber-900 font-medium mb-2">
              メッセージ（任意）
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
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
