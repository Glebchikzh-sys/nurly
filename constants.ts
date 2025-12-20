
import { Prayer, Surah, Reciter } from './types';

export const PRAYERS: Prayer[] = [
  { name: 'Fajr', time: '05:12 AM' },
  { name: 'Dhuhr', time: '12:30 PM' },
  { name: 'Asr', time: '03:45 PM', isNext: true },
  { name: 'Maghrib', time: '06:15 PM' },
  { name: 'Isha', time: '07:45 PM' },
];

export const SURAHS: Surah[] = [
  { number: 1, englishName: 'Al-Fatiha', englishNameTranslation: 'The Opener', arabicName: 'الفاتحة', numberOfAyahs: 7 },
  { number: 2, englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', arabicName: 'البقرة', numberOfAyahs: 286 },
  { number: 3, englishName: 'Al-Imran', englishNameTranslation: 'Family of Imran', arabicName: 'آل عمران', numberOfAyahs: 200 },
  { number: 4, englishName: 'An-Nisa', englishNameTranslation: 'The Women', arabicName: 'النساء', numberOfAyahs: 176 },
  { number: 5, englishName: 'Al-Ma\'idah', englishNameTranslation: 'The Table Spread', arabicName: 'المائدة', numberOfAyahs: 120 },
  { number: 6, englishName: 'Al-An\'am', englishNameTranslation: 'The Cattle', arabicName: 'الأنعام', numberOfAyahs: 165 },
  { number: 7, englishName: 'Al-A\'raf', englishNameTranslation: 'The Heights', arabicName: 'الأعراف', numberOfAyahs: 206 },
  { number: 8, englishName: 'Al-Anfal', englishNameTranslation: 'The Spoils of War', arabicName: 'الأنفال', numberOfAyahs: 75 },
  { number: 18, englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', arabicName: 'الكهف', numberOfAyahs: 110 },
  { number: 36, englishName: 'Ya-Sin', englishNameTranslation: 'Ya Sin', arabicName: 'يس', numberOfAyahs: 83 },
  { number: 67, englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', arabicName: 'الملك', numberOfAyahs: 30 },
];

export const MOCK_AYAH_ARABIC = "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ";
export const MOCK_AYAH_TRANSLATION = "Blessed is He in whose hand is dominion, and He is over all things competent.";

export const RECITERS: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', subfolder: 'Alafasy_64kbps' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit \'Abd us-Samad', subfolder: 'Abdul_Basit_Murattal_64kbps' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman as-Sudais', subfolder: 'Abdurrahmaan_As-Sudais_64kbps' },
  { id: 'ar.saoodshuraym', name: 'Sa\'ud ash-Shuraym', subfolder: 'Saood_ash-Shuraym_64kbps' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Hussary', subfolder: 'Husary_64kbps' },
];
