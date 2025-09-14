import React, { useRef, useState } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { formatDateHK } from '../../utils/formatDate';
import { Plus, Paperclip, X, Download, Printer, ExternalLink, Trash2 } from 'lucide-react';
import FileActionModal from './FileActionModal';

const AttachmentManager = ({ attachments, onFilesSelect, onDelete, downloadContextName, isJsZipLoaded, supabase, onFileUpload }) => {
    const t = useTranslation();
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [actionDialog, setActionDialog] = useState({ isOpen: false, type: '', files: [] });
    const [isUploading, setIsUploading] = useState(false);

    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleFileChange = async (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        if (!onFileUpload || !supabase) {
            alert('錯誤：上傳功能尚未初始化。');
            return;
        }

        setIsUploading(true);
        const filesToUpload = Array.from(event.target.files);

        // 使用 Promise.all 來並行處理所有檔案的上傳
        const uploadPromises = filesToUpload.map(async (file) => {
            // onFileUpload 是從 App.js 傳來的函式
            const permanentUrl = await onFileUpload(file); 
            
            if (permanentUrl) {
                return {
                    id: `${Date.now()}-${file.name}`,
                    name: file.name,
                    url: permanentUrl, // 使用從 Supabase Storage 獲取的永久 URL
                    uploadedAt: getTodayDateString(),
                };
            }
            return null;
        });

        // 等待所有上傳操作完成
        const newAttachments = (await Promise.all(uploadPromises)).filter(Boolean);

        if (newAttachments.length > 0) {
            // 將帶有永久 URL 的新附件資訊回傳給 CaseFormModal
            onFilesSelect(newAttachments);
        }

        setIsUploading(false);
        event.target.value = null; // 清空檔案選擇輸入框，以便下次可以選擇同一個檔案
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleSelectFile = (fileId) => {
        setSelectedFiles(prev =>
            prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedFiles((attachments || []).map(file => file.id));
        } else {
            setSelectedFiles([]);
        }
    };

    const handleDeleteSelected = () => {
        onDelete(selectedFiles);
        setSelectedFiles([]);
    };

    const sanitizeFilename = (name) => {
        return name ? name.replace(/[\/\\?%*:|"<>]/g, '-') : '';
    }

    const handleDownloadSelected = async () => {
        if (!isJsZipLoaded || typeof window.JSZip === 'undefined') {
            alert('JSZip library is not ready. Please wait a moment and try again.');
            return;
        }

        const zip = new window.JSZip();
        const filesToDownload = (attachments || []).filter(f => selectedFiles.includes(f.id));

        for (const file of filesToDownload) {
            if (file.url) {
                try {
                    const response = await fetch(file.url);
                    if (!response.ok) throw new Error(`Failed to fetch ${file.name}`);
                    const blob = await response.blob();
                    zip.file(file.name, blob);
                } catch (error) {
                    console.error(`Skipping file due to error: ${file.name}`, error);
                    alert(`failed to download ${file.name} file due to error`);
                }
            }
        }

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
        }
    };
    
    const handleBatchAction = (type) => {
        setActionDialog({
            isOpen: true,
            type: type,
            files: (attachments || []).filter(file => selectedFiles.includes(file.id))
        });
    };

    return (
        <div className="p-4 border border-dashed rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">{t('attachments')}</h3>
                {selectedFiles.length > 0 && (
                     <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{selectedFiles.length} {t('selected')}</span>
                        <button type="button" onClick={() => handleBatchAction('open')} className="p-1 text-gray-600 hover:text-blue-600" title={t('open_selected')}><ExternalLink size={18}/></button>
                        <button type="button" onClick={handleDownloadSelected} disabled={!isJsZipLoaded} className={`p-1 text-gray-600 ${!isJsZipLoaded ? 'cursor-not-allowed opacity-50' : 'hover:text-blue-600'}`} title={isJsZipLoaded ? t('download_selected') : 'Loading...'}><Download size={18}/></button>
                        <button type="button" onClick={() => handleBatchAction('print')} className="p-1 text-gray-600 hover:text-blue-600" title={t('print_selected')}><Printer size={18}/></button>
                        <button type="button" onClick={handleDeleteSelected} className="p-1 text-gray-600 hover:text-red-600" title={t('delete_selected')}><Trash2 size={18}/></button>
                    </div>
                )}
            </div>
            
            <div className="space-y-2 mb-4">
                {(attachments || []).length > 0 && (
                    <div className="flex items-center bg-gray-100 p-2 rounded-md">
                        <input type="checkbox" onChange={handleSelectAll} checked={selectedFiles.length === (attachments || []).length && (attachments || []).length > 0} className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                        <label className="text-sm font-medium">{t('select_all')}</label>
                    </div>
                )}
                {(attachments || []).map(file => (
                    <div key={file.id} className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm border">
                        <div className="flex items-center space-x-3 flex-grow overflow-hidden">
                            <input type="checkbox" checked={selectedFiles.includes(file.id)} onChange={() => handleSelectFile(file.id)} className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                            <Paperclip size={16} className="flex-shrink-0 text-gray-500" />
                            <div className="flex-grow overflow-hidden">
                                {file.url ? (
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 truncate hover:underline" title={file.name}>
                                        {file.name}
                                    </a>
                                ) : (
                                    <span className="text-sm font-medium text-gray-800 truncate" title={file.name}>{file.name}</span>
                                )}
                                {file.uploadedAt && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {t('uploaded_on')}: {formatDateHK(file.uploadedAt)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                             <button type="button" onClick={() => onDelete(file.id)} className="p-1 text-gray-500 hover:text-red-700" title={t('delete')}>
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {(attachments || []).length === 0 && !isUploading && (
                    <p className="text-sm text-center text-gray-500 py-2">{t('not_found')}</p>
                )}
                {isUploading && (
                    <p className="text-sm text-center text-blue-600 py-2">{t('uploading_files')}...</p>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                disabled={isUploading}
            />
            <button
                type="button"
                onClick={handleUploadClick}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-semibold flex items-center justify-center transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isUploading}
            >
                <Plus size={18} className="mr-2" />
                {isUploading ? t('uploading') : t('add_attachment')}
            </button>
            {actionDialog.isOpen && (
                <FileActionModal
                    files={actionDialog.files}
                    type={actionDialog.type}
                    onClose={() => setActionDialog({ isOpen: false, type: '', files: [] })}
                />
            )}
        </div>
    );
};

export default React.memo(AttachmentManager);