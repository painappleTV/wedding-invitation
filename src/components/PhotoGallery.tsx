import { useState, useEffect } from 'react';
import { weddingConfig } from '../config';

const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

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
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
      />
    </div>
  );
}

interface PhotoGalleryProps {
  images?: string[];
  /** スライド切り替え間隔（秒） */
  intervalSeconds?: number;
}

export function PhotoGallery({
  images = weddingConfig.galleryImages,
  intervalSeconds = weddingConfig.slideshowInterval ?? 4,
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const photos = images.filter((src) => {
    try {
      return new URL(src, window.location.origin).pathname;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [photos.length, intervalSeconds]);

  if (photos.length === 0) {
    return (
      <section className="py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif text-amber-900 mb-8 text-center tracking-wider">
            私たちの写真
          </h2>
          <div className="aspect-video bg-amber-100 rounded-lg flex items-center justify-center text-amber-700">
            <p>写真を public/images/ に追加してください</p>
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
          {photos.map((src, i) => (
            <SlideImage
              key={i}
              src={src}
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
      </div>
    </section>
  );
}
