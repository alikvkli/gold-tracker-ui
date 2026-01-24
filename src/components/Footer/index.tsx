import React, { useState } from 'react';
import { Mail, MapPin } from 'lucide-react';
import LegalWarningModal from './LegalWarningModal';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

    return (
        <>
            <footer className="relative py-12 border-t border-white/5 bg-zinc-950 overflow-hidden mb-[72px] sm:mb-0">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-amber-500/20 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center">

                        {/* 1. Header: Logo & Tagline */}
                        <div className="mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4 cursor-default">
                                <img
                                    src="/images/logo.png"
                                    alt="Biriktirerek.com Logo"
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                                />
                                <span className="font-bold text-2xl tracking-tight text-white">
                                    Biriktirerek.com
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm max-w-md mx-auto">
                                Altın birikimlerinizi güvenle takip edin, profesyonel araçlarla yönetin.
                            </p>
                        </div>

                        {/* 2. Menu Links (Simplified) */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mb-10">
                            <a href="/#features" className="px-4 py-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 text-sm font-medium transition-all">
                                Özellikler
                            </a>
                            <button onClick={() => setIsLegalModalOpen(true)} className="px-4 py-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 text-sm font-medium transition-all">
                                Yasal Uyarı
                            </button>
                            <a href="mailto:fatalsoft.inc@gmail.com" className="px-4 py-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 text-sm font-medium transition-all">
                                İletişim
                            </a>
                        </div>

                        {/* 3. App Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full max-w-md justify-center">
                            {/* Play Store */}
                            <a
                                href="https://play.google.com/store/apps/details?id=com.fatalsoft.altin_takip"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto flex-1 flex items-center gap-3 bg-zinc-900 border border-white/10 hover:border-amber-500/50 rounded-xl px-4 py-3 transition-all group"
                            >
                                <svg className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" /></svg>
                                <div className="text-left">
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Android İçin</div>
                                    <div className="text-white font-bold text-sm">Play Store</div>
                                </div>
                            </a>

                            {/* App Store */}
                            <div className="w-full sm:w-auto flex-1 flex items-center gap-3 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 opacity-60 cursor-not-allowed">
                                <svg className="w-8 h-8 text-zinc-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4M15.42,16.59C15.42,16.59 15.42,16.59 15.42,16.59C15.42,16.59 15.42,16.59 15.42,16.59L15.41,16.58L15.42,16.59M9.58,16.59L9.59,16.58C9.59,16.58 9.59,16.58 9.59,16.58L9.58,16.59M9.58,16.59L9.58,16.59L9.58,16.59C9.58,16.59 9.58,16.59 9.58,16.59M16.5,13.5L16.5,13.5L16.5,13.5C16.5,13.5 16.5,13.5 16.5,13.5L16.5,13.5C16.5,13.5 16.5,13.5 16.5,13.5M12,8V16H12V8M16,8H16V8M8,8H8V8Z" /><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,13.24 4.7,10.37C5.62,8.87 7.13,7.91 8.82,7.91C10.1,7.91 11.24,8.8 12,8.8C12.74,8.8 14.16,7.74 15.71,7.74C16.35,7.74 18.06,7.94 19.3,9.77C19.23,9.81 17.06,11.08 17.09,13.88C17.13,16.92 19.82,17.96 19.86,17.97C19.84,18.03 19.44,19.42 18.71,19.5M13,3.5C14.1,2.15 14,1 14,1C12.91,1.1 11.5,1.75 10.74,2.94C10.04,4.03 10.38,5.34 10.38,5.34C11.53,5.43 12.87,4.56 13,3.5Z" /></svg>
                                <div className="text-left">
                                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">iOS İçin</div>
                                    <div className="text-zinc-500 font-bold text-sm">Yakında</div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Contact & Copyright */}
                        <div className="flex flex-col items-center gap-4 text-xs text-zinc-600">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>fatalsoft.inc@gmail.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Kocaeli, Gebze</span>
                                </div>
                            </div>
                            <p>
                                © {currentYear} Biriktirerek.com • Tüm Hakları Saklıdır
                            </p>
                        </div>

                    </div>
                </div>
            </footer>

            <LegalWarningModal
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
            />
        </>
    );
};

export default Footer;
