import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet,
    History,
    Loader2,
    Info,
    Search,
    Coins,
    Banknote,
    LayoutGrid,
    ChevronDown,
} from 'lucide-react';
import { useAppSelector } from '../../hooks';

import { PATHS } from '../../routes/paths';
import { formatDate } from '@/lib/date';
import {
    useGetAllAssetsQuery,
    useGetCurrenciesQuery
} from '@/features/api/apiSlice';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { dateFormat, user, encryptionKey } = useAppSelector(state => state.app);
    const [activeTab, setActiveTab] = useState<'ALL' | 'GOLD' | 'CURRENCY'>('ALL');

    // RTK Query Hooks with Polling
    const skipQuery = user?.encrypted && !encryptionKey;

    // Poll every 60 seconds
    const {
        data: currencies = [],
        isLoading: isCurrenciesLoading
    } = useGetCurrenciesQuery(undefined, { pollingInterval: 60000 });

    const {
        isLoading: isAssetsLoading
    } = useGetAllAssetsQuery(undefined, {
        skip: skipQuery,
        pollingInterval: 60000
    });

    const isLoading = isCurrenciesLoading || (isAssetsLoading && !skipQuery);

    // Calculate Total Portfolio Value using correct aggregation logic (handling Sells)


    // Filter and Sort Logic
    const [searchTerm, setSearchTerm] = useState("");

    const categories = [
        { id: 'ALL', label: 'Tümü', icon: LayoutGrid },
        { id: 'GOLD', label: 'Altın', icon: Coins },
        { id: 'CURRENCY', label: 'Döviz', icon: Banknote },
    ];

    const filteredRates = useMemo(() => {
        // Whitelist for currencies
        const ALLOWED_CURRENCIES = ["USD", "EUR", "GBP", "CHF", "CAD", "AUD", "JPY", "SAR", "DKK", "SEK", "NOK", "RUB", "CNY", "AED"];

        let results = currencies.filter(cur => {
            const searchLower = searchTerm.toLowerCase();
            const matchSearch = cur.name.toLowerCase().includes(searchLower) || cur.code.toLowerCase().includes(searchLower);

            // If searching, show everything that matches
            if (searchTerm) return matchSearch;

            // Category and Whitelist Filter
            const isGold = cur.type === 'Altın' || cur.type === 'Gold';
            const isCurrency = cur.type === 'Döviz';

            // Filter minor currencies unless searching
            if (isCurrency && !ALLOWED_CURRENCIES.includes(cur.code) && !ALLOWED_CURRENCIES.includes(cur.name)) {
                return false;
            }

            if (activeTab === 'ALL') return isGold || isCurrency;
            if (activeTab === 'GOLD') return isGold;
            if (activeTab === 'CURRENCY') return isCurrency;

            return matchSearch;
        });

        // Sorting Logic
        results.sort((a, b) => {
            const isGoldA = a.type === 'Altın' || a.type === 'Gold';
            const isGoldB = b.type === 'Altın' || b.type === 'Gold';

            if (isGoldA && !isGoldB) return -1;
            if (!isGoldA && isGoldB) return 1;

            const priorityOrder = ["gram-altin", "ceyrek-altin", "ons", "USD", "EUR", "GBP"];
            // Check against both name and code for robustness
            const getIndex = (item: any) => {
                let idx = priorityOrder.indexOf(item.name);
                if (idx === -1) idx = priorityOrder.indexOf(item.code);
                return idx;
            };

            const indexA = getIndex(a);
            const indexB = getIndex(b);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return 0;
        });

        return results;
    }, [currencies, searchTerm, activeTab]);

    // Disclaimer State
    const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(() => {
        const saved = localStorage.getItem('disclaimerExpanded');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const toggleDisclaimer = () => {
        const newState = !isDisclaimerExpanded;
        setIsDisclaimerExpanded(newState);
        localStorage.setItem('disclaimerExpanded', JSON.stringify(newState));
    };

    return (
        <div className="space-y-6 lg:space-y-10 font-sans selection:bg-amber-500/30 selection:text-amber-200">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight mb-2">Panel</h1>
                    <p className="text-xs sm:text-sm lg:text-base text-zinc-500 font-medium">Portföyünüzün genel durumu ve canlı kurlar.</p>
                </div>

            </header>

            {/* Custom Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
                <div className="xl:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">

                    {/* Disclaimer - Collapsible */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 transition-all duration-300">
                        <div
                            className="flex items-center justify-between gap-3 cursor-pointer select-none"
                            onClick={toggleDisclaimer}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 shrink-0">
                                    <Info size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-amber-500">Önemli Bilgilendirme</h4>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-amber-500/50 transition-transform duration-300 ${isDisclaimerExpanded ? 'rotate-180' : ''}`} />
                        </div>

                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDisclaimerExpanded ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-[3.25rem]">
                                Bu platformda gösterilen altın ve döviz fiyatları, piyasa ortalaması alınarak <strong>tahmini</strong> olarak sunulmaktadır.
                                Kurumumuz bir borsa veya döviz bürosu değildir; gösterilen değerler üzerinden alım/satım yapılmaz.
                                Gerçek işlem fiyatları, piyasa koşullarına ve işlem yaptığınız kuruma göre farklılık gösterebilir.
                            </p>
                        </div>
                    </div>
                    {/* Controls Area (Tabs + Search) */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                        {/* Tabs */}
                        <div className="flex p-1 bg-zinc-900 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeTab === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveTab(cat.id as any)}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${isActive
                                            ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-72 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Varlık ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    {/* Rates Table */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl relative min-h-[400px]">
                        {isLoading && (
                            <div className="absolute inset-0 z-10 bg-zinc-950/20 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 bg-white/5">
                                        <th className="px-3 py-3 sm:px-6 sm:py-5">Varlık</th>
                                        <th className="hidden sm:table-cell px-6 py-5 text-center">Türü</th>
                                        <th className="px-3 py-3 sm:px-6 sm:py-5 text-right">Alış</th>
                                        <th className="px-3 py-3 sm:px-6 sm:py-5 text-right">Satış</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredRates.map((cur: any) => {
                                        const isGold = cur.type === 'Altın' || cur.type === 'Gold' || cur.name.includes('Altın');

                                        return (
                                            <tr key={cur.id} className="group hover:bg-white/5 transition-colors">
                                                <td className="px-3 py-3 sm:px-6 sm:py-5">
                                                    <div className="flex items-center gap-2 sm:gap-4">
                                                        <div className={`hidden sm:flex w-12 h-12 rounded-2xl items-center justify-center border transition-all duration-300 group-hover:scale-105 ${isGold
                                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/5'
                                                            : 'bg-zinc-800 border-white/5 text-zinc-400'
                                                            }`}>
                                                            {isGold ? <Coins className="w-6 h-6" /> : <span className="text-lg font-black">{cur.code.substring(0, 1).toUpperCase()}</span>}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-xs sm:text-base group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                                                                {cur.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-5 text-center">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isGold
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        : 'bg-zinc-800 text-zinc-400 border-white/5'
                                                        }`}>
                                                        {cur.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 sm:px-6 sm:py-5 text-right">
                                                    <div className="text-white font-bold font-mono text-xs sm:text-base">₺{parseFloat(cur.buying).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                                                </td>
                                                <td className="px-3 py-3 sm:px-6 sm:py-5 text-right">
                                                    <div className="text-amber-400 font-bold font-mono text-xs sm:text-base">₺{parseFloat(cur.selling).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer / Stats */}
                        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-zinc-950/30 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-zinc-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span>Canlı Piyasa Verileri</span>
                            </div>
                            {/* Using first item's date as general update time, or current time if polling */}
                            <span className="font-mono opacity-60">Son Güncelleme: {currencies[0]?.last_updated_at ? formatDate(currencies[0].last_updated_at, dateFormat) : 'Yükleniyor...'}</span>
                        </div>

                        {filteredRates.length === 0 && (
                            <div className="py-20 text-center">
                                <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                <h3 className="text-white font-bold text-lg mb-1">Sonuç Bulunamadı</h3>
                                <p className="text-zinc-500">Aradığınız kriterlere uygun varlık bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Widget */}
                <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 border border-white/5 rounded-xl sm:rounded-2xl lg:rounded-[3rem] p-4 sm:p-6 md:p-8 lg:p-10 backdrop-blur-2xl flex flex-col shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                            <Wallet className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight mb-4 sm:mb-6 md:mb-8">Durum</h3>
                            <div className="space-y-3 sm:space-y-4 md:space-y-6">
                                <div className="p-3 sm:p-4 md:p-6 bg-white/5 rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/5">
                                    <p className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 sm:mb-3 md:mb-4">Hızlı Erişim</p>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        <button
                                            onClick={() => navigate(PATHS.ASSETS)}
                                            className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 p-2.5 sm:p-3 md:p-4 bg-zinc-900 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-500" />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400">Varlıklar</span>
                                        </button>
                                        <button
                                            onClick={() => navigate(PATHS.PROFILE)}
                                            className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 p-2.5 sm:p-3 md:p-4 bg-zinc-900 rounded-lg sm:rounded-xl md:rounded-2xl border border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400">Ayarlar</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/5 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
                                        <History className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-zinc-700" />
                                    </div>
                                    <p className="text-[11px] sm:text-xs md:text-sm font-bold text-zinc-500 leading-relaxed">
                                        Tüm işlemlerinizi detaylı olarak incelemek ister misiniz?
                                    </p>
                                    <button
                                        onClick={() => navigate(PATHS.ASSETS)}
                                        className="w-full mt-4 sm:mt-6 md:mt-8 text-[9px] sm:text-[10px] font-black px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 bg-white text-zinc-900 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-amber-500 hover:text-zinc-900 transition-all uppercase tracking-[0.2em] shadow-xl"
                                    >
                                        Dökümü Aç
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
