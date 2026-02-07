import { WeddingInfo } from '../components/WeddingInfo';
import { PhotoGallery } from '../components/PhotoGallery';
import { weddingConfig } from '../config';

export function TopPage() {
  return (
    <div className="min-h-screen relative">
      <header className="py-10 sm:py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-serif text-amber-900 tracking-widest">
          結婚式のご案内
        </h1>
        <p className="mt-4 text-amber-800">
          誠に勝手ながら、招待状に記載のURLよりご覧ください
        </p>
      </header>
      <WeddingInfo />
      <PhotoGallery />
      <footer className="py-8 text-center text-amber-700 text-sm space-y-2">
        <p>{weddingConfig.coupleNames}</p>
        <p className="text-amber-600 text-xs">IT企業勤めらしく、ページは自作しました</p>
      </footer>
    </div>
  );
}
