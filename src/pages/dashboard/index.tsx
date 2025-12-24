import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Wallet,
    History,
    Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { PATHS } from '../../routes/paths';
import { addToast } from '@/features/ui/uiSlice';
import api from '@/lib/api';
import { formatDate } from '@/lib/date';

interface Currency {
    id: number;
    code: string;
    name: string;
    type: string;
    buying: string;
    selling: string;
    last_updated_at: string;
}

interface Asset {
    id: number;
    currency_id: number;
    amount: string;
    price: string;
    currency: {
        id: number;
        code: string;
        name: string;
        type: string;
    }
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { dateFormat } = useAppSelector(state => state.app);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Altın' | 'Döviz'>('Altın');

    const fetchData = async () => {
        try {
            const [currenciesRes, assetsRes] = await Promise.all([
                api.get('/currencies'),
                api.get('/assets?per_page=1000')
            ]);
            setCurrencies(currenciesRes.data);
            setAssets(assetsRes.data.data);
        } catch (error) {
            console.error('Veriler alınırken hata oluştu:', error);
            dispatch(addToast({ message: 'Veriler güncellenirken bir hata oluştu.', type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const totalPortfolioValue = assets.reduce((total, asset) => {
        const currency = currencies.find(c => c.id === asset.currency_id);
        if (currency) {
            return total + (parseFloat(asset.amount) * parseFloat(currency.selling));
        }
        return total;
    }, 0);

    const filteredRates = currencies.filter(c => {
        if (activeTab === 'Altın') return c.type === 'Altın' || c.type === 'Gold';
        return c.type === 'Döviz';
    });

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">Panel</h1>
                    <p className="text-zinc-500 font-medium">Portföyünüzün genel durumu ve canlı kurlar.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tahmini Değer</p>
                            <p className="text-xl font-black">
                                ₺{totalPortfolioValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Custom Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-8">
                    {/* Tab Switcher */}
                    <div className="flex items-center justify-between">
                        <div className="flex p-1.5 bg-zinc-900 border border-white/5 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('Altın')}
                                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Altın'
                                    ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20'
                                    : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                Altın
                            </button>
                            <button
                                onClick={() => setActiveTab('Döviz')}
                                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Döviz'
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                Döviz
                            </button>
                        </div>

                        <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-widest ${activeTab === 'Altın' ? 'text-amber-500 bg-amber-500/5' : 'text-blue-500 bg-blue-500/5'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === 'Altın' ? 'bg-amber-500' : 'bg-blue-500'
                                }`} />
                            Canlı Veri
                        </div>
                    </div>

                    {/* Rates Table */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
                        {isLoading && (
                            <div className="absolute inset-0 z-10 bg-zinc-950/20 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5">
                                        <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5">Varlık</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5">Alış</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 text-right">Satış</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRates.map((cur) => (
                                        <tr key={cur.id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${activeTab === 'Altın'
                                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                                        : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                        }`}>
                                                        {cur.code.substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white group-hover:text-amber-400 transition-colors uppercase">
                                                            {activeTab === 'Altın' ? cur.name : cur.code}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-0.5 opacity-50 uppercase">
                                                            {activeTab === 'Altın' ? cur.code : cur.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-zinc-400">₺{parseFloat(cur.buying).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                                    <div className="flex items-center gap-1 mt-1 text-[9px] text-green-400/50 font-bold uppercase tracking-tighter">
                                                        <TrendingUp className="w-2.5 h-2.5" /> +0.12%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className={`text-lg font-black tracking-tight ${activeTab === 'Altın' ? 'text-amber-500' : 'text-blue-500'
                                                    }`}>
                                                    ₺{parseFloat(cur.selling).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                                                    {formatDate(cur.last_updated_at, dateFormat)}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widget */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 border border-white/5 rounded-[3rem] p-10 backdrop-blur-2xl flex flex-col shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                            <Wallet className="w-48 h-48" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black tracking-tight mb-8">Durum</h3>
                            <div className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">Hızlı Erişim</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => navigate(PATHS.ASSETS)}
                                            className="flex flex-col items-center gap-3 p-4 bg-zinc-900 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <Wallet className="w-5 h-5 text-amber-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Varlıklar</span>
                                        </button>
                                        <button
                                            onClick={() => navigate(PATHS.PROFILE)}
                                            className="flex flex-col items-center gap-3 p-4 bg-zinc-900 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <History className="w-5 h-5 text-blue-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ayarlar</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                        <History className="w-8 h-8 text-zinc-700" />
                                    </div>
                                    <p className="text-sm font-bold text-zinc-500 leading-relaxed">
                                        Tüm işlemlerinizi detaylı olarak incelemek ister misiniz?
                                    </p>
                                    <button
                                        onClick={() => navigate(PATHS.ASSETS)}
                                        className="w-full mt-8 text-[10px] font-black px-8 py-5 bg-white text-zinc-900 rounded-2xl hover:bg-amber-500 hover:text-zinc-900 transition-all uppercase tracking-[0.2em] shadow-xl"
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
