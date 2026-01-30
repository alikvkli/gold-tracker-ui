import { useMemo } from 'react';
import { Asset, Currency } from '../features/api/apiSlice';

export interface PortfolioItem {
    currencyId: number;
    amount: number;
    totalCost: number; // For remaining amount
    averageCost: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercent: number;
    places: Set<string>;
    currency?: Currency;
}

export interface PortfolioStats {
    totalCost: number;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
    items: PortfolioItem[];
}

export const usePortfolio = (assets: Asset[], currencies: Currency[]): PortfolioStats => {
    const currencyMap = useMemo(() => {
        const map = new Map<number, Currency>();
        currencies.forEach(c => map.set(c.id, c));
        return map;
    }, [currencies]);

    return useMemo(() => {
        const itemMap = new Map<number, PortfolioItem>();

        // Sort assets by date to ensure correct order for average cost calculation
        const sortedAssets = [...assets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedAssets.forEach(asset => {
            const amount = parseFloat(asset.amount);
            const price = parseFloat(asset.price);
            const currencyId = Number(asset.currency_id);
            const currency = currencyMap.get(currencyId);

            if (isNaN(amount) || isNaN(price)) return;

            let item = itemMap.get(currencyId);
            if (!item) {
                item = {
                    currencyId,
                    amount: 0,
                    totalCost: 0,
                    averageCost: 0,
                    currentValue: 0,
                    profitLoss: 0,
                    profitLossPercent: 0,
                    places: new Set(),
                    currency
                };
                itemMap.set(currencyId, item);
            }

            // Update places
            if (asset.place) item.places.add(asset.place);

            if (asset.type === 'buy') {
                item.amount += amount;
                item.totalCost += amount * price;
            } else {
                // Sell logic: Reduce quantity and reduce totalCost proportionally
                if (item.amount > 0) {
                    const avgPrice = item.totalCost / item.amount;
                    item.amount -= amount;
                    item.totalCost -= amount * avgPrice;
                } else {
                    // Selling from 0 (shouldn't happen logically but handle it)
                    item.amount -= amount;
                }
            }

            // Recalculate average cost after operation
            if (item.amount > 0) {
                item.averageCost = item.totalCost / item.amount;
            } else {
                item.averageCost = 0;
                item.totalCost = 0;
            }
        });

        const items: PortfolioItem[] = [];
        let grandTotalCost = 0;
        let grandTotalValue = 0;

        itemMap.forEach(item => {
            // Only include items with positive balance
            if (item.amount > 0) {
                const currency = currencyMap.get(item.currencyId);
                const currentPrice = currency ? parseFloat(currency.selling) : 0;

                item.currentValue = item.amount * currentPrice;
                item.profitLoss = item.currentValue - item.totalCost;
                item.profitLossPercent = item.totalCost > 0 ? (item.profitLoss / item.totalCost) * 100 : 0;
                // Add currency object if missing (from fallback map)
                if (!item.currency && currency) item.currency = currency;

                grandTotalCost += item.totalCost;
                grandTotalValue += item.currentValue;
                items.push(item);
            }
        });

        const grandProfitLoss = grandTotalValue - grandTotalCost;
        const grandProfitLossPercent = grandTotalCost > 0 ? (grandProfitLoss / grandTotalCost) * 100 : 0;

        return {
            totalCost: grandTotalCost,
            totalValue: grandTotalValue,
            profitLoss: grandProfitLoss,
            profitLossPercent: grandProfitLossPercent,
            items: items.sort((a, b) => b.currentValue - a.currentValue) // Sort by value desc
        };

    }, [assets, currencyMap]);
};
