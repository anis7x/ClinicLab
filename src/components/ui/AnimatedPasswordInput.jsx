import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AnimatedPasswordInput({ placeholder = "" }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative w-full">
            <input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pr-4 pl-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-colors text-right focus:bg-white"
                dir="rtl"
            />

            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
        </div>
    );
}
