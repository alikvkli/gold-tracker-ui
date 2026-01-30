import { useGoldPrices } from "@/hooks/useGoldPrices";
import { Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PATHS } from "@/routes/paths";

interface GoldPriceMarqueeProps {
    className?: string;
}

export default function GoldPriceMarquee({ className = "" }: GoldPriceMarqueeProps) {
    const { data, isLoading } = useGoldPrices();

    // Keys to display in marquee
    const targetKeys = ["USD", "EUR", "gram-altin", "ceyrek-altin", "cumhuriyet-altini"];

    const displayItems = targetKeys.map(key => data.find(item => item.name === key)).filter(Boolean);

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center py-12 ${className}`}>
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    // Helper to format name
    const formatName = (key: string) => {
        const names: Record<string, string> = {
            "USD": "ABD Doları",
            "EUR": "Euro",
            "gram-altin": "Gram Altın",
            "ceyrek-altin": "Çeyrek Altın",
            "cumhuriyet-altini": "Cumhuriyet Altını"
        };
        return names[key] || key;
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {displayItems.map((item) => {
                    if (!item) return null;
                    const isPositive = item.change.includes('%') ? !item.change.includes('-') : parseFloat(item.change) >= 0;

                    return (
                        <div key={item.name} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white group-hover:text-amber-400 transition-colors uppercase">
                                    {formatName(item.name)}
                                </span>
                                <span className={`text-xs font-mono font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {item.change}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-400 text-xs">Alış</span>
                                    <span className="text-white font-medium">₺{item.buying}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-zinc-400 text-xs">Satış</span>
                                    <span className="text-amber-400 font-bold">₺{item.selling}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-center">
                <Link
                    to={PATHS.MARKET}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                >
                    Tüm Fiyatları Gör
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
