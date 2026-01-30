import { useGoldPrices } from "@/hooks/useGoldPrices";
import { Loader2, ArrowLeft, Search, Coins, Banknote, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useState, useMemo } from "react";
import MobileBottomNav from "@/components/Navigation/MobileBottomNav";
import Footer from "@/components/Footer";

type Category = 'ALL' | 'GOLD' | 'CURRENCY';

export default function PublicMarketPage() {
    const { data: currencies, isLoading, lastUpdate } = useGoldPrices();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<Category>('ALL');

    const filteredData = useMemo(() => {
        // Whitelist for currencies (to filter out minor ones)
        const ALLOWED_CURRENCIES = ["USD", "EUR", "GBP", "CHF", "CAD", "AUD", "JPY", "SAR"];

        let results = currencies.filter(item => {
            const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

            // If searching, show everything that matches
            if (searchTerm) return matchSearch;

            // Otherwise apply category and whitelist filters
            const isGold = item.type === 'Altın' || item.type === 'Gold' || item.name.includes('altin') || item.name.includes('bilezik') || item.name === 'ons';
            const isCurrency = item.type === 'Döviz';

            // Filter minor currencies if category is ALL or CURRENCY
            if (isCurrency && !ALLOWED_CURRENCIES.includes(item.name)) {
                return false;
            }

            if (activeCategory === 'ALL') return isGold || isCurrency;
            if (activeCategory === 'GOLD') return isGold;
            if (activeCategory === 'CURRENCY') return isCurrency;

            return matchSearch;
        });

        // Sorting Logic: Gold First, then Priority Currencies, then others
        results.sort((a, b) => {
            const isGoldA = a.type === 'Altın' || a.name.includes('altin') || a.name === 'ons';
            const isGoldB = b.type === 'Altın' || b.name.includes('altin') || b.name === 'ons';

            if (isGoldA && !isGoldB) return -1;
            if (!isGoldA && isGoldB) return 1;

            // Define specific order for popular items
            const priorityOrder = ["gram-altin", "ceyrek-altin", "ons", "USD", "EUR", "GBP"];
            const indexA = priorityOrder.indexOf(a.name);
            const indexB = priorityOrder.indexOf(b.name);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return 0;
        });

        return results;
    }, [currencies, searchTerm, activeCategory]);

    const categories = [
        { id: 'ALL', label: 'Tümü', icon: LayoutGrid },
        { id: 'GOLD', label: 'Altın', icon: Coins },
        { id: 'CURRENCY', label: 'Döviz', icon: Banknote },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500/30 selection:text-amber-200">
            {/* Background Ornaments */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
            </div>

            {/* Header */}
            <nav className="sticky top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to={PATHS.HOME} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Ana Sayfa</span>
                    </Link>
                    <div className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
                        Canlı Piyasa
                    </div>
                    <div className="w-20"></div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
                {/* Hero / Title Section */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Güncel Piyasa Verileri</h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Altın, döviz ve emtia piyasalarındaki anlık değişimleri profesyonel araçlarla takip edin.
                    </p>
                </div>

                {/* Controls Area */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    {/* Tabs */}
                    <div className="flex p-1 bg-zinc-900 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id as Category)}
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

                {isLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                        <p className="text-zinc-500 font-medium animate-pulse">Veriler yükleniyor...</p>
                    </div>
                ) : (
                    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 bg-white/5">
                                        <th className="px-3 py-3 sm:px-6 sm:py-5">Varlık</th>
                                        <th className="hidden sm:table-cell px-6 py-5 text-center">Türü</th>
                                        <th className="px-3 py-3 sm:px-6 sm:py-5 text-right">Alış</th>
                                        <th className="px-3 py-3 sm:px-6 sm:py-5 text-right">Satış</th>
                                        <th className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-5 text-right">Değişim</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredData.map((currency) => {
                                        const isPositive = currency.change.includes('%') ? !currency.change.includes('-') : parseFloat(currency.change) >= 0;
                                        const isGold = currency.type === 'Altın' || currency.type === 'Gold' || currency.name.includes('altin');

                                        return (
                                            <tr key={currency.name} className="group hover:bg-white/5 transition-colors">
                                                <td className="px-3 py-3 sm:px-6 sm:py-5">
                                                    <div className="flex items-center gap-2 sm:gap-4">
                                                        <div className={`hidden sm:flex w-12 h-12 rounded-2xl items-center justify-center border transition-all duration-300 group-hover:scale-105 ${isGold
                                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/5'
                                                            : 'bg-zinc-800 border-white/5 text-zinc-400'
                                                            }`}>
                                                            {isGold ? <Coins className="w-6 h-6" /> : <span className="text-lg font-black">{currency.name.substring(0, 1).toUpperCase()}</span>}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-xs sm:text-base group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                                                                {currency.name.replace(/-/g, ' ')}
                                                            </div>
                                                            <div className="hidden sm:block text-xs text-zinc-500 font-medium">Canlı Veri</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-5 text-center">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isGold
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        : 'bg-zinc-800 text-zinc-400 border-white/5'
                                                        }`}>
                                                        {currency.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 sm:px-6 sm:py-5 text-right">
                                                    <div className="text-white font-bold font-mono text-xs sm:text-base">₺{currency.buying}</div>
                                                </td>
                                                <td className="px-3 py-3 sm:px-6 sm:py-5 text-right">
                                                    <div className="text-amber-400 font-bold font-mono text-xs sm:text-base">₺{currency.selling}</div>
                                                </td>
                                                <td className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-5 text-right">
                                                    <div className={`inline-flex items-center justify-center w-full sm:w-auto px-1.5 py-1 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-sm font-bold border ${isPositive
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                        {currency.change}
                                                    </div>
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
                            <span className="font-mono opacity-60">Son Güncelleme: {lastUpdate}</span>
                        </div>

                        {filteredData.length === 0 && (
                            <div className="py-20 text-center">
                                <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                <h3 className="text-white font-bold text-lg mb-1">Sonuç Bulunamadı</h3>
                                <p className="text-zinc-500">Aradığınız kriterlere uygun varlık bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
            <MobileBottomNav />
        </div>
    );
}
