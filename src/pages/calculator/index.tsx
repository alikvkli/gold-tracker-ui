import React, { useState, useMemo, useEffect } from 'react';
import {
    Calculator,
    ArrowRightLeft,
    RefreshCw,
    TrendingUp,
    Wallet,
    ArrowDown,
    Search,
    X,
    Coins,
    Banknote
} from 'lucide-react';
import { useGetCurrenciesQuery, Currency } from '../../features/api/apiSlice';

interface CurrencySelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (currencyId: string) => void;
    currencies: Partial<Currency>[];
    selectedId: string;
    title: string;
}

const CurrencySelectModal: React.FC<CurrencySelectModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currencies,
    selectedId,
    title
}) => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'gold' | 'currency'>('all');

    if (!isOpen) return null;

    // Filter logic
    const filteredCurrencies = currencies.filter(c => {
        // 1. Search filter
        const searchMatch =
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.code?.toLowerCase().includes(search.toLowerCase());

        if (!searchMatch) return false;

        // 2. Tab filter
        if (activeTab === 'gold') {
            return c.type === 'Altın' || c.type === 'Gold' || c.code?.includes('altin'); // Check code as fallback
        }
        if (activeTab === 'currency') {
            return (c.type !== 'Altın' && c.type !== 'Gold' && !c.code?.includes('altin'));
        }

        return true;
    });

    const getDisplayName = (c: Partial<Currency>) => {
        if (c.code === 'TRY') return 'Türk Lirası';
        // For Gold, use Name (e.g., Gram Altın). For Currency, use Code (e.g., USD) + Name
        if (c.type === 'Altın' || c.type === 'Gold' || c.code?.includes('altin')) {
            return c.name;
        }
        return `${c.code} - ${c.name}`;
    };


    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-zinc-900 border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[80vh] animate-in slide-in-from-bottom duration-300">

                {/* Header */}
                <div className="p-6 pb-2 border-b border-white/5 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Varlık ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-black/40 rounded-xl overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Tümü
                        </button>
                        <button
                            onClick={() => setActiveTab('currency')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'currency' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Banknote className="w-4 h-4" />
                            Döviz
                        </button>
                        <button
                            onClick={() => setActiveTab('gold')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'gold' ? 'bg-zinc-800 text-amber-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Coins className="w-4 h-4" />
                            Altın
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 p-2 scrollbar-hide">
                    {filteredCurrencies.length > 0 ? (
                        <div className="space-y-1">
                            {filteredCurrencies.map(c => {
                                const isSelected = String(c.id) === selectedId || (c.code === 'TRY' && selectedId === 'TRY');

                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            onSelect(c.code === 'TRY' ? 'TRY' : String(c.id));
                                            onClose();
                                        }}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${isSelected ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                                            {c.code?.substring(0, 1)}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className={`font-bold ${isSelected ? 'text-amber-500' : 'text-white'}`}>
                                                {getDisplayName(c)}
                                            </div>
                                            <div className="text-xs text-zinc-500 font-medium">
                                                {c.code === 'TRY' ? (
                                                    <span>Temel Para Birimi</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-zinc-400">
                                                            Alış: <span className="text-zinc-300">₺{parseFloat(c.buying || '0').toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                                        <span className="text-zinc-400">
                                                            Satış: <span className="text-zinc-300">₺{parseFloat(c.selling || '0').toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                            <Search className="w-8 h-8 mb-2 opacity-20" />
                            <p>Sonuç bulunamadı.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CalculatorPage: React.FC = () => {
    const { data: currencies = [], isLoading } = useGetCurrenciesQuery();

    const [amount, setAmount] = useState<string>('1');
    const [fromCurrencyId, setFromCurrencyId] = useState<string>('TRY');
    const [toCurrencyId, setToCurrencyId] = useState<string>('USD');

    // Modals
    const [isFromModalOpen, setIsFromModalOpen] = useState(false);
    const [isToModalOpen, setIsToModalOpen] = useState(false);

    // Constants
    const TRY_CURRENCY: Partial<Currency> = {
        id: -1, // Dummy ID
        code: 'TRY',
        name: 'Türk Lirası',
        selling: '1',
        buying: '1',
        type: 'Fiat'
    };

    // Prepare list for select
    const allCurrencies = useMemo(() => {
        // Filter out currencies with 0 price
        const validCurrencies = currencies.filter(c =>
            parseFloat(c.selling) > 0 && parseFloat(c.buying) > 0
        );
        return [TRY_CURRENCY, ...validCurrencies];
    }, [currencies]);

    // Set default TO currency once data is loaded
    useEffect(() => {
        if (!isLoading && currencies.length > 0 && toCurrencyId === 'USD') {
            const hasUSD = currencies.some(c => c.code === 'USD');
            if (!hasUSD && currencies[0]) {
                setToCurrencyId(String(currencies[0].id));
            } else if (hasUSD) {
                const usd = currencies.find(c => c.code === 'USD');
                if (usd) setToCurrencyId(String(usd.id));
            }
        }
    }, [currencies, isLoading]);


    const handleSwap = () => {
        setFromCurrencyId(toCurrencyId);
        setToCurrencyId(fromCurrencyId);
    };

    const getSelectedCurrency = (id: string) => {
        return allCurrencies.find(c => (c.code === id) || (String(c.id) === id));
    };

    const calculation = useMemo(() => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt < 0) return null;

        const from = getSelectedCurrency(fromCurrencyId);
        const to = getSelectedCurrency(toCurrencyId);

        if (!from || !to) return null;

        let result = 0;
        let rate = 0;

        const fromIsTRY = from.code === 'TRY';
        const toIsTRY = to.code === 'TRY';

        // 1. Same currency
        if (from.code === to.code) {
            return { result: amt, rate: 1, from, to };
        }

        // 2. TRY -> Asset
        if (fromIsTRY) {
            // Buying 'to' asset with TRY (Bank Sells)
            const price = parseFloat(to.selling!);
            result = amt / price;
            rate = 1 / price;
        }
        // 3. Asset -> TRY
        else if (toIsTRY) {
            // Selling 'from' asset to get TRY (Bank Buys)
            const price = parseFloat(from.buying!);
            result = amt * price;
            rate = price;
        }
        // 4. Asset -> Asset
        else {
            // Sell 'from' -> Buy 'to'
            const sellPrice = parseFloat(from.buying!);
            const buyPrice = parseFloat(to.selling!);

            const tryAmount = amt * sellPrice;
            result = tryAmount / buyPrice;

            rate = sellPrice / buyPrice;
        }

        return { result, rate, from, to };

    }, [amount, fromCurrencyId, toCurrencyId, allCurrencies]);

    const formatCurrencyResult = (val: number, isFiat: boolean) => {
        if (isFiat) {
            return val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return val.toLocaleString('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    };

    const getDisplayName = (c?: Partial<Currency>) => {
        if (!c) return '';
        if (c.code === 'TRY') return 'Türk Lirası';
        if (c.type === 'Altın' || c.type === 'Gold' || c.code?.includes('altin')) return c.name;
        return c.code;
    };


    const selectedFrom = getSelectedCurrency(fromCurrencyId);
    const selectedTo = getSelectedCurrency(toCurrencyId);

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                    <span className="bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
                        Dönüştürücü
                    </span>
                </h1>
                <p className="text-zinc-400 font-medium">Anlık piyasa verilerine göre hızlı dönüşüm (Döviz & Altın).</p>
            </header>

            <div className="max-w-2xl mx-auto pt-4 relative">
                {/* Glow Effects */}
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none opacity-50"></div>
                <div className="absolute top-40 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none opacity-50"></div>

                {/* Main Card */}
                <div className="relative bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50">

                    {/* FROM SECTION */}
                    <div className="p-6 sm:p-8 pb-6">
                        <label className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">
                            <Wallet className="w-4 h-4 text-zinc-500" />
                            Elimdeki Varlık
                        </label>

                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-transparent text-4xl sm:text-5xl font-black text-white focus:outline-none w-full sm:w-1/2 placeholder-zinc-700"
                                placeholder="0"
                            />

                            <button
                                onClick={() => setIsFromModalOpen(true)}
                                className="w-full sm:w-auto flex items-center justify-between gap-3 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl sm:rounded-2xl pl-4 pr-4 py-3 sm:py-4 text-white font-bold transition-all focus:ring-2 focus:ring-amber-500/50"
                            >
                                <span className="truncate max-w-[200px] text-lg">
                                    {getDisplayName(selectedFrom)}
                                </span>
                                <ArrowDown className="w-4 h-4 text-zinc-500" />
                            </button>
                        </div>
                    </div>

                    {/* DIVIDER & SWAP */}
                    <div className="relative h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex items-center justify-center -my-3 z-10 transition-colors">
                        <button
                            onClick={handleSwap}
                            className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all shadow-xl hover:scale-110 active:scale-95 group"
                        >
                            <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>

                    {/* TO SECTION */}
                    <div className="p-6 sm:p-8 pt-10 bg-black/20">
                        <label className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">
                            <TrendingUp className="w-4 h-4 text-zinc-500" />
                            Alacağım Varlık
                        </label>

                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                            <div className="w-full sm:w-1/2 overflow-hidden">
                                <div className="text-xs sm:text-xs font-bold text-amber-500/70 uppercase tracking-widest mb-1">
                                    Tahmini Tutar
                                </div>
                                {calculation ? (
                                    <div className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight truncate drop-shadow-2xl">
                                        <span className="bg-gradient-to-r from-amber-200 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                                            {formatCurrencyResult(calculation.result, calculation.to.code === 'TRY')}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-zinc-800">-</div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsToModalOpen(true)}
                                className="w-full sm:w-auto flex items-center justify-between gap-3 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl sm:rounded-2xl pl-4 pr-4 py-3 sm:py-4 text-white font-bold transition-all focus:ring-2 focus:ring-amber-500/50"
                            >
                                <span className="truncate max-w-[200px] text-lg">
                                    {getDisplayName(selectedTo)}
                                </span>
                                <ArrowDown className="w-4 h-4 text-zinc-500" />
                            </button>
                        </div>
                    </div>

                    {/* FOOTER RATES */}
                    {calculation && (
                        <div className="px-6 sm:px-8 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs sm:text-sm text-zinc-400 font-medium">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>1 {calculation.from.code} = {formatCurrencyResult(calculation.rate, calculation.to.code === 'TRY')} {calculation.to.code}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-zinc-500">
                        * Fiyatlar anlık piyasa (Alış/Satış) farkları gözetilerek hesaplanmıştır.
                    </p>
                </div>
            </div>

            {/* Modals */}
            <CurrencySelectModal
                isOpen={isFromModalOpen}
                onClose={() => setIsFromModalOpen(false)}
                onSelect={setFromCurrencyId}
                currencies={allCurrencies}
                selectedId={fromCurrencyId}
                title="Varlık Seçin"
            />
            <CurrencySelectModal
                isOpen={isToModalOpen}
                onClose={() => setIsToModalOpen(false)}
                onSelect={setToCurrencyId}
                currencies={allCurrencies}
                selectedId={toCurrencyId}
                title="Dönüştürülecek Varlık"
            />
        </div>
    );
};

export default CalculatorPage;
