import React from 'react';
import { User, Mail, Lock, ArrowRight, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { PATHS } from '@/routes/paths';
import Button from '@/components/Button';
import Input from '@/components/Input';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks';
import { addToast } from '@/features/ui/uiSlice';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues: {
            name: '',
            surname: '',
            email: '',
            password: '',
            password_confirmation: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Ad alanı zorunludur'),
            surname: Yup.string().required('Soyad alanı zorunludur'),
            email: Yup.string().email('Geçersiz e-posta adresi').required('E-posta alanı zorunludur'),
            password: Yup.string().min(6, 'Şifre en az 6 karakter olmalıdır').required('Şifre alanı zorunludur'),
            password_confirmation: Yup.string()
                .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
                .required('Şifre tekrarı zorunludur'),
        }),
        onSubmit: async (values) => {
            try {
                await api.post('/auth/register', values);
                dispatch(addToast({ message: 'Hesabınız başarıyla oluşturuldu. Giriş yapabilirsiniz.', type: 'success' }));
                navigate(PATHS.LOGIN);
            } catch (error: any) {
                const errorMessage = error.response?.data?.errors?.[0] || 'Kayıt olunurken bir hata oluştu.';
                dispatch(addToast({ message: errorMessage, type: 'error' }));
            }
        },
    });

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div
                        onClick={() => navigate(PATHS.HOME)}
                        className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-zinc-900 shadow-xl shadow-amber-600/20 mb-6 cursor-pointer"
                    >
                        <Coins className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-amber-500 mb-2">Hesap Oluştur</h1>
                    <p className="text-zinc-500">Aramıza katılın ve takibe başlayın.</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">
                    <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Ad"
                                placeholder="John"
                                icon={<User className="w-5 h-5" />}
                                name="name"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                                error={formik.touched.name && formik.errors.name ? formik.errors.name : undefined}
                            />
                            <Input
                                label="Soyad"
                                placeholder="Doe"
                                name="surname"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.surname}
                                error={formik.touched.surname && formik.errors.surname ? formik.errors.surname : undefined}
                            />
                        </div>
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
                        <Input
                            label="Şifre Tekrar"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock className="w-5 h-5" />}
                            name="password_confirmation"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password_confirmation}
                            error={formik.touched.password_confirmation && formik.errors.password_confirmation ? formik.errors.password_confirmation : undefined}
                        />
                        <Button className="mt-4 group" type="submit" isLoading={formik.isSubmitting}>
                            Kayıt Ol
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-sm text-zinc-500">
                            Zaten hesabınız var mı?{' '}
                            <button
                                onClick={() => navigate(PATHS.LOGIN)}
                                className="font-bold text-amber-500 hover:text-amber-400 transition-colors"
                            >
                                Giriş Yap
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
