import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAssetUnit = (code?: string, name?: string): string => {
  if (!code) return '';

  const upperCode = code.toUpperCase();
  const upperName = name?.toUpperCase() || '';

  // Gram unit check
  const gramKeywords = ['ONS', 'GRAM', '24AYAR', '22AYAR', '18AYAR', '14AYAR', '8AYAR', 'GUMUS', 'PLATIN', 'PALADYUM'];
  if (gramKeywords.some(k => upperCode.includes(k) || upperName.includes(k))) {
    return 'gr';
  }

  // Default to 'adet' for everything else as requested
  return 'adet';
};