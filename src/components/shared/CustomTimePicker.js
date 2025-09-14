import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { Clock } from 'lucide-react';

const CustomTimePicker = ({ value, onChange }) => {
    const t = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // 將 24 小時制時間字串 ("14:30") 分解成狀態
    const timeToState = (timeString) => {
        if (!timeString || !timeString.includes(':')) {
            return { h24: 9, m: 0 }; // 預設為 09:00
        }
        const [h, m] = timeString.split(':').map(Number);
        return { h24: h, m: m };
    };

    const [time, setTime] = useState(timeToState(value));

    // 當外部傳入的 value 改變時，同步更新內部狀態
    useEffect(() => {
        setTime(timeToState(value));
    }, [value]);

    // 當時間改變時，呼叫 onChange 將 24 小時制字串傳出去
    const handleTimeSelect = (h24, m) => {
        setTime({ h24, m });
        const new24hValue = `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        onChange(new24hValue);
        setIsOpen(false);
    };

    // 點擊元件外部時關閉面板
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    // 產生選項
    const ampmOptions = useMemo(() => ['am', 'pm'], []);
    const hourOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    const minuteOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []);

    // 格式化顯示在按鈕上的時間
    const displayTime = useMemo(() => {
        const { h24, m } = time;
        const ampmKey = h24 >= 12 ? 'pm' : 'am';
        const h12 = h24 % 12 || 12;
        const paddedMinutes = String(m).padStart(2, '0');
        return `${t(ampmKey)} ${h12}:${paddedMinutes}`;
    }, [time, t]);

    // 時間選擇面板
    const TimePickerPanel = () => (
        <div className="absolute z-20 mt-1 w-48 bg-white rounded-md shadow-lg border flex text-sm">
            {/* AM/PM 欄 */}
            <div className="flex flex-col border-r">
                {ampmOptions.map(key => {
                    const isSelected = (key === 'am' && time.h24 < 12) || (key === 'pm' && time.h24 >= 12);
                    return (
                        <button
                            type="button"
                            key={key}
                            onClick={() => {
                                const isAm = key === 'am';
                                if (isAm && time.h24 >= 12) handleTimeSelect(time.h24 - 12, time.m);
                                if (!isAm && time.h24 < 12) handleTimeSelect(time.h24 + 12, time.m);
                            }}
                            className={`px-3 py-2 text-center w-full ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                        >
                            {t(key)}
                        </button>
                    )
                })}
            </div>
            {/* 小時欄 */}
            <div className="flex-1 h-48 overflow-y-auto border-r">
                {hourOptions.map(h => {
                    const currentH12 = time.h24 % 12 || 12;
                    const isSelected = h === currentH12;
                    return (
                        <button
                            type="button"
                            key={`h-${h}`}
                            onClick={() => {
                                const isPm = time.h24 >= 12;
                                let newH24 = h;
                                if (isPm && h !== 12) newH24 += 12;
                                if (!isPm && h === 12) newH24 = 0;
                                handleTimeSelect(newH24, time.m);
                            }}
                            className={`px-3 py-2 text-center w-full ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                        >
                            {String(h).padStart(2, '0')}
                        </button>
                    )
                })}
            </div>
            {/* 分鐘欄 */}
            <div className="flex-1 h-48 overflow-y-auto">
                {minuteOptions.map(m => {
                    const isSelected = m === time.m;
                    return (
                        <button
                            type="button"
                            key={`m-${m}`}
                            onClick={() => handleTimeSelect(time.h24, m)}
                            className={`px-3 py-2 text-center w-full ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                        >
                            {String(m).padStart(2, '0')}
                        </button>
                    )
                })}
            </div>
        </div>
    );

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <span>{displayTime}</span>
                <Clock size={16} className="text-gray-500" />
            </button>
            {isOpen && <TimePickerPanel />}
        </div>
    );
};

export default React.memo(CustomTimePicker);

