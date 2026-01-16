import React, { useState } from 'react';
import { Mail, MapPin } from 'lucide-react';
import LegalWarningModal from './LegalWarningModal';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

    return (
        <>
            <footer className="relative py-16 sm:py-24 border-t border-white/5 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 overflow-hidden mb-[72px] sm:mb-0">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center">

                        {/* 1. Logo Section */}
                        <div className="flex items-center gap-3 mb-6 group cursor-default">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img
                                    src="/images/logo.png"
                                    alt="Biriktirerek.com Logo"
                                    className="w-16 h-16 object-contain drop-shadow-2xl"
                                />
                            </div>
                            <span className="font-black text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                                Biriktirerek.com
                            </span>
                        </div>

                        {/* 2. Description (Optional but good for SEO/Design) */}
                        <p className="text-zinc-400 max-w-lg mx-auto mb-10 text-sm leading-relaxed">
                            Altın birikimlerinizi güvenle takip edin, portföyünüzü profesyonel araçlarla yönetin.
                        </p>

                        {/* 3. Main Actions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-12">
                            {/* Navigation Links Card */}
                            <div className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:bg-white/[0.07]">
                                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Hızlı Erişim</h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <a href="/#features" className="text-zinc-300 hover:text-amber-400 font-medium text-sm transition-colors">Özellikler</a>
                                    <span className="text-zinc-700">•</span>
                                    <button onClick={() => setIsLegalModalOpen(true)} className="text-zinc-300 hover:text-amber-400 font-medium text-sm transition-colors cursor-pointer">Yasal Uyarı</button>
                                    <span className="text-zinc-700">•</span>
                                    <a href="mailto:fatalsoft.inc@gmail.com" className="text-zinc-300 hover:text-amber-400 font-medium text-sm transition-colors">İletişim</a>
                                </div>
                            </div>

                            {/* Mobile App Card - Play Store */}
                            <a
                                href="https://play.google.com/store/apps/details?id=com.fatalsoft.altin_takip"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10"
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" /></svg>
                                    <div className="text-left">
                                        <div className="text-xs text-amber-500/80 font-bold uppercase tracking-wider">Mobil Uygulama</div>
                                        <div className="text-amber-400 font-bold text-lg leading-none">Play Store'da İndir</div>
                                    </div>
                                </div>
                            </a>

                            {/* Mobile App Card - App Store (Coming Soon) */}
                            <div className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-400 border border-white/5">
                                    YAKINDA
                                </div>
                                <div className="flex items-center gap-3 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4M15.42,16.59C15.42,16.59 15.42,16.59 15.42,16.59C15.42,16.59 15.42,16.59 15.42,16.59L15.41,16.58L15.42,16.59M9.58,16.59L9.59,16.58C9.59,16.58 9.59,16.58 9.59,16.58L9.58,16.59M9.58,16.59L9.58,16.59L9.58,16.59C9.58,16.59 9.58,16.59 9.58,16.59M16.5,13.5L16.5,13.5L16.5,13.5C16.5,13.5 16.5,13.5 16.5,13.5L16.5,13.5C16.5,13.5 16.5,13.5 16.5,13.5M12,8V16H12V8M16,8H16V8M8,8H8V8Z" /> <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,13.24 4.7,10.37C5.62,8.87 7.13,7.91 8.82,7.91C10.1,7.91 11.24,8.8 12,8.8C12.74,8.8 14.16,7.74 15.71,7.74C16.35,7.74 18.06,7.94 19.3,9.77C19.23,9.81 17.06,11.08 17.09,13.88C17.13,16.92 19.82,17.96 19.86,17.97C19.84,18.03 19.44,19.42 18.71,19.5M13,3.5C14.1,2.15 14,1 14,1C12.91,1.1 11.5,1.75 10.74,2.94C10.04,4.03 10.38,5.34 10.38,5.34C11.53,5.43 12.87,4.56 13,3.5Z" /></svg>
                                    <div className="text-left">
                                        <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">App Store</div>
                                        <div className="text-zinc-300 font-bold text-lg leading-none">Yakında</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Bottom Info */}
                        <div className="flex flex-col items-center gap-4 text-sm text-zinc-500">
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                                <a href="mailto:fatalsoft.inc@gmail.com" className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
                                    <Mail className="w-4 h-4" />
                                    <span>fatalsoft.inc@gmail.com</span>
                                </a>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>Kocaeli, Gebze</span>
                                </div>
                            </div>
                            <div className="w-12 h-px bg-zinc-800 my-2"></div>
                            <p>
                                © {currentYear} <span className="text-zinc-300 font-medium">Biriktirerek.com</span> • Tüm Hakları Saklıdır
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
