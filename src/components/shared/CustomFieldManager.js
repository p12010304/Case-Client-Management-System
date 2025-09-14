// src/components/shared/CustomFieldManager.js
import React from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { Plus, Trash2 } from 'lucide-react';

const CustomFieldManager = ({ fields, onFieldsChange }) => {
    const t = useTranslation();

    const handleFieldChange = (index, key, value) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        onFieldsChange(newFields);
    };

    const addField = () => {
        onFieldsChange([...fields, { key: '', value: '' }]);
    };

    const removeField = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        onFieldsChange(newFields);
    };

    return (
        <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">{t('custom_fields')}</h3>
            <div className="space-y-2">
                {(fields || []).map((field, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={t('field_name')}
                            value={field.key}
                            onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                            className="flex-grow mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder={t('field_value')}
                            value={field.value}
                            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                            className="flex-grow mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="button" onClick={() => removeField(index)} className="p-2 text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={addField}
                className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-semibold flex items-center justify-center"
            >
                <Plus size={18} className="mr-2" />
                {t('add_field')}
            </button>
        </div>
    );
};
export default CustomFieldManager;