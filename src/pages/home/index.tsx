import {
  TrendingUp,
  ShieldCheck,
  History,
  LayoutDashboard,
  ArrowRight,
  ChevronRight,
  Activity,
  Wallet,
  Mail,
  MapPin
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
            <img 
              src="/images/logo.png" 
              alt="Biriktirerek.com Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
              Biriktirerek.com
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
      <footer className="relative py-16 sm:py-20 border-t border-white/5 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 sm:gap-12">
            {/* Logo and Brand */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <img 
                    src="/images/logo.png" 
                    alt="Biriktirerek.com Logo" 
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                </div>
                <span className="font-black text-xl sm:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                  Biriktirerek.com
                </span>
              </div>
              <p className="text-sm sm:text-base text-zinc-400 text-center max-w-md">
                Altın birikimlerinizi profesyonelce takip edin ve yatırımlarınızı yönetin.
              </p>
            </div>

            {/* Links and Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 w-full">
              {/* Navigation Links */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <a 
                  href="#features" 
                  className="px-4 py-2 text-zinc-400 hover:text-amber-400 text-sm font-medium transition-all hover:bg-white/5 rounded-lg"
                >
                  Özellikler
                </a>
                <a 
                  href="mailto:fatalsoft.inc@gmail.com" 
                  className="px-4 py-2 text-zinc-400 hover:text-amber-400 text-sm font-medium transition-all hover:bg-white/5 rounded-lg flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  İletişim
                </a>
              </div>

              {/* Play Store Button */}
              <a 
                href="https://play.google.com/store/apps/details?id=com.fatalsoft.altin_takip" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 hover:border-amber-500/40 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20"
              >
                <svg className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400 font-medium">Mobil Uygulama</span>
                  <span className="text-sm font-bold text-amber-400">Play Store'da İndir</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-6 border-t border-white/5 w-full">
              <a 
                href="mailto:fatalsoft.inc@gmail.com"
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-amber-400 text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>fatalsoft.inc@gmail.com</span>
              </a>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-600"></div>
              <div className="flex items-center gap-2 px-4 py-2 text-zinc-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Kocaeli, Gebze</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex flex-col items-center gap-2 pt-4 border-t border-white/5 w-full">
              <p className="text-xs sm:text-sm text-zinc-500 text-center">
                © {new Date().getFullYear()} <span className="text-zinc-300 font-semibold">Biriktirerek.com</span>. Tüm Hakları Saklıdır.
              </p>
              <p className="text-xs text-zinc-600">
                Altın birikimlerinizi güvenle takip edin
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}