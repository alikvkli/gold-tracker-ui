import React, { useEffect, useMemo, useState } from 'react';
import {
    History,
    Plus,
    Trash2,
    Loader2,
    Calendar,
    TrendingUp,
    TrendingDown,
    X,
    Hash,
    Banknote,
    MapPin,
    StickyNote,
    Shield,
    ChevronLeft,
    ChevronRight,
    Coins,
    Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Göreceli yolları kullanarak derleme hatalarını gidermeye çalışıyoruz
import { PATHS } from '../../routes/paths';
import { setEncryptionKey } from '../../features/app';
import { addToast } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import api from '../../lib/api';
import { formatDate, formatNumericValue, parseNumericValue } from '../../lib/date';
import Button from '../../components/Button';
import Input from '../../components/Input';

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
    const { user, encryptionKey, dateFormat, token } = useAppSelector(state => state.app);
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

    const confirmDelete = async () => {
        if (!assetToDelete) return;

        if (!token) {
            dispatch(addToast({ message: 'Oturum bilgisi bulunamadı.', type: 'error' }));
            return;
        }

        setIsDeleting(assetToDelete);
        
        try {
            const headers: any = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };
            
            if (encryptionKey) {
                headers['X-Encryption-Key'] = encryptionKey;
            }

            // 405 (Method Not Allowed) ve 403 (Forbidden) hatalarını aşmak için
            // POST metodunu kullanıp gövdede _method: 'DELETE' gönderiyoruz.
            await api.post(`/assets/${assetToDelete}`, {
                _method: 'DELETE'
            }, { headers });
            
            dispatch(addToast({ message: 'İşlem başarıyla silindi.', type: 'success' }));
            fetchAssets(page);
            fetchAllAssets();
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            console.error('Silme Hatası Detayı:', error.response);
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Silme işlemi başarısız.';
            dispatch(addToast({ message: errorMessage, type: 'error' }));
        } finally {
            setIsDeleting(null);
            setAssetToDelete(null);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!assetToEdit) return;

        if (!token) {
            dispatch(addToast({ message: 'Oturum bulunamadı.', type: 'error' }));
            return;
        }

        setIsEditing(true);
        try {
            const headers: any = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };
            
            if (encryptionKey) {
                headers['X-Encryption-Key'] = encryptionKey;
            }

            // Güncelleme işlemi için de POST + _method: 'PUT' yapısını kullanıyoruz.
            const updateData = {
                ...values,
                _method: 'PUT'
            };

            await api.post(`/assets/${assetToEdit.id}`, updateData, { headers });
            
            dispatch(addToast({ message: 'İşlem başarıyla güncellendi.', type: 'success' }));
            setIsEditModalOpen(false);
            setAssetToEdit(null);
            formik.resetForm();
            fetchAssets(page);
            fetchAllAssets();
        } catch (error: any) {
            console.error('Güncelleme Hatası Detayı:', error.response);
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Güncelleme başarısız.';
            dispatch(addToast({ message: errorMessage, type: 'error' }));
        } finally {
            setIsEditing(false);
        }
    };

    const calculateTotals = () => {
        let totalAmount = 0;
        let totalCost = 0;
        let totalValue = 0;

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
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <header className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-white/5">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-100 to-amber-300">
                                Birikimlerim
                            </h1>
                        </div>
                    </div>
                    <p className="text-sm sm:text-base text-zinc-400 font-medium ml-16 sm:ml-0">Tüm alım/satım işlemlerinizin dökümü ve geçmişi.</p>
                </div>
                <Button className="group w-full sm:w-auto shrink-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300" onClick={() => {
                    setIsEditModalOpen(false);
                    setAssetToEdit(null);
                    formik.resetForm();
                    setIsModalOpen(true);
                }}>
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Yeni İşlem Ekle
                </Button>
            </header>

            {!isLoading && assets.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl hover:border-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-500/0 transition-all duration-300"></div>
                        <div className="relative flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20 shadow-lg shadow-amber-500/10 group-hover:scale-110 transition-transform duration-300">
                                <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam Miktar</p>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200">
                                    {totals.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl hover:border-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/0 transition-all duration-300"></div>
                        <div className="relative flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                                <Banknote className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam Değer</p>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                    ₺{totals.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={`group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-xl sm:col-span-2 lg:col-span-1 overflow-hidden transition-all duration-300 hover:shadow-xl ${totals.profitLoss >= 0 ? 'border-green-500/20 hover:border-green-500/30 hover:shadow-green-500/5' : 'border-red-500/20 hover:border-red-500/30 hover:shadow-red-500/5'}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300 ${totals.profitLoss >= 0 ? 'from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/0' : 'from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/0'}`}></div>
                        <div className="relative flex items-center gap-3 sm:gap-4">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-transform duration-300 group-hover:scale-110 ${totals.profitLoss >= 0 ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400 border-green-500/20 shadow-green-500/10' : 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-400 border-red-500/20 shadow-red-500/10'}`}>
                                {totals.profitLoss >= 0 ? <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" /> : <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam Kar/Zarar</p>
                                <p className={`text-xl sm:text-2xl lg:text-3xl font-black truncate ${totals.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {totals.profitLoss >= 0 ? '+' : ''}₺{totals.profitLoss.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className={`text-xs sm:text-sm font-bold mt-1 ${totals.profitLoss >= 0 ? 'text-green-400/80' : 'text-red-400/80'}`}>
                                    {totals.profitLossPercent >= 0 ? '+' : ''}{totals.profitLossPercent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-50"></div>
                
                {/* Mobile Card View - md'den küçük ekranlarda gösterilecek */}
                <div className="relative md:hidden p-4 space-y-3">
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10">
                                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                                    </div>
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-xl animate-pulse"></div>
                                </div>
                                <p className="text-zinc-400 font-medium">Veriler yükleniyor...</p>
                            </div>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-3xl flex items-center justify-center border border-white/5 shadow-xl">
                                        <History className="w-12 h-12 text-zinc-600" />
                                    </div>
                                    <div className="absolute inset-0 bg-zinc-500/10 rounded-3xl blur-2xl"></div>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-zinc-300 mb-2">Henüz bir işlem kaydınız bulunmuyor</p>
                                    <p className="text-sm text-zinc-500">Yeni bir işlem ekleyerek başlayın</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        assets.map((asset, index) => {
                            const profitLoss = calculateAssetProfitLoss(asset);
                            return (
                                <div
                                    key={asset.id}
                                    className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all duration-200 group"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Header: Tür ve Tarih */}
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl shrink-0 border transition-all duration-200 ${asset.type === 'buy' ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400 border-green-500/20 shadow-lg shadow-green-500/5' : 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-400 border-red-500/20 shadow-lg shadow-red-500/5'}`}>
                                                {asset.type === 'buy' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-white">{asset.type === 'buy' ? 'Alım' : 'Satım'}</p>
                                                <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                                                    <Calendar className="w-3 h-3 shrink-0" />
                                                    <span>{formatDate(asset.date, dateFormat)}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {asset.type === 'buy' && (
                                            <div className="flex flex-col items-end">
                                                <span className={`font-black text-sm ${profitLoss.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {profitLoss.profitLoss >= 0 ? '+' : ''}₺{profitLoss.profitLoss.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                <span className={`text-xs font-bold ${profitLoss.profitLoss >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                                    {profitLoss.profitLossPercent >= 0 ? '+' : ''}{profitLoss.profitLossPercent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Varlık Adı */}
                                    <div className="mb-3">
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Varlık</p>
                                        <p className="font-bold text-base text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
                                            {(asset.currency.type === 'Altın' || asset.currency.type === 'Gold')
                                                ? asset.currency.name
                                                : asset.currency.code}
                                        </p>
                                    </div>

                                    {/* Miktar ve Fiyat Bilgileri */}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Miktar</p>
                                            <p className="font-bold text-sm text-white">
                                                {parseFloat(asset.amount).toLocaleString('tr-TR')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Birim Fiyat</p>
                                            <p className="text-sm text-zinc-400 font-medium">
                                                ₺{parseFloat(asset.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Toplam ve Yer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam</p>
                                            <p className={`font-black text-lg ${asset.type === 'buy' ? 'text-white' : 'text-zinc-400'}`}>
                                                ₺{(parseFloat(asset.amount) * parseFloat(asset.price)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        {asset.place && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                                                <span className="text-xs text-zinc-400 font-medium">{asset.place}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop Table View - md ve üzeri ekranlarda gösterilecek */}
                <div className="relative hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
                        <thead>
                            <tr className="border-b border-white/5 bg-gradient-to-r from-white/5 via-white/5 to-white/5">
                                <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-xs font-black uppercase tracking-widest text-zinc-400">Tür / Tarih</th>
                                <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-xs font-black uppercase tracking-widest text-zinc-400">Varlık</th>
                                <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Miktar</th>
                                <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Birim Fiyat</th>
                                <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Toplam</th>
                                <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-xs font-black uppercase tracking-widest text-zinc-400 hidden lg:table-cell">Yer</th>
                                <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-xs font-black uppercase tracking-widest text-zinc-400 text-right hidden sm:table-cell">Kar/Zarar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10">
                                                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                                                </div>
                                                <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-xl animate-pulse"></div>
                                            </div>
                                            <p className="text-zinc-400 font-medium">Veriler yükleniyor...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="relative">
                                                <div className="w-24 h-24 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-3xl flex items-center justify-center border border-white/5 shadow-xl">
                                                    <History className="w-12 h-12 text-zinc-600" />
                                                </div>
                                                <div className="absolute inset-0 bg-zinc-500/10 rounded-3xl blur-2xl"></div>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-zinc-300 mb-2">Henüz bir işlem kaydınız bulunmuyor</p>
                                                <p className="text-sm text-zinc-500">Yeni bir işlem ekleyerek başlayın</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset, index) => {
                                    const profitLoss = calculateAssetProfitLoss(asset);
                                    return (
                                        <tr 
                                            key={asset.id} 
                                            className="border-b border-white/5 hover:bg-gradient-to-r hover:from-white/5 hover:to-white/0 transition-all duration-200 group"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                                                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                                    <div className={`p-2.5 sm:p-3 lg:p-3.5 rounded-xl sm:rounded-2xl shrink-0 border transition-all duration-200 group-hover:scale-105 ${asset.type === 'buy' ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400 border-green-500/20 shadow-lg shadow-green-500/5' : 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-400 border-red-500/20 shadow-lg shadow-red-500/5'}`}>
                                                        {asset.type === 'buy' ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-xs sm:text-sm truncate text-white">{asset.type === 'buy' ? 'Alım' : 'Satım'}</p>
                                                        <p className="text-[10px] sm:text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                                                            <Calendar className="w-3 h-3 shrink-0" /> <span className="truncate">{formatDate(asset.date, dateFormat)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs sm:text-sm text-white truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300">
                                                        {(asset.currency.type === 'Altın' || asset.currency.type === 'Gold')
                                                            ? asset.currency.name
                                                            : asset.currency.code}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-right">
                                                <span className="font-bold text-xs sm:text-sm text-white tracking-tighter">
                                                    {parseFloat(asset.amount).toLocaleString('tr-TR')}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-right">
                                                <span className="text-xs sm:text-sm text-zinc-400 font-medium">
                                                    ₺{parseFloat(asset.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-right">
                                                <span className={`font-black tracking-tighter text-sm sm:text-base lg:text-lg ${asset.type === 'buy' ? 'text-white' : 'text-zinc-400'}`}>
                                                    ₺{(parseFloat(asset.amount) * parseFloat(asset.price)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 hidden lg:table-cell">
                                                {asset.place ? (
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                                                        <span className="text-xs sm:text-sm text-zinc-400 font-medium truncate">{asset.place}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-600 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-right hidden sm:table-cell">
                                                {asset.type === 'buy' ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className={`font-black text-xs sm:text-sm ${profitLoss.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {profitLoss.profitLoss >= 0 ? '+' : ''}₺{profitLoss.profitLoss.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                        <span className={`text-[10px] sm:text-xs font-bold ${profitLoss.profitLoss >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                                            {profitLoss.profitLossPercent >= 0 ? '+' : ''}{profitLoss.profitLossPercent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-500 text-sm">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.last_page > 1 && (
                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 bg-gradient-to-r from-white/5 via-white/5 to-white/5">
                        <p className="text-xs sm:text-sm text-zinc-400 font-medium text-center sm:text-left">
                            Toplam <span className="text-white font-bold">{pagination.total}</span> işlemden
                            <span className="text-white font-bold"> {(page - 1) * pagination.per_page + 1} - {Math.min(page * pagination.per_page, pagination.total)}</span> gösteriliyor
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 border border-white/10 rounded-lg hover:bg-white/10 hover:border-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                                {[...Array(pagination.last_page)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 hover:scale-110 ${page === i + 1 
                                            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-900 shadow-lg shadow-amber-500/30 border border-amber-400/20' 
                                            : 'hover:bg-white/5 text-zinc-400 border border-transparent hover:border-white/10'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                disabled={page === pagination.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 border border-white/10 rounded-lg hover:bg-white/10 hover:border-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {(isModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-zinc-900 border-t lg:border border-white/10 rounded-t-2xl sm:rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="p-4 sm:p-6 lg:p-8 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl sm:text-2xl font-black">{isEditModalOpen ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}</h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsEditModalOpen(false);
                                    setAssetToEdit(null);
                                    formik.resetForm();
                                }}
                                className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all shrink-0"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-1 bg-white/5 rounded-xl sm:rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => formik.setFieldValue('type', 'buy')}
                                    className={`py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${formik.values.type === 'buy' ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' : 'text-zinc-500'}`}
                                >
                                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Alım
                                </button>
                                <button
                                    type="button"
                                    onClick={() => formik.setFieldValue('type', 'sell')}
                                    className={`py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${formik.values.type === 'sell' ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20' : 'text-zinc-500'}`}
                                >
                                    <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Satım
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-lg sm:rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAssetType('Altın')}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all ${selectedAssetType === 'Altın' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Altın
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAssetType('Döviz')}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all ${selectedAssetType === 'Döviz' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Döviz
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <select
                                            name="currency_id"
                                            onChange={formik.handleChange}
                                            value={formik.values.currency_id}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-white outline-none focus:border-amber-500/50 appearance-none transition-all"
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
                                        <Coins className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <Input
                                    label="Tarih"
                                    type="date"
                                    name="date"
                                    onChange={formik.handleChange}
                                    value={formik.values.date}
                                    error={formik.touched.date && formik.errors.date ? formik.errors.date : undefined}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-zinc-500 text-lg sm:text-xl font-medium">₺</span>
                                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
                                        {(Number(formik.values.amount || 0) * Number(formik.values.price || 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

            {isSecurityModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6 bg-zinc-950/90 backdrop-blur-md">
                    <div className="w-full max-w-md bg-zinc-900 border-t lg:border border-white/10 rounded-t-2xl sm:rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 lg:p-10 overflow-hidden relative">
                        <div className="text-center relative z-10">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-amber-500/5">
                                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">Güvenlik Kontrolü</h2>
                            <form onSubmit={handleVerifyKey} className="space-y-4 sm:space-y-6">
                                <Input
                                    label="Şifreleme Anahtarı"
                                    type="password"
                                    placeholder="••••••••"
                                    value={securityKey}
                                    onChange={(e) => setSecurityKey(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <Button type="submit" className="w-full" isLoading={isVerifying}>
                                        Doğrula ve Eriş
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(PATHS.DASHBOARD)}
                                        className="text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest py-2"
                                    >
                                        Geri Dön
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-end lg:items-center justify-center p-0 lg:p-6 bg-zinc-950/90 backdrop-blur-md">
                    <div className="w-full max-w-md bg-zinc-900 border-t lg:border border-white/10 rounded-t-2xl sm:rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 lg:p-10 overflow-hidden relative">
                        <div className="text-center relative z-10">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 border border-red-500/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-red-500/5">
                                <Trash2 className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">İşlemi Sil</h2>
                            <p className="text-sm text-zinc-500 leading-relaxed mb-6 sm:mb-10 px-4">
                                Bu işlemi silmek istediğinize emin misiniz? Bu işlem geri <span className="text-red-500 font-bold">alınamaz</span>.
                            </p>
                            <div className="flex flex-col gap-3 sm:gap-4">
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