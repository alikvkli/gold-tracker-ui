import React, { useEffect, useState } from 'react';
import {
    History,
    Plus,
    Trash2,
    Coins,
    LayoutDashboard,
    User as UserIcon,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Calendar,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    X,
    Hash,
    Banknote,
    MapPin,
    StickyNote,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { PATHS } from '@/routes/paths';
import { logout, setEncryptionKey } from '@/features/app';
import { addToast } from '@/features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import api from '@/lib/api';
import { formatDate } from '@/lib/date';
import Button from '@/components/Button';
import Input from '@/components/Input';

interface Asset {
    id: number;
    currency_id: number;
    type: 'buy' | 'sell';
    amount: string;
    price: string;
    date: string;
    place: string | null;
    note: string | null;
    currency: {
        id: number;
        name: string;
        code: string;
    }
}

interface Currency {
    id: number;
    code: string;
    name: string;
    buying: string;
    selling: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const AssetsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [assets, setAssets] = useState<Asset[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const { user, encryptionKey, dateFormat } = useAppSelector(state => state.app);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [securityKey, setSecurityKey] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const fetchAssets = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/assets?page=${pageNum}`);
            setAssets(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Varlıklar alınırken hata oluştu:', error);
            dispatch(addToast({ message: 'Varlık bilgileriniz yüklenemedi.', type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await api.get('/currencies'); // Simplified currency list
            setCurrencies(response.data);
        } catch (error) {
            console.error('Kurlar alınırken hata oluştu:', error);
            dispatch(addToast({ message: 'Kur bilgileri yüklenemedi.', type: 'error' }));
        }
    };

    useEffect(() => {
        if (user?.encrypted && !encryptionKey) {
            setIsSecurityModalOpen(true);
            setIsLoading(false);
        } else {
            fetchAssets(page);
            fetchCurrencies();
        }
    }, [page, user?.encrypted, encryptionKey]);

    const handleVerifyKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!securityKey) return;

        setIsVerifying(true);
        try {
            // Test the key by making a request to the assets endpoint
            await api.get('/assets?page=1', {
                headers: { 'X-Encryption-Key': securityKey }
            });

            // If successful, save the key and close the modal
            dispatch(setEncryptionKey(securityKey));
            setIsSecurityModalOpen(false);
            dispatch(addToast({ message: 'Şifreleme anahtarı doğrulandı.', type: 'success' }));
            fetchAssets(1);
            fetchCurrencies();
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors?.[0] || 'Yanlış şifreleme anahtarı.';
            dispatch(addToast({ message: errorMessage, type: 'error' }));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;

        setIsDeleting(id);
        try {
            await api.delete(`/assets/${id}`);
            dispatch(addToast({ message: 'İşlem başarıyla silindi.', type: 'success' }));
            fetchAssets(page);
        } catch (error: any) {
            dispatch(addToast({ message: 'Silme işlemi sırasında bir hata oluştu.', type: 'error' }));
        } finally {
            setIsDeleting(null);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate(PATHS.HOME);
    };

    const formik = useFormik({
        initialValues: {
            currency_id: '',
            type: 'buy',
            amount: '',
            price: '',
            date: new Date().toISOString().split('T')[0],
            place: '',
            note: '',
        },
        validationSchema: Yup.object({
            currency_id: Yup.string().required('Varlık seçimi zorunludur'),
            type: Yup.string().oneOf(['buy', 'sell']).required(),
            amount: Yup.number().positive('Miktar pozitif olmalıdır').required('Miktar zorunludur'),
            price: Yup.number().positive('Fiyat pozitif olmalıdır').required('Fiyat zorunludur'),
            date: Yup.string().required('Tarih zorunludur'),
        }),
        onSubmit: async (values) => {
            try {
                await api.post('/assets', values);
                dispatch(addToast({ message: 'İşlem başarıyla eklendi.', type: 'success' }));
                setIsModalOpen(false);
                formik.resetForm();
                fetchAssets(1);
                setPage(1);
            } catch (error: any) {
                dispatch(addToast({ message: error.response?.data?.errors?.[0] || 'İşlem eklenirken bir hata oluştu.', type: 'error' }));
            }
        },
    });

    // Auto-populate price based on selected currency and transaction type
    useEffect(() => {
        if (formik.values.currency_id && currencies.length > 0) {
            const selectedCurrency = currencies.find(c => c.id === parseInt(formik.values.currency_id));
            if (selectedCurrency) {
                const price = formik.values.type === 'buy' ? selectedCurrency.buying : selectedCurrency.selling;
                formik.setFieldValue('price', price);
            }
        }
    }, [formik.values.currency_id, formik.values.type, currencies]);

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
                    <button onClick={() => navigate(PATHS.ASSETS)} className="flex items-center gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-amber-500 font-bold transition-all shadow-lg shadow-amber-500/5">
                        <History className="w-5 h-5" />
                        Varlıklarım
                    </button>
                    <button onClick={() => navigate(PATHS.PROFILE)} className="flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-medium">
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
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black mb-2 tracking-tight">Varlıklarım</h1>
                        <p className="text-zinc-500">Tüm alım/satım işlemlerinizin dökümü ve geçmişi.</p>
                    </div>
                    <Button className="group" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        Yeni İşlem Ekle
                    </Button>
                </header>

                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Tür / Tarih</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Varlık</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Miktar</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Birim Fiyat</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Toplam</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                                                <p className="text-zinc-500 font-medium">Veriler yükleniyor...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : assets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-6 opacity-30">
                                                <History className="w-20 h-20" />
                                                <p className="text-xl font-medium">Henüz bir işlem kaydınız bulunmuyor.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    assets.map((asset) => (
                                        <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${asset.type === 'buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {asset.type === 'buy' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{asset.type === 'buy' ? 'Alım' : 'Satım'}</p>
                                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                                            <Calendar className="w-3 h-3" /> {formatDate(asset.date, dateFormat)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="font-bold text-white">{asset.currency.name}</p>
                                                    <p className="text-xs text-zinc-500 font-mono mt-1">{asset.currency.code}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="font-bold text-white tracking-tighter">
                                                    {parseFloat(asset.amount).toLocaleString('tr-TR')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-zinc-400 font-medium">
                                                    ₺{parseFloat(asset.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`font-black tracking-tighter text-lg ${asset.type === 'buy' ? 'text-white' : 'text-zinc-400'
                                                    }`}>
                                                    ₺{(parseFloat(asset.amount) * parseFloat(asset.price)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(asset.id)}
                                                    disabled={isDeleting === asset.id}
                                                    className="p-3 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    {isDeleting === asset.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="px-8 py-6 flex items-center justify-between border-t border-white/5 bg-white/5">
                            <p className="text-xs text-zinc-500 font-medium">
                                Toplam <span className="text-white font-bold">{pagination.total}</span> işlemden
                                <span className="text-white font-bold"> {(page - 1) * pagination.per_page + 1} - {Math.min(page * pagination.per_page, pagination.total)}</span> gösteriliyor
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(pagination.last_page)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' : 'hover:bg-white/5 text-zinc-500'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={page === pagination.last_page}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Note */}
                <div className="mt-12 p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                    <div className="text-sm">
                        <p className="font-bold text-amber-500 mb-1">Şifreleme Hakkında Not</p>
                        <p className="text-zinc-500 leading-relaxed">
                            Varlıklarınızın gizliliği için şifreleme özelliğini kullanıyorsanız, verilerinize güvenli bir şekilde erişebilmek için profil sayfanızdan şifreleme anahtarınızı doğrulamanız gerekmektedir. Doğrulama yapıldıktan sonra tüm verileriniz otomatik olarak görünür hale gelecektir.
                        </p>
                    </div>
                </div>
            </main>

            {/* Add Asset Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-2xl font-black">Yeni İşlem Ekle</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4 p-1 bg-white/5 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => formik.setFieldValue('type', 'buy')}
                                    className={`py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formik.values.type === 'buy' ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' : 'text-zinc-500'
                                        }`}
                                >
                                    <TrendingUp className="w-4 h-4" /> Alım
                                </button>
                                <button
                                    type="button"
                                    onClick={() => formik.setFieldValue('type', 'sell')}
                                    className={`py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formik.values.type === 'sell' ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' : 'text-zinc-500'
                                        }`}
                                >
                                    <TrendingDown className="w-4 h-4" /> Satım
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-500 px-1 uppercase tracking-widest">Varlık</label>
                                    <div className="relative">
                                        <select
                                            name="currency_id"
                                            onChange={formik.handleChange}
                                            value={formik.values.currency_id}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50 appearance-none transition-all"
                                        >
                                            <option value="" disabled className="bg-zinc-900">Seçiniz...</option>
                                            {currencies.map(cur => (
                                                <option key={cur.id} value={cur.id} className="bg-zinc-900">{cur.name} ({cur.code})</option>
                                            ))}
                                        </select>
                                        <Coins className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                    {formik.touched.currency_id && formik.errors.currency_id && (
                                        <p className="text-xs text-red-400 font-medium px-1">{formik.errors.currency_id}</p>
                                    )}
                                </div>

                                <Input
                                    label="Tarih"
                                    type="date"
                                    name="date"
                                    onChange={formik.handleChange}
                                    value={formik.values.date}
                                    error={formik.touched.date && formik.errors.date ? formik.errors.date : undefined}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Input
                                    label="Miktar"
                                    placeholder="0.00"
                                    type="number"
                                    step="0.01"
                                    icon={<Hash className="w-5 h-5" />}
                                    name="amount"
                                    onChange={formik.handleChange}
                                    value={formik.values.amount}
                                    error={formik.touched.amount && formik.errors.amount ? formik.errors.amount : undefined}
                                />
                                <Input
                                    label="Birim Fiyat (₺)"
                                    placeholder="0.00"
                                    type="number"
                                    step="0.01"
                                    icon={<Banknote className="w-5 h-5" />}
                                    name="price"
                                    onChange={formik.handleChange}
                                    value={formik.values.price}
                                    error={formik.touched.price && formik.errors.price ? formik.errors.price : undefined}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Input
                                    label="Yer"
                                    placeholder="Kuyumcu, Banka vb."
                                    icon={<MapPin className="w-5 h-5" />}
                                    name="place"
                                    onChange={formik.handleChange}
                                    value={formik.values.place}
                                />
                                <Input
                                    label="Not"
                                    placeholder="Ek bilgiler..."
                                    icon={<StickyNote className="w-5 h-5" />}
                                    name="note"
                                    onChange={formik.handleChange}
                                    value={formik.values.note}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-4"
                                isLoading={formik.isSubmitting}
                            >
                                {formik.values.type === 'buy' ? 'Alımı Kaydet' : 'Satımı Kaydet'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
            {/* Security Modal */}
            {isSecurityModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-md">
                    <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Shield className="w-32 h-32" />
                        </div>

                        <div className="text-center relative z-10">
                            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/5">
                                <Shield className="w-10 h-10 text-amber-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-4 tracking-tight">Güvenlik Kontrolü</h2>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-10 px-4">
                                Varlıklarınız şifrelenmiştir. İşlemlerinizi görebilmek için lütfen <span className="text-amber-500 font-bold">Şifreleme Anahtarınızı</span> giriniz.
                            </p>

                            <form onSubmit={handleVerifyKey} className="space-y-6">
                                <Input
                                    label="Şifreleme Anahtarı"
                                    type="password"
                                    placeholder="••••••••"
                                    value={securityKey}
                                    onChange={(e) => setSecurityKey(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex flex-col gap-4">
                                    <Button type="submit" className="w-full" isLoading={isVerifying}>
                                        Doğrula ve Eriş
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(PATHS.DASHBOARD)}
                                        className="text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest"
                                    >
                                        Geri Dön
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetsPage;
