import { Mail, ArrowRight, ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { PATHS } from '@/routes/paths';
import Button from '@/components/Button';
import Input from '@/components/Input';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks';
import { addToast } from '@/features/ui/uiSlice';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Geçersiz e-posta adresi').required('E-posta alanı zorunludur'),
        }),
        onSubmit: async (values) => {
            try {
                await api.post('/auth/forgot-password', values);
                dispatch(addToast({ message: 'Doğrulama kodu e-posta adresinize gönderildi.', type: 'success' }));
                navigate(PATHS.RESET_PASSWORD);
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
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-zinc-900 shadow-xl shadow-amber-600/20 mb-6 font-bold">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-100 to-amber-500 mb-2">Şifremi Unuttum</h1>
                    <p className="text-zinc-500">E-posta adresinizi girin, şifrenizi sıfırlamanız için kod gönderelim.</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">

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
                        <Button
                            className="mt-2 group"
                            type="submit"
                            isLoading={formik.isSubmitting}
                        >
                            Kod Gönder
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
