import { weddingConfig } from '../config';

interface ParkingInfo {
  main: string;
  restriction: string;
}

interface WeddingInfoProps {
  sectionTitle?: string;
  venueName?: string;
  venueAddress?: string;
  /** 地図リンクURL（空なら venueAddress から検索URLを生成） */
  venueMapUrl?: string;
  date?: string;
  /** 1行目：集合時間 / 挙式時間 */
  time?: string;
  /** 2行目：補足（※...） */
  timeNote?: string;
  /** 駐車場情報（未指定なら config を使用） */
  parkingInfo?: ParkingInfo | null;
}

export function WeddingInfo({
  sectionTitle = '挙式・披露宴のご案内',
  venueName = weddingConfig.venueName,
  venueAddress = weddingConfig.venueAddress,
  venueMapUrl = weddingConfig.venueMapUrl,
  date = weddingConfig.date,
  time = weddingConfig.time,
  timeNote,
  parkingInfo = weddingConfig.parkingInfo,
}: WeddingInfoProps) {
  return (
    <section className="py-8 sm:py-12 px-4 bg-amber-50/50">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-serif text-amber-900 mb-8 tracking-wider">
          {sectionTitle}
        </h2>
        <div className="space-y-4 text-amber-950">
          <p className="text-lg">{date}</p>
          <div>
            <p className="text-lg">{time}</p>
            {timeNote && <p className="text-sm text-amber-700 mt-1 whitespace-pre-line">{timeNote}</p>}
          </div>
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
            {parkingInfo && (
              <div className="mt-6 pt-6 border-t border-amber-200/70 text-left">
                <p className="text-xs font-medium text-amber-700 tracking-wider mb-2">
                  🅿 PARKING
                </p>
                <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">
                  {parkingInfo.main}
                </p>
                <p className="text-xs text-amber-600 mt-2 opacity-90">
                  ※{parkingInfo.restriction}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
