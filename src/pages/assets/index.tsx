import React, { useEffect, useMemo, useState } from 'react';
import {
    History,
    Plus,
    Trash2,
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
    Shield,
    ChevronLeft,
    ChevronRight,
    Coins,
    Edit,
    Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { PATHS } from '@/routes/paths';
import { setEncryptionKey } from '@/features/app';
import { addToast } from '@/features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import api from '@/lib/api';
import { formatDate, formatNumericValue, parseNumericValue } from '@/lib/date';
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
        type: string;
    }
}

interface Currency {
    id: number;
    code: string;
    name: string;
    type: string;
    buying: string;
    selling: string;
    last_updated_at?: string;
    created_at?: string;
    updated_at?: string;
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
    const [allAssets, setAllAssets] = useState<Asset[]>([]);
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
    const [selectedAssetType, setSelectedAssetType] = useState<'Altın' | 'Döviz'>('Altın');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const currencyMap = useMemo(() => {
        const map = new Map<number, Currency>();
        currencies.forEach(currency => map.set(currency.id, currency));
        return map;
    }, [currencies]);

    const getCurrencyForAsset = (asset: Asset) => {
        const byId = currencyMap.get(asset.currency_id);
        if (byId) return byId;

        const assetCode = asset.currency?.code?.toLowerCase();
        if (!assetCode) return undefined;

        return currencies.find(cur => cur.code?.toLowerCase() === assetCode);
    };

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

    const fetchAllAssets = async () => {
        try {
            const response = await api.get('/assets?per_page=10000');
            setAllAssets(response.data.data);
        } catch (error) {
            console.error('Tüm varlıklar alınırken hata oluştu:', error);
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await api.get('/currencies');
            setCurrencies(response.data);
        } catch (error) {
            console.error('Kurlar alınırken hata oluştu:', error);
        }
    };

    useEffect(() => {
        if (user?.encrypted && !encryptionKey) {
            setIsSecurityModalOpen(true);
            setIsLoading(false);
        } else {
            fetchAssets(page);
            fetchAllAssets();
            fetchCurrencies();
        }
    }, [page, user?.encrypted, encryptionKey]);

