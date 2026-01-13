/**
 * 요일을 한 글자로 반환 (일, 월, 화, 수, 목, 금, 토)
 */
export const getDayChar = (date: Date): string => {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return dayNames[date.getDay()];
};

/**
 * 날짜를 "MM/dd(요)" 형식으로 포맷
 */
export const formatDateWithDay = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}(${getDayChar(date)})`;
};

/**
 * 날짜를 "yy.MM.dd(요)" 형식으로 포맷
 */
export const formatDateWithDayShort = (date: Date): string => {
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}(${getDayChar(date)})`;
};
