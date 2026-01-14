import React, { useEffect, useMemo, useState } from 'react';
import {
    History,
    Trash2,
    TrendingUp,
    TrendingDown,
    Hash,
    Banknote,
    MapPin,
    StickyNote,
    ChevronLeft,
    ChevronRight,
    Coins,
    ArrowRightLeft
} from 'lucide-react';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { setEncryptionKey } from '../../features/app';
import { addToast } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import api from '../../lib/api'; // Kept only for initial key verification
import { formatDate, formatNumericValue, parseNumericValue } from '../../lib/date';
import { getAssetUnit } from '../../lib/utils';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
    useGetAssetsQuery,
    useGetAllAssetsQuery,
    useGetCurrenciesQuery,
    useAddAssetMutation,
    useUpdateAssetMutation,
    useDeleteAssetMutation,
    Asset
} from '../../features/api/apiSlice';

const TransactionsPage: React.FC = () => {

    const dispatch = useAppDispatch();
    const { user, encryptionKey, dateFormat } = useAppSelector(state => state.app);

    // Local UI State
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [selectedAssetType, setSelectedAssetType] = useState<'Altın' | 'Döviz'>('Altın');
    const [isExternalSale, setIsExternalSale] = useState(false);

    // Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

    // Transaction Security Modal
    const [isTransactionSecurityModalOpen, setIsTransactionSecurityModalOpen] = useState(false);
    const [transactionSecurityKey, setTransactionSecurityKey] = useState('');
    const [isTransactionVerifying, setIsTransactionVerifying] = useState(false);
    const [pendingAction, setPendingAction] = useState<{
        type: 'add' | 'update' | 'delete';
        payload?: any;
        id?: number;
    } | null>(null);

    // Initial Load Security (Optional: Only if we want to force unlock for history, but we decided to remove blocking)
    // We will rely on skipQuery to hide data, but not show modal on load.
    // const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false); 


    // RTK Query Hooks
    const skipQuery = user?.encrypted && !encryptionKey;

    const { data: assetsData, isLoading: isAssetsLoading, isFetching: isAssetsFetching } = useGetAssetsQuery(
        { page },
        { skip: skipQuery }
    );

    const { data: allAssets } = useGetAllAssetsQuery(undefined, { skip: skipQuery });

    const { data: currencies = [] } = useGetCurrenciesQuery();

    const [addAsset, { isLoading: isAdding }] = useAddAssetMutation();
    const [updateAsset, { isLoading: isUpdating }] = useUpdateAssetMutation();
    const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();

    const assets = assetsData?.data || [];
    const pagination = assetsData?.pagination || null;
    const isLoading = isAssetsLoading || isAssetsFetching;

    // Derived State
    const balances = useMemo(() => {
        const balances = new Map<number, number>();
        (allAssets || []).forEach(asset => {
            const amount = parseFloat(asset.amount);
            if (!isNaN(amount)) {
                const currencyId = Number(asset.currency_id);
                const current = balances.get(currencyId) || 0;
                if (asset.type === 'buy') {
                    balances.set(currencyId, current + amount);
                } else {
                    balances.set(currencyId, current - amount);
                }
            }
        });
        return balances;
    }, [allAssets]);

    // Effects
    /*
    useEffect(() => {
        if (user?.encrypted && !encryptionKey) {
            setIsSecurityModalOpen(true);
        }
    }, [user?.encrypted, encryptionKey]);
    */

    useEffect(() => {
        if (!isEditModalOpen) {
            formik.setFieldValue('type', activeTab);
            if (activeTab === 'buy') setIsExternalSale(false);
        }
    }, [activeTab, isEditModalOpen]);

    // Handlers
    const handleTransactionSecurityVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionSecurityKey) return;

        setIsTransactionVerifying(true);
        try {
            // Test the key with a lightweight request first? 
            // Or just try to execute the pending action, if it fails with 403/500 due to key, catch it?
            // Safer to use the key in the action.

            const headers = { 'X-Encryption-Key': transactionSecurityKey };

            if (pendingAction?.type === 'delete' && pendingAction.id) {
                await deleteAsset({ id: pendingAction.id, headers }).unwrap();
                dispatch(addToast({ message: 'İşlem başarıyla silindi.', type: 'success' }));
                setIsDeleteModalOpen(false);
                setAssetToDelete(null);
            } else if (pendingAction?.type === 'update' && pendingAction.id) {
                await updateAsset({ id: pendingAction.id, data: pendingAction.payload, headers }).unwrap();
                dispatch(addToast({ message: 'İşlem güncellendi.', type: 'success' }));
                setIsEditModalOpen(false);
                setAssetToEdit(null);
                formik.resetForm();
            } else if (pendingAction?.type === 'add') {
                await addAsset({ data: pendingAction.payload, headers }).unwrap();
                dispatch(addToast({ message: 'İşlem eklendi.', type: 'success' }));
                formik.resetForm();
                formik.setFieldValue('type', activeTab);
                setPage(1);
            }

            // If successful, update global key to unlock session
            if (!encryptionKey) {
                dispatch(setEncryptionKey(transactionSecurityKey));
            }

            setIsTransactionSecurityModalOpen(false);
            setPendingAction(null);
            setTransactionSecurityKey('');

        } catch (error: any) {
            const errorMessage = error?.data?.message || error.response?.data?.errors?.[0] || 'İşlem başarısız (Şifre hatalı olabilir).';
            dispatch(addToast({ message: errorMessage, type: 'error' }));
        } finally {
            setIsTransactionVerifying(false);
        }
    };

    const confirmDelete = async () => {
        if (!assetToDelete) return;

        if (user?.encrypted) {
            setPendingAction({ type: 'delete', id: assetToDelete });
            setIsTransactionSecurityModalOpen(true);
            return;
        }

        try {
            await deleteAsset({ id: assetToDelete }).unwrap();
            dispatch(addToast({ message: 'İşlem başarıyla silindi.', type: 'success' }));
            setIsDeleteModalOpen(false);
            setAssetToDelete(null);
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Silme işlemi başarısız.';
            dispatch(addToast({ message: errorMessage, type: 'error' }));
        }
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
            if (values.type === 'sell' && !isExternalSale) {
                const currentBalance = balances.get(parseInt(values.currency_id)) || 0;
                if (parseFloat(String(values.amount)) > currentBalance) {
                    dispatch(addToast({ message: `Yetersiz bakiye. Mevcut: ${currentBalance}`, type: 'error' }));
                    return;
                }
            }

            const payloadData = {
                ...values,
                currency_id: Number(values.currency_id),
                type: values.type as 'buy' | 'sell'
            };

            // Check Encryption
            if (user?.encrypted) {
                if (isEditModalOpen && assetToEdit) {
                    setPendingAction({ type: 'update', id: assetToEdit.id, payload: payloadData });
                } else {
                    setPendingAction({ type: 'add', payload: payloadData });
                }
                setIsTransactionSecurityModalOpen(true);
                return;
            }

            if (isEditModalOpen && assetToEdit) {
                try {
                    await updateAsset({ id: assetToEdit.id, data: payloadData }).unwrap();
                    dispatch(addToast({ message: 'İşlem güncellendi.', type: 'success' }));
                    setIsEditModalOpen(false);
                    setAssetToEdit(null);
                    formik.resetForm();
                } catch (error: any) {
                    const errorMessage = error?.data?.message || 'Güncelleme başarısız.';
                    dispatch(addToast({ message: errorMessage, type: 'error' }));
                }
            } else {
                try {
                    await addAsset({ data: payloadData }).unwrap();
                    dispatch(addToast({ message: 'İşlem eklendi.', type: 'success' }));
                    formik.resetForm();
                    formik.setFieldValue('type', activeTab);
                    setPage(1);
                } catch (error: any) {
                    dispatch(addToast({ message: error?.data?.errors?.[0] || 'Hata oluştu.', type: 'error' }));
                }
            }
        },
    });

    // Auto-fill price
    useEffect(() => {
        if (formik.values.currency_id && currencies.length > 0) {
            const selectedCurrency = currencies.find(c => c.id === parseInt(formik.values.currency_id));
            if (selectedCurrency) {
                const price = formik.values.type === 'buy' ? selectedCurrency.buying : selectedCurrency.selling;
                formik.setFieldValue('price', price);
            }
        }
    }, [formik.values.currency_id, formik.values.type, currencies]);

    const openEditModal = (asset: Asset) => {
        setAssetToEdit(asset);
        setIsEditModalOpen(true);
        formik.setValues({
            currency_id: String(asset.currency_id),
            type: asset.type,
            amount: asset.amount,
            price: asset.price,
            date: asset.date || new Date().toISOString().split('T')[0],
            place: asset.place || '',
            note: asset.note || '',
        });
    };

    return (
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Header */}
            <header className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-white/5">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
                            <ArrowRightLeft className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
                                İşlemler
                            </h1>
                        </div>
                    </div>
                    <p className="text-sm sm:text-base text-zinc-400 font-medium ml-16 sm:ml-0">Yeni işlem ekleyin veya geçmiş işlemlerinizi inceleyin.</p>
                </div>
            </header>

            {/* Transaction Form Area */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 backdrop-blur-xl">
                <div className="flex p-1 bg-zinc-900 rounded-xl mb-6 sm:mb-8 w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab('buy')}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'buy'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20'
                            : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <TrendingUp className="w-4 h-4" /> Alım Yap
                    </button>
                    <button
                        onClick={() => setActiveTab('sell')}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'sell'
                            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20'
                            : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <TrendingDown className="w-4 h-4" /> Satış Yap
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-6 max-w-4xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            {/* Asset Type Selector */}
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

                            {/* External Sale Checkbox (Only on Sell tab) */}
                            {activeTab === 'sell' && (
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <input
                                        type="checkbox"
                                        id="externalSale"
                                        checked={isExternalSale}
                                        onChange={(e) => {
                                            setIsExternalSale(e.target.checked);
                                            formik.setFieldValue('currency_id', '');
                                        }}
                                        className="w-4 h-4 rounded border-gray-600 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
                                    />
                                    <label htmlFor="externalSale" className="text-xs font-medium text-zinc-400 select-none cursor-pointer hover:text-zinc-300">
                                        Portföyde olmayan varlık (Harici Satış)
                                    </label>
                                </div>
                            )}

                            {/* Currency Select */}
                            <div className="relative">
                                <select
                                    name="currency_id"
                                    onChange={formik.handleChange}
                                    value={formik.values.currency_id}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-white outline-none focus:border-blue-500/50 appearance-none transition-all"
                                >
                                    <option value="" disabled>Seçiniz...</option>
                                    {currencies
                                        .filter(cur => {
                                            const matchesType = selectedAssetType === 'Altın'
                                                ? (cur.type === 'Altın' || cur.type === 'Gold')
                                                : cur.type === 'Döviz';

                                            if (!matchesType) return false;

                                            if (activeTab === 'sell' && !isExternalSale) {
                                                const balance = balances.get(cur.id) || 0;
                                                return balance > 0;
                                            }

                                            return true;
                                        })
                                        .map(cur => {
                                            const balance = balances.get(cur.id) || 0;
                                            const label = (activeTab === 'sell' && !isExternalSale)
                                                ? `${selectedAssetType === 'Altın' ? cur.name : cur.code} (Mevcut: ${balance})`
                                                : (selectedAssetType === 'Altın' ? cur.name : cur.code);

                                            return (
                                                <option key={cur.id} value={cur.id} disabled={activeTab === 'sell' && !isExternalSale && balance <= 0}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                </select>
                                <Coins className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 pointer-events-none" />
                            </div>
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
                    <div className="bg-zinc-800/50 border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-zinc-500 text-lg sm:text-xl font-medium">Toplam: ₺</span>
                            <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-white">
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
                        className={`w-full ${activeTab === 'buy' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                        isLoading={formik.isSubmitting || isAdding || isUpdating}
                    >
                        {isEditModalOpen
                            ? 'İşlemi Güncelle'
                            : (activeTab === 'buy' ? 'Alım İşlemini Kaydet' : 'Satış İşlemini Kaydet')
                        }
                    </Button>
                </form>
            </div>

            {/* History Table */}
            <div className="relative bg-zinc-900/50 border border-white/5 rounded-2xl sm:rounded-[2rem] overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-zinc-400" />
                        Son İşlemler
                    </h3>
                </div>

                {/* Mobile Card View (Visible < lg) */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {isLoading ? (
                        <div className="col-span-full py-10 text-center text-zinc-500">Yükleniyor...</div>
                    ) : assets.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-zinc-500">İşlem bulunamadı.</div>
                    ) : (
                        assets.map((asset) => (
                            <div key={asset.id} className="bg-zinc-800/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                                <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${asset.type === 'buy' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                            {asset.type === 'buy' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${asset.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                                {asset.type === 'buy' ? 'Alım İşlemi' : 'Satış İşlemi'}
                                            </p>
                                            <p className="text-sm font-bold text-white mt-0.5">
                                                {(asset.currency.type === 'Altın' || asset.currency.type === 'Gold') ? asset.currency.name : asset.currency.code}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500 mb-1">{formatDate(asset.date, dateFormat)}</p>
                                        <button
                                            onClick={() => {
                                                setAssetToDelete(asset.id);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-1.5 text-zinc-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                    <button className="col-span-2 text-left" onClick={() => openEditModal(asset)}>
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-0.5">Miktar</p>
                                            <p className="text-white font-medium">
                                                {parseFloat(asset.amount).toLocaleString('tr-TR')} <span className="text-xs text-zinc-500">{getAssetUnit(asset.currency.code, asset.currency.name)}</span>
                                            </p>
                                        </div>
                                    </button>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500 mb-0.5">Birim Fiyat</p>
                                        <p className="text-zinc-300 font-medium">₺{parseFloat(asset.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="col-span-2 pt-3 mt-1 border-t border-white/5 flex items-center justify-between">
                                        <p className="text-xs text-zinc-500">Toplam Tutar</p>
                                        <p className="text-base font-bold text-white">
                                            ₺{(parseFloat(asset.amount) * parseFloat(asset.price)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View (Visible >= lg) */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Tür / Tarih</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Varlık</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Miktar</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Fiyat</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Tutar</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-10 text-center text-zinc-500">Yükleniyor...</td></tr>
                            ) : assets.length === 0 ? (
                                <tr><td colSpan={6} className="py-10 text-center text-zinc-500">İşlem bulunamadı.</td></tr>
                            ) : (
                                assets.map((asset) => (
                                    <tr
                                        key={asset.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => openEditModal(asset)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${asset.type === 'buy' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                                    {asset.type === 'buy' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-white">{asset.type === 'buy' ? 'Alım' : 'Satım'}</p>
                                                    <p className="text-xs text-zinc-400">{formatDate(asset.date, dateFormat)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {(asset.currency.type === 'Altın' || asset.currency.type === 'Gold') ? asset.currency.name : asset.currency.code}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-zinc-300">
                                            {parseFloat(asset.amount).toLocaleString('tr-TR')} <span className="text-xs text-zinc-500">{getAssetUnit(asset.currency.code, asset.currency.name)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-zinc-300">
                                            ₺{parseFloat(asset.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-white">
                                            ₺{(parseFloat(asset.amount) * parseFloat(asset.price)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAssetToDelete(asset.id);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {pagination && pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="disabled:opacity-50"><ChevronLeft /></button>
                        <span className="text-sm text-zinc-400">Sayfa {page} / {pagination.last_page}</span>
                        <button disabled={page === pagination.last_page} onClick={() => setPage(p => p + 1)} className="disabled:opacity-50"><ChevronRight /></button>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">İşlemi Sil</h3>
                        <p className="text-zinc-500 mb-6">Bu işlem geri alınamaz. Devam etmek istiyor musunuz?</p>
                        <div className="flex gap-3">
                            <Button className="flex-1 bg-zinc-800 hover:bg-zinc-700" onClick={() => setIsDeleteModalOpen(false)}>Vazgeç</Button>
                            <Button className="flex-1 bg-red-600 hover:bg-red-500" onClick={confirmDelete} isLoading={isDeleting}>Sil</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Modal - NOW JUST IN TIME */}
            {isTransactionSecurityModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                    <form onSubmit={handleTransactionSecurityVerify} className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md space-y-4 border border-white/10">
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
                                <coins aria-hidden="true" className="w-6 h-6" />
                                {/* Using a standard icon just in case coins isn't imported or valid, but 'Coins' is imported on top */}
                            </div>
                            <h2 className="text-2xl font-bold">Güvenlik Kontrolü</h2>
                            <p className="text-zinc-400 text-sm mt-1">İşlemi tamamlamak için şifreleme anahtarınızı giriniz.</p>
                        </div>

                        <Input
                            type="password"
                            value={transactionSecurityKey}
                            onChange={e => setTransactionSecurityKey(e.target.value)}
                            placeholder="Şifreleme Anahtarı"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => {
                                setIsTransactionSecurityModalOpen(false);
                                setPendingAction(null);
                                setTransactionSecurityKey('');
                            }}>İptal</Button>
                            <Button type="submit" className="flex-1" isLoading={isTransactionVerifying}>Onayla</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;
