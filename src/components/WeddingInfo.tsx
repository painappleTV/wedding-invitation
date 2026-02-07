import { weddingConfig } from '../config';

interface WeddingInfoProps {
  sectionTitle?: string;
  venueName?: string;
  venueAddress?: string;
  /** 地図リンクURL（空なら venueAddress から検索URLを生成） */
  venueMapUrl?: string;
  date?: string;
  time?: string;
}

export function WeddingInfo({
  sectionTitle = '挙式・披露宴のご案内',
  venueName = weddingConfig.venueName,
  venueAddress = weddingConfig.venueAddress,
  venueMapUrl = weddingConfig.venueMapUrl,
  date = weddingConfig.date,
  time = weddingConfig.time,
}: WeddingInfoProps) {
  return (
    <section className="py-8 sm:py-12 px-4 bg-amber-50/50">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-serif text-amber-900 mb-8 tracking-wider">
          {sectionTitle}
        </h2>
        <div className="space-y-4 text-amber-950">
          <p className="text-lg">{date}</p>
          <p className="text-lg">{time}</p>
          <div className="pt-6 border-t border-amber-200">
            <p className="font-medium">{venueName}</p>
            <p className="text-sm text-amber-800 mt-1">{venueAddress}</p>
            <a
              href={venueMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] mt-3 px-4 py-2 text-amber-700 underline hover:text-amber-900 hover:bg-amber-100 rounded transition-colors"
            >
              地図を開く
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
