import { useMemo, useState, useEffect } from 'react';
import { weddingConfig } from '../config';

const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

interface GalleryItem {
  url: string;
  num: number;
}

/** 1_, 2_, 10_ などの数字プレフィックスでソートしたギャラリー画像を取得 */
function useGalleryImages(): GalleryItem[] {
  return useMemo(() => {
    const glob = import.meta.glob(
      '../assets/images/[0-9]*_*.{jpg,jpeg,png,gif,webp}',
      { eager: true, as: 'url' }
    ) as Record<string, string>;
    const entries = Object.entries(glob);
    if (entries.length === 0) return [];
    return entries
      .map(([path, url]) => {
        const match = path.match(/\/(\d+)_/);
        const num = match ? parseInt(match[1], 10) : 0;
        return { num, url };
      })
      .sort((a, b) => a.num - b.num);
  }, []);
}

function SlideImage({
  src,
  alt,
  isActive,
}: {
  src: string;
  alt: string;
  isActive: boolean;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
      }`}
    >
      {/* 背景：同じ画像をぼかしで表示（縦横とも見切れ防止） */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={imgSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-90"
        />
      </div>
      {/* 前面：画像を中央にコンテナ内収め（object-contain で全体表示） */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <img
          src={imgSrc}
          alt={alt}
          className="max-w-full max-h-full object-contain drop-shadow-lg"
          onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
        />
      </div>
    </div>
  );
}

interface PhotoGalleryProps {
  /** 上書き用（未指定時は src/assets/images/ の [0-9]*_* パターンを自動取得） */
  images?: string[];
  /** キャプション（未指定時は config.galleryCaptions を使用） */
  captions?: Record<number, string>;
  /** スライド切り替え間隔（秒） */
  intervalSeconds?: number;
}

export function PhotoGallery({
  images,
  captions = weddingConfig.galleryCaptions,
  intervalSeconds = weddingConfig.slideshowInterval ?? 4,
}: PhotoGalleryProps) {
  const autoImages = useGalleryImages();
  const photos: GalleryItem[] =
    images && images.length > 0
      ? images.map((url, i) => ({ url, num: i + 1 }))
      : autoImages;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [photos.length, intervalSeconds]);

  const currentCaption =
    photos[currentIndex] && captions
      ? captions[photos[currentIndex].num]
      : undefined;

  if (photos.length === 0) {
    return (
      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif text-amber-900 mb-8 text-center tracking-wider">
            私たちの写真
          </h2>
          <div className="aspect-video bg-amber-100 rounded-lg flex items-center justify-center text-amber-700">
            <p>写真を src/assets/images/ に 1_xxx.jpg, 2_xxx.png の形式で追加してください</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-serif text-amber-900 mb-8 text-center tracking-wider">
          私たちの写真
        </h2>
        <div className="relative aspect-[4/3] sm:aspect-video rounded-lg overflow-hidden shadow-md bg-amber-100">
          {photos.map((item, i) => (
            <SlideImage
              key={item.url}
              src={item.url}
              alt={`写真 ${i + 1}`}
              isActive={i === currentIndex}
            />
          ))}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`写真 ${i + 1} を表示`}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
        {currentCaption && (
          <p className="mt-3 text-center text-amber-900 text-sm font-medium">
            {currentCaption}
          </p>
        )}
      </div>
    </section>
  );
}
