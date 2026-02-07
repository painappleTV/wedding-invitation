import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WeddingInfo } from '../components/WeddingInfo';
import { PhotoGallery } from '../components/PhotoGallery';
import { RSVPForm } from '../components/RSVPForm';
import { weddingConfig } from '../config';
import { getGuest, submitRSVP } from '../api/client';
import { getMockGuest } from '../api/mock';
import type { Guest, RSVPRequest } from '../api/client';

export function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    const fetchGuest = async () => {
      const useMock = !import.meta.env.VITE_API_URL;
      if (useMock) {
        const mock = getMockGuest(code);
        if (mock) {
          setGuest(mock);
        } else {
          setError('招待が見つかりません');
        }
        setLoading(false);
        return;
      }

      try {
        const data = await getGuest(code);
        setGuest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, [code, navigate]);

  const handleRSVPSubmit = async (data: RSVPRequest) => {
    if (!guest) return;
    const useMock = !import.meta.env.VITE_API_URL;
    if (useMock) {
      const anyAttending = data.members.some((m) => m.attending);
      const allDeclined = data.members.every((m) => !m.attending);
      const rsvpStatus = allDeclined ? 'declined' : anyAttending ? 'attending' : 'pending';
      setGuest({
        ...guest,
        members: data.members.map((m) => ({ ...m, allergy: m.allergy, note: m.note })),
        rsvpStatus,
        rsvpMessage: data.rsvpMessage ?? null,
        updatedAt: new Date().toISOString(),
      });
      return;
    }
    const updated = await submitRSVP(guest.inviteCode, data);
    setGuest(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-amber-800">読み込み中...</p>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 px-4">
        <p className="text-amber-900 font-medium">{error || '招待が見つかりません'}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 min-h-[44px] px-4 text-amber-700 underline hover:text-amber-900"
        >
          トップへ戻る
        </button>
      </div>
    );
  }

  const ct = guest.customText;
  const headerTitle = ct?.headerTitle ?? '結婚式のご案内';
  const footerText = ct?.footerText ?? weddingConfig.coupleNames;

  return (
    <div className="min-h-screen relative">
      <header className="py-10 sm:py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-amber-900 tracking-widest">
          {headerTitle}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-amber-800">
          {guest.name} 様
        </p>
        {guest.message && (
          <p className="mt-4 max-w-xl mx-auto text-amber-700 leading-relaxed">
            {guest.message}
          </p>
        )}
      </header>

      <WeddingInfo
        sectionTitle={ct?.sectionTitle}
        venueName={ct?.venueName}
        venueAddress={ct?.venueAddress}
        date={ct?.date}
        time={ct?.time}
      />
      <PhotoGallery />
      <RSVPForm guest={guest} onSubmit={handleRSVPSubmit} />

      <footer className="py-8 text-center text-amber-700 text-sm space-y-2">
        <p>{footerText}</p>
        <p className="text-amber-600 text-xs">IT企業勤めらしく、ページは2人で自作しました</p>
      </footer>
    </div>
  );
}
