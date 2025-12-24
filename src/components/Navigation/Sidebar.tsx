import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Coins,
    LayoutDashboard,
    History,
    User as UserIcon,
    LogOut
} from 'lucide-react';
import { PATHS } from '@/routes/paths';
import { useAppDispatch } from '@/hooks';
import { logout } from '@/features/app';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
        navigate(PATHS.HOME);
    };

    const navItems = [
        { path: PATHS.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        { path: PATHS.ASSETS, label: 'Varlıklarım', icon: History },
        { path: PATHS.PROFILE, label: 'Profil', icon: UserIcon },
    ];

    return (
        <aside className="w-72 border-r border-white/5 bg-zinc-900/30 flex flex-col p-6 fixed inset-y-0 hidden lg:flex">
            <div
                className="flex items-center gap-3 mb-10 px-2 cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => navigate(PATHS.HOME)}
            >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-zinc-900 shadow-lg shadow-amber-500/20">
                    <Coins className="w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
                    AltınTakip
                </span>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-medium ${isActive
                                ? 'bg-white/5 border border-white/10 text-amber-500 font-bold shadow-lg shadow-amber-500/5'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-medium mt-auto"
            >
                <LogOut className="w-5 h-5" />
                Çıkış Yap
            </button>
        </aside>
    );
};

export default Sidebar;
