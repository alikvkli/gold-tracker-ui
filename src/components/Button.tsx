import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className,
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
        primary: "bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]",
        secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-[0.98]",
        ghost: "text-zinc-400 hover:text-white hover:bg-white/5 active:scale-[0.98]",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98]",
        outline: "bg-transparent text-amber-500 border border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500 active:scale-[0.98]",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <button
            className={classNames(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : null}
            {children}
        </button>
    );
};

export default Button;
