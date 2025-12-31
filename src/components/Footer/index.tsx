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

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">
                <div className="flex flex-col items-center justify-center gap-4 sm:gap-5">
                    {/* Marka */}
                    <div className="flex items-center gap-2 group">
                        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-lg border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                        </div>
                        <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                            Fatal<span className="text-amber-500">Soft</span>
                        </span>
                    </div>

                    {/* İletişim bilgileri */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                        <a
                            href="mailto:fatalsoft.inc@gmail.com"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-lg transition-all duration-300 group"
                        >
                            <Mail className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs sm:text-sm font-medium text-zinc-300 group-hover:text-amber-400 transition-colors">
                                fatalsoft.inc@gmail.com
                            </span>
                        </a>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-xs sm:text-sm font-medium text-zinc-400">
                                Kocaeli, Gebze
                            </span>
                        </div>
                    </div>

                    {/* Telif hakkı */}
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Copyright className="w-3.5 h-3.5" />
                        <span className="text-xs sm:text-sm font-medium">
                            {currentYear} <span className="text-zinc-300 font-bold">FatalSoft</span> - Tüm hakları saklıdır
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

