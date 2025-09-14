import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { caseTypeConfig, caseStatusOptions, dateTimeFields } from '../../data/config';
import Modal from './Modal';
import ConfirmationDialog from './ConfirmationDialog';
import InputField from './InputField';
import TextAreaField from './TextAreaField';
import AttachmentManager from './AttachmentManager';
import CustomFieldManager from './CustomFieldManager';
import SearchableSelect from './SearchableSelect';
import CustomTimePicker from './CustomTimePicker';
import CustomDatePicker from './CustomDatePicker';
import UserSelector from './UserSelector';
import { X } from 'lucide-react';

const CaseFormModal = React.memo(({ 
    caseItem, 
    people, 
    allUsers, 
    currentUser, 
    onSave, 
    onClose, 
    isJsZipLoaded, 
    supabase, 
    onFileUpload,
    onDeleteAttachmentFile
}) => {
    const t = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        reference_id: '',
        case_type: Object.keys(caseTypeConfig)[0],
        case_subtype: '',
        status: caseStatusOptions[0],
        roles: {},
        fields: {},
        notes: '',
        attachments: [],
        visibility: 'private',
        shared_with: [],
        custom_fields: []
    });
    const [isConfirmingClose, setIsConfirmingClose] = useState(false);

    const getPersonName = (personId) => {
        const person = people.find(p => p.id === personId);
        return person ? (person.name_zh || person.name_en) : t('unknown_participant');
    };

    useEffect(() => {
        if (caseItem) {
             //確保 roles 中的每個值都是 array
            const rolesAsArray = {};
            for (const role in caseItem.roles) {
                const value = caseItem.roles[role];
                rolesAsArray[role] = Array.isArray(value) ? value : (value ? [value] : []);
            }
            setFormData(p => ({ ...p, ...caseItem, roles: rolesAsArray }));
        } else {
            const defaultType = Object.keys(caseTypeConfig)[0];
            const config = caseTypeConfig[defaultType];
            const initialRoles = config.roles.reduce((acc, role) => ({ ...acc, [role]: [] }), {}); // 初始化為空陣列
            const initialFields = config.fields.reduce((acc, field) => ({ ...acc, [field]: '' }), {});
            const initialSubtype = (config.subtypes && config.subtypes.length > 0) ? config.subtypes[0] : '';
            setFormData(prev => ({ ...prev, case_type: defaultType, case_subtype: initialSubtype, roles: initialRoles, fields: initialFields }));
        }
    }, [caseItem]);

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        const config = caseTypeConfig[newType];
        const newRoles = config.roles.reduce((acc, role) => ({ ...acc, [role]: [] }), {}); // 初始化為空陣列
        const newFields = config.fields.reduce((acc, field) => ({ ...acc, [field]: '' }), {});
        const newSubtype = (config.subtypes && config.subtypes.length > 0) ? config.subtypes[0] : '';
        setFormData(prev => ({ ...prev, case_type: newType, case_subtype: newSubtype, roles: newRoles, fields: newFields, notes: '', attachments: [] }));
    };

    // 新的 Role Change 處理函式
    const handleRoleChange = (role, personId, action) => {
        setFormData(prev => {
            const currentRoleIds = prev.roles[role] || [];
            let newRoleIds;

            if (action === 'add') {
                // 防止重複添加
                newRoleIds = currentRoleIds.includes(personId) ? currentRoleIds : [...currentRoleIds, personId];
            } else { // 'remove'
                newRoleIds = currentRoleIds.filter(id => id !== personId);
            }

            return { ...prev, roles: { ...prev.roles, [role]: newRoleIds } };
        });
    };

    const handleFieldChange = (field, value) => setFormData(prev => ({ ...prev, fields: { ...prev.fields, [field]: value } }));
    const handleCommonFieldChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    
    const handleFilesSelect = (newAttachments) => {
        setFormData(p => ({ ...p, attachments: [...(p.attachments || []), ...newAttachments] }));
    };
    
    const handleDeleteAttachment = (ids) => {
        const idsToDelete = Array.isArray(ids) ? ids : [ids];
        const attachmentsToDelete = (formData.attachments || []).filter(att => idsToDelete.includes(att.id));

        attachmentsToDelete.forEach(file => {
            if (file.url && file.url.startsWith('http') && onDeleteAttachmentFile) {
                onDeleteAttachmentFile(file.url); 
            }
        });

        setFormData(p => ({ ...p, attachments: p.attachments.filter(att => !idsToDelete.includes(att.id)) }));
    };

    const handleCustomFieldsChange = (newFields) => {
        setFormData(prev => ({ ...prev, custom_fields: newFields }));
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSaving) return; 
        setIsSaving(true);

        try {
            const newAttachments = formData.attachments.filter(att => att.file && !att.url);
            
            const uploadPromises = newAttachments.map(async (attachment) => {
                const publicUrl = await onFileUpload(attachment.file);
                if (publicUrl) {
                    return { id: attachment.id, name: attachment.name, size: attachment.size, type: attachment.type, url: publicUrl };
                }
                console.error(`Failed to upload ${attachment.name}`);
                return null;
            });

            const uploadedAttachments = (await Promise.all(uploadPromises)).filter(Boolean);
            const existingAttachments = formData.attachments.filter(att => att.url);
            const finalAttachments = [...existingAttachments, ...uploadedAttachments];

            const finalFormData = { ...formData, attachments: finalAttachments };
            
            onSave({ updatedData: finalFormData, originalData: caseItem });

        } catch (error) {
            console.error("Error during file upload and save process:", error);
            alert("儲存過程中發生錯誤，請檢查主控台資訊。");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleCloseRequest = () => setIsConfirmingClose(true);
    const currentConfig = caseTypeConfig[formData.case_type];

    const getFieldsForType = () => {
        let fields = [...currentConfig.fields];
        if (currentConfig.subtype_fields && currentConfig.subtype_fields[formData.case_subtype]) {
            fields = [...fields, ...currentConfig.subtype_fields[formData.case_subtype]];
        }
        return fields;
    };

    return (
        <>
            <Modal title={caseItem ? t('edit_case') : t('add_case')} onClose={handleCloseRequest}>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label={t('reference_id')} name="reference_id" value={formData.reference_id} onChange={handleCommonFieldChange} />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('case_status')}</label>
                                <select name="status" value={formData.status} onChange={handleCommonFieldChange} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {caseStatusOptions.map(opt => <option key={opt} value={opt}>{t(opt)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('case_type')}</label>
                                <select value={formData.case_type} onChange={handleTypeChange} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {Object.keys(caseTypeConfig).map(type => <option key={type} value={type}>{t(type)}</option>)}
                                </select>
                            </div>
                            {currentConfig.subtypes && currentConfig.subtypes.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('case_subtype')}</label>
                                    <select name="case_subtype" value={formData.case_subtype} onChange={handleCommonFieldChange} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {currentConfig.subtypes.map(sub => <option key={sub} value={sub}>{t(sub)}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        {/*相關人員 UI 重構*/}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-4">{t('roles')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                {currentConfig.roles.map(role => (
                                    <div key={role}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t(role)}</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {(formData.roles[role] || []).map(personId => (
                                                <span key={personId} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full">
                                                    {getPersonName(personId)}
                                                    <button type="button" onClick={() => handleRoleChange(role, personId, 'remove')} className="ml-2 text-blue-600 hover:text-blue-800">
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <SearchableSelect
                                            options={people.filter(p => !(formData.roles[role] || []).includes(p.id))}
                                            value={''} // 保持為空，因為它只用於添加
                                            onChange={(personId) => handleRoleChange(role, personId, 'add')}
                                            placeholder={`${t('add')} ${t(role)}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-4">{t('details')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getFieldsForType().map(field => {
                                    const isDateTimeField = dateTimeFields.includes(field);
                                    const timeFieldName = `${field.replace(/\s/g, '')}Time`;
                                    const isDateField = field.toLowerCase().includes('date');

                                    if (isDateField) {
                                        return (
                                            <React.Fragment key={field}>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t(field)}</label>
                                                    <CustomDatePicker
                                                        name={field}
                                                        value={formData.fields[field] || ''}
                                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                                    />
                                                </div>
                                                {isDateTimeField && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t(timeFieldName)}</label>
                                                        <CustomTimePicker
                                                            value={formData.fields[timeFieldName] || ''}
                                                            onChange={(timeValue) => handleFieldChange(timeFieldName, timeValue)}
                                                        />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    }
                                    
                                    return (
                                         <InputField
                                            key={field}
                                            label={t(field)}
                                            name={field}
                                            value={formData.fields[field] || ''}
                                            onChange={(e) => handleFieldChange(field, e.target.value)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="border-t pt-4 space-y-4">
                            <TextAreaField label={t('notes')} name="notes" value={formData.notes || ''} onChange={handleCommonFieldChange} rows={3} />
                            
                            <AttachmentManager 
                                attachments={formData.attachments || []} 
                                onFilesSelect={handleFilesSelect} 
                                onDelete={handleDeleteAttachment} 
                                downloadContextName={formData.reference_id || 'new_case_attachments'} 
                                isJsZipLoaded={isJsZipLoaded}
                                supabase={supabase}
                                onFileUpload={onFileUpload}
                            />

                            <CustomFieldManager fields={formData.custom_fields || []} onFieldsChange={handleCustomFieldsChange} />
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('permission')}</label>
                                <select name="visibility" value={formData.visibility} onChange={handleCommonFieldChange} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="private">{t('private')}</option>
                                    <option value="public">{t('public')}</option>
                                    <option value="custom">{t('custom_share')}</option>
                                </select>
                            </div>

                            {formData.visibility === 'custom' && (
                                <UserSelector
                                    allUsers={allUsers}
                                    currentUser={currentUser}
                                    value={formData.shared_with}
                                    onChange={(selectedIds) => setFormData(prev => ({ ...prev, shared_with: selectedIds }))}
                                />
                            )}
                        </div>
                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <button type="button" onClick={handleCloseRequest} className="px-6 py-2 border rounded-lg">{t('cancel')}</button>
                            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{isSaving ? t('loading') : t('save')}</button>
                        </div>
                    </form>
                </div>
            </Modal>
            {isConfirmingClose && <ConfirmationDialog onConfirm={onClose} onCancel={() => setIsConfirmingClose(false)} />}
        </>
    );
});

export default CaseFormModal;