// src/components/shared/ConfirmationDialog.js
import React from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { AlertTriangle } from 'lucide-react';


const ConfirmationDialog = ({ onConfirm, onCancel }) => {
    const t = useTranslation();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
                <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4 text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{t('confirm_close_title')}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">{t('confirm_close_message')}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                        {t('confirm_close_confirm')}
                    </button>
                    <button type="button" onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                        {t('confirm_close_cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmationDialog;