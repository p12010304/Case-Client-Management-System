// src/components/shared/FileActionModal.js
import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { ExternalLink, Printer } from 'lucide-react';

const FileActionModal = ({ files, type, onClose }) => {
    const t = useTranslation();
    const [remainingFiles, setRemainingFiles] = useState(files || []);
    
    const handleLinkClick = (fileId) => {
        setRemainingFiles(prev => prev.filter(f => f.id !== fileId));
    };
    
    const title = type === 'open' ? t('open_files_title') : t('print_files_title');
    const icon = type === 'open' ? <ExternalLink size={14} className="mr-2"/> : <Printer size={14} className="mr-2"/>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('files_instruction')}</p>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {(remainingFiles || []).map(file => (
                        <li key={file.id}>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" onClick={() => handleLinkClick(file.id)} className="text-blue-600 hover:underline flex items-center">
                                {icon}
                                {file.name}
                            </a>
                        </li>
                    ))}
                    {remainingFiles.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">{t('not_found')}</p>
                    )}
                </ul>
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">{t('close')}</button>
                </div>
            </div>
        </div>
    );
};
export default FileActionModal;