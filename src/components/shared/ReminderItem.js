// src/components/shared/ReminderItem.js

import React from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { formatDateHK } from '../../utils/formatDate';
import { Clock, Users, MapPin, FileText, Trash2, Briefcase, Building, Hash, AlertTriangle, ChevronsRight } from 'lucide-react';

const ReminderItem = ({ item, onEditCase, onEditEvent, onDeleteEvent, getUserName, showDate = false }) => {
    const t = useTranslation();
    const isMeeting = item.type === 'meeting';
    const isCaseEvent = item.type === 'case';
    
    let theme = {
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-400',
        textColor: 'text-gray-800',
    };

    if (isMeeting) {
        theme = {
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-400',
            textColor: 'text-yellow-800',
        };
    } else if (isCaseEvent) {
        // 每種案件、活動使用不同的顏色
        switch (item.caseType) {
            case 'Litigation':
                theme = {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-500',
                    textColor: 'text-red-800',
                };
                break;
            case 'Conveyancing':
                theme = {
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-500',
                    textColor: 'text-blue-800',
                };
                break;
            case 'Commercial':
                theme = {
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-500',
                    textColor: 'text-green-800',
                };
                break;
            case 'Tenancy Agreement':
                 theme = {
                    bgColor: 'bg-indigo-50',
                    borderColor: 'border-indigo-500',
                    textColor: 'text-indigo-800',
                };
                break;
            default:
                theme = {
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-400',
                    textColor: 'text-purple-800',
                };
                break;
        }
    }

    const handleClick = () => {
        if (isMeeting) {
            // 假設 onEditEvent 接收 event object or ID
            onEditEvent(item.id); 
        } else if (isCaseEvent) {
            onEditCase(item.caseId);
        }
    };

    //確保 attendeeNames 只在 isMeeting 為 true 時計算和使用
    const attendeeNames = (isMeeting && item.attendees && Array.isArray(item.attendees) && getUserName)
        ? item.attendees.map(id => getUserName(id)).join(', ')
        : null;

    return (
        <li>
            <div 
                onClick={handleClick} 
                className={`w-full text-left p-4 border-l-4 rounded-r-lg ${theme.bgColor} ${theme.borderColor} hover:shadow-md transition-shadow cursor-pointer flex justify-between items-start gap-4`}
            >
                <div className="flex-grow">
                    <div className={`flex items-center font-semibold mb-2 ${theme.textColor}`}>
                        <Clock size={18} className="mr-2" />
                        <span>
                            {showDate && `${formatDateHK(item.sortDate)} `}
                            {item.time} - 
                            {isCaseEvent && item.caseType && ` [${t(item.caseType)}] - `}
                            {item.title}
                        </span>
                    </div>
                    <div className="text-sm text-gray-700 ml-7 space-y-1.5">
                        {isMeeting && attendeeNames && <p className="flex items-center"><Users size={14} className="mr-2" />{t('our_attendees')}: {attendeeNames}</p>}
                        {isMeeting && item.location && <p className="flex items-center"><MapPin size={14} className="mr-2" />{t('location')}: {item.location}</p>}
                        
                        {isCaseEvent && item.details?.eventType && <p className="flex items-center font-medium"><Briefcase size={14} className="mr-2" />{item.details.eventType}</p>}
                        {isCaseEvent && item.details?.caseNumber && <p className="flex items-center"><Hash size={14} className="mr-2" />{t('Case Number')}: {item.details.caseNumber}</p>}
                        {isCaseEvent && item.details?.plaintiff && <p className="flex items-center"><Users size={14} className="mr-2" />{t('Plaintiff')}: {item.details.plaintiff}</p>}
                        {isCaseEvent && item.details?.defendant && <p className="flex items-center"><Users size={14} className="mr-2" />{t('Defendant')}: {item.details.defendant}</p>}
                        {isCaseEvent && item.details?.court && <p className="flex items-center"><Building size={14} className="mr-2" />{t('Court Name')}: {item.details.court}</p>}
                        {isCaseEvent && item.details?.limitationDate && <p className="flex items-center text-red-600 font-medium"><AlertTriangle size={14} className="mr-2" />{t('Limitation Date')}: {formatDateHK(item.details.limitationDate)}</p>}
                        {isCaseEvent && item.details?.nextStep && <p className="flex items-center"><ChevronsRight size={14} className="mr-2" />{t('Next Step')}: {item.details.nextStep}</p>}
                        
                        {item.notes && <p className="flex items-start"><FileText size={14} className="mr-2 mt-0.5" />{t('notes')}: {item.notes}</p>}
                    </div>
                </div>

                {isMeeting && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm(t('confirm_delete_event'))) {
                                onDeleteEvent(item.id);
                            }
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full flex-shrink-0"
                        aria-label="Delete event"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
        </li>
    );
};

export default ReminderItem;