    const handleVerifyKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!securityKey) return;

        setIsVerifying(true);
        try {
            await api.get('/assets?page=1', {
                headers: { 'X-Encryption-Key': securityKey }
            });
            dispatch(setEncryptionKey(securityKey));
            setIsSecurityModalOpen(false);
            dispatch(addToast({ message: 'Şifreleme anahtarı doğrulandı.', type: 'success' }));
            fetchAssets(1);
            fetchAllAssets();
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors?.[0] || 'Yanlış şifreleme anahtarı.';
            dispatch(addToast({ message: errorMessage, type: 'error' }));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDelete = async (id: number) => {
        setAssetToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!assetToDelete) return;

        setIsDeleting(assetToDelete);
        try {
            await api.delete(`/assets/${assetToDelete}`);
            dispatch(addToast({ message: 'İşlem başarıyla silindi.', type: 'success' }));
            fetchAssets(page);
            fetchAllAssets();
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            dispatch(addToast({ message: 'Silme işlemi sırasında bir hata oluştu.', type: 'error' }));
        } finally {
            setIsDeleting(null);
            setAssetToDelete(null);
        }
    };

    const handleEdit = (asset: Asset) => {
        setAssetToEdit(asset);
        formik.setValues({
            currency_id: asset.currency_id.toString(),
            type: asset.type,
            amount: asset.amount,
            price: asset.price,
            date: asset.date,
            place: asset.place || '',
            note: asset.note || '',
        });
        setSelectedAssetType(asset.currency.type === 'Altın' || asset.currency.type === 'Gold' ? 'Altın' : 'Döviz');
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (values: any) => {
        if (!assetToEdit) return;

        setIsEditing(true);
        try {
            await api.put(`/assets/${assetToEdit.id}`, values);
            dispatch(addToast({ message: 'İşlem başarıyla güncellendi.', type: 'success' }));
            setIsEditModalOpen(false);
            setAssetToEdit(null);
            formik.resetForm();
            fetchAssets(page);
            fetchAllAssets();
        } catch (error: any) {
            dispatch(addToast({ message: error.response?.data?.errors?.[0] || 'İşlem güncellenirken bir hata oluştu.', type: 'error' }));
        } finally {
            setIsEditing(false);
        }
    };

    // Calculate totals and profit/loss
    const calculateTotals = () => {
        let totalAmount = 0;
        let totalCost = 0;
        let totalValue = 0;

        // Currencies henüz yüklenmemişse 0 döndür
        if (currencies.length === 0 || allAssets.length === 0) {
            return { totalAmount: 0, totalCost: 0, totalValue: 0, profitLoss: 0, profitLossPercent: 0 };
        }

        allAssets.forEach(asset => {
            const currency = getCurrencyForAsset(asset);

            if (currency && currency.selling && currency.selling !== '0' && currency.selling !== '0.0000') {
                const amount = parseFloat(asset.amount);
                const price = parseFloat(asset.price);
                const currentPrice = parseFloat(currency.selling);

                if (!isNaN(amount) && !isNaN(price) && !isNaN(currentPrice) && amount > 0 && price > 0 && currentPrice > 0) {
                    if (asset.type === 'buy') {
                        totalAmount += amount;
                        totalCost += amount * price;
                        totalValue += amount * currentPrice;
                    } else {
                        totalAmount -= amount;
                        totalCost -= amount * price;
                        totalValue -= amount * currentPrice;
                    }
                }
            }
        });

        const profitLoss = totalValue - totalCost;
        const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

        return { totalAmount, totalCost, totalValue, profitLoss, profitLossPercent };
    };

    const calculateAssetProfitLoss = (asset: Asset) => {
        if (asset.type !== 'buy') {
            return { profitLoss: 0, profitLossPercent: 0 };
        }

        // Currencies henüz yüklenmemişse 0 döndür
        if (currencies.length === 0) {
            return { profitLoss: 0, profitLossPercent: 0 };
        }

        const currency = getCurrencyForAsset(asset);

        if (!currency || !currency.selling || currency.selling === '0' || currency.selling === '0.0000') {
            return { profitLoss: 0, profitLossPercent: 0 };
        }

        const amount = parseFloat(asset.amount);
        const buyPrice = parseFloat(asset.price);
        const currentPrice = parseFloat(currency.selling);

        if (isNaN(amount) || isNaN(buyPrice) || isNaN(currentPrice) || amount <= 0 || buyPrice <= 0 || currentPrice <= 0) {
            console.warn('Geçersiz değerler:', { amount, buyPrice, currentPrice, assetId: asset.id });
            return { profitLoss: 0, profitLossPercent: 0 };
        }

        const profitLoss = (currentPrice - buyPrice) * amount;
        const profitLossPercent = buyPrice > 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0;

        return { profitLoss, profitLossPercent };
    };

    const totals = calculateTotals();

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
            if (isEditModalOpen && assetToEdit) {
                await handleUpdate(values);
            } else {
                try {
                    await api.post('/assets', values);
                    dispatch(addToast({ message: 'İşlem başarıyla eklendi.', type: 'success' }));
                    setIsModalOpen(false);
                    formik.resetForm();
                    fetchAssets(1);
                    fetchAllAssets();
                    setPage(1);
                } catch (error: any) {
                    dispatch(addToast({ message: error.response?.data?.errors?.[0] || 'İşlem eklenirken bir hata oluştu.', type: 'error' }));
                }
            }
        },
    });

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
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">Birikimlerim</h1>
                    <p className="text-zinc-500 font-medium">Tüm alım/satım işlemlerinizin dökümü ve geçmişi.</p>
                </div>
                <Button className="group w-full md:w-auto" onClick={() => {
                    setIsEditModalOpen(false);
                    setAssetToEdit(null);
                    formik.resetForm();
                    setIsModalOpen(true);
                }}>
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                    Yeni İşlem Ekle
                </Button>
            </header>

            {/* Summary Cards */}
            {!isLoading && assets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Toplam Miktar</p>
                                <p className="text-2xl font-black text-white">
                                    {totals.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                <Banknote className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Toplam Değer</p>
                                <p className="text-2xl font-black text-white">
                                    ₺{totals.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={`bg-zinc-900/50 border rounded-[2.5rem] p-8 backdrop-blur-xl ${totals.profitLoss >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${totals.profitLoss >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {totals.profitLoss >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Toplam Kar/Zarar</p>
                                <p className={`text-2xl font-black ${totals.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {totals.profitLoss >= 0 ? '+' : ''}₺{totals.profitLoss.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className={`text-xs font-bold mt-1 ${totals.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {totals.profitLossPercent >= 0 ? '+' : ''}{totals.profitLossPercent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Tür / Tarih</th>
                                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Varlık</th>
                                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Miktar</th>
                                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Birim Fiyat</th>
                                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Toplam</th>
                                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Yer</th>
                                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Kar/Zarar</th>
                                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                                            <p className="text-zinc-500 font-medium">Veriler yükleniyor...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-30">
                                            <History className="w-20 h-20" />
                                            <p className="text-xl font-medium">Henüz bir işlem kaydınız bulunmuyor.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => {
                                    const profitLoss = calculateAssetProfitLoss(asset);
                                    return (
                                        <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${asset.type === 'buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
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
                                                    <p className="font-bold text-white">
                                                        {(asset.currency.type === 'Altın' || asset.currency.type === 'Gold')
                                                            ? asset.currency.name
                                                            : asset.currency.code}
                                                    </p>
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
                                                <span className={`font-black tracking-tighter text-lg ${asset.type === 'buy' ? 'text-white' : 'text-zinc-400'}`}>
                                                    ₺{(parseFloat(asset.amount) * parseFloat(asset.price)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {asset.place ? (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-zinc-500" />
                                                        <span className="text-sm text-zinc-400 font-medium">{asset.place}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-600 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {asset.type === 'buy' ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className={`font-black text-sm ${profitLoss.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {profitLoss.profitLoss >= 0 ? '+' : ''}₺{profitLoss.profitLoss.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                        <span className={`text-xs font-bold ${profitLoss.profitLoss >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                                            {profitLoss.profitLossPercent >= 0 ? '+' : ''}{profitLoss.profitLossPercent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-500 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100">
                                                    <button
                                                        onClick={() => handleEdit(asset)}
                                                        className="p-3 text-zinc-600 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(asset.id)}
                                                        disabled={isDeleting === asset.id}
                                                        className="p-3 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                                    >
                                                        {isDeleting === asset.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.last_page > 1 && (
                    <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 bg-white/5">
                        <p className="text-xs text-zinc-500 font-medium text-center sm:text-left">
                            Toplam <span className="text-white font-bold">{pagination.total}</span> işlemden
                            <span className="text-white font-bold"> {(page - 1) * pagination.per_page + 1} - {Math.min(page * pagination.per_page, pagination.total)}</span> gösteriliyor
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                                {[...Array(pagination.last_page)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shrink-0 ${page === i + 1 ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' : 'hover:bg-white/5 text-zinc-500'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                disabled={page === pagination.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div className="text-sm">
                    <p className="font-bold text-amber-500 mb-1">Şifreleme Hakkında Not</p>
                    <p className="text-zinc-500 leading-relaxed">
                        Varlıklarınızın gizliliği için şifreleme özelliğini kullanıyorsanız, verilerinize güvenli bir şekilde erişebilmek için profil sayfanızdan şifreleme anahtarınızı doğrulamanız gerekmektedir.
                    </p>
                </div>
            </div>

            {/* Add/Edit Asset Modal / Bottom Tray */}
            {(isModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-zinc-900 border-t lg:border border-white/10 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
                        {/* Drag Handle for Mobile */}
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto my-4 lg:hidden" />

                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-2xl font-black">{isEditModalOpen ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}</h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsEditModalOpen(false);
                                    setAssetToEdit(null);
                                    formik.resetForm();
                                }}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-500 px-1 uppercase tracking-widest text-center block w-full mb-3">Varlık Grubu</label>
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAssetType('Altın')}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all ${selectedAssetType === 'Altın' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
                                                }`}
                                        >
                                            Altın
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAssetType('Döviz')}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all ${selectedAssetType === 'Döviz' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
                                                }`}
                                        >
                                            Döviz
                                        </button>
                                    </div>
                                </div>

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
                                            {currencies
                                                .filter(cur => {
                                                    if (selectedAssetType === 'Altın') {
                                                        return cur.type === 'Altın' || cur.type === 'Gold';
                                                    }
                                                    return cur.type === 'Döviz';
                                                })
                                                .map(cur => (
                                                    <option key={cur.id} value={cur.id} className="bg-zinc-900">
                                                        {selectedAssetType === 'Altın' ? cur.name : cur.code}
                                                    </option>
                                                ))}
                                        </select>
                                        <Coins className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                    {formik.touched.currency_id && formik.errors.currency_id && (
                                        <p className="text-xs text-red-400 font-medium px-1">{formik.errors.currency_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Tarih"
                                    type="date"
                                    name="date"
                                    onChange={formik.handleChange}
                                    value={formik.values.date}
                                    error={formik.touched.date && formik.errors.date ? formik.errors.date : undefined}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-1.5 bg-zinc-950 border border-white/5 rounded-2xl relative">
                                    <Input
                                        label="Miktar"
                                        placeholder="0"
                                        type="text"
                                        icon={<Hash className="w-5 h-5" />}
                                        name="amount"
                                        onChange={(e) => {
                                            const rawValue = parseNumericValue(e.target.value);
                                            if (!isNaN(Number(rawValue)) || rawValue === '' || rawValue === '.') {
                                                formik.setFieldValue('amount', rawValue);
                                            }
                                        }}
                                        value={formatNumericValue(formik.values.amount)}
                                        error={formik.touched.amount && formik.errors.amount ? formik.errors.amount : undefined}
                                    />
                                </div>
                                <div className="p-1.5 bg-zinc-950 border border-white/5 rounded-2xl relative">
                                    <Input
                                        label="Birim Fiyat (₺)"
                                        placeholder="0"
                                        type="text"
                                        icon={<Banknote className="w-5 h-5" />}
                                        name="price"
                                        onChange={(e) => {
                                            const rawValue = parseNumericValue(e.target.value);
                                            if (!isNaN(Number(rawValue)) || rawValue === '' || rawValue === '.') {
                                                formik.setFieldValue('price', rawValue);
                                            }
                                        }}
                                        value={formatNumericValue(formik.values.price)}
                                        error={formik.touched.price && formik.errors.price ? formik.errors.price : undefined}
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Tahmini Toplam Tutar</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-zinc-500 text-xl font-medium">₺</span>
                                    <span className="text-3xl sm:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
                                        {(Number(formik.values.amount || 0) * Number(formik.values.price || 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                isLoading={formik.isSubmitting || isEditing}
                            >
                                {isEditModalOpen 
                                    ? (formik.values.type === 'buy' ? 'Alımı Güncelle' : 'Satımı Güncelle')
                                    : (formik.values.type === 'buy' ? 'Alımı Kaydet' : 'Satımı Kaydet')
                                }
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Security Modal / Bottom Tray */}
            {isSecurityModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6 bg-zinc-950/90 backdrop-blur-md">
                    <div className="w-full max-w-md bg-zinc-900 border-t lg:border border-white/10 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Shield className="w-32 h-32" />
                        </div>

                        <div className="text-center relative z-10">
                            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/5">
                                <Shield className="w-10 h-10 text-amber-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-4 tracking-tight">Güvenlik Kontrolü</h2>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-10 px-4">
                                Varlıklarınız şifrelenmiştir. Erişmek için lütfen <span className="text-amber-500 font-bold">Şifreleme Anahtarınızı</span> giriniz.
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
            {/* Delete Confirmation Modal / Bottom Tray */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-end lg:items-center justify-center p-0 lg:p-6 bg-zinc-950/90 backdrop-blur-md">
                    <div className="w-full max-w-md bg-zinc-900 border-t lg:border border-white/10 rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Trash2 className="w-32 h-32 text-red-500" />
                        </div>

                        <div className="text-center relative z-10">
                            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/5">
                                <Trash2 className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-4 tracking-tight">İşlemi Sil</h2>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-10 px-4">
                                Bu işlemi silmek istediğinize emin misiniz? Bu işlem geri <span className="text-red-500 font-bold">alınamaz</span>.
                            </p>

                            <div className="flex flex-col gap-4">
                                <Button
                                    onClick={confirmDelete}
                                    className="w-full !bg-red-500 !text-white hover:!bg-red-600 shadow-lg shadow-red-500/20"
                                    isLoading={isDeleting !== null}
                                >
                                    Evet, Sil
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setAssetToDelete(null);
                                    }}
                                    className="text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest py-2"
                                >
                                    Vazgeç
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetsPage;
