import React from 'react';
import { Mail, MapPin, Copyright, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-white/5 bg-gradient-to-b from-zinc-900/40 via-zinc-900/30 to-zinc-950/50 backdrop-blur-xl relative overflow-hidden">
            {/* Dekoratif arka plan efektleri */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 lg:py-12">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                    {/* Sol taraf - Marka ve İletişim */}
                    <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-5">
                        {/* Marka */}
                        <div className="flex items-center gap-2 group">
                            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                            </div>
                            <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                                Fatal<span className="text-amber-500">Soft</span>
                            </span>
                        </div>

                        {/* İletişim bilgileri */}
                        <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 sm:gap-5">
                            <a
                                href="mailto:fatalsoft.inc@gmail.com"
                                className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-xl transition-all duration-300 group"
                            >
                                <div className="p-1.5 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-zinc-300 group-hover:text-amber-400 transition-colors">
                                    fatalsoft.inc@gmail.com
                                </span>
                            </a>
                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
                                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-zinc-400">
                                    Kocaeli, Gebze
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sağ taraf - Telif hakkı */}
                    <div className="flex flex-col items-center lg:items-end gap-2">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
                            <Copyright className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />
                            <span className="text-xs sm:text-sm text-zinc-400 font-medium">
                                {currentYear} <span className="font-bold text-zinc-300">FatalSoft</span>
                            </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-500 font-medium uppercase tracking-wider">
                            Tüm hakları saklıdır
                        </p>
                    </div>
                </div>

                {/* Alt çizgi */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center">
                    <p className="text-[10px] sm:text-xs text-zinc-600 font-medium">
                        Altın Cüzdan ile portföyünüzü takip edin
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

