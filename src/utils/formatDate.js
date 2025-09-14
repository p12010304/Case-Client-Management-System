// src/utils/formatDate.js

export const formatDateHK = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // 檢查無效日期
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// 我們傳入整個翻譯函式 t，讓它來決定要顯示 AM/PM 還是 上午/下午
export const formatTime = (timeString, t) => {
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
      return 'All Day'; // 如果時間格式不對或為空，返回 "All Day"
    }

    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (isNaN(h) || isNaN(m)) return 'All Day';

    const ampmKey = h >= 12 ? 'pm' : 'am';
    const hour12 = h % 12 || 12; // 12點制的小時 (0點和12點都顯示為12)
    const paddedMinutes = String(m).padStart(2, '0');

    // 使用翻譯函式來取得正確的顯示文字
    return `${t(ampmKey)} ${hour12}:${paddedMinutes}`;
};
