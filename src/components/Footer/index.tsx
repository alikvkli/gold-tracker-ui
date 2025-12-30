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

            <div className="relative z-10 max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-5 lg:gap-8">
                    {/* Sol taraf - Marka ve İletişim */}
                    <div className="flex flex-col items-center lg:items-start gap-3 sm:gap-4 md:gap-5 w-full lg:w-auto">
                        {/* Marka */}
                        <div className="flex items-center gap-1.5 sm:gap-2 group">
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-lg sm:rounded-xl border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-500" />
                            </div>
                            <span className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight">
                                Fatal<span className="text-amber-500">Soft</span>
                            </span>
                        </div>

                        {/* İletişim bilgileri */}
                        <div className="flex flex-col sm:flex-row items-center lg:items-start gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full sm:w-auto">
                            <a
                                href="mailto:fatalsoft.inc@gmail.com"
                                className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-lg sm:rounded-xl transition-all duration-300 group w-full sm:w-auto justify-center lg:justify-start"
                            >
                                <div className="p-1 sm:p-1.5 bg-amber-500/10 rounded-md sm:rounded-lg group-hover:bg-amber-500/20 transition-colors shrink-0">
                                    <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-zinc-300 group-hover:text-amber-400 transition-colors truncate max-w-[200px] sm:max-w-none">
                                    fatalsoft.inc@gmail.com
                                </span>
                            </a>
                            <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl w-full sm:w-auto justify-center lg:justify-start">
                                <div className="p-1 sm:p-1.5 bg-blue-500/10 rounded-md sm:rounded-lg shrink-0">
                                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-500" />
                                </div>
                                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-zinc-400">
                                    Kocaeli, Gebze
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sağ taraf - Telif hakkı */}
                    <div className="flex flex-col items-center lg:items-end gap-1.5 sm:gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl">
                            <Copyright className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-zinc-500 shrink-0" />
                            <span className="text-[10px] sm:text-xs md:text-sm text-zinc-400 font-medium whitespace-nowrap">
                                {currentYear} <span className="font-bold text-zinc-300">FatalSoft</span>
                            </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-zinc-500 font-medium uppercase tracking-wider text-center lg:text-right">
                            Tüm hakları saklıdır
                        </p>
                    </div>
                </div>

                {/* Alt çizgi */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5 flex items-center justify-center">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-zinc-600 font-medium text-center px-2">
                        Altın Cüzdan ile portföyünüzü takip edin
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

