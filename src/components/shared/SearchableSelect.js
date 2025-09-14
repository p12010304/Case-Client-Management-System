import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../context/LanguageProvider';

// 幾乎所有「案件表單」中的角色選擇都使用這個元件
const SearchableSelect = ({ label, options, value, onChange }) => {
    const t = useTranslation();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    
    // [鍵盤導覽] 1. 新增狀態來追蹤反白選項的索引
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const wrapperRef = useRef(null);
    const listRef = useRef(null); // 用於滾動列表

    // [鍵盤導覽] 2. 當搜尋結果改變時，重設反白
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    // 過濾選項
    const filteredOptions = options.filter(opt =>
        (opt.name_en && opt.name_en.toLowerCase().includes(query.toLowerCase())) ||
        (opt.name_zh && opt.name_zh.toLowerCase().includes(query.toLowerCase()))
    );

    // [鍵盤導覽] 3. 處理鍵盤事件的函式
    const handleKeyDown = (e) => {
        if (!isOpen) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault(); // 防止頁面滾動
                setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault(); // 防止頁面滾動
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
            default:
                break;
        }
    };
    
    // [鍵盤導覽] 4. 確保反白的選項在可視範圍內
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const el = listRef.current.children[highlightedIndex];
            if (el) el.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex]);

    const handleSelect = (option) => {
        onChange(option.id);
        setIsOpen(false);
        setQuery('');
    };
    
    const selectedName = options.find(opt => opt.id === value)?.name_en || options.find(opt => opt.id === value)?.name_zh || '';

    return (
        <div ref={wrapperRef} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={isOpen ? query : selectedName}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown} // [鍵盤導覽] 5. 綁定事件
                    className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('search')}
                />
                {isOpen && (
                    <ul ref={listRef} className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {filteredOptions.length > 0 ? filteredOptions.map((opt, index) => (
                            <li
                                key={opt.id}
                                onClick={() => handleSelect(opt)}
                                // [鍵盤導覽] 6. 根據索引設定背景顏色
                                className={`px-4 py-2 cursor-pointer ${index === highlightedIndex ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                            >
                                {opt.name_en || opt.name_zh}
                            </li>
                        )) : (
                            <li className="px-4 py-2 text-gray-500">{t('not_found')}</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default React.memo(SearchableSelect);
