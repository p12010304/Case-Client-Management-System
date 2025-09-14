import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { Check, ChevronDown, Users, User, X } from 'lucide-react';

const UserSelector = ({ allUsers, currentUser, value, onChange }) => {
    const t = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // 點擊外部關閉選單的邏輯
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    // 當勾選使用者時的處理
    const handleUserToggle = (userId) => {
        const newSelection = value.includes(userId)
            ? value.filter(id => id !== userId)
            : [...value, userId];
        onChange(newSelection);
    };

    // 當選擇常用群組時的處理
    const handleGroupSelect = (memberIds) => {
        // 使用 Set 來確保成員不重複
        const newSelection = [...new Set([...value, ...memberIds])];
        onChange(newSelection);
    };

    // 移除已選的使用者
    const handleRemoveUser = (userId) => {
        onChange(value.filter(id => id !== userId));
    };

    // 產生按鈕上顯示的文字
    const getButtonLabel = () => {
        if (value.length === 0) {
            return t('select_users_or_groups');
        }
        if (value.length === 1) {
            const user = allUsers.find(u => u.id === value[0]);
            return user?.username || '1 selected';
        }
        return `${value.length} ${t('selected')}`;
    };

    const userGroups = currentUser.sharing_groups || [];

    return (
        <div ref={wrapperRef} className="relative w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('share_with')}</label>
            {/* --- 已選使用者的標籤列表 --- */}
            {value.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {value.map(userId => {
                        const user = allUsers.find(u => u.id === userId);
                        return (
                            <span key={userId} className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                                {user?.username || userId}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveUser(userId)}
                                    className="p-0.5 rounded-full hover:bg-blue-200"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
            {/* --- 下拉選單按鈕 --- */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-11 flex items-center justify-between text-left px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <span className="text-gray-700">{getButtonLabel()}</span>
                <ChevronDown size={20} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* --- 下拉選單面板 --- */}
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto">
                    {/* --- 常用群組 --- */}
                    {userGroups.length > 0 && (
                        <div className="border-b p-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-1">{t('sharing_groups')}</h4>
                            <ul>
                                {userGroups.map(group => (
                                    <li
                                        key={group.id}
                                        onClick={() => handleGroupSelect(group.members)}
                                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 cursor-pointer"
                                    >
                                        <Users size={16} className="text-gray-600" />
                                        <span>{group.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* --- 所有使用者列表 --- */}
                    <ul className="p-2">
                        {allUsers.map(user => {
                            const isSelected = value.includes(user.id);
                            return (
                                <li
                                    key={user.id}
                                    onClick={() => handleUserToggle(user.id)}
                                    className="flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 cursor-pointer"
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

export default UserSelector;

