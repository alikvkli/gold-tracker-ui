export const formatDate = (date: string | Date, format: 'relative' | 'standard'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return 'Geçersiz Tarih';

    if (format === 'standard') {
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    // Relative format
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 0) return 'Gelecek Tarih'; // Should not happen for logs but safer

    if (diffInSeconds < 60) {
        return `${diffInSeconds} saniye önce`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} dakika önce`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} saat önce`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} gün önce`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ay önce`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} yıl önce`;
};

export const formatNumericValue = (value: string | number): string => {
    if (value === '' || value === undefined || value === null) return '';

    // value is assumed to be a raw numeric string (e.g. "1234.56") or a number
    const strValue = value.toString();

    // Split into integer and decimal parts
    const [integerPart, decimalPart] = strValue.split('.');

    // Format the integer part with dots as thousand separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Combine with comma as decimal separator if decimalPart exists
    if (decimalPart !== undefined) {
        return `${formattedInteger},${decimalPart}`;
    }

    return formattedInteger;
};

export const parseNumericValue = (formattedValue: string): string => {
    // Convert Turkish format "6.189,62" -> English format "6189.62"
    // 1. Remove dots (thousand separators)
    // 2. Change comma to dot (decimal separator)
    return formattedValue.replace(/\./g, '').replace(',', '.');
};
