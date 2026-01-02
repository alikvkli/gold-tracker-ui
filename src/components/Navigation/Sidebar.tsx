import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Wallet,
    LayoutDashboard,
    History,
    User as UserIcon,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { PATHS } from '@/routes/paths';
import { useAppDispatch } from '@/hooks';
import { logout } from '@/features/app';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            // Küçük ekranlarda (lg'den küçük) her zaman collapsed
            const isSmallScreen = window.innerWidth < 1024;
            if (isSmallScreen) {
                document.documentElement.setAttribute('data-sidebar-collapsed', 'true');
                return true;
            }
            const saved = localStorage.getItem('sidebarCollapsed');
            const collapsed = saved ? JSON.parse(saved) : false;
            // İlk yüklemede document'e set et
            document.documentElement.setAttribute('data-sidebar-collapsed', String(collapsed));
            return collapsed;
        }
        return true; // Default olarak collapsed (küçük ekran varsayımı)
    });

    // Ekran boyutu değiştiğinde kontrol et
    useEffect(() => {
        const handleResize = () => {
            const isSmallScreen = window.innerWidth < 1024;
            if (isSmallScreen && !isCollapsed) {
                setIsCollapsed(true);
                document.documentElement.setAttribute('data-sidebar-collapsed', 'true');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isCollapsed]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isSmallScreen = window.innerWidth < 1024;
            // Küçük ekranlarda localStorage'a kaydetme (her zaman collapsed)
            if (!isSmallScreen) {
                localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
            }
            // Sidebar durumunu document'e data attribute olarak ekle
            document.documentElement.setAttribute('data-sidebar-collapsed', String(isCollapsed));
        }
    }, [isCollapsed]);

    const handleLogout = () => {
        dispatch(logout());
        navigate(PATHS.HOME);
    };

    const navItems = [
        { path: PATHS.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        { path: PATHS.ASSETS, label: 'Varlıklarım', icon: Wallet },
        { path: PATHS.TRANSACTIONS, label: 'İşlemler', icon: History },
        { path: PATHS.PROFILE, label: 'Profil', icon: UserIcon },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-16 sm:w-20' : 'w-64 xl:w-72'} border-r border-white/5 bg-zinc-900/30 flex flex-col p-3 sm:p-4 xl:p-6 fixed inset-y-0 flex transition-all duration-300 z-50`}>
            <div className="mb-6 sm:mb-8 xl:mb-10">
                {isCollapsed ? (
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <div
                            className="w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center text-zinc-900 shadow-lg shadow-amber-500/20 cursor-pointer transition-transform hover:scale-[1.02]"
                            onClick={() => navigate(PATHS.HOME)}
                            title="Altın Cüzdan"
                        >
                            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
                        </div>
                        <button
                            onClick={() => {
                                const isSmallScreen = window.innerWidth < 1024;
                                if (!isSmallScreen) {
                                    setIsCollapsed(!isCollapsed);
                                }
                            }}
                            className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all hidden lg:block"
                            title="Genişlet"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            className="flex items-center gap-2 xl:gap-3 cursor-pointer transition-transform hover:scale-[1.02]"
                            onClick={() => navigate(PATHS.HOME)}
                        >
                            <div className="w-9 h-9 xl:w-10 xl:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-zinc-900 shadow-lg shadow-amber-500/20 shrink-0">
                                <Wallet className="w-5 h-5 xl:w-6 xl:h-6" />
                            </div>
                            <span className="font-bold text-lg xl:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 truncate">
                                Altın Cüzdan
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                const isSmallScreen = window.innerWidth < 1024;
                                if (!isSmallScreen) {
                                    setIsCollapsed(!isCollapsed);
                                }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm hidden lg:flex"
                            title="Daralt"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Daralt</span>
                        </button>
                    </div>
                )}
            </div>

            <nav className="flex-1 flex flex-col gap-1.5 sm:gap-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 xl:gap-4'} ${isCollapsed ? 'px-2 sm:px-3' : 'px-3 xl:px-4'} ${isCollapsed ? 'py-2 sm:py-2.5' : 'py-2.5 xl:py-3'} ${isCollapsed ? 'rounded-lg' : 'rounded-xl xl:rounded-2xl'} transition-all font-medium text-sm xl:text-base ${isActive
                                ? 'bg-white/5 border border-white/10 text-amber-500 font-bold shadow-lg shadow-amber-500/5'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon className={`${isCollapsed ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4 h-4 xl:w-5 xl:h-5'} shrink-0`} />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            <button
                onClick={handleLogout}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 xl:gap-4'} ${isCollapsed ? 'px-2 sm:px-3' : 'px-3 xl:px-4'} ${isCollapsed ? 'py-2 sm:py-2.5' : 'py-2.5 xl:py-3'} ${isCollapsed ? 'rounded-lg' : 'rounded-xl xl:rounded-2xl'} text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all font-medium mt-auto text-sm xl:text-base`}
                title={isCollapsed ? 'Çıkış Yap' : ''}
            >
                <LogOut className={`${isCollapsed ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4 h-4 xl:w-5 xl:h-5'} shrink-0`} />
                {!isCollapsed && <span className="truncate">Çıkış Yap</span>}
            </button>
        </aside>
    );
};

export default Sidebar;
