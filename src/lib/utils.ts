import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const KHMER_DIGITS = '០១២៣៤៥៦៧៨៩';

/** Convert Western digits in a string to Khmer numerals (e.g. 3 → ៣). */
export function toKhmerDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)] ?? d);
}
