/** Target languages for AI translation (Gemini uses English language names). */

export type TranslateLanguage = {
  code: string;
  labelEn: string;
  labelKh: string;
  apiName: string;
};

/** Shown first in the translate menu. */
export const TRANSLATE_LANGUAGE_PINNED = ['en', 'kh', 'vi', 'zh', 'ja', 'ko'] as const;

export const TRANSLATE_LANGUAGES: TranslateLanguage[] = [
  { code: 'en', labelEn: 'English', labelKh: 'អង់គ្លេស', apiName: 'English' },
  { code: 'kh', labelEn: 'Khmer', labelKh: 'ខ្មែរ', apiName: 'Khmer' },
  { code: 'vi', labelEn: 'Vietnamese', labelKh: 'វៀតណាម', apiName: 'Vietnamese' },
  { code: 'zh', labelEn: 'Chinese (Simplified)', labelKh: 'ចិន (សាមញ្ញ)', apiName: 'Chinese (Simplified)' },
  { code: 'zh-TW', labelEn: 'Chinese (Traditional)', labelKh: 'ចិន (Traditional)', apiName: 'Chinese (Traditional)' },
  { code: 'ja', labelEn: 'Japanese', labelKh: 'ជប៉ុន', apiName: 'Japanese' },
  { code: 'ko', labelEn: 'Korean', labelKh: 'កូរ៉េ', apiName: 'Korean' },
  { code: 'fr', labelEn: 'French', labelKh: 'បារាំង', apiName: 'French' },
  { code: 'es', labelEn: 'Spanish', labelKh: 'អេស្ប៉ាញ', apiName: 'Spanish' },
  { code: 'de', labelEn: 'German', labelKh: 'អាល្លឺម៉ង់', apiName: 'German' },
  { code: 'pt', labelEn: 'Portuguese', labelKh: 'ព័រទុយហ្គាល់', apiName: 'Portuguese' },
  { code: 'pt-BR', labelEn: 'Portuguese (Brazil)', labelKh: 'ព័រទុយហ្គាល់ (ប្រេស៊ីល)', apiName: 'Portuguese (Brazil)' },
  { code: 'ru', labelEn: 'Russian', labelKh: 'រុស្ស៊ី', apiName: 'Russian' },
  { code: 'ar', labelEn: 'Arabic', labelKh: 'អារ៉ាប់', apiName: 'Arabic' },
  { code: 'hi', labelEn: 'Hindi', labelKh: 'ហិណ្ឌី', apiName: 'Hindi' },
  { code: 'bn', labelEn: 'Bengali', labelKh: 'Bengali', apiName: 'Bengali' },
  { code: 'id', labelEn: 'Indonesian', labelKh: 'ឥណ្ឌូនេស៊ី', apiName: 'Indonesian' },
  { code: 'ms', labelEn: 'Malay', labelKh: 'ម៉ាឡេ', apiName: 'Malay' },
  { code: 'tl', labelEn: 'Filipino / Tagalog', labelKh: 'ហ្វីលីពីន', apiName: 'Filipino' },
  { code: 'my', labelEn: 'Burmese', labelKh: 'Myanmar', apiName: 'Burmese' },
  { code: 'lo', labelEn: 'Lao', labelKh: 'ឡាវ', apiName: 'Lao' },
  { code: 'ne', labelEn: 'Nepali', labelKh: 'Nepali', apiName: 'Nepali' },
  { code: 'si', labelEn: 'Sinhala', labelKh: 'Sinhala', apiName: 'Sinhala' },
  { code: 'ta', labelEn: 'Tamil', labelKh: 'Tamil', apiName: 'Tamil' },
  { code: 'te', labelEn: 'Telugu', labelKh: 'Telugu', apiName: 'Telugu' },
  { code: 'mr', labelEn: 'Marathi', labelKh: 'Marathi', apiName: 'Marathi' },
  { code: 'gu', labelEn: 'Gujarati', labelKh: 'Gujarati', apiName: 'Gujarati' },
  { code: 'kn', labelEn: 'Kannada', labelKh: 'Kannada', apiName: 'Kannada' },
  { code: 'ml', labelEn: 'Malayalam', labelKh: 'Malayalam', apiName: 'Malayalam' },
  { code: 'pa', labelEn: 'Punjabi', labelKh: 'Punjabi', apiName: 'Punjabi' },
  { code: 'ur', labelEn: 'Urdu', labelKh: 'Urdu', apiName: 'Urdu' },
  { code: 'fa', labelEn: 'Persian / Farsi', labelKh: 'Persian', apiName: 'Persian' },
  { code: 'tr', labelEn: 'Turkish', labelKh: 'Turkish', apiName: 'Turkish' },
  { code: 'he', labelEn: 'Hebrew', labelKh: 'Hebrew', apiName: 'Hebrew' },
  { code: 'it', labelEn: 'Italian', labelKh: 'Italian', apiName: 'Italian' },
  { code: 'nl', labelEn: 'Dutch', labelKh: 'Dutch', apiName: 'Dutch' },
  { code: 'pl', labelEn: 'Polish', labelKh: 'Polish', apiName: 'Polish' },
  { code: 'uk', labelEn: 'Ukrainian', labelKh: 'Ukrainian', apiName: 'Ukrainian' },
  { code: 'cs', labelEn: 'Czech', labelKh: 'Czech', apiName: 'Czech' },
  { code: 'sk', labelEn: 'Slovak', labelKh: 'Slovak', apiName: 'Slovak' },
  { code: 'hu', labelEn: 'Hungarian', labelKh: 'Hungarian', apiName: 'Hungarian' },
  { code: 'ro', labelEn: 'Romanian', labelKh: 'Romanian', apiName: 'Romanian' },
  { code: 'bg', labelEn: 'Bulgarian', labelKh: 'Bulgarian', apiName: 'Bulgarian' },
  { code: 'el', labelEn: 'Greek', labelKh: 'Greek', apiName: 'Greek' },
  { code: 'sv', labelEn: 'Swedish', labelKh: 'Swedish', apiName: 'Swedish' },
  { code: 'no', labelEn: 'Norwegian', labelKh: 'Norwegian', apiName: 'Norwegian' },
  { code: 'da', labelEn: 'Danish', labelKh: 'Danish', apiName: 'Danish' },
  { code: 'fi', labelEn: 'Finnish', labelKh: 'Finnish', apiName: 'Finnish' },
  { code: 'is', labelEn: 'Icelandic', labelKh: 'Icelandic', apiName: 'Icelandic' },
  { code: 'et', labelEn: 'Estonian', labelKh: 'Estonian', apiName: 'Estonian' },
  { code: 'lv', labelEn: 'Latvian', labelKh: 'Latvian', apiName: 'Latvian' },
  { code: 'lt', labelEn: 'Lithuanian', labelKh: 'Lithuanian', apiName: 'Lithuanian' },
  { code: 'hr', labelEn: 'Croatian', labelKh: 'Croatian', apiName: 'Croatian' },
  { code: 'sr', labelEn: 'Serbian', labelKh: 'Serbian', apiName: 'Serbian' },
  { code: 'bs', labelEn: 'Bosnian', labelKh: 'Bosnian', apiName: 'Bosnian' },
  { code: 'sl', labelEn: 'Slovenian', labelKh: 'Slovenian', apiName: 'Slovenian' },
  { code: 'mk', labelEn: 'Macedonian', labelKh: 'Macedonian', apiName: 'Macedonian' },
  { code: 'sq', labelEn: 'Albanian', labelKh: 'Albanian', apiName: 'Albanian' },
  { code: 'ca', labelEn: 'Catalan', labelKh: 'Catalan', apiName: 'Catalan' },
  { code: 'gl', labelEn: 'Galician', labelKh: 'Galician', apiName: 'Galician' },
  { code: 'eu', labelEn: 'Basque', labelKh: 'Basque', apiName: 'Basque' },
  { code: 'ga', labelEn: 'Irish', labelKh: 'Irish', apiName: 'Irish' },
  { code: 'cy', labelEn: 'Welsh', labelKh: 'Welsh', apiName: 'Welsh' },
  { code: 'mt', labelEn: 'Maltese', labelKh: 'Maltese', apiName: 'Maltese' },
  { code: 'af', labelEn: 'Afrikaans', labelKh: 'Afrikaans', apiName: 'Afrikaans' },
  { code: 'sw', labelEn: 'Swahili', labelKh: 'Swahili', apiName: 'Swahili' },
  { code: 'am', labelEn: 'Amharic', labelKh: 'Amharic', apiName: 'Amharic' },
  { code: 'ha', labelEn: 'Hausa', labelKh: 'Hausa', apiName: 'Hausa' },
  { code: 'yo', labelEn: 'Yoruba', labelKh: 'Yoruba', apiName: 'Yoruba' },
  { code: 'ig', labelEn: 'Igbo', labelKh: 'Igbo', apiName: 'Igbo' },
  { code: 'zu', labelEn: 'Zulu', labelKh: 'Zulu', apiName: 'Zulu' },
  { code: 'xh', labelEn: 'Xhosa', labelKh: 'Xhosa', apiName: 'Xhosa' },
  { code: 'so', labelEn: 'Somali', labelKh: 'Somali', apiName: 'Somali' },
  { code: 'rw', labelEn: 'Kinyarwanda', labelKh: 'Kinyarwanda', apiName: 'Kinyarwanda' },
  { code: 'mg', labelEn: 'Malagasy', labelKh: 'Malagasy', apiName: 'Malagasy' },
  { code: 'ka', labelEn: 'Georgian', labelKh: 'Georgian', apiName: 'Georgian' },
  { code: 'hy', labelEn: 'Armenian', labelKh: 'Armenian', apiName: 'Armenian' },
  { code: 'az', labelEn: 'Azerbaijani', labelKh: 'Azerbaijani', apiName: 'Azerbaijani' },
  { code: 'kk', labelEn: 'Kazakh', labelKh: 'Kazakh', apiName: 'Kazakh' },
  { code: 'uz', labelEn: 'Uzbek', labelKh: 'Uzbek', apiName: 'Uzbek' },
  { code: 'ky', labelEn: 'Kyrgyz', labelKh: 'Kyrgyz', apiName: 'Kyrgyz' },
  { code: 'tg', labelEn: 'Tajik', labelKh: 'Tajik', apiName: 'Tajik' },
  { code: 'tk', labelEn: 'Turkmen', labelKh: 'Turkmen', apiName: 'Turkmen' },
  { code: 'mn', labelEn: 'Mongolian', labelKh: 'Mongolian', apiName: 'Mongolian' },
  { code: 'bo', labelEn: 'Tibetan', labelKh: 'Tibetan', apiName: 'Tibetan' },
  { code: 'dz', labelEn: 'Dzongkha', labelKh: 'Dzongkha', apiName: 'Dzongkha' },
  { code: 'ps', labelEn: 'Pashto', labelKh: 'Pashto', apiName: 'Pashto' },
  { code: 'ku', labelEn: 'Kurdish', labelKh: 'Kurdish', apiName: 'Kurdish' },
  { code: 'sd', labelEn: 'Sindhi', labelKh: 'Sindhi', apiName: 'Sindhi' },
  { code: 'as', labelEn: 'Assamese', labelKh: 'Assamese', apiName: 'Assamese' },
  { code: 'or', labelEn: 'Odia', labelKh: 'Odia', apiName: 'Odia' },
  { code: 'sa', labelEn: 'Sanskrit', labelKh: 'Sanskrit', apiName: 'Sanskrit' },
  { code: 'jv', labelEn: 'Javanese', labelKh: 'Javanese', apiName: 'Javanese' },
  { code: 'su', labelEn: 'Sundanese', labelKh: 'Sundanese', apiName: 'Sundanese' },
  { code: 'ceb', labelEn: 'Cebuano', labelKh: 'Cebuano', apiName: 'Cebuano' },
  { code: 'haw', labelEn: 'Hawaiian', labelKh: 'Hawaiian', apiName: 'Hawaiian' },
  { code: 'mi', labelEn: 'Maori', labelKh: 'Maori', apiName: 'Maori' },
  { code: 'sm', labelEn: 'Samoan', labelKh: 'Samoan', apiName: 'Samoan' },
  { code: 'to', labelEn: 'Tongan', labelKh: 'Tongan', apiName: 'Tongan' },
  { code: 'fj', labelEn: 'Fijian', labelKh: 'Fijian', apiName: 'Fijian' },
  { code: 'ht', labelEn: 'Haitian Creole', labelKh: 'Haitian Creole', apiName: 'Haitian Creole' },
  { code: 'lb', labelEn: 'Luxembourgish', labelKh: 'Luxembourgish', apiName: 'Luxembourgish' },
  { code: 'be', labelEn: 'Belarusian', labelKh: 'Belarusian', apiName: 'Belarusian' },
  { code: 'yi', labelEn: 'Yiddish', labelKh: 'Yiddish', apiName: 'Yiddish' },
  { code: 'la', labelEn: 'Latin', labelKh: 'Latin', apiName: 'Latin' },
  { code: 'eo', labelEn: 'Esperanto', labelKh: 'Esperanto', apiName: 'Esperanto' },
  { code: 'co', labelEn: 'Corsican', labelKh: 'Corsican', apiName: 'Corsican' },
  { code: 'fy', labelEn: 'Frisian', labelKh: 'Frisian', apiName: 'Frisian' },
  { code: 'gd', labelEn: 'Scottish Gaelic', labelKh: 'Scottish Gaelic', apiName: 'Scottish Gaelic' },
  { code: 'br', labelEn: 'Breton', labelKh: 'Breton', apiName: 'Breton' },
  { code: 'oc', labelEn: 'Occitan', labelKh: 'Occitan', apiName: 'Occitan' },
  { code: 'sc', labelEn: 'Sardinian', labelKh: 'Sardinian', apiName: 'Sardinian' },
  { code: 'fo', labelEn: 'Faroese', labelKh: 'Faroese', apiName: 'Faroese' },
  { code: 'nn', labelEn: 'Norwegian Nynorsk', labelKh: 'Norwegian Nynorsk', apiName: 'Norwegian Nynorsk' },
  { code: 'se', labelEn: 'Northern Sami', labelKh: 'Northern Sami', apiName: 'Northern Sami' },
  { code: 'qu', labelEn: 'Quechua', labelKh: 'Quechua', apiName: 'Quechua' },
  { code: 'gn', labelEn: 'Guarani', labelKh: 'Guarani', apiName: 'Guarani' },
  { code: 'ay', labelEn: 'Aymara', labelKh: 'Aymara', apiName: 'Aymara' },
  { code: 'nso', labelEn: 'Northern Sotho', labelKh: 'Northern Sotho', apiName: 'Northern Sotho' },
  { code: 'st', labelEn: 'Southern Sotho', labelKh: 'Southern Sotho', apiName: 'Southern Sotho' },
  { code: 'tn', labelEn: 'Tswana', labelKh: 'Tswana', apiName: 'Tswana' },
  { code: 'ts', labelEn: 'Tsonga', labelKh: 'Tsonga', apiName: 'Tsonga' },
  { code: 'ss', labelEn: 'Swati', labelKh: 'Swati', apiName: 'Swati' },
  { code: 've', labelEn: 'Venda', labelKh: 'Venda', apiName: 'Venda' },
  { code: 'ny', labelEn: 'Chichewa', labelKh: 'Chichewa', apiName: 'Chichewa' },
  { code: 'sn', labelEn: 'Shona', labelKh: 'Shona', apiName: 'Shona' },
  { code: 'lg', labelEn: 'Luganda', labelKh: 'Luganda', apiName: 'Luganda' },
  { code: 'ln', labelEn: 'Lingala', labelKh: 'Lingala', apiName: 'Lingala' },
  { code: 'ti', labelEn: 'Tigrinya', labelKh: 'Tigrinya', apiName: 'Tigrinya' },
  { code: 'om', labelEn: 'Oromo', labelKh: 'Oromo', apiName: 'Oromo' },
];

