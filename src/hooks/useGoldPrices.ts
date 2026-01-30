import { useState, useEffect } from 'react';

export interface GoldData {
    name: string;
    buying: string;
    selling: string;
    type: string;
    change: string;
    lastUpdate?: string;
}

export interface RawGoldData {
    [key: string]: {
        "Alış": string;
        "Satış": string;
        "Tür": string;
        "Değişim": string;
    } | string;
}

const API_URL = "https://finans.truncgil.com/today.json";

export const useGoldPrices = () => {
    const [data, setData] = useState<GoldData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Veri çekilemedi');

                const jsonData: RawGoldData = await response.json();

                // Extract update time
                let updateDate = jsonData.Update_Date as string;

                // Try to parse and format date if valid
                try {
                    // Update_Date format usually "YYYY-MM-DD HH:mm:ss" from truncgil
                    const date = new Date(updateDate);
                    if (!isNaN(date.getTime())) {
                        updateDate = date.toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                } catch (e) {
                    console.error("Date parsing error", e);
                }

                setLastUpdate(updateDate);

                // Transform data array
                const items: GoldData[] = Object.entries(jsonData)
                    .filter(([key]) => key !== 'Update_Date')
                    .map(([key, value]) => {
                        const item = value as { "Alış": string; "Satış": string; "Tür": string; "Değişim": string };
                        return {
                            name: key, // The key itself is the code e.g. USD, gram-altin
                            buying: item.Alış,
                            selling: item.Satış,
                            type: item.Tür,
                            change: item.Değişim,
                            lastUpdate: updateDate
                        };
                    });

                setData(items);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setError('Fiyatlar yüklenirken bir hata oluştu');
                setIsLoading(false);
            }
        };

        fetchData();

        // Refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    return { data, isLoading, error, lastUpdate };
};
