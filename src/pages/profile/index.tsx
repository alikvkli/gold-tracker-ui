import React, { useState } from 'react';
import {
    User as UserIcon,
    Mail,
    Lock,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Coins,
    LayoutDashboard,
    History,
    LogOut,
    KeyRound,
    Eye,
    EyeOff,
    Calendar,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { PATHS } from '@/routes/paths';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { logout, setEncryptionKey, setLogin, setDateFormat } from '@/features/app';
import { addToast } from '@/features/ui/uiSlice';
import api from '@/lib/api';
import Button from '@/components/Button';
import Input from '@/components/Input';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, encryptionKey, token, dateFormat } = useAppSelector(state => state.app);

    const [showKey, setShowKey] = useState(false);
    const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate(PATHS.HOME);
    };

    // Password Change Form
    const passwordFormik = useFormik({
        initialValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        },
        validationSchema: Yup.object({
            current_password: Yup.string().required('Mevcut şifre zorunludur'),
            password: Yup.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır').required('Yeni şifre zorunludur'),
            password_confirmation: Yup.string()
                .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
                .required('Şifre tekrarı zorunludur'),
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                await api.post('/auth/password/change', values);
                dispatch(addToast({ message: 'Şifreniz başarıyla güncellendi.', type: 'success' }));
                resetForm();
            } catch (error: any) {
                dispatch(addToast({ message: error.response?.data?.errors?.[0] || 'Şifre güncellenirken bir hata oluştu.', type: 'error' }));
            }
        },
    });

    // Encryption Toggle Form (inside modal)
    const encryptionFormik = useFormik({
        initialValues: {
            password: '',
        },
        validationSchema: Yup.object({
            password: Yup.string().required('Onay için şifreniz zorunludur'),
        }),
        onSubmit: async (values) => {
            try {
                await api.post('/encryption/toggle', {
                    ...values,
                    status: !user?.encrypted
                });
                // After toggle, the user object in state should be updated
                const updatedUser = { ...user!, encrypted: !user?.encrypted };
                dispatch(setLogin({ user: updatedUser, token: token! }));

                if (!updatedUser.encrypted) {
                    dispatch(setEncryptionKey(null));
                }

                setIsEncryptionModalOpen(false);
                dispatch(addToast({
                    message: updatedUser.encrypted ? 'Şifreleme başarıyla aktifleştirildi.' : 'Şifreleme devre dışı bırakıldı.',
                    type: 'success'
                }));
            } catch (error: any) {
                console.log("err", error)
                dispatch(addToast({ message: error.response?.data?.errors?.[0] || 'İşlem başarısız oldu.', type: 'error' }));
            }
        },
    });

    const handleKeyUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const key = new FormData(e.currentTarget).get('encryptionKey') as string;
        dispatch(setEncryptionKey(key));
        dispatch(addToast({ message: 'Şifreleme anahtarı güncellendi.', type: 'success' }));
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-zinc-900/30 flex flex-col p-6 fixed inset-y-0">
                <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => navigate(PATHS.HOME)}>
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-zinc-900 shadow-lg shadow-amber-500/20">
                        <Coins className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
                        GoldTracker
                    </span>
                </div>

                <nav className="flex-1 flex flex-col gap-2">
                    <button onClick={() => navigate(PATHS.DASHBOARD)} className="flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button onClick={() => navigate(PATHS.ASSETS)} className="flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-medium">
                        <History className="w-5 h-5" />
                        Varlıklarım
                    </button>
                    <button onClick={() => navigate(PATHS.PROFILE)} className="flex items-center gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-amber-500 font-bold transition-all shadow-lg shadow-amber-500/5">
                        <UserIcon className="w-5 h-5" />
                        Profil
                    </button>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-medium mt-auto"
                >
                    <LogOut className="w-5 h-5" />
                    Çıkış Yap
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-10 overflow-y-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Profil ve Güvenlik</h1>
                    <p className="text-zinc-500">Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin.</p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                    {/* User Info & Password */}
                    <div className="space-y-8">
                        <section className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <UserIcon className="w-10 h-10 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">{user?.name} {user?.surname}</h3>
                                    <p className="text-zinc-500 flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4" /> {user?.email}
                                    </p>
                                </div>
                            </div>

                            <hr className="border-white/5 mb-8" />

                            <form onSubmit={passwordFormik.handleSubmit} className="space-y-6">
                                <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <Lock className="w-5 h-5 text-amber-500" /> Şifre Değiştir
                                </h4>
                                <Input
                                    label="Mevcut Şifre"
                                    type="password"
                                    name="current_password"
                                    onChange={passwordFormik.handleChange}
                                    value={passwordFormik.values.current_password}
                                    error={passwordFormik.touched.current_password && passwordFormik.errors.current_password ? passwordFormik.errors.current_password : undefined}
                                />
                                <div className="grid grid-cols-2 gap-6">
                                    <Input
                                        label="Yeni Şifre"
                                        type="password"
                                        name="password"
                                        onChange={passwordFormik.handleChange}
                                        value={passwordFormik.values.password}
                                        error={passwordFormik.touched.password && passwordFormik.errors.password ? passwordFormik.errors.password : undefined}
                                    />
                                    <Input
                                        label="Yeni Şifre Tekrar"
                                        type="password"
                                        name="password_confirmation"
                                        onChange={passwordFormik.handleChange}
                                        value={passwordFormik.values.password_confirmation}
                                        error={passwordFormik.touched.password_confirmation && passwordFormik.errors.password_confirmation ? passwordFormik.errors.password_confirmation : undefined}
                                    />
                                </div>
                                <Button type="submit" isLoading={passwordFormik.isSubmitting} className="w-full">
                                    Şifreyi Güncelle
                                </Button>
                            </form>
                        </section>

                        {/* Appearance Settings */}
                        <section className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
                            <h4 className="text-lg font-bold flex items-center gap-2 mb-6">
                                <Zap className="w-5 h-5 text-amber-500" /> Görünüm Ayarları
                            </h4>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-zinc-500 px-1 uppercase tracking-widest block mb-4">Tarih Gösterimi</label>
                                    <div className="grid grid-cols-2 gap-4 p-1 bg-zinc-950 border border-white/5 rounded-2xl">
                                        <button
                                            onClick={() => dispatch(setDateFormat('relative'))}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${dateFormat === 'relative'
                                                ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20'
                                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Zap className="w-4 h-4" /> Dinamik
                                        </button>
                                        <button
                                            onClick={() => dispatch(setDateFormat('standard'))}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${dateFormat === 'standard'
                                                ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20'
                                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Calendar className="w-4 h-4" /> Standart
                                        </button>
                                    </div>
                                    <p className="mt-3 text-xs text-zinc-600 px-1 italic">
                                        * Örn: "{dateFormat === 'relative' ? '5 dakika önce' : '24.12.2025 07:35'}"
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Security & Encryption */}
                    <div className="space-y-8">
                        <section className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-lg font-bold flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-amber-500" /> Varlık Şifreleme (Anonimlik)
                                </h4>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${user?.encrypted ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-zinc-500/10 text-zinc-500 border-white/5'
                                    }`}>
                                    {user?.encrypted ? 'Aktif' : 'Devre Dışı'}
                                </div>
                            </div>

                            <p className="text-sm text-zinc-500 leading-relaxed mb-8">
                                Şifreleme aktif edildiğinde, varlıklarınız veritabanında sizin kimliğinizle doğrudan ilişkilendirilmez.
                                Sadece size özel bir **Şifreleme Anahtarı** ile bu verilere erişebilirsiniz. Anahtarınızı kaybederseniz verilerinize erişilemez.
                            </p>

                            <Button
                                variant={user?.encrypted ? 'outline' : 'primary'}
                                className="w-full mb-8"
                                onClick={() => setIsEncryptionModalOpen(true)}
                            >
                                {user?.encrypted ? (
                                    <span className="flex items-center gap-2 text-red-400">
                                        <ShieldAlert className="w-5 h-5" /> Şifrelemeyi Kapat
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5" /> Şifrelemeyi Aktifleştir
                                    </span>
                                )}
                            </Button>

                            {user?.encrypted && (
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-6">
                                    <h5 className="font-bold text-sm tracking-widest uppercase text-zinc-400 flex items-center gap-2">
                                        <KeyRound className="w-4 h-4" /> Aktif Şifreleme Anahtarı
                                    </h5>

                                    <form onSubmit={handleKeyUpdate} className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type={showKey ? 'text' : 'password'}
                                                name="encryptionKey"
                                                defaultValue={encryptionKey || ''}
                                                placeholder="Anahtarınızı buraya girin..."
                                                className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 px-4 pr-12 text-white outline-none focus:border-amber-500/50 transition-all font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowKey(!showKey)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                            >
                                                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 italic px-1">
                                            * Bu anahtar sadece tarayıcınızda (yerel) saklanır. Sunucuya gönderilmez, ancak işlemlerde `X-Encryption-Key` olarak kullanılır.
                                        </p>
                                        <Button variant="secondary" size="sm" type="submit" className="w-full">
                                            Anahtarı Güncelle
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            {/* Encryption Toggle Modal */}
            {isEncryptionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-black">Güvenlik Onayı</h3>
                            <p className="text-zinc-500 mt-2 text-sm px-4">
                                Şifreleme durumunu değiştirmek için lütfen **Şifreleme Anahtarınızı** (ikincil şifre) girerek onaylayın.
                            </p>
                        </div>

                        <form onSubmit={encryptionFormik.handleSubmit} className="space-y-6">
                            <Input
                                label="Şifreleme Anahtarı"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                onChange={encryptionFormik.handleChange}
                                value={encryptionFormik.values.password}
                                error={encryptionFormik.touched.password && encryptionFormik.errors.password ? encryptionFormik.errors.password : undefined}
                            />
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsEncryptionModalOpen(false)}
                                >
                                    İptal
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    isLoading={encryptionFormik.isSubmitting}
                                >
                                    Onayla
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
