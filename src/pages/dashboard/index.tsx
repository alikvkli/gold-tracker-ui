import React, { useEffect, useState } from 'react';
import { TrendingUp, Coins, LogOut, LayoutDashboard, History, User as UserIcon, Loader2, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { logout } from '@/features/app';
import { addToast } from '@/features/ui/uiSlice';
import api from '@/lib/api';

interface Currency {
    id: number;
    code: string;
    name: string;
    type: string;
    buying: string;
    selling: string;
    last_updated_at: string;
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.app);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCurrencies = async () => {
        try {
            const response = await api.get('/currencies');
            setCurrencies(response.data);
        } catch (error) {
            console.error('Kurlar alınırken hata oluştu:', error);
            dispatch(addToast({ message: 'Güncel kurlar alınamadı.', type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrencies();
        const interval = setInterval(fetchCurrencies, 60000); // 1 dakikada bir güncelle
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate(PATHS.HOME);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-zinc-900/30 flex flex-col p-6 fixed inset-y-0">
                <div className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-[1.02] cursor-pointer" onClick={() => navigate(PATHS.HOME)}>
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-zinc-900 shadow-lg shadow-amber-500/20">
                        <Coins className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
                        GoldTracker
                    </span>
                </div>

                <nav className="flex-1 flex flex-col gap-2">
                    <button onClick={() => navigate(PATHS.DASHBOARD)} className="flex items-center gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-amber-500 font-bold transition-all shadow-lg shadow-amber-500/5">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button onClick={() => navigate(PATHS.ASSETS)} className="flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-medium">
                        <History className="w-5 h-5" />
                        Varlıklarım
                    </button>
                    <button onClick={() => navigate(PATHS.PROFILE)} className="flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-medium">
                        <UserIcon className="w-5 h-5" />
                        Profil
                    </button>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-medium mt-auto"
                >
                    <LogOut className="w-5 h-5" />
                    Çıkış Yap
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-10 overflow-y-auto">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black mb-2 tracking-tight">Dashboard</h1>
                        <p className="text-zinc-500">Yatırımlarınızın genel durumu ve canlı kurlar.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Hesap Sahibi</p>
                            <p className="font-bold text-amber-500 leading-none">{user?.name} {user?.surname}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                            <UserIcon className="w-6 h-6 text-zinc-400" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp className="w-32 h-32" />
                        </div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Toplam Portföy Değeri</p>
                        <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">₺1,240,500.00</h2>
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold mt-6 px-3 py-1.5 bg-green-400/10 rounded-full w-fit border border-green-400/20">
                            <TrendingUp className="w-3.5 h-3.5" /> +₺12,400.00 (1.2%)
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-4 uppercase font-bold tracking-tighter">* Şifreli varlıklar dahil değildir.</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl lg:col-span-2 overflow-hidden relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Canlı Kurlar</p>
                                <h3 className="text-xl font-bold">Piyasa Özeti</h3>
                            </div>
                            <button
                                onClick={fetchCurrencies}
                                disabled={isLoading}
                                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-zinc-400 hover:text-white active:rotate-180"
                            >
                                <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="h-40 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currencies.slice(0, 6).map((cur) => (
                                    <div key={cur.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-amber-500/30 transition-all group">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase tracking-widest">{cur.code}</span>
                                            <TrendingUp className="w-3 h-3 text-green-400" />
                                        </div>
                                        <p className="text-zinc-400 text-xs font-medium mb-1 truncate">{cur.name}</p>
                                        <div className="flex flex-col">
                                            <span className="text-xl font-bold tracking-tighter">₺{parseFloat(cur.selling).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                            <span className="text-[10px] text-zinc-600 font-mono mt-1">{cur.last_updated_at}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black tracking-tight">Varlık Dağılımı</h3>
                            <button className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">Tümünü Gör</button>
                        </div>
                        <div className="aspect-square max-h-64 mx-auto bg-white/5 rounded-full border border-white/5 border-dashed flex items-center justify-center relative">
                            <div className="absolute inset-4 rounded-full border-8 border-amber-500/20 border-t-amber-500"></div>
                            <div className="text-center">
                                <p className="text-3xl font-black">75%</p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Gram Altın</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black tracking-tight">Son Hareketler</h3>
                            <button onClick={() => navigate(PATHS.ASSETS)} className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">Geçmişi İncele</button>
                        </div>
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
                            <History className="w-16 h-16 mb-6 opacity-10" />
                            <p className="font-medium">Henüz bir işleminiz bulunmuyor.</p>
                            <button
                                onClick={() => navigate(PATHS.ASSETS)}
                                className="mt-6 text-sm font-bold px-6 py-2.5 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500/20 transition-all"
                            >
                                İlk İşlemini Ekle
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
