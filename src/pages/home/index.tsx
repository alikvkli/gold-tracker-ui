import {
  TrendingUp,
  ShieldCheck,
  History,
  LayoutDashboard,
  ArrowRight,
  ChevronRight,
  Activity,
  Coins
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Canlı Altın Kurları",
      description: "Piyasadaki en güncel altın fiyatlarını anlık olarak takip edin ve portföyünüzü güncel tutun.",
      icon: <TrendingUp className="w-6 h-6 text-amber-500" />,
    },
    {
      title: "Güvenli ve Anonim",
      description: "Varlıklarınızı uçtan uca şifreleme ile anonim olarak takip edin. Verileriniz sadece sizin kontrolünüzde.",
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
    },
    {
      title: "İşlem Geçmişi",
      description: "Tüm alım ve satım işlemlerinizi detaylı bir şekilde kaydedin ve performansınızı analiz edin.",
      icon: <History className="w-6 h-6 text-amber-700" />,
    },
    {
      title: "Modern Dashboard",
      description: "Varlık dağılımınızı ve kâr/zarar durumunuzu görsel grafiklerle kolayca inceleyin.",
      icon: <LayoutDashboard className="w-6 h-6 text-amber-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-zinc-900 shadow-xl shadow-amber-600/20">
              <Coins className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
              AltınTakip
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(PATHS.LOGIN)}
              className="text-zinc-400 hover:text-white transition-colors font-medium text-sm hidden sm:block"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => navigate(PATHS.REGISTER)}
              className="px-5 py-2.5 bg-white text-zinc-950 rounded-full font-semibold text-sm hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-400/20"
            >
              Hemen Başla
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest mb-8 border border-amber-500/20">
          <Activity className="w-3 h-3 animate-pulse" />
          Anlık Altın Takibi
        </div>

        <h1 className="text-5xl sm:text-8xl font-black tracking-tight mb-8 max-w-4xl leading-[1.1]">
          Altın Yatırımlarınızı <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
            Profesyonelce Yönetin
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed">
          Portföyünüzü modern araçlarla takip edin, uçtan uca şifreleme ile anonim kalın ve yatırım kararlarınızı verilerle güçlendirin.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <button
            onClick={() => navigate(PATHS.REGISTER)}
            className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-amber-500/20 cursor-pointer"
          >
            Hesap Oluştur
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate(PATHS.LOGIN)}
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm"
          >
            Zaten Üyeyim
            <ChevronRight className="w-5 h-5 text-amber-500" />
          </button>
        </div>

        {/* Dashboard Preview Mock */}
        <div className="mt-24 relative group w-full max-w-5xl">
          <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-6">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
              </div>
              <div className="px-4 py-1.5 bg-white/5 rounded-lg text-xs font-mono text-zinc-500 uppercase tracking-widest">
                goldtracker.sh
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-40 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-center p-6 text-left">
                <p className="text-zinc-500 text-xs font-bold uppercase mb-2">Toplam Varlık</p>
                <h3 className="text-3xl font-bold text-amber-400">₺1,240,500.00</h3>
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1 font-bold">
                  <TrendingUp className="w-3 h-3" /> +12.4%
                </p>
              </div>
              <div className="h-40 bg-white/5 rounded-2xl border border-white/5 md:col-span-2 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[60%] bg-gradient-to-t from-amber-500/20 to-transparent"></div>
                </div>
                <div className="flex gap-4 items-end h-[40%] px-8 w-full">
                  {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-amber-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">Kusursuz Yatırım Deneyimi</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Altın birikimlerinizi takip ederken ihtiyaç duyacağınız tüm araçlar tek bir platformda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 p-10 rounded-[2.5rem] border border-white/5 hover:border-amber-500/30 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  {feature.icon}
                </div>
                <div className="mb-8 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500 border border-white/5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-zinc-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-zinc-900 shadow-lg">
              <Coins className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">AltınTakip</span>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            <a href="#" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors">Ana Sayfa</a>
            <a href="#" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors">Özellikler</a>
            <a href="#" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors">Güvenlik</a>
            <a href="#" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors">İletişim</a>
          </div>

          <div className="text-center">
            <p className="text-zinc-600 text-sm">
              © 2026 AltinTakip. Tüm Hakları Saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}