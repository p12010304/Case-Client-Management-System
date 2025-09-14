import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { ArrowLeft, User, Mail, Save, Edit, X, Plus, Trash2, Users, ChevronDown, Check } from 'lucide-react';

// 使用者選擇器，用於建立分享群組
const MemberSelector = ({ allUsers, selectedMembers, onToggleMember }) => {
    const t = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const getButtonLabel = () => {
        if (selectedMembers.length === 0) return t('select_members');
        const count = selectedMembers.length;
        // 根據語言和數量組合字串
        return `${count} ${t(count === 1 ? 'member_selected' : 'members_selected')}`;
    };

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-11 flex items-center justify-between text-left px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <span className="text-gray-700">{getButtonLabel()}</span>
                <ChevronDown size={20} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul className="p-2">
                        {allUsers.map(user => {
                            const isSelected = selectedMembers.includes(user.id);
                            return (
                                <li
                                    key={user.id}
                                    onClick={() => onToggleMember(user.id)}
                                    className="flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-600" />
                                        <span>{user.username}</span>
                                    </div>
                                    {isSelected && <Check size={16} className="text-blue-600" />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

// updated UserProfilePage component
const UserProfilePage = ({ user, allUsers, onSave, onBack}) => {
    const t = useTranslation();
    
    const [userData, setUserData] = useState({ ...user, sharing_groups: user.sharing_groups || [] });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupMembers, setNewGroupMembers] = useState([]);

    useEffect(() => {
        setUserData({ ...user, sharing_groups: user.sharing_groups || [] });
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAllChanges = (e) => {
        e.preventDefault();
        onSave(userData);
        setIsEditingProfile(false);
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim() || newGroupMembers.length === 0) {
            alert(t('group_creation_error'));
            return;
        }
        const newGroup = { id: `sg-${Date.now()}`, name: newGroupName, members: newGroupMembers };
        setUserData(prev => ({ ...prev, sharing_groups: [...prev.sharing_groups, newGroup] }));
        setNewGroupName('');
        setNewGroupMembers([]);
        setIsCreatingGroup(false);
    };

    const handleDeleteGroup = (groupId) => {
        if (window.confirm(t('confirm_delete_group_message'))) {
            setUserData(prev => ({
                ...prev,
                sharing_groups: prev.sharing_groups.filter(g => g.id !== groupId)
            }));
        }
    };
    
    const handleToggleMember = (memberId) => {
        setNewGroupMembers(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]);
    };

    if (!user || !allUsers) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>{t('loading_data')}</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center mb-8">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 mr-4"><ArrowLeft size={24} /></button>
                    <h1 className="text-3xl font-bold text-gray-800">{t('my_profile')}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                         <div className="bg-white rounded-xl shadow-md p-6">
                            <form onSubmit={handleSaveAllChanges}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">{t('personal_info')}</h2>
                                    {isEditingProfile ? (
                                        <div className="flex items-center space-x-2">
                                            <button type="button" onClick={() => { setIsEditingProfile(false); setUserData({ ...user }); }} className="p-2 rounded-full hover:bg-gray-200"><X size={18} /></button>
                                            <button type="submit" className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"><Save size={18} /></button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setIsEditingProfile(true)} className="p-2 rounded-full hover:bg-gray-200"><Edit size={18} /></button>
                                    )}
                                </div>
                                <div className="text-center mb-6">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
                                        {userData.username?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 block mb-1">{t('username')}</label>
                                        <input type="text" name="username" value={userData.username} onChange={handleProfileChange} disabled={!isEditingProfile} className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 block mb-1">{t('email')}</label>
                                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500">
  {userData.email}
</div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">{t('sharing_groups')}</h2>
                                {!isCreatingGroup && (
                                    <button onClick={() => setIsCreatingGroup(true)} className="flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                                        <Plus size={16} />
                                        <span>{t('add_group')}</span>
                                    </button>
                                )}
                            </div>
                            
                            {isCreatingGroup && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
                                    <h3 className="font-bold mb-3">{t('create_new_group')}</h3>
                                    <div className="space-y-4">
                                        <input type="text" placeholder={t('group_name')} value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                        <MemberSelector allUsers={allUsers.filter(u => u.id !== user.id)} selectedMembers={newGroupMembers} onToggleMember={handleToggleMember} />
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => setIsCreatingGroup(false)} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200">{t('cancel')}</button>
                                            <button onClick={handleCreateGroup} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">{t('save_group')}</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {userData.sharing_groups.length > 0 ? (
                                    userData.sharing_groups.map(group => (
                                        <div key={group.id} className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50">
                                            <div>
                                                <p className="font-semibold">{group.name}</p>
                                                <div className="flex items-center mt-1 space-x-1">
                                                    <Users size={14} className="text-gray-500"/>
                                                    {/* --- THIS IS THE FIX --- */}
                                                    <p className="text-sm text-gray-500">{group.members.length} {t('members_unit')}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteGroup(group.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">{t('no_sharing_groups_yet')}</p>
                                )}
                            </div>
                            <div className="mt-6 border-t pt-4 flex justify-end">
                                <button onClick={handleSaveAllChanges} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">{t('save')}</button>
                            </div>
                        </div>
                        {/* <div className="bg-white rounded-xl shadow-md p-6">
                           <MfaSetup supabase={supabase} />
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
