import React, { useState, useMemo } from 'react'; // 移除 useEffect
import { useTranslation } from '../../context/LanguageProvider';
import { personIdentityOptions } from '../../data/config';
import { Search, Plus, Edit, Trash2, Star } from 'lucide-react';

const PeopleManagement = React.memo(({ people, actions, onViewPerson, onEditPerson }) => {
    const t = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    // 1. 將預設搜尋欄位改為 'name_en'
    const [searchField, setSearchField] = useState('name_en');
    const [sortBy, setSortBy] = useState('created_at_desc');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [identityFilter, setIdentityFilter] = useState('all_identities');

    const filteredPeople = useMemo(() => {
        let results = [...people];
        
        if (identityFilter !== 'all_identities') {
            results = results.filter(p => p.identity?.type === identityFilter);
        }

        if (showFavoritesOnly) {
            results = results.filter(p => p.is_favorite);
        }
        
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        if (searchTerm) {
            results = results.filter(p => {
                // 2. 更新篩選邏輯以分別處理中英文姓名
                if (searchField === 'name_en') {
                    return p.name_en && p.name_en.toLowerCase().includes(lowerCaseSearchTerm);
                }
                if (searchField === 'name_zh') {
                    return p.name_zh && p.name_zh.toLowerCase().includes(lowerCaseSearchTerm);
                }
                if (searchField === 'hkid') {
                    return p.hkid && p.hkid.toLowerCase().includes(lowerCaseSearchTerm);
                }
                if (searchField === 'keyword') {
                    const stringValuesMatch = Object.values(p).some(val => typeof val === 'string' && val.toLowerCase().includes(lowerCaseSearchTerm));
                    const identityMatch = p.identity?.type === 'identity_other' && p.identity.custom_value?.toLowerCase().includes(lowerCaseSearchTerm);
                    const attachmentMatch = (p.attachments || []).some(att => att.name.toLowerCase().includes(lowerCaseSearchTerm));
                    const customFieldMatch = (p.custom_fields || []).some(field => 
                        field.key.toLowerCase().includes(lowerCaseSearchTerm) || 
                        field.value.toLowerCase().includes(lowerCaseSearchTerm)
                    );
                    const contactMatch = (p.phones || []).some(phone => phone.includes(lowerCaseSearchTerm)) || 
                                     (p.emails || []).some(email => email.toLowerCase().includes(lowerCaseSearchTerm));

                    return stringValuesMatch || identityMatch || attachmentMatch || customFieldMatch || contactMatch;
                }
                return true;
            });
        }
        
        const getDisplayName = (p) => p.name_en || p.name_zh || '';
        switch (sortBy) {
            case 'name_asc': 
                results.sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b))); 
                break;
            case 'name_desc': 
                results.sort((a, b) => getDisplayName(b).localeCompare(getDisplayName(a))); 
                break;
            case 'created_at_desc': 
            default:
                results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); 
                break;
        }

        return results;
    }, [people, searchTerm, searchField, sortBy, showFavoritesOnly, identityFilter]);

    return (
        <div className="mt-8">
            <div className="bg-white p-4 rounded-lg shadow-md mb-8 border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                    
                    <div className="relative flex items-center lg:col-span-2">
                        <select 
                            value={searchField} 
                            onChange={e => setSearchField(e.target.value)} 
                            className="h-11 appearance-none pl-4 pr-10 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {/*3. 將 'name' 選項拆分為 'name_en' 和 'name_zh' */}
                            <option value="name_en">{t('name_en')}</option>
                            <option value="name_zh">{t('name_zh')}</option>
                            <option value="hkid">HKID</option>
                            <option value="keyword">{t('keyword')}</option>
                        </select>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder={t('search')} 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                className="h-11 w-full pl-10 pr-4 rounded-r-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:col-span-3 justify-end gap-4">
                        <select 
                            value={identityFilter} 
                            onChange={e => setIdentityFilter(e.target.value)} 
                            className="h-11 w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all_identities">{t('all_identities')}</option>
                            {personIdentityOptions.map(opt => <option key={opt} value={opt}>{t(opt)}</option>)}
                        </select>
                        <select 
                            value={sortBy} 
                            onChange={e => setSortBy(e.target.value)} 
                            className="h-11 w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="created_at_desc">{t('newest_first')}</option>
                            <option value="name_asc">{t('name_asc')}</option>
                            <option value="name_desc">{t('name_desc')}</option>
                        </select>
                        <button 
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} 
                            className={`flex items-center justify-center space-x-2 w-full sm:w-auto h-11 px-4 rounded-lg transition font-semibold shadow-sm ${showFavoritesOnly ? 'bg-yellow-400 text-white' : 'bg-white text-gray-700 border'}`}
                        >
                            <Star size={18} className={showFavoritesOnly ? 'text-white' : 'text-yellow-400'}/>
                            <span>{t('favorites_only')}</span>
                        </button>
                        <button 
                            onClick={() => onEditPerson(null)} 
                            className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-blue-600 text-white h-11 px-6 rounded-lg font-semibold shadow-md hover:bg-blue-700"
                        >
                            <Plus size={20} />
                            <span>{t('add_person')}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-x-auto border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 w-12"></th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">{t('name_en')} / {t('name_zh')}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase">{t('person_identity_type')}</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPeople.map(p => {
                            const identityText = p.identity?.type === 'identity_other' 
                                ? p.identity.custom_value || t(p.identity.type)
                                : t(p.identity?.type || '');
                            
                            const identityColorClass = p.identity?.type === 'identity_client' 
                                ? 'bg-green-100 text-green-800'
                                : p.identity?.type === 'identity_collaborator'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800';

                            return (
                                <tr key={p.id}>
                                    <td className="px-4 py-4">
                                        <button onClick={() => actions.toggleFavorite(p)}>
                                            <Star size={20} className={p.is_favorite ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-400'}/>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <button onClick={() => onViewPerson(p)} className="text-blue-600 hover:underline text-left">
                                            {p.name_en || p.name_zh}
                                            {p.name_zh && p.name_en && <span className="block text-xs text-gray-500">{p.name_zh}</span>}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${identityColorClass}`}>
                                            {identityText}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => onEditPerson(p)} className="p-1 text-gray-600 hover:text-green-600"><Edit size={18}/></button>
                                        <button onClick={() => actions.delete(p.id)} className="p-1 text-gray-600 hover:text-red-600"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default PeopleManagement;