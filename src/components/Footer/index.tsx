import React from 'react';
import { Mail, MapPin, Copyright } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-white/5 bg-zinc-900/30 backdrop-blur-sm">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                    {/* Sol taraf - İletişim bilgileri */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-zinc-400">
                        <a
                            href="mailto:fatalsoft.inc@gmail.com"
                            className="flex items-center gap-2 hover:text-amber-500 transition-colors duration-200 group"
                        >
                            <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">fatalsoft.inc@gmail.com</span>
                        </a>
                        <div className="flex items-center gap-2 text-zinc-500">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">Kocaeli, Gebze</span>
                        </div>
                    </div>

                    {/* Sağ taraf - Telif hakkı */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500">
                        <Copyright className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>
                            {currentYear} <span className="font-semibold text-zinc-400">FatalSoft</span>. Tüm hakları saklıdır.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

