import React, { useState, useMemo } from 'react';
import {
    ArrowRightLeft,
    RefreshCw,
    TrendingUp,
    ChevronDown,
    Search,
    X,
    Info,
    ArrowUpRight,
    Banknote,
    Coins
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
    isOpen, onClose, onSelect, currencies, selectedId, title
}) => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'gold' | 'currency'>('all');

    if (!isOpen) return null;

    const filtered = currencies.filter(c => {
        const match = c.name?.toLowerCase().includes(search.toLowerCase()) || c.code?.toLowerCase().includes(search.toLowerCase());
        if (!match) return false;

        if (activeTab === 'gold') {
            return c.type === 'Altın' || c.type === 'Gold' || c.code?.includes('altin');
        }
        if (activeTab === 'currency') {
            return (c.type !== 'Altın' && c.type !== 'Gold' && !c.code?.includes('altin'));
        }
        return true;
    });

    const formatCode = (code?: string) => {
        if (!code) return '';
        if (code === 'TRY') return 'TL';
        if (code.includes('altin')) {
            if (code === 'gram_altin') return 'GRAM';
            if (code === 'ceyrek_altin') return 'ÇEYREK';
            if (code === 'yarim_altin') return 'YARIM';
            if (code === 'tam_altin') return 'TAM';
            if (code === 'cumhuriyet_altini') return 'CUMHURİYET';
            if (code === 'ons_altin') return 'ONS';
            if (code === 'ata_altin') return 'ATA';
            if (code === 'resat_altin') return 'REŞAT';
            return code.replace(/_/g, ' ').toUpperCase();
        }
        return code;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X className="w-5 h-5 text-zinc-500" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Varlık ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-black/40 rounded-xl">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Tümü
                        </button>
                        <button
                            onClick={() => setActiveTab('currency')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'currency' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Banknote className="w-3.5 h-3.5" />
                            Döviz
                        </button>
                        <button
                            onClick={() => setActiveTab('gold')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'gold' ? 'bg-zinc-800 text-amber-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Coins className="w-3.5 h-3.5" />
                            Altın
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-2 space-y-1">
                    {filtered.map(c => {
                        const cleanCode = formatCode(c.code);
                        const isSelected = String(c.id) === selectedId || (c.code === 'TRY' && selectedId === 'TRY');

                        return (
                            <button
                                key={c.id}
                                onClick={() => { onSelect(c.code === 'TRY' ? 'TRY' : String(c.id)); onClose(); }}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${isSelected ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs ${isSelected ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {cleanCode.substring(0, 3)}
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold ${isSelected ? 'text-amber-500' : 'text-white'}`}>
                                            {c.code === 'TRY' ? 'Türk Lirası' : c.name}
                                        </div>
                                        <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{cleanCode}</div>
                                    </div>
                                </div>

                                {c.selling && (
                                    <div className="text-right">
                                        <div className="text-sm font-mono text-zinc-300">
                                            <span className="text-zinc-500 text-[10px] mr-2">SATIŞ</span>
                                            ₺{parseFloat(c.selling).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        {c.buying && (
                                            <div className="text-xs font-mono text-zinc-500">
                                                <span className="text-zinc-600 text-[10px] mr-2">ALIŞ</span>
                                                ₺{parseFloat(c.buying).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const CalculatorPage: React.FC = () => {
    const { data: currencies = [] } = useGetCurrenciesQuery();
    const [amount, setAmount] = useState<string>('1000');
    const [fromId, setFromId] = useState('TRY');
    const [toId, setToId] = useState('USD');
    const [modals, setModals] = useState({ from: false, to: false });

    const TRY_DATA = { id: -1, code: 'TRY', name: 'Türk Lirası', selling: '1', buying: '1', type: 'Fiat' };
    const allItems = useMemo(() => [TRY_DATA, ...currencies.filter(c => parseFloat(c.selling) > 0)], [currencies]);

    const fromVal = allItems.find(c => c.code === fromId || String(c.id) === fromId);
    const toVal = allItems.find(c => c.code === toId || String(c.id) === toId);

    const calc = useMemo(() => {
        if (!fromVal || !toVal || !amount) return null;
        const buy = parseFloat(fromVal.buying!);
        const sell = parseFloat(toVal.selling!);
        const result = (parseFloat(amount) * buy) / sell;
        return { result, rate: buy / sell };
    }, [amount, fromVal, toVal]);

    const getDisplayCode = (c?: typeof TRY_DATA) => {
        if (!c?.code) return '';
        if (c.code === 'TRY') return 'TL';
        // Generic mapping for button display
        if (c.code === 'gram_altin') return 'Gram Altın';
        if (c.code === 'ceyrek_altin') return 'Çeyrek Altın';
        if (c.code === 'yarim_altin') return 'Yarım Altın';
        if (c.code === 'tam_altin') return 'Tam Altın';
        if (c.code === 'cumhuriyet_altini') return 'Cumhuriyet';
        if (c.code === 'ons_altin') return 'Ons Altın';
        if (c.code === 'ata_altin') return 'Ata Altın';
        if (c.code === 'resat_altin') return 'Reşat Altın';

        // Capitalize code if simpler
        return c.code.toUpperCase();
    };

    return (
        <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
            {/* Minimalist Header */}
            <div className="text-center mb-10 sm:mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Piyasa Verileri Canlı
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                    Dönüştürücü<span className="text-amber-500">.</span>
                </h1>
                <p className="text-zinc-500 font-medium max-w-md mx-auto text-sm sm:text-base">
                    Varlıklarınız arasında hızlı ve güvenli hesaplama yapın.
                </p>
            </div>

            <div className="relative group">
                {/* Background Shadow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-amber-500/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />

                <div className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="flex flex-col divide-y divide-white/5 relative">

                        {/* INPUT: GÖNDERİLEN */}
                        <div className="p-8 sm:p-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Satılacak Varlık</span>
                                <Info className="w-4 h-4 text-zinc-700" />
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setModals({ ...modals, from: true })}
                                    className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all w-full sm:w-auto overflow-hidden group/btn"
                                >
                                    <span className="text-lg sm:text-2xl font-black text-white truncate group-hover/btn:text-amber-500 transition-colors">{getDisplayCode(fromVal)}</span>
                                    <ChevronDown className="w-5 h-5 text-zinc-500 shrink-0 group-hover/btn:text-amber-500 transition-colors" />
                                </button>

                                <div className="space-y-1">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-transparent text-5xl sm:text-6xl font-black text-white focus:outline-none placeholder-zinc-800"
                                        placeholder="0"
                                    />
                                    <div className="text-sm text-zinc-500 font-medium pl-1">
                                        {fromVal?.name}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RESULT: ALINACAK */}
                        <div className="p-8 sm:p-10 bg-black/20 space-y-6 relative">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Alınacak Varlık</span>
                                <TrendingUp className="w-4 h-4 text-amber-500/50" />
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setModals({ ...modals, to: true })}
                                    className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 bg-amber-500 text-black rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 w-full sm:w-auto overflow-hidden"
                                >
                                    <span className="text-lg sm:text-2xl font-black truncate">{getDisplayCode(toVal)}</span>
                                    <ChevronDown className="w-5 h-5 shrink-0" />
                                </button>

                                <div className="space-y-1">
                                    <div className="h-16 sm:h-20 flex items-end overflow-hidden">
                                        <div className="text-5xl sm:text-7xl font-black tracking-tighter truncate leading-none drop-shadow-2xl">
                                            <span className="bg-gradient-to-r from-amber-200 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                                                {calc ? calc.result.toLocaleString('tr-TR', { maximumFractionDigits: toVal?.code === 'TRY' ? 2 : 4 }) : '0.00'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-zinc-500 font-medium italic pl-1">
                                        * Yaklaşık karşılığıdır
                                    </div>
                                </div>
                            </div>

                            {/* Swap Button (Centered vertically between sections) */}
                            <button
                                onClick={() => { setFromId(toId); setToId(fromId); }}
                                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-zinc-800 border-4 border-zinc-900 rounded-2xl flex items-center justify-center text-white hover:text-amber-500 transition-all hover:scale-110 z-10 shadow-xl"
                            >
                                <ArrowRightLeft className="w-6 h-6 rotate-90 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    {calc && (
                        <div className="px-8 sm:px-10 py-5 bg-white/[0.02] border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 text-zinc-400 text-xs sm:text-sm font-bold">
                                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                                1 {getDisplayCode(fromVal)} = {calc.rate.toLocaleString('tr-TR', { maximumFractionDigits: 6 })} {getDisplayCode(toVal)}
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-zinc-600 font-bold uppercase tracking-tighter hidden sm:flex">
                                <ArrowUpRight className="w-3 h-3" />
                                İşlem anlık kurlardan hesaplanmaktadır
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CurrencySelectModal
                isOpen={modals.from}
                onClose={() => setModals({ ...modals, from: false })}
                onSelect={setFromId}
                currencies={allItems}
                selectedId={fromId}
                title="Gönderilecek Varlık"
            />
            <CurrencySelectModal
                isOpen={modals.to}
                onClose={() => setModals({ ...modals, to: false })}
                onSelect={setToId}
                currencies={allItems}
                selectedId={toId}
                title="Alınacak Varlık"
            />
        </div>
    );
};

export default CalculatorPage;