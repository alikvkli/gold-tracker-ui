import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Coins, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { PATHS } from '@/routes/paths';
import Button from '@/components/Button';
import Input from '@/components/Input';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks';
import { setLogin } from '@/features/app';
import { addToast } from '@/features/ui/uiSlice';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Geçersiz e-posta adresi').required('E-posta alanı zorunludur'),
            password: Yup.string().min(6, 'Şifre en az 6 karakter olmalıdır').required('Şifre alanı zorunludur'),
        }),
        onSubmit: async (values) => {
            setStatus(null);
            try {
                const response = await api.post('/auth/login', values);
                const { user, token } = response.data;

                dispatch(setLogin({ user, token }));
                dispatch(addToast({ message: 'Başarıyla giriş yapıldı.', type: 'success' }));
                navigate(PATHS.DASHBOARD);
            } catch (error: any) {
                const errorMessage = error.response?.data?.errors?.[0] || 'Giriş yapılırken bir hata oluştu.';
                setStatus({ type: 'error', message: errorMessage });
            }
        },
    });

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div
                        onClick={() => navigate(PATHS.HOME)}
                        className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-zinc-900 shadow-xl shadow-amber-600/20 mb-6 cursor-pointer"
                    >
                        <Coins className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-amber-500 mb-2">Hoş Geldiniz</h1>
                    <p className="text-zinc-500">Yatırımlarınızı takip etmek için giriş yapın.</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">
                    {status && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                            }`}>
                            <AlertCircle className="w-5 h-5" />
                            {status.message}
                        </div>
                    )}

                    <form className="flex flex-col gap-6" onSubmit={formik.handleSubmit}>
                        <Input
                            label="E-Posta"
                            placeholder="ornek@mail.com"
                            type="email"
                            icon={<Mail className="w-5 h-5" />}
                            name="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
                        />
                        <Input
                            label="Şifre"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock className="w-5 h-5" />}
                            name="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
                        />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate(PATHS.FORGOT_PASSWORD)}
                                className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                            >
                                Şifremi Unuttum
                            </button>
                        </div>
                        <Button
                            className="mt-2 group"
                            type="submit"
                            isLoading={formik.isSubmitting}
                        >
                            Giriş Yap
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-sm text-zinc-500">
                            Hesabınız yok mu?{' '}
                            <button
                                type="button"
                                onClick={() => navigate(PATHS.REGISTER)}
                                className="font-bold text-amber-500 hover:text-amber-400 transition-colors"
                            >
                                Kayıt Ol
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
