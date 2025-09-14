import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { personIdentityOptions } from '../../data/config';
import Modal from './Modal';
import ConfirmationDialog from './ConfirmationDialog';
import InputField from './InputField';
import TextAreaField from './TextAreaField';
import AttachmentManager from './AttachmentManager';
import CustomFieldManager from './CustomFieldManager';
import { ChevronDown, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import UserSelector from './UserSelector';

const ContactInputList = ({ type, contacts, onChange, onAdd, onRemove }) => {
    const t = useTranslation();
    const label = type === 'phones' ? t('contact_phone') : 'Email';
    const addLabel = type === 'phones' ? t('add_phone') : t('add_email');

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="space-y-2">
                {contacts.map((contact, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <InputField
                            name={type}
                            type={type === 'emails' ? 'email' : 'tel'}
                            value={contact}
                            onChange={(e) => onChange(type, index, e.target.value)}
                        />
                        {contacts.length > 1 && (
                             <button type="button" onClick={() => onRemove(type, index)} className="p-2 text-red-500 hover:text-red-700 shrink-0">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => onAdd(type)} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Plus size={16} /> {addLabel}
            </button>
        </div>
    );
};

const PersonFormModal = React.memo(({ person, cases, allUsers, currentUser, onSave, onClose, onCaseClick, isJsZipLoaded, supabase, onFileUpload, onDeleteAttachmentFile }) => {
    const t = useTranslation();
    
    const getInitialEmptyState = () => ({
        name_zh: '', name_en: '', hkid: '', nationality: '', 
        phones: [''], emails: [''],
        identity: { type: personIdentityOptions[0], custom_value: '' }, 
        personality_notes: '', notes: '', attachments: [],
        visibility: 'private', shared_with: [], custom_fields: [],
        is_favorite: false,
    });

    const [formData, setFormData] = useState(getInitialEmptyState());
    const [initialData, setInitialData] = useState(null);

    const [isConfirmingClose, setIsConfirmingClose] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);

    useEffect(() => {
        if (person) {
            const personState = { 
                ...getInitialEmptyState(),
                ...person,
                identity: person.identity || { type: personIdentityOptions[0], custom_value: '' },
                phones: (person.phones && person.phones.length > 0) ? person.phones : [''],
                emails: (person.emails && person.emails.length > 0) ? person.emails : [''],
                custom_fields: person.custom_fields || [],
                attachments: person.attachments || [],
                shared_with: person.shared_with || [],
            };
            setFormData(personState);
            setInitialData(personState);
        } else {
            const emptyState = getInitialEmptyState();
            setFormData(emptyState);
            setInitialData(emptyState);
        }
    }, [person]);

    const isFormDirty = () => {
        if (!initialData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    };

    const handleCloseRequest = () => {
        if (isFormDirty()) {
            setIsConfirmingClose(true);
        } else {
            onClose();
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleIdentityChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({
            ...p,
            identity: { ...p.identity, [name]: value }
        }));
    };

    const handleContactChange = (type, index, value) => {
        const newContacts = [...formData[type]];
        newContacts[index] = value;
        setFormData(p => ({ ...p, [type]: newContacts }));
    };

    const handleAddContact = (type) => {
        setFormData(p => ({ ...p, [type]: [...p[type], ''] }));
    };

    const handleRemoveContact = (type, index) => {
        if (formData[type].length <= 1) return;
        const newContacts = formData[type].filter((_, i) => i !== index);
        setFormData(p => ({ ...p, [type]: newContacts }));
    };

    const handleFilesSelect = (newAttachments) => {
        setFormData(p => ({ ...p, attachments: [...(p.attachments || []), ...newAttachments] }));
    };

    const handleDeleteAttachment = (ids) => {
        const idsToDelete = Array.isArray(ids) ? ids : [ids];
        const attachmentsToDelete = (formData.attachments || []).filter(att => idsToDelete.includes(att.id));

        attachmentsToDelete.forEach(file => {
            if (file.url && file.url.startsWith('http') && onDeleteAttachmentFile) {
                console.log(`正在請求從後端刪除人員附件:`, file.url);
                onDeleteAttachmentFile(file.url); 
            }
        });

        setFormData(p => ({ ...p, attachments: p.attachments.filter(att => !idsToDelete.includes(att.id)) }));
    };
    
    const handleCustomFieldsChange = (newFields) => { 
        setFormData(prev => ({ ...prev, custom_fields: newFields })); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            phones: formData.phones.filter(phone => phone && phone.trim() !== ''),
            emails: formData.emails.filter(email => email && email.trim() !== ''),
        };
        if (finalData.identity.type !== 'identity_other') {
            finalData.identity.custom_value = '';
        }
        
        onSave({ updatedData: finalData, originalData: initialData });
    };

    const handleCaseClick = (caseId) => { 
        if (isFormDirty()) {
            if(window.confirm(t('confirm_close_message'))) {
                onClose(); 
                onCaseClick(caseId);
            }
        } else {
            onClose(); 
            onCaseClick(caseId);
        }
    };
    
    const relatedCases = useMemo(() => person ? cases.filter(c => Object.values(c.roles || {}).flat().includes(person.id)) : [], [person, cases]);
    const ongoingCases = useMemo(() => relatedCases.filter(c => c.status !== 'status_completed'), [relatedCases]);
    const completedCases = useMemo(() => relatedCases.filter(c => c.status === 'status_completed'), [relatedCases]);

    return (
        <>
            <Modal title={person ? t('edit_person') : t('add_person')} onClose={handleCloseRequest}>
                <div className="p-6 max-h-[85vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* --- Basic Info --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label={t('name_en')} name="name_en" value={formData.name_en || ''} onChange={handleChange} />
                            <InputField label={t('name_zh')} name="name_zh" value={formData.name_zh || ''} onChange={handleChange} />
                            <InputField label="HKID" name="hkid" value={formData.hkid || ''} onChange={handleChange} />
                            <InputField label={t('nationality')} name="nationality" value={formData.nationality || ''} onChange={handleChange} />
                        </div>

                        {/* --- Contact Info --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <ContactInputList type="phones" contacts={formData.phones} onChange={handleContactChange} onAdd={handleAddContact} onRemove={handleRemoveContact} />
                           <ContactInputList type="emails" contacts={formData.emails} onChange={handleContactChange} onAdd={handleAddContact} onRemove={handleRemoveContact} />
                        </div>

                        {/* --- Identity/Role --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('person_identity_type')}</label>
                                <select name="type" value={formData.identity.type} onChange={handleIdentityChange} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {personIdentityOptions.map(opt => <option key={opt} value={opt}>{t(opt)}</option>)}
                                </select>
                            </div>
                            {formData.identity.type === 'identity_other' && (
                                <InputField label={t('identity_other_specify')} name="custom_value" value={formData.identity.custom_value || ''} onChange={handleIdentityChange} />
                            )}
                        </div>
                        
                        {/* --- Notes & Attachments --- */}
                        <TextAreaField label={t('personality_notes')} name="personality_notes" value={formData.personality_notes || ''} onChange={handleChange} rows={2} />
                        <TextAreaField label={t('notes')} name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} />
                        <AttachmentManager 
                            attachments={formData.attachments || []} 
                            onFilesSelect={handleFilesSelect} 
                            onDelete={handleDeleteAttachment} 
                            downloadContextName={formData.name_en || formData.name_zh || 'new_person_attachments'} 
                            isJsZipLoaded={isJsZipLoaded}
                            supabase={supabase}
                            onFileUpload={onFileUpload}
                        />
                        <CustomFieldManager fields={formData.custom_fields || []} onFieldsChange={handleCustomFieldsChange} />
                        
                        {/* --- 關聯案件區塊 --- */}
                        {person && (
                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-lg font-medium mb-4">{t('related_cases')}</h3>
                                {relatedCases.length > 0 ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-base font-semibold text-gray-700 mb-2">{t('ongoing_cases')} ({ongoingCases.length})</h4>
                                            {ongoingCases.length > 0 ? (
                                                <ul className="space-y-2 pl-2">
                                                {ongoingCases.map(c => (
                                                    <li key={c.id}>
                                                        <button type="button" onClick={() => handleCaseClick(c.id)} className="text-blue-600 hover:underline flex items-center text-sm">
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
                                            {showCompleted && completedCases.length > 0 && (
                                                 <ul className="space-y-2 pl-2 mt-2">
                                                 {completedCases.map(c => (
                                                     <li key={c.id}>
                                                         <button type="button" onClick={() => handleCaseClick(c.id)} className="text-blue-600 hover:underline flex items-center text-sm">
                                                             <LinkIcon size={12} className="mr-2"/>{c.reference_id} ({t(c.case_type)})
                                                         </button>
                                                     </li>
                                                 ))}
                                                 </ul>
                                            )}
                                        </div>
                                    </div>
                                ) : <p className="text-sm text-gray-500">{t('no_related_cases')}</p>}
                            </div>
                        )}
                        
                        {/* --- Permission Settings --- */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-4">{t('permission_settings')}</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('permission')}</label>
                                <select name="visibility" value={formData.visibility} onChange={handleChange} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="private">{t('private')}</option>
                                    <option value="public">{t('public')}</option>
                                    <option value="custom">{t('custom_share')}</option>
                                </select>
                            </div>
                            {formData.visibility === 'custom' && (
                                <div className="mt-4">
                                    <UserSelector
                                        allUsers={allUsers}
                                        currentUser={currentUser}
                                        value={formData.shared_with}
                                        onChange={(selectedIds) => setFormData(prev => ({ ...prev, shared_with: selectedIds }))}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <button type="button" onClick={handleCloseRequest} className="px-6 py-2 border rounded-lg">{t('cancel')}</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t('save')}</button>
                        </div>
                    </form>
                </div>
            </Modal>
            {isConfirmingClose && <ConfirmationDialog onConfirm={onClose} onCancel={() => setIsConfirmingClose(false)} />}
        </>
    );
});

export default PersonFormModal;