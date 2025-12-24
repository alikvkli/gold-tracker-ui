import React from 'react';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className,
    ...props
}) => {
    return (
        <div className="w-full flex flex-col gap-2">
            {label && (
                <label className="text-sm font-medium text-zinc-400 px-1">
                    {label}
                </label>
            )
            }
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={classNames(
                        "w-full bg-zinc-900 border border-white/5 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none transition-all",
                        "focus:border-amber-500/50 focus:bg-zinc-900/80 focus:ring-1 focus:ring-amber-500/20",
                        {
                            "pl-12": !!icon,
                            "border-red-500/50 focus:border-red-500": !!error
                        },
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-400 px-1 font-medium">{error}</p>
            )}
        </div>
    );
};

export default Input;
