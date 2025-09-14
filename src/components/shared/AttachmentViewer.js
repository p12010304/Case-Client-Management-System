import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { formatDateHK } from '../../utils/formatDate';
import { ChevronDown, Paperclip, Download, Printer, ExternalLink, Trash2 } from 'lucide-react';
import FileActionModal from './FileActionModal';


const AttachmentViewer = ({ attachments, downloadContextName, isJsZipLoaded }) => {
    const t = useTranslation();
    const [isOpen, setIsOpen] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [actionDialog, setActionDialog] = useState({ isOpen: false, type: '', files: [] });

    // ... (所有下載、列印等函式維持不變) ...
    const handleSelectFile = (fileId) => {
        setSelectedFiles(prev =>
            prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedFiles(attachments.map(file => file.id));
        } else {
            setSelectedFiles([]);
        }
    };
    
    const sanitizeFilename = (name) => {
        if (!name) return '';
        return name.replace(/[\/\\?%*:|"<>]/g, '-');
    }

    const handleDownloadSelected = async () => {
        if (!isJsZipLoaded || typeof window.JSZip === 'undefined') {
            alert('JSZip library is not ready. Please wait a moment and try again.');
            return;
        }

        const zip = new window.JSZip();
        const filesToDownload = attachments.filter(f => selectedFiles.includes(f.id));

        for (const file of filesToDownload) {
            if (file.url) {
                try {
                    const response = await fetch(file.url);
                    // 增加一個檢查，確保請求成功
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const blob = await response.blob();
                    zip.file(file.name, blob);
                } catch (error) {
                    // 對於開發者，在主控台印出詳細錯誤
                    console.error(`Failed to fetch file: ${file.name}`, error);
                    // 對於使用者，彈出一個明確的提示
                    alert(`failed to download ${file.name} file due to error`);
                }
            }
        }

        // 如果 zip 物件中至少有一個檔案，才繼續生成壓縮檔
        if (Object.keys(zip.files).length > 0) {
            zip.generateAsync({ type: "blob" }).then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                const safeContextName = sanitizeFilename(downloadContextName);
                link.download = `${safeContextName || 'attachments'}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            });
        } else {
            // 如果所有檔案都下載失敗，可以給予提示
            alert('All selected files could not be downloaded.');
        }
    };
    
    const handleBatchAction = (type) => {
        setActionDialog({
            isOpen: true,
            type: type,
            files: attachments.filter(file => selectedFiles.includes(file.id))
        });
    };

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="font-semibold text-gray-700 mb-2 flex items-center w-full text-left"
            >
                <span>{t('attachments')} ({attachments.length})</span>
                <ChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
            </button>
            {isOpen && (
                 <div className="p-4 border border-dashed rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                         <h3 className="text-lg font-semibold">{/* Title is now outside */}</h3>
                         {selectedFiles.length > 0 && (
                             <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">{selectedFiles.length} {t('selected')}</span>
                                <button type="button" onClick={() => handleBatchAction('open')} className="p-1 text-gray-600 hover:text-blue-600" title={t('open_selected')}><ExternalLink size={18}/></button>
                                <button type="button" onClick={handleDownloadSelected} disabled={!isJsZipLoaded} className={`p-1 text-gray-600 ${!isJsZipLoaded ? 'cursor-not-allowed opacity-50' : 'hover:text-blue-600'}`} title={isJsZipLoaded ? t('download_selected') : 'Loading...'}><Download size={18}/></button>
                                <button type="button" onClick={() => handleBatchAction('print')} className="p-1 text-gray-600 hover:text-blue-600" title={t('print_selected')}><Printer size={18}/></button>
                            </div>
                        )}
                    </div>
                     <div className="space-y-2 mb-4">
                        {attachments.length > 0 && (
                            <div className="flex items-center bg-gray-100 p-2 rounded-md">
                                <input type="checkbox" onChange={handleSelectAll} checked={selectedFiles.length === attachments.length && attachments.length > 0} className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                <label className="text-sm font-medium">{t('select_all')}</label>
                            </div>
                        )}
                        {attachments.map(file => (
                             <div key={file.id} className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm border">
                                <div className="flex items-center space-x-3 flex-grow overflow-hidden">
                                     <input type="checkbox" checked={selectedFiles.includes(file.id)} onChange={() => handleSelectFile(file.id)} className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                     <Paperclip size={16} className="flex-shrink-0 text-gray-500" />
                                     <div className="flex-grow overflow-hidden">
                                         <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 truncate hover:underline" title={file.name}>
                                             {file.name}
                                         </a>
                                         {/*顯示上傳日期 */}
                                         {file.uploadedAt && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {t('uploaded_on')}: {formatDateHK(file.uploadedAt)}
                                            </p>
                                        )}
                                     </div>
                                 </div>
                             </div>
                        ))}
                    </div>
                    {actionDialog.isOpen && (
                        <FileActionModal
                            files={actionDialog.files}
                            type={actionDialog.type}
                            onClose={() => setActionDialog({ isOpen: false, type: '', files: [] })}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(AttachmentViewer);
