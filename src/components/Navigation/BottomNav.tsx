import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    User as UserIcon,
    Calculator
} from 'lucide-react';
import { PATHS } from '@/routes/paths';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: PATHS.DASHBOARD, label: 'Panel', icon: LayoutDashboard },
        { path: PATHS.ASSETS, label: 'Varlıklarım', icon: Wallet },
        { path: PATHS.CALCULATOR, label: 'Dönüştürücü', icon: Calculator },
        { path: PATHS.PROFILE, label: 'Profil', icon: UserIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-zinc-900/80 backdrop-blur-xl border-t border-white/5 px-6 pt-3 pb-8 z-40">
            <div className="flex justify-between items-center max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center gap-1 min-w-[64px]"
                        >
                            <div className={`p-2 rounded-xl transition-all ${isActive
                                ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20'
                                : 'text-zinc-500'
                                }`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-bold tracking-tight uppercase ${isActive ? 'text-amber-500' : 'text-zinc-500'
                                }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
