import React, { useState, useEffect, useRef } from 'react';
import { useTranslation, useLanguage } from '../../context/LanguageProvider';
import { Settings, Languages, Briefcase, ChevronDown, User, LogOut } from 'lucide-react';

const Header = React.memo(({ currentUser, currentView, setCurrentView, onLogout, onProfileClick }) => {
    const t = useTranslation();
    const { language, toggleLanguage } = useLanguage();
    const [showSettings, setShowSettings] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const userMenuRef = useRef(null);

    // 點擊外部關閉使用者選單
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userMenuRef]);
    
    return (
        <header className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <Briefcase size={32} className="text-blue-600"/>
                    <h1 className="text-3xl font-bold text-gray-800">{t('app_title')}</h1>
                </div>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <div className="relative">
                        <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full hover:bg-gray-200">
                            <Settings size={20} />
                        </button>
                        {showSettings && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 z-20">
                                <h4 className="font-bold mb-2">{t('notification_settings')}</h4>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="email-toggle" className="text-sm">{t('daily_email_summary')}</label>
                                    <div 
                                        onClick={() => setEmailEnabled(!emailEnabled)} 
                                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${emailEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${emailEnabled ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={toggleLanguage} className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg shadow-sm border">
                        <Languages size={18} />
                        <span>{language === 'en' ? '中文' : 'English'}</span>
                    </button>
                    {/* --- 使用者選單 --- */}
                    <div className="relative" ref={userMenuRef}>
                        <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg shadow-sm border">
                            {/* 使用可選鏈 (?.) 來安全地讀取 username */}
                            <span>{currentUser?.username || 'User'}</span>
                            <ChevronDown size={16} />
                        </button>
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 overflow-hidden border">
                                <ul>
                                    <li>
                                        <button 
                                            onClick={() => {
                                                onProfileClick(); // 確保只呼叫 onProfileClick
                                                setShowUserMenu(false);
                                            }}
                                            className="w-full text-left flex items-center px-4 py-3 hover:bg-gray-100 text-gray-700"
                                        >
                                            <User size={16} className="mr-3" />
                                            <span>{t('profile')}</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => {
                                                onLogout(); // 確保只呼叫 onLogout
                                                setShowUserMenu(false);
                                            }}
                                            className="w-full text-left flex items-center px-4 py-3 hover:bg-gray-100 text-red-600"
                                        >
                                            <LogOut size={16} className="mr-3" />
                                            <span>{t('logout')}</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* 只有在非個人主頁時，才顯示案件/人員導覽列 */}
            {currentView !== 'profile' && (
                 <nav className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setCurrentView('cases')} className={`w-full py-2 px-4 rounded-md font-semibold transition ${currentView === 'cases' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-300'}`}>{t('case_management')}</button>
                    <button onClick={() => setCurrentView('people')} className={`w-full py-2 px-4 rounded-md font-semibold transition ${currentView === 'people' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-300'}`}>{t('people_management')}</button>
                    <button onClick={() => setCurrentView('events')} className={`w-full py-2 px-4 rounded-md font-semibold transition ${currentView === 'events' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-300'}`}>{t('event_management')}</button>
                </nav>
            )}
        </header>
    );
});

export default Header;
