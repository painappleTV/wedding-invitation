/**
 * 結婚式の情報をここでカスタマイズしてください
 */
export const weddingConfig = {
  /** 新郎新婦の名前（フッター表示用） */
  coupleNames: '〇〇 & 〇〇',

  /** 式場名 */
  venueName: '〇〇ホテル グランドボールルーム',

  /** 式場住所 */
  venueAddress: '東京都〇〇区〇〇 1-2-3',

  /** 日付 */
  date: '2026年〇月〇日（〇）',

  /** 時間 */
  time: '受付 11:30 / 挙式 12:00',

  /** 写真ギャラリーの画像パス（public/images/ に配置）スライドショーで順番に表示。photo1.jpg〜photo10.jpg を配置するか、パスを編集してください */
  galleryImages: [
    '/images/photo1.jpg',
    '/images/photo2.jpg',
    '/images/photo3.jpg',
    '/images/photo4.jpg',
    '/images/photo5.jpg',
    '/images/photo6.jpg',
    '/images/photo7.jpg',
    '/images/photo8.jpg',
    '/images/photo9.jpg',
    '/images/photo10.jpg',
  ],
  /** スライド切り替え間隔（秒） */
  slideshowInterval: 4,
};
