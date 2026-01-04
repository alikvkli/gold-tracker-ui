import React from 'react';
import classNames from 'classnames';

interface PasswordStrengthIndicatorProps {
    password?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password = '' }) => {
    const getStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 6) score += 1;
        if (pass.length > 10) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = getStrength(password);

    const getStrengthColor = () => {
        if (strength === 0) return 'bg-zinc-700';
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (strength === 0) return 'Zayıf';
        if (strength <= 2) return 'Zayıf';
        if (strength <= 4) return 'Orta';
        return 'Güçlü';
    };

    return (
        <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-1 h-1.5 w-full">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={classNames(
                            "h-full flex-1 rounded-full transition-all duration-300",
                            level <= strength ? getStrengthColor() : "bg-zinc-800"
                        )}
                    />
                ))}
            </div>
            <div className="flex justify-end">
                <span className={classNames("text-xs font-medium transition-colors duration-300",
                    strength === 0 ? "text-zinc-500" :
                        strength <= 2 ? "text-red-400" :
                            strength <= 4 ? "text-yellow-400" :
                                "text-green-400"
                )}>
                    {password && getStrengthText()}
                </span>
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
