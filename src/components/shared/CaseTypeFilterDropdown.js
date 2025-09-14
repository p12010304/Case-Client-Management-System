// src/components/shared/CaseTypeFilterDropdown.js
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { caseTypeConfig } from '../../data/config';
import { ChevronDown } from 'lucide-react';

const CaseTypeFilterDropdown = ({ currentFilter, onFilterChange }) => {
    const t = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredType, setHoveredType] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (type, subtype = null) => {
        onFilterChange({ type, subtype });
        setIsOpen(false);
    };

    const getButtonLabel = () => {
        if (currentFilter.subtype) {
            return `${t(currentFilter.type)} > ${t(currentFilter.subtype)}`;
        }
        //修正點 1：當類型不是 'all' 時，才進行翻譯
        if (currentFilter.type !== 'all') {
            return t(currentFilter.type);
        }
        // 預設顯示「所有類型」
        return t('all_types');
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="h-11 w-full sm:w-auto px-4 text-left bg-white border rounded-lg flex items-center justify-between px-3 py-2 border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span>{getButtonLabel()}</span>
                <ChevronDown size={16} className="text-gray-500" />
            </button>
            {isOpen && (
                <div onMouseLeave={() => setHoveredType(null)} className="absolute z-10 mt-1 w-56 bg-white rounded-md shadow-lg border">
                    <ul className="py-1">
                        {/*修正點 2：點擊「所有類型」時，傳遞 'all' 而不是中文字串 */}
                        <li onClick={() => handleSelect('all')} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{t('all_types')}</li>
                        {Object.entries(caseTypeConfig).map(([type, config]) => (
                            <li key={type} onMouseEnter={() => setHoveredType(type)} className="relative px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelect(type)}>
                                {t(type)}
                                {config.subtypes && config.subtypes.length > 0 && hoveredType === type && (
                                    <div className="absolute left-full top-0 -mt-1 w-56 bg-white rounded-md shadow-lg border">
                                        <ul className="py-1">
                                            {config.subtypes.map(subtype => (
                                                <li key={subtype} onClick={(e) => { e.stopPropagation(); handleSelect(type, subtype); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{t(subtype)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
export default CaseTypeFilterDropdown;