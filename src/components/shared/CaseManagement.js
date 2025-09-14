import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { formatDateHK } from '../../utils/formatDate'; 
import { caseStatusOptions } from '../../data/config';
import CaseTypeFilterDropdown from './CaseTypeFilterDropdown';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const CaseManagement = ({ cases, people, actions, getPersonName, onPersonClick, onEditCase, onViewCase }) => {
    const t = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('reference_id');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState({ type: 'all', subtype: null });
    const [yearFilter, setYearFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [dayFilter, setDayFilter] = useState('');

    const getCaseDateForFilter = (caseItem) => {
        if (!caseItem || !caseItem.fields) return null;

        const { fields, case_type } = caseItem;
        switch (case_type) {
            case 'Litigation':
                return fields['Hearing Date'];
            case 'Conveyancing':
                return fields['Completion Date'];
            case 'Commercial':
                return fields['Signing Date'];
            case 'Tenancy Agreement':
                return fields['Signing Date'];
            default:
                return Object.entries(fields)
                    .find(([key, value]) => key.toLowerCase().includes('date') && value)?.[1];
        }
    };
    
    const safeCases = cases || [];

    const filteredCases = safeCases.filter(c => {
        let isMatch = true;
        
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            if (searchField === 'reference_id') {
                isMatch = (c.reference_id || '').toLowerCase().includes(lowerCaseSearchTerm);
            } else if (searchField === 'keyword') {
                 //更新搜尋邏輯以處理 roles 中的陣列
                const rolePersonIds = Object.values(c.roles || {}).flat();
                const roleNames = rolePersonIds.map(pId => getPersonName(pId) || '').join(' ');
                const fieldValues = Object.values(c.fields || {}).join(' ');
                const customFieldValues = (c.custom_fields || []).map(f => f.value).join(' ');

                const searchableText = [
                    c.reference_id || '',
                    roleNames,
                    c.notes || '',
                    fieldValues,
                    customFieldValues
                ].join(' ').toLowerCase();
                
                isMatch = searchableText.includes(lowerCaseSearchTerm);
            }
        }

        if (statusFilter !== 'all') {
            isMatch = isMatch && c.status === statusFilter;
        }
        if (typeFilter.type !== 'all') {
            isMatch = isMatch && c.case_type === typeFilter.type;
            if (typeFilter.subtype) {
                isMatch = isMatch && c.case_subtype === typeFilter.subtype;
            }
        }
        
        const caseDate = getCaseDateForFilter(c);
        if (yearFilter && caseDate && !isNaN(new Date(caseDate))) {
            isMatch = isMatch && new Date(caseDate).getFullYear() === parseInt(yearFilter);
        }
        if (monthFilter && caseDate && !isNaN(new Date(caseDate))) {
            isMatch = isMatch && (new Date(caseDate).getMonth() + 1) === parseInt(monthFilter);
        }
        if (dayFilter && caseDate && !isNaN(new Date(caseDate))) {
            isMatch = isMatch && new Date(caseDate).getDate() === parseInt(dayFilter);
        }

        return isMatch;
    });

    const availableYears = [...new Set(safeCases.map(c => {
        const date = getCaseDateForFilter(c);
        return date && !isNaN(new Date(date)) ? new Date(date).getFullYear() : null;
    }).filter(Boolean))].sort((a,b) => b-a);

    return (
        <div>
            <div className="bg-white p-4 rounded-lg shadow-md mb-8 border">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                    <div className="relative flex items-center">
                         <select value={searchField} onChange={e => setSearchField(e.target.value)} className="h-11 appearance-none pl-4 pr-10 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="reference_id">{t('reference_id')}</option>
                            <option value="keyword">{t('keyword')}</option>
                        </select>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" placeholder={t('search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-11 w-full pl-10 pr-4 rounded-r-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row lg:col-span-2 justify-end gap-4">
                        <div className="flex gap-2">
                           <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="h-11 w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">{t('year')}</option>
                                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                            <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="h-11 w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">{t('month')}</option>
                                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                            </select>
                            <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className="h-11 w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">{t('day')}</option>
                                {Array.from({length: 31}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                            </select>
                        </div>
                        <CaseTypeFilterDropdown currentFilter={typeFilter} onFilterChange={setTypeFilter} />
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-11 w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">{t('all_statuses')}</option>
                            {caseStatusOptions.map(opt => <option key={opt} value={opt}>{t(opt)}</option>)}
                        </select>
                        <button onClick={() => onEditCase(null)} className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-blue-600 text-white h-11 px-6 rounded-lg font-semibold shadow-md hover:bg-blue-700"><Plus size={20} /><span>{t('add_case')}</span></button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-x-auto border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase">{t('reference_id')}</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">{t('case_type')}</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">{t('roles')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase">{t('date')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase">{t('case_status')}</th><th className="px-6 py-3 text-right text-xs font-semibold uppercase">{t('actions')}</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCases.map(caseItem => {
                            const displayDate = getCaseDateForFilter(caseItem);
                            const dateLabel = displayDate ? Object.keys(caseItem.fields || {}).find(key => caseItem.fields[key] === displayDate) : '';

                            return (
                                <tr key={caseItem.id}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onViewCase(caseItem.id)} className="text-blue-600 hover:underline">
                                            {caseItem.reference_id}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {t(caseItem.case_type)} {caseItem.case_subtype && <span className="block text-xs text-gray-500">{t(caseItem.case_subtype)}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {Object.entries(caseItem.roles || {}).map(([role, personIds]) => {
                                            const ids = Array.isArray(personIds) ? personIds : (personIds ? [personIds] : []);
                                            if (ids.length === 0) return null;
                                            return (
                                                <div key={role} className="mb-1">
                                                    <strong>{t(role)}:</strong>
                                                    {ids.map((personId, index) => (
                                                        <React.Fragment key={personId}>
                                                            <button onClick={() => onPersonClick(personId)} className="text-blue-600 hover:underline ml-1">
                                                                {getPersonName(personId)}
                                                            </button>
                                                            {index < ids.length - 1 && ','}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            )
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {displayDate && (
                                            <div>
                                                <span className="font-semibold">{formatDateHK(displayDate)}</span>
                                                <span className="block text-xs text-gray-500">{t(dateLabel)}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${caseItem.status === 'status_completed' ? 'bg-green-100 text-green-800' : caseItem.status === 'status_on_hold' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {t(caseItem.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 relative">
                                        <button onClick={() => onEditCase(caseItem.id)} className="p-1 text-gray-600 hover:text-green-600"><Edit size={18}/></button>
                                        <button onClick={() => actions?.delete(caseItem.id)} className="p-1 text-gray-600 hover:text-red-600"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CaseManagement;