export function getTranslateLanguageLabel(entry: TranslateLanguage, uiLang: 'kh' | 'en'): string {
  return uiLang === 'kh' ? entry.labelKh : entry.labelEn;
}

export function resolveTranslateApiName(code: string): string {
  const found = TRANSLATE_LANGUAGES.find((l) => l.code === code);
  return found?.apiName || code;
}

export function getOrderedTranslateLanguages(): TranslateLanguage[] {
  const pinned = TRANSLATE_LANGUAGE_PINNED.map((code) =>
    TRANSLATE_LANGUAGES.find((l) => l.code === code)
  ).filter((l): l is TranslateLanguage => !!l);

  const pinnedCodes = new Set(pinned.map((l) => l.code));
  const rest = TRANSLATE_LANGUAGES.filter((l) => !pinnedCodes.has(l.code)).sort((a, b) =>
    a.labelEn.localeCompare(b.labelEn)
  );

  return [...pinned, ...rest];
}

export function filterTranslateLanguages(query: string, uiLang: 'kh' | 'en'): TranslateLanguage[] {
  const q = query.trim().toLowerCase();
  const all = getOrderedTranslateLanguages();
  if (!q) return all;
  return all.filter(
    (l) =>
      l.labelEn.toLowerCase().includes(q) ||
      l.labelKh.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      l.apiName.toLowerCase().includes(q)
  );
}
