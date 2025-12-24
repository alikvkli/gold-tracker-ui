import { Lock, ArrowRight, ChevronLeft, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { PATHS } from '@/routes/paths';
import Button from '@/components/Button';
import Input from '@/components/Input';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks';
import { addToast } from '@/features/ui/uiSlice';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues: {
            verification_code: '',
            password: '',
            password_confirmation: '',
        },
        validationSchema: Yup.object({
            verification_code: Yup.string().length(5, 'Kod 5 haneli olmalıdır').required('Doğrulama kodu zorunludur'),
            password: Yup.string().min(6, 'Şifre en az 6 karakter olmalıdır').required('Yeni şifre alanı zorunludur'),
            password_confirmation: Yup.string()
                .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
                .required('Şifre tekrarı zorunludur'),
        }),
        onSubmit: async (values) => {
            try {
                await api.post('/auth/reset-password', values);
                dispatch(addToast({ message: 'Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.', type: 'success' }));
                navigate(PATHS.LOGIN);
            } catch (error: any) {
                const errorMessage = error.response?.data?.errors?.[0] || 'Bir hata oluştu.';
                dispatch(addToast({ message: errorMessage, type: 'error' }));
            }
        },
    });

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md relative z-10">
                <button
                    onClick={() => navigate(PATHS.LOGIN)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Giriş Sayfasına Dön
                </button>

                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-zinc-900 shadow-xl shadow-amber-600/20 mb-6">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-amber-500 mb-2">Şifre Sıfırla</h1>
                    <p className="text-zinc-500">E-posta ile gelen 5 haneli kodu ve yeni şifrenizi girin.</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">

                    <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
                        <Input
                            label="Doğrulama Kodu"
                            placeholder="12345"
                            maxLength={5}
                            name="verification_code"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.verification_code}
                            error={formik.touched.verification_code && formik.errors.verification_code ? formik.errors.verification_code : undefined}
                        />
                        <Input
                            label="Yeni Şifre"
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
                            label="Yeni Şifre Tekrar"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock className="w-5 h-5" />}
                            name="password_confirmation"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password_confirmation}
                            error={formik.touched.password_confirmation && formik.errors.password_confirmation ? formik.errors.password_confirmation : undefined}
                        />
                        <Button
                            className="mt-4 group"
                            type="submit"
                            isLoading={formik.isSubmitting}
                        >
                            Şifreyi Güncelle
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
