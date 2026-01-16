import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface LegalWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LegalWarningModal: React.FC<LegalWarningModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">YASAL UYARI</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto text-zinc-300 space-y-4 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    <p>
                        Burada yer alan haberler, döviz kurları ve altın fiyatları bilgi amaçlıdır. Yayınlanan bilgiler yatırım danışmanlığı kapsamında değildir.
                    </p>
                    <p>
                        Bu nedenle, yalnızca burada yer alan bilgilere dayanılarak yatırım kararı verilmesi beklentilerinize uygun sonuçlar doğurmayabilir. Bu web sitesinde yer alan ve <span className="text-amber-500 font-semibold">Biriktirerek.com</span> tarafından derlenmiş olan her türlü bilgi, şekil, şema, tahmin ve tavsiyeler ile görüşler önceden haber verilmeksizin değiştirilebilir.
                    </p>
                    <p>
                        Bu sitede yer alan her türlü bilgi, değerlendirme, yorum ve istatistiki şekil ve değerler yatırımcıyı bilgilendirmeye yönelik olup, hiç bir şekilde herhangi bir kıymetli madenin ve/veya dövizin alım-satım teklifi ve/veya taahhüdü anlamına gelmemektedir.
                    </p>
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl my-4">
                        <p className="text-xs text-amber-500/80 uppercase tracking-widest font-bold mb-2">Sorumluluk Reddi</p>
                        <p className="text-zinc-400 text-xs">
                            Gerek site üzerindeki, gerekse site içinde kullanılan kaynaklardaki hata ve eksikliklerden, burada yer alan bilgi, değerlendirme, yorum ve istatistiki şekil ve değerlendirmelerin kullanımı sonucunda ortaya çıkabilecek veya sitedeki bilgilerin kullanılması sonucunda yatırımcıların uğrayabilecekleri doğrudan ve/veya dolaylı zararlardan, kar yoksunluğundan, manevi zararlardan ve üçüncü kişilerin uğrayabileceği zararlardan <span className="font-semibold text-zinc-300">Biriktirerek.com</span> hiçbir şekilde sorumlu tutulamaz.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-zinc-900/50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                        Okudum, Anladım
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalWarningModal;
