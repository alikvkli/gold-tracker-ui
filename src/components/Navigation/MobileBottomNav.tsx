import React from 'react';
import { Home, LayoutGrid, LogIn, UserPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PATHS } from '../../routes/paths';

const MobileBottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        {
            label: 'Ana Sayfa',
            icon: <Home className="w-5 h-5" />,
            action: () => navigate(PATHS.HOME),
            isActive: isActive(PATHS.HOME) || isActive(PATHS.ROOT) || isActive(PATHS.MARKET)
        },
        {
            label: 'Özellikler',
            icon: <LayoutGrid className="w-5 h-5" />,
            action: () => {
                navigate(PATHS.HOME);
                setTimeout(() => {
                    const element = document.getElementById('features');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            },
            isActive: false
        },
        {
            label: 'Giriş',
            icon: <LogIn className="w-5 h-5" />,
            action: () => navigate(PATHS.LOGIN),
            isActive: isActive(PATHS.LOGIN)
        },
        {
            label: 'Kayıt Ol',
            icon: <UserPlus className="w-5 h-5" />,
            action: () => navigate(PATHS.REGISTER),
            isActive: isActive(PATHS.REGISTER),
            highlight: true
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 sm:hidden">
            <div className="grid grid-cols-4 h-[72px]">
                {navItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={item.action}
                        className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative ${item.highlight
                            ? 'text-zinc-950'
                            : item.isActive ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {item.highlight ? (
                            <div className="absolute inset-x-2 top-2 bottom-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl -z-10 shadow-lg shadow-amber-500/20"></div>
                        ) : null}

                        {item.icon}
                        <span className={`text-[10px] font-medium ${item.highlight ? 'font-bold' : ''}`}>
                            {item.label}
                        </span>

                        {!item.highlight && item.isActive && (
                            <div className="absolute top-0 w-8 h-1 bg-amber-500 rounded-b-lg shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MobileBottomNav;
