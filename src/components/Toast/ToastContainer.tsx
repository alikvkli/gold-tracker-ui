import React from 'react';
import { useAppSelector } from '../../hooks';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts } = useAppSelector(state => state.ui);

    return (
        <div className="fixed top-8 right-8 z-[9999] flex flex-col gap-4 max-w-md w-full sm:w-auto">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
};

export default ToastContainer;
