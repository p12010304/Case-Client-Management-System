// src/context/LanguageProvider.js
import React, { useState, createContext, useContext } from 'react';
import { translations } from '../data/config'; // 引入我們剛剛建立的設定檔

// 建立 Context
const LanguageContext = createContext();

// 建立一個 Provider 元件，它將包含所有語言相關的邏輯
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('zh');

    const toggleLanguage = () => setLanguage(lang => lang === 'en' ? 'zh' : 'en');

    const t = (key) => translations[language][key] || key;

    const value = {
        t,
        language,
        toggleLanguage
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// 建立一個客製化的 Hook，讓其他元件可以輕鬆使用
export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context.t; // 直接回傳 t 函式，因為這是最常用的
};

// 也匯出 toggleLanguage 和 language，以備不時之需
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return {
        language: context.language,
        toggleLanguage: context.toggleLanguage
    };
}