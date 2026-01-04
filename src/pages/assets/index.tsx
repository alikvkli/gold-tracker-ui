import React, { useEffect, useMemo, useState } from 'react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Loader2,
    Info,
    ArrowRightLeft,
    Banknote,
    Coins,
    MapPin,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '../../routes/paths';
import { setEncryptionKey } from '../../features/app';
import { addToast } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import api from '../../lib/api';
import Button from '../../components/Button';
import Input from '../../components/Input';


interface Asset {
    id: number;
    currency_id: number;
    type: 'buy' | 'sell';
    amount: string;
    price: string;
    date: string;
    place: string | null;
    note: string | null;
    currency: {
        id: number;
        name: string;
        code: string;
        type: string;
    }
}

interface Currency {
    id: number;
    code: string;
    name: string;
    type: string;
    buying: string;
    selling: string;
    last_updated_at?: string;
    created_at?: string;
    updated_at?: string;
}

const AssetsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [allAssets, setAllAssets] = useState<Asset[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const { user, encryptionKey } = useAppSelector(state => state.app);
    const [isLoading, setIsLoading] = useState(true);

    // Security
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [securityKey, setSecurityKey] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const currencyMap = useMemo(() => {
        const map = new Map<number, Currency>();
        currencies.forEach(currency => map.set(currency.id, currency));
        return map;
    }, [currencies]);

    const getCurrencyForAsset = (asset: Asset) => {
        const byId = currencyMap.get(Number(asset.currency_id));
        if (byId) return byId;

        const assetCode = asset.currency?.code?.toLowerCase();
        if (!assetCode) return undefined;

        return currencies.find(cur => cur.code?.toLowerCase() === assetCode);
    };

    const fetchAllAssets = async () => {
        try {
            const response = await api.get('/assets?per_page=10000');
            setAllAssets(response.data.data);
        } catch (error) {
            console.error('Tüm varlıklar alınırken hata oluştu:', error);
            dispatch(addToast({ message: 'Varlıklar yüklenemedi.', type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await api.get('/currencies');
            setCurrencies(response.data);
        } catch (error) {
            console.error('Kurlar alınırken hata oluştu:', error);
        }
    };

    useEffect(() => {
        if (user?.encrypted && !encryptionKey) {
            setIsSecurityModalOpen(true);
            setIsLoading(false);
        } else {
            fetchAllAssets();
            fetchCurrencies();
        }
    }, [user?.encrypted, encryptionKey]);

    const handleVerifyKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!securityKey) return;

        setIsVerifying(true);
        try {
            await api.get('/assets?page=1', {
                headers: { 'X-Encryption-Key': securityKey }
            });
            dispatch(setEncryptionKey(securityKey));
            setIsSecurityModalOpen(false);
            dispatch(addToast({ message: 'Şifreleme anahtarı doğrulandı.', type: 'success' }));
            fetchAllAssets();
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors?.[0] || 'Yanlış şifreleme anahtarı.';
            dispatch(addToast({ message: errorMessage, type: 'error' }));
        } finally {
            setIsVerifying(false);
        }
    };

    const calculateTotals = () => {
        let totalAmount = 0;
        let totalCost = 0;
        let totalValue = 0;

        if (currencies.length === 0 || allAssets.length === 0) {
            return { totalAmount: 0, totalCost: 0, totalValue: 0, profitLoss: 0, profitLossPercent: 0 };
        }

        allAssets.forEach(asset => {
            const currency = getCurrencyForAsset(asset);

            if (currency && currency.selling && currency.selling !== '0' && currency.selling !== '0.0000') {
                const amount = parseFloat(asset.amount);
                const price = parseFloat(asset.price);
                const currentPrice = parseFloat(currency.selling);

                if (!isNaN(amount) && !isNaN(price) && !isNaN(currentPrice) && amount > 0 && price > 0 && currentPrice > 0) {
                    if (asset.type === 'buy') {
                        totalAmount += amount;
                        totalCost += amount * price;
                        totalValue += amount * currentPrice;
                    } else {
                        totalAmount -= amount;
                        totalCost -= amount * price;
                        totalValue -= amount * currentPrice;
                    }
                }
            }
        });

        const profitLoss = totalValue - totalCost;
        const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

        return { totalAmount, totalCost, totalValue, profitLoss, profitLossPercent };
    };

    const calculatePortfolio = () => {
        const stats = new Map<number, { amount: number; totalCost: number; places: Set<string> }>();

        // Sort by date ascending to calculate weighted average correctly
        const sortedAssets = [...allAssets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedAssets.forEach(asset => {
            const amount = parseFloat(asset.amount);
            const price = parseFloat(asset.price);

            if (!isNaN(amount) && !isNaN(price)) {
                const currencyId = Number(asset.currency_id);
                const current = stats.get(currencyId) || { amount: 0, totalCost: 0, places: new Set<string>() };

                if (asset.type === 'buy') {
                    current.amount += amount;
                    current.totalCost += amount * price;
                    if (asset.place) current.places.add(asset.place);
                } else {
                    // When selling, reduce cost basis proportionally
                    if (current.amount > 0) {
                        const avgPrice = current.totalCost / current.amount;
                        current.amount -= amount;
                        current.totalCost -= amount * avgPrice;
                        // We keep the places as historical record or current? 
                        // Keeping them serves "Where did I buy these assets?"
                    } else {
                        current.amount -= amount;
                    }
                }
                stats.set(currencyId, current);
            }
        });

        return stats;
    };

    const portfolio = useMemo(() => calculatePortfolio(), [allAssets]);

    // Derived balances map for compatibility with existing code if needed, 
    // or just use portfolio directly.
    const balances = useMemo(() => {
        const bal = new Map<number, number>();
        portfolio.forEach((value, key) => bal.set(key, value.amount));
        return bal;
    }, [portfolio]);
    const totals = calculateTotals();

    const ownedCurrencies = useMemo(() => {
        return currencies.filter(c => (balances.get(c.id) || 0) > 0);
    }, [currencies, balances]);

    return (
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <header className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-white/5">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-100 to-amber-300">
                                Varlıklarım
                            </h1>
                        </div>
                    </div>
                    <p className="text-sm sm:text-base text-zinc-400 font-medium ml-16 sm:ml-0">Mevcut birikim durumunuz ve portföy özetiniz.</p>
                </div>
                <Button
                    className="group w-full sm:w-auto shrink-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300"
                    onClick={() => navigate(PATHS.TRANSACTIONS)}
                >
                    <ArrowRightLeft className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    İşlem Yap
                </Button>
            </header>

            {!isLoading && allAssets.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl hover:border-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-500/0 transition-all duration-300"></div>
                        <div className="relative flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20 shadow-lg shadow-amber-500/10 group-hover:scale-110 transition-transform duration-300">
                                <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam Harcama</p>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200">
                                    ₺{totals.totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl hover:border-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/0 transition-all duration-300"></div>
                        <div className="relative flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                                <Banknote className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam Değer</p>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                    ₺{totals.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={`group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl sm:col-span-2 lg:col-span-1 overflow-hidden transition-all duration-300 hover:shadow-xl ${totals.profitLoss >= 0 ? 'border-green-500/20 hover:border-green-500/30 hover:shadow-green-500/5' : 'border-red-500/20 hover:border-red-500/30 hover:shadow-red-500/5'}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300 ${totals.profitLoss >= 0 ? 'from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/0' : 'from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/0'}`}></div>
                        <div className="relative flex items-center gap-3 sm:gap-4">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-transform duration-300 group-hover:scale-110 ${totals.profitLoss >= 0 ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400 border-green-500/20 shadow-green-500/10' : 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-400 border-red-500/20 shadow-red-500/10'}`}>
                                {totals.profitLoss >= 0 ? <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" /> : <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest">Toplam Kar/Zarar</p>
                                    <div className="group relative">
                                        <Info className="w-3 h-3 text-zinc-500 cursor-help" />
                                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-800 border border-white/10 rounded-lg text-xs text-zinc-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                                            Tahmini rakamlar. Gerçek değerler piyasa koşullarına göre değişebilir.
                                        </div>
                                    </div>
                                </div>
                                <p className={`text-xl sm:text-2xl lg:text-3xl font-black truncate ${totals.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {totals.profitLoss >= 0 ? '+' : ''}₺{totals.profitLoss.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className={`text-xs sm:text-sm font-bold mt-1 ${totals.profitLoss >= 0 ? 'text-green-400/80' : 'text-red-400/80'}`}>
                                    {totals.profitLossPercent >= 0 ? '+' : ''}{totals.profitLossPercent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Owned Assets List */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <Coins size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Portföyüm</h3>
                </div>

                {isLoading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
                        <p className="text-zinc-400">Yükleniyor...</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View (Visible < lg) */}
                        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {ownedCurrencies.length > 0 ? (
                                ownedCurrencies.map(currency => {
                                    const stat = portfolio.get(currency.id);
                                    if (!stat) return null;

                                    const { amount, totalCost, places } = stat;
                                    const currentPrice = parseFloat(currency.selling);
                                    const totalValue = amount * currentPrice;
                                    const avgPrice = amount > 0 ? totalCost / amount : 0;
                                    const profitLoss = totalValue - totalCost;
                                    const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                                    const isProfit = profitLoss >= 0;
                                    const placesList = Array.from(places).join(', ');

                                    return (
                                        <div key={currency.id} className="bg-zinc-800/40 border border-white/5 rounded-xl p-4 hover:border-amber-500/20 transition-all">
                                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5">
                                                        <span className="text-sm font-bold text-amber-500">{currency.code?.substring(0, 1)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">
                                                            {(currency.type === 'Altın' || currency.type === 'Gold') ? currency.name : currency.code}
                                                        </p>
                                                        {placesList && (
                                                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5" title={placesList}>
                                                                <MapPin size={10} />
                                                                <span className="truncate max-w-[150px]">{placesList}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-2xl font-black text-white">{amount.toLocaleString('tr-TR')}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-0.5">Ort. Fiyat</p>
                                                    <p className="text-zinc-300 font-medium">₺{avgPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-zinc-500 mb-0.5">Güncel</p>
                                                    <p className="text-white font-medium">₺{currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-0.5">Toplam</p>
                                                    <p className="text-white font-bold">₺{totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-zinc-500 mb-0.5">Kâr/Zarar</p>
                                                    <p className={`font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                                        {isProfit ? '+' : ''}₺{Math.abs(profitLoss).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                        <span className="text-[10px] ml-1 opacity-70">
                                                            (%{Math.abs(profitLossPercent).toFixed(1)})
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-12 text-center text-zinc-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <p className="text-lg font-medium mb-2">Portföyünüz boş</p>
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View (Visible >= lg) */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Varlık</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Yer</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Miktar</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Ort. Fiyat</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Güncel Fiyat</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Değer</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">K/Z</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ownedCurrencies.length > 0 ? (
                                        ownedCurrencies.map(currency => {
                                            const stat = portfolio.get(currency.id);
                                            if (!stat) return null;

                                            const { amount, totalCost, places } = stat;
                                            const currentPrice = parseFloat(currency.selling);
                                            const totalValue = amount * currentPrice;
                                            const avgPrice = amount > 0 ? totalCost / amount : 0;
                                            const profitLoss = totalValue - totalCost;
                                            const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                                            const isProfit = profitLoss >= 0;
                                            const placesList = Array.from(places).join(', ');

                                            return (
                                                <tr key={currency.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-all">
                                                                <span className="text-xs font-bold text-zinc-400 group-hover:text-amber-500">{currency.code?.substring(0, 1)}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                                                                    {(currency.type === 'Altın' || currency.type === 'Gold') ? currency.name : currency.code}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs text-zinc-400 truncate max-w-[150px] block" title={placesList}>
                                                            {placesList || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-bold text-white">{amount.toLocaleString('tr-TR')}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm text-zinc-400">₺{avgPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-sm font-medium text-white">₺{currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-black text-white">₺{totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className={`flex flex-col items-end ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                                            <span className="text-sm font-bold">
                                                                {isProfit ? '+' : ''}₺{Math.abs(profitLoss).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                            <span className="text-xs font-medium opacity-80">
                                                                %{Math.abs(profitLossPercent).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-zinc-500">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                                        <Wallet className="w-8 h-8 text-zinc-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-medium mb-1">Portföyünüz boş</p>
                                                        <p className="text-sm text-zinc-600 mb-4">Henüz bir varlık eklememişsiniz.</p>
                                                        <Button
                                                            className="bg-zinc-800 hover:bg-zinc-700 h-9 text-xs"
                                                            onClick={() => navigate(PATHS.TRANSACTIONS)}
                                                        >
                                                            İşlemlere Git
                                                        </Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {
                isSecurityModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6 bg-zinc-950/90 backdrop-blur-md">
                        <div className="w-full max-w-md bg-zinc-900 border-t lg:border border-white/10 rounded-t-2xl sm:rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 lg:p-10 overflow-hidden relative">
                            <div className="text-center relative z-10">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-amber-500/5">
                                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">Güvenlik Kontrolü</h2>
                                <form onSubmit={handleVerifyKey} className="space-y-4 sm:space-y-6">
                                    <Input
                                        label="Şifreleme Anahtarı"
                                        type="password"
                                        placeholder="••••••••"
                                        value={securityKey}
                                        onChange={(e) => setSecurityKey(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex flex-col gap-3 sm:gap-4">
                                        <Button type="submit" className="w-full" isLoading={isVerifying}>
                                            Doğrula ve Eriş
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={() => navigate(PATHS.DASHBOARD)}
                                            className="text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest py-2"
                                        >
                                            Geri Dön
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AssetsPage;