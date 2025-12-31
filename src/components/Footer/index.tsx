import React from 'react';
import { Mail, MapPin, Copyright } from 'lucide-react';

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
                        <img 
                            src="/images/logo.png" 
                            alt="Biriktirerek.com Logo" 
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                        />
                        <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                            Biriktirerek.com
                        </span>
                    </div>

                    {/* İletişim bilgileri ve Play Store */}
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
                        <a
                            href="https://play.google.com/store/apps/details?id=com.fatalsoft.altin_takip"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-lg transition-all duration-300 group"
                        >
                            <svg className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-zinc-300 group-hover:text-amber-400 transition-colors">
                                Play Store
                            </span>
                        </a>
                    </div>

                    {/* Telif hakkı */}
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Copyright className="w-3.5 h-3.5" />
                        <span className="text-xs sm:text-sm font-medium">
                            {currentYear} <span className="text-zinc-300 font-bold">Biriktirerek.com</span> - Tüm hakları saklıdır
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

