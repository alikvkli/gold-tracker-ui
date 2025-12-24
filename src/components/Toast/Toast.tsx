import React, { useEffect } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    Info,
    AlertTriangle,
    X
} from 'lucide-react';
import { Toast as ToastType } from '../../features/ui/uiSlice';
import { useAppDispatch } from '../../hooks';
import { removeToast } from '../../features/ui/uiSlice';

const Toast: React.FC<ToastType> = ({ id, message, type, duration = 5000 }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeToast(id));
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, dispatch]);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-amber-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-orange-400" />,
    };

    const styles = {
        success: "border-green-500/20 bg-green-500/10 text-green-200",
        error: "border-red-500/20 bg-red-500/10 text-red-200",
        info: "border-amber-500/20 bg-amber-500/10 text-amber-200",
        warning: "border-orange-500/20 bg-orange-500/10 text-orange-200",
    };

    return (
        <div className={`
            flex items-center gap-4 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl
            animate-in fade-in slide-in-from-right-8 duration-300
            ${styles[type]}
        `}>
            <div className="shrink-0">
                {icons[type]}
            </div>
            <p className="text-sm font-bold tracking-tight pr-4">
                {message}
            </p>
            <button
                onClick={() => dispatch(removeToast(id))}
                className="ml-auto p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-white"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
