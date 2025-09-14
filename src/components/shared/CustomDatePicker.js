import React from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { Calendar } from 'lucide-react';

const CustomDatePicker = ({ value, onChange, name }) => {
    const t = useTranslation();

    // 讓實際的日期文字在沒有值的時候變透明，
    // 自訂的 placeholder就能顯示出來。
    const inputStyle = {
        color: value ? 'inherit' : 'transparent',
    };

    return (
        <div className="relative w-full">
            {/* 實際的 input 元件 */}
            <input
                type="date"
                name={name}
                value={value || ''}
                onChange={onChange}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={inputStyle}
            />
            
            {/* 自訂的 placeholder */}
            {!value && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    {t('date_placeholder')}
                </span>
            )}

            {/* 自訂的日曆圖示 (這會蓋在原生圖示上) */}
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 pointer-events-none">
                 <Calendar size={16} className="text-gray-500" />
            </div>
        </div>
    );
};

export default React.memo(CustomDatePicker);
