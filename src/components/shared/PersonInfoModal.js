import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import Modal from './Modal';
import InfoRow from './InfoRow';
import AttachmentViewer from './AttachmentViewer';
import { Link as LinkIcon } from 'lucide-react';

const PersonInfoModal = ({ person, cases, onClose, onCaseClick, isJsZipLoaded }) => {
    const t = useTranslation();
    const [showCompleted, setShowCompleted] = useState(false);
    
    const relatedCases = useMemo(() => person ? cases.filter(c => 
        Object.values(c.roles || {}).flat().includes(person.id)
    ) : [], [person, cases]);

    const ongoingCases = useMemo(() => relatedCases.filter(c => c.status !== 'status_completed'), [relatedCases]);
    const completedCases = useMemo(() => relatedCases.filter(c => c.status === 'status_completed'), [relatedCases]);

    if (!person) return null;

    const identityText = person.identity?.type === 'identity_other' 
        ? person.identity.custom_value || t(person.identity.type)
        : t(person.identity?.type || '');

    return (
        <Modal title={t('person_details')} onClose={onClose}>
            <div className="p-6 max-h-[85vh] overflow-y-auto">
                <dl className="space-y-4">
                    <InfoRow label={t('name_en')} value={person.name_en} />
                    <InfoRow label={t('name_zh')} value={person.name_zh} />
                    <InfoRow label="HKID" value={person.hkid} />
                    <InfoRow label={t('nationality')} value={person.nationality} />
                    <InfoRow label={t('contact_phone')} value={(person.phones || []).join(', ')} />
                    <InfoRow label="Email" value={(person.emails || []).join(', ')} />
                    <InfoRow label={t('person_identity_type')} value={identityText} />
                    <InfoRow label={t('personality_notes')} value={person.personality_notes} />
                    <InfoRow label={t('notes')} value={person.notes} />
                    {(person.custom_fields || []).map(field => <InfoRow key={field.key} label={field.key} value={field.value} />)}
                </dl>
                
                {(person.attachments && person.attachments.length > 0) && (
                     <div className="border-t pt-4 mt-4">
                        <AttachmentViewer
                            attachments={person.attachments}
                            downloadContextName={person.name_en || person.name_zh}
                            isJsZipLoaded={isJsZipLoaded}
                        />
                    </div>
                )}

                {/* ---關聯案件區塊 --- */}
                {relatedCases.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium mb-4">{t('related_cases')}</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-base font-semibold text-gray-700 mb-2">{t('ongoing_cases')} ({ongoingCases.length})</h4>
                                {ongoingCases.length > 0 ? (
                                    <ul className="space-y-2 pl-2">
                                        {ongoingCases.map(c => (
                                            <li key={c.id}>
                                                <button type="button" onClick={() => onCaseClick(c.id)} className="text-blue-600 hover:underline flex items-center text-sm">
                                                    <LinkIcon size={14} className="mr-2"/>{c.reference_id} ({t(c.case_type)})
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500 pl-2">{t('no_ongoing_cases')}</p>}
                            </div>
                             <div>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-base font-semibold text-gray-700">{t('completed_cases')} ({completedCases.length})</h4>
                                    {completedCases.length > 0 && (
                                        <button type="button" onClick={() => setShowCompleted(!showCompleted)} className="text-sm font-semibold text-gray-500 hover:text-gray-800 px-2 py-1">
                                            {showCompleted ? t('hide') : t('show')}
                                        </button>
                                    )}
                                </div>
                                {showCompleted && (
                                    <ul className="space-y-2 pl-2 mt-2">
                                        {completedCases.map(c => (
                                            <li key={c.id}>
                                                <button type="button" onClick={() => onCaseClick(c.id)} className="text-blue-600 hover:underline flex items-center text-sm">
                                                    <LinkIcon size={14} className="mr-2"/>{c.reference_id} ({t(c.case_type)})
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default React.memo(PersonInfoModal);