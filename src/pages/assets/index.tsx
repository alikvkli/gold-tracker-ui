import React, { useEffect, useState } from 'react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Loader2,
    Info,
    ArrowRightLeft,
    Banknote,
    Coins,
    Shield,
    ChevronDown,
    History,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '../../routes/paths';
import { setEncryptionKey } from '../../features/app';
import { addToast } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import api from '../../lib/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { getAssetUnit } from '../../lib/utils';
import {
    useGetAllAssetsQuery,
    useGetCurrenciesQuery,
    useDeleteAssetMutation,
} from '../../features/api/apiSlice';
import { usePortfolio } from '../../hooks/usePortfolio';
import { formatDate } from '../../lib/date';

const AssetsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { user, encryptionKey, dateFormat } = useAppSelector(state => state.app);

    // Security
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [securityKey, setSecurityKey] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Delete Logic
    const [deleteAsset] = useDeleteAssetMutation();
    const [assetToDelete, setAssetToDelete] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteClick = (asset: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setAssetToDelete(asset);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!assetToDelete) return;

        try {
            const headers: Record<string, string> = user?.encrypted && encryptionKey
                ? { 'X-Encryption-Key': encryptionKey }
                : {};

            await deleteAsset({ id: assetToDelete.id, headers }).unwrap();
            dispatch(addToast({ message: 'Varlık başarıyla silindi.', type: 'success' }));
            setIsDeleteModalOpen(false);
            setAssetToDelete(null);
        } catch (error: any) {
            // If the server returns 404, it might mean the asset is already deleted or a redirect issue occurred.
            // In either case, the asset is gone, so we treat it as success.
            if (error?.status === 404) {
                dispatch(addToast({ message: 'Varlık silindi.', type: 'success' }));
                setIsDeleteModalOpen(false);
                setAssetToDelete(null);
                return;
            }
            const errorMessage = error?.data?.message || `Silme işlemi başarısız oldu (${error?.status || 'Bilinmeyen Hata'}).`;
            dispatch(addToast({ message: errorMessage, type: 'error' }));
        }
    };

    // RTK Query
    const skipQuery = user?.encrypted && !encryptionKey;

    const {
        data: allAssets = [],
        isLoading: isAssetsLoading
    } = useGetAllAssetsQuery(undefined, { skip: skipQuery });

    const {
        data: currencies = [],
        isLoading: isCurrenciesLoading
    } = useGetCurrenciesQuery();

    const isLoading = (isAssetsLoading && !skipQuery) || isCurrenciesLoading;

    // Use Portfolio Hook for Aggregated Data
    const {
        totalCost,
        totalValue,
        profitLoss,
        profitLossPercent,
        items: portfolioItems
    } = usePortfolio(allAssets, currencies);

    // Derived Data for fallback lookups if needed (removed currencyMap since hook handles it)

    useEffect(() => {
        if (user?.encrypted && !encryptionKey) {
            setIsSecurityModalOpen(true);
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
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors?.[0] || 'Yanlış şifreleme anahtarı.';
            dispatch(addToast({ message: errorMessage, type: 'error' }));
        } finally {
            setIsVerifying(false);
        }
    };

    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const toggleExpanded = (id: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

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

            {/* Top Summary Cards */}
            {!isLoading && portfolioItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-[2rem] p-6 backdrop-blur-xl hover:border-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-500/0 transition-all duration-300"></div>
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20 shadow-lg shadow-amber-500/5 group-hover:scale-110 transition-transform duration-300">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam Harcama</p>
                                <p className="text-2xl sm:text-3xl font-black text-white truncate tracking-tight">
                                    ₺{totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-[2rem] p-6 backdrop-blur-xl hover:border-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/0 transition-all duration-300"></div>
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20 shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform duration-300">
                                <Banknote className="w-7 h-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam Değer</p>
                                <p className="text-2xl sm:text-3xl font-black text-white truncate tracking-tight">
                                    ₺{totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={`group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border rounded-2xl sm:rounded-[2rem] p-6 backdrop-blur-xl sm:col-span-2 lg:col-span-1 overflow-hidden transition-all duration-300 hover:shadow-xl ${profitLoss >= 0 ? 'border-green-500/20 hover:border-green-500/30 hover:shadow-green-500/5' : 'border-red-500/20 hover:border-red-500/30 hover:shadow-red-500/5'}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300 ${profitLoss >= 0 ? 'from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/0' : 'from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/0'}`}></div>
                        <div className="relative flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-transform duration-300 group-hover:scale-110 ${profitLoss >= 0 ? 'bg-gradient-to-br from-green-500/10 to-green-600/10 text-green-500 border-green-500/20 shadow-green-500/5' : 'bg-gradient-to-br from-red-500/10 to-red-600/10 text-red-500 border-red-500/20 shadow-red-500/5'}`}>
                                {profitLoss >= 0 ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest">Toplam Kar/Zarar</p>
                                    <div className="group relative">
                                        <Info className="w-3 h-3 text-zinc-500 cursor-help" />
                                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-800 border border-white/10 rounded-lg text-xs text-zinc-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                                            Tahmini rakamlar.
                                        </div>
                                    </div>
                                </div>
                                <p className={`text-2xl sm:text-3xl font-black truncate tracking-tight ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {profitLoss >= 0 ? '+' : ''}₺{Math.abs(profitLoss).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className={`text-xs font-bold mt-1 ${profitLoss >= 0 ? 'text-green-500/60' : 'text-red-500/60'}`}>
                                    {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 2: Varlık Detayları */}
            <section className="bg-zinc-900 border border-white/5 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <Coins size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Varlık Detayları</h2>
                </div>

                {isLoading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
                        <p className="text-zinc-400">Yükleniyor...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <>
                            {/* Mobile Card View (< lg) */}
                            <div className="lg:hidden space-y-4">
                                {portfolioItems.map((item) => {
                                    const { currency, amount, profitLoss, profitLossPercent, averageCost, currentValue } = item;
                                    if (!currency) return null;
                                    const isProfit = profitLoss >= 0;
                                    const isExpanded = expandedItems.has(item.currencyId);

                                    // Get history for this currency
                                    const historyAssets = allAssets.filter(
                                        a => Number(a.currency_id) === item.currencyId && a.type === 'buy'
                                    );

                                    return (
                                        <div key={item.currencyId} className="bg-zinc-800/40 border border-white/5 rounded-xl transition-all overflow-hidden shadow-sm">
                                            {/* Summary Header (Clickable) */}
                                            <div
                                                className="p-5 flex flex-col gap-5 cursor-pointer hover:bg-white/5 transition-colors"
                                                onClick={() => toggleExpanded(item.currencyId)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 shadow-inner">
                                                            <span className="text-base font-black text-zinc-400">
                                                                {currency.code?.substring(0, 1)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-black text-lg text-white tracking-tight">
                                                                    {(currency.type === 'Altın' || currency.type === 'Gold') ? currency.name : currency.code}
                                                                </h3>
                                                                {historyAssets.length > 0 && (
                                                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} p-1 bg-white/5 rounded-full`}>
                                                                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Toplam Miktar</p>
                                                        <p className="text-white text-base font-bold">
                                                            {amount.toLocaleString('tr-TR')} <span className="text-[10px] text-zinc-500 font-normal">{getAssetUnit(currency.code, currency.name)}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Ort. Maliyet</p>
                                                        <p className="text-zinc-300 text-sm font-medium">
                                                            ₺{averageCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Toplam Değer</p>
                                                        <p className="text-white text-base font-black">
                                                            ₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Kar/Zarar</p>
                                                        <div className={`flex flex-col items-end ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                                            <span className="font-black text-sm">
                                                                {isProfit ? '+' : ''}₺{Math.abs(profitLoss).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                            <span className="text-[10px] font-bold opacity-80 mt-0.5">
                                                                %{Math.abs(profitLossPercent).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded History - Improved UI */}
                                            {isExpanded && historyAssets.length > 0 && (
                                                <div className="bg-zinc-950/30 border-t border-white/5 p-5 space-y-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <History className="w-3.5 h-3.5 text-amber-500" />
                                                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Alım Geçmişi</p>
                                                    </div>
                                                    {historyAssets.map(asset => {
                                                        const assetAmount = parseFloat(asset.amount);
                                                        const assetPrice = parseFloat(asset.price);
                                                        const currentPrice = parseFloat(currency.selling);
                                                        const assetValue = assetAmount * currentPrice;
                                                        const assetCost = assetAmount * assetPrice; // Total Cost
                                                        const assetPL = assetValue - assetCost;
                                                        const isAssetProfit = assetPL >= 0;

                                                        return (
                                                            <div key={asset.id} className="relative bg-zinc-900 border border-white/5 rounded-2xl p-5 overflow-hidden group hover:border-amber-500/20 transition-all shadow-lg shadow-black/20">
                                                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                                                                    <Coins className="w-20 h-20" />
                                                                </div>

                                                                <div className="relative z-10 flex flex-col gap-4">
                                                                    {/* Header: Date & Place & P/L */}
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex flex-col">
                                                                            {asset.place && (
                                                                                <span className="text-sm font-bold text-white mb-0.5">{asset.place}</span>
                                                                            )}
                                                                            <span className="text-xs text-zinc-500 font-medium">
                                                                                {formatDate(asset.date, dateFormat)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`text-right font-black ${isAssetProfit ? 'text-green-500' : 'text-red-500'}`}>
                                                                                <div className="text-sm">{isAssetProfit ? '+' : ''}₺{Math.abs(assetPL).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => handleDeleteClick(asset, e)}
                                                                                className="p-2 -mr-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Details Grid */}
                                                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                                                        <div>
                                                                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Miktar</p>
                                                                            <p className="text-sm font-bold text-white">
                                                                                {assetAmount.toLocaleString('tr-TR')} <span className="text-[10px] text-zinc-500 font-normal">{getAssetUnit(currency.code, currency.name)}</span>
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Birim Fiyat</p>
                                                                            <p className="text-sm font-medium text-zinc-400">₺{assetPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Toplam Maliyet</p>
                                                                            <p className="text-sm font-bold text-zinc-300">
                                                                                ₺{assetCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Güncel Değer</p>
                                                                            <p className="text-sm font-bold text-white">
                                                                                ₺{assetValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop Table View (>= lg) */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-xs font-black uppercase tracking-widest text-zinc-500">
                                            <th className="px-4 py-4 w-12"></th>
                                            <th className="px-4 py-4">Varlık</th>
                                            <th className="px-4 py-4">Değerlendirme</th>
                                            <th className="px-4 py-4 text-center">Miktar</th>
                                            <th className="px-4 py-4 text-right">Ort. Fiyat</th>
                                            <th className="px-4 py-4 text-right">Güncel Fiyat</th>
                                            <th className="px-4 py-4 text-right">Değer</th>
                                            <th className="px-4 py-4 text-right">K/Z</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {portfolioItems.map((item) => {
                                            const { currency, amount, averageCost, currentValue, profitLoss, profitLossPercent, places } = item;
                                            if (!currency) return null;
                                            const currentPrice = parseFloat(currency.selling);
                                            const isProfit = profitLoss >= 0;
                                            const isExpanded = expandedItems.has(item.currencyId);

                                            const historyAssets = allAssets.filter(
                                                a => Number(a.currency_id) === item.currencyId && a.type === 'buy'
                                            );

                                            return (
                                                <React.Fragment key={item.currencyId}>
                                                    {/* Parent Row */}
                                                    <tr
                                                        className={`transition-colors group cursor-pointer ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
                                                        onClick={() => toggleExpanded(item.currencyId)}
                                                    >
                                                        <td className="px-4 py-4 text-zinc-500">
                                                            {historyAssets.length > 0 && (
                                                                <div className={`transition-transform duration-300 w-6 h-6 flex items-center justify-center rounded-full bg-white/5 ${isExpanded ? 'rotate-180 bg-white/10' : ''}`}>
                                                                    <ChevronDown className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-all">
                                                                    <span className="text-xs font-bold text-zinc-400 group-hover:text-amber-500">
                                                                        {currency.code?.substring(0, 1)}
                                                                    </span>
                                                                </div>
                                                                <span className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                                                                    {(currency.type === 'Altın' || currency.type === 'Gold') ? currency.name : currency.code}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-zinc-300">{Array.from(places).join(', ') || '-'}</span>
                                                                <span className="text-[10px] text-zinc-500 font-medium bg-white/5 px-2 py-0.5 rounded w-fit mt-1">ÖZET</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="text-sm font-bold text-white">
                                                                {amount.toLocaleString('tr-TR')}
                                                                <span className="text-xs font-normal text-zinc-500 ml-1">{getAssetUnit(currency.code, currency.name)}</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <span className="text-sm font-medium text-zinc-400">
                                                                ₺{averageCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <span className="text-sm font-bold text-white">
                                                                ₺{currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <span className="text-sm font-black text-white">
                                                                ₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className={`flex flex-col items-end ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                                                <span className="text-sm font-bold">
                                                                    {isProfit ? '+' : ''}₺{Math.abs(profitLoss).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                                <span className="text-xs font-bold opacity-80">
                                                                    %{Math.abs(profitLossPercent).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Children Rows */}
                                                    {isExpanded && historyAssets.map(asset => {
                                                        const assetAmount = parseFloat(asset.amount);
                                                        const assetPrice = parseFloat(asset.price);
                                                        const assetValue = assetAmount * currentPrice;
                                                        const assetCost = assetAmount * assetPrice;
                                                        const assetPL = assetValue - assetCost;
                                                        const assetPLPercent = assetCost > 0 ? (assetPL / assetCost) * 100 : 0;
                                                        const isAssetProfit = assetPL >= 0;

                                                        return (
                                                            <tr key={asset.id} className="bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
                                                                <td className="px-4 py-3 border-l-2 border-amber-500/20"></td>
                                                                <td className="px-4 py-3">
                                                                    <div className="pl-4 flex flex-col">
                                                                        <span className="text-xs text-zinc-400">Alım İşlemi</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex flex-col">
                                                                        {asset.place && <span className="text-sm font-medium text-zinc-300">{asset.place}</span>}
                                                                        <span className="text-xs text-zinc-500">{formatDate(asset.date, dateFormat)}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className="text-sm text-zinc-300">
                                                                        {assetAmount.toLocaleString('tr-TR')}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-sm font-bold text-zinc-300">
                                                                            ₺{assetCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </span>
                                                                        <span className="text-[10px] text-zinc-500">
                                                                            @{assetPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex justify-end">
                                                                        <button
                                                                            onClick={(e) => handleDeleteClick(asset, e)}
                                                                            className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                            title="Varlığı Sil"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className="text-sm font-medium text-zinc-300">
                                                                        ₺{assetValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className={`flex flex-col items-end ${isAssetProfit ? 'text-green-500' : 'text-red-500'}`}>
                                                                        <span className="text-sm font-bold">
                                                                            {isAssetProfit ? '+' : ''}₺{Math.abs(assetPL).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </span>
                                                                        <span className="text-xs opacity-70">
                                                                            %{Math.abs(assetPLPercent).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {portfolioItems.length === 0 && (
                                <div className="py-12 text-center text-zinc-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <Wallet className="w-10 h-10 opacity-20" />
                                        <p>Henüz bir varlık eklememişsiniz.</p>
                                        <Button
                                            className="bg-zinc-800 hover:bg-zinc-700 h-9 text-xs"
                                            onClick={() => navigate(PATHS.TRANSACTIONS)}
                                        >
                                            İşlemlere Git
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    </div>
                )}
            </section>

            {isSecurityModalOpen && (
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
            )}

            {isDeleteModalOpen && assetToDelete && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-lg shadow-red-500/5">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Varlığı Sil</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                <span className="text-white font-bold">{assetToDelete.amount} {getAssetUnit(assetToDelete.currency?.code || '', assetToDelete.currency?.name || '')} </span>
                                tutarındaki varlık kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setAssetToDelete(null);
                                    }}
                                    className="w-full"
                                >
                                    İptal
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleConfirmDelete}
                                    className="w-full border-red-500/20 hover:bg-red-500/10 text-red-500 hover:text-red-400"
                                >
                                    Sil
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetsPage;