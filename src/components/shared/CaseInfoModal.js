import React from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { formatDateHK, formatTime } from '../../utils/formatDate';
import Modal from './Modal';
import InfoRow from './InfoRow';
import AttachmentViewer from './AttachmentViewer'; 

const CaseInfoModal = React.memo(({ caseItem, getPersonName, onClose, onPersonClick, isJsZipLoaded }) => {
    const t = useTranslation();

    const renderFieldValue = (fieldKey, fieldValue) => {
        if (fieldKey.toLowerCase().includes('date')) {
            const timeKey = `${fieldKey.replace(/\s/g, '')}Time`;
            const timeValue = caseItem.fields[timeKey];
            const formattedDate = formatDateHK(fieldValue);
            if (timeValue) {
                return `${formattedDate} ${formatTime(timeValue, t)}`;
            }
            return formattedDate;
        }
        return fieldValue;
    };

    return (
        <Modal title={t('case_details')} onClose={onClose}>
            <div className="p-6">
                <dl className="space-y-4">
                    <InfoRow label={t('reference_id')} value={caseItem.reference_id} />
                    <InfoRow label={t('case_type')} value={`${t(caseItem.case_type)}${caseItem.case_subtype ? ` - ${t(caseItem.case_subtype)}` : ''}`} />
                    <InfoRow label={t('case_status')} value={t(caseItem.status)} />
                    
                    {/* --- 相關人員顯示 UI 更新 --- */}
                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium mb-4">{t('roles')}</h3>
                        <dl className="space-y-3">
                            {Object.entries(caseItem.roles || {}).map(([role, personIds]) => {
                                // 確保 personIds是一個陣列
                                const ids = Array.isArray(personIds) ? personIds : (personIds ? [personIds] : []);
                                if (ids.length === 0) return null;

                                return (
                                    <div key={role} className="grid grid-cols-3 gap-4">
                                        <dt className="text-sm font-medium text-gray-600">{t(role)}</dt>
                                        <dd className="col-span-2 text-sm text-gray-900">
                                            <ul className="space-y-2">
                                            {ids.map(personId => (
                                                <li key={personId}>
                                                    <button onClick={() => onPersonClick(personId)} className="text-blue-600 hover:underline hover:text-blue-800">
                                                        {getPersonName(personId)}
                                                    </button>
                                                </li>
                                            ))}
                                            </ul>
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium mb-4">{t('details')}</h3>
                        <dl className="space-y-2">
                            {Object.entries(caseItem.fields || {})
                                .filter(([key]) => !key.endsWith('Time')) 
                                .map(([key, value]) => (
                                    <InfoRow key={key} label={t(key)} value={renderFieldValue(key, value)} />
                                ))
                            }
                        </dl>
                    </div>

                    <InfoRow label={t('notes')} value={caseItem.notes} />
                    
                    {(caseItem.custom_fields || []).length > 0 && (
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-medium mb-4">{t('custom_fields')}</h3>
                            <dl className="space-y-2">
                                {caseItem.custom_fields.map(field => <InfoRow key={field.key} label={field.key} value={field.value} />)}
                            </dl>
                        </div>
                    )}

                    {(caseItem.attachments || []).length > 0 && (
                        <div className="border-t pt-4 mt-4">
                           <AttachmentViewer 
                                attachments={caseItem.attachments}
                                isJsZipLoaded={isJsZipLoaded}
                                downloadContextName={caseItem.reference_id}
                           />
                        </div>
                    )}
                </dl>
            </div>
        </Modal>
    );
});

export default CaseInfoModal;