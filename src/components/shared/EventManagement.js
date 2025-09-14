// src/components/shared/EventManagement.js

import React, { useMemo, useCallback } from 'react';
import { useTranslation } from './../../context/LanguageProvider';
import { formatDateHK } from '../../utils/formatDate';
import { Calendar, Plus, Clock, Edit, Trash2, Users, Briefcase, User as PersonIcon, MapPin, FileText, Building, Hash, AlertTriangle, ChevronsRight } from 'lucide-react';

const EventManagement = ({
    events,
    cases,
    getPersonName,
    getUserName,
    getCaseRef,
    onEditEvent,
    eventActions,
    onViewEvent,
    onViewCase, 
    handleEditCase,
}) => {
    const t = useTranslation();

    const getCaseDateForFilter = useCallback((caseItem) => {
        if (!caseItem || !caseItem.fields) return null;
        const { fields, case_type } = caseItem;
        switch (case_type) {
            case 'Litigation': return fields['Hearing Date'];
            case 'Conveyancing': return fields['Completion Date'];
            case 'Commercial': return fields['Signing Date'];
            case 'Tenancy Agreement': return fields['Signing Date'];
            default:
                return Object.entries(fields).find(([key]) => key.toLowerCase().includes('date'))?.[1];
        }
    }, []);
    
    const formatDisplayTime = useCallback((timeValue, t) => {
        if (!timeValue || typeof timeValue !== 'string' || !timeValue.includes(':')) {
            return t('all_day');
        }
        const [hours, minutes] = timeValue.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            return t('all_day');
        }
        
        const isPM = hours >= 12;
        let displayHours = hours % 12 || 12;
        const period = isPM ? t('time_pm') : t('time_am');
        const formattedMinutes = minutes.toString().padStart(2, '0');

        if (t('time_am') === '上午') {
            return `${period} ${displayHours}:${formattedMinutes}`;
        }
        return `${displayHours}:${formattedMinutes} ${period}`;
    }, [t]);


    const mapItemToDisplayObject = useCallback((item, type) => {
        if (type === 'event') {
            const participantNames = (item.participants || []).map(p => (p.personId ? getPersonName(p.personId) : p.personName) || t('unknown_participant')).filter(Boolean).join(', ');
            let title = item.title;
            if (!title) {
                const eventWithTemplate = t('event_with');
                title = eventWithTemplate.includes('...') ? eventWithTemplate.replace('...', participantNames) : `${eventWithTemplate} ${participantNames}`;
            }
            
            return {
                ...item,
                displayType: 'event',
                displayTitle: title,
                displayTime: formatDisplayTime(item.time, t),
                colorClasses: "bg-yellow-50 border-yellow-200 hover:border-yellow-300",
                details: {
                    participantNames,
                    attendeeNames: (item.attendees || []).map(getUserName).join(', '),
                    caseRef: item.case_id ? getCaseRef(item.case_id) : null,
                    location: item.location,
                    notes: item.notes,
                }
            };
        }

        if (type === 'case') {
            const relevantDate = getCaseDateForFilter(item);
            const dateLabel = Object.keys(item.fields || {}).find(key => item.fields[key] === relevantDate) || '';
            let colorClasses = "bg-purple-50 border-purple-200 hover:border-purple-300";
            
            switch (item.case_type) {
                case 'Litigation': colorClasses = "bg-red-50 border-red-200 hover:border-red-300"; break;
                case 'Conveyancing': colorClasses = "bg-blue-50 border-blue-200 hover:border-blue-300"; break;
                case 'Commercial': colorClasses = "bg-green-50 border-green-200 hover:border-green-300"; break;
            }

            const timeValue = item.case_type === 'Litigation' ? item.fields['HearingDateTime'] : null;

            return {
                id: item.id,
                sortDate: relevantDate,
                displayType: 'case',
                displayTitle: `[${t(item.case_type)}] - ${item.reference_id}`,
                displayTime: formatDisplayTime(timeValue, t),
                colorClasses: colorClasses,
                details: {
                    eventType: t(dateLabel),
                    caseNumber: item.fields['Case Number'],
                    plaintiff: getPersonName(item.roles['Plaintiff']),
                    defendant: getPersonName(item.roles['Defendant']),
                    court: item.fields['Court Name'],
                    limitationDate: item.fields['Limitation Date'],
                    nextStep: item.fields['Next Step'],
                    notes: item.notes,
                },
                originalItem: item
            };
        }
        return null;
    }, [t, getPersonName, getUserName, getCaseRef, getCaseDateForFilter, formatDisplayTime]);

    const getTodaysItems = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayEvents = events.filter(e => e.date === todayStr).map(item => mapItemToDisplayObject(item, 'event'));
        const todayCases = cases.filter(c => getCaseDateForFilter(c) === todayStr).map(item => mapItemToDisplayObject(item, 'case'));
        return [...todayEvents, ...todayCases].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
    }, [events, cases, mapItemToDisplayObject, getCaseDateForFilter]);
    
    const getUpcomingItems = useMemo(() => {
        const today = new Date(); today.setHours(0,0,0,0);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const sevenDaysFromNow = new Date(today); sevenDaysFromNow.setDate(today.getDate() + 8);

        const upcomingEvents = events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate >= tomorrow && eventDate < sevenDaysFromNow;
        }).map(item => mapItemToDisplayObject(item, 'event'));

        const upcomingCases = cases.filter(c => {
            const caseDateStr = getCaseDateForFilter(c);
            if (!caseDateStr) return false;
            const caseDate = new Date(caseDateStr);
            return caseDate >= tomorrow && caseDate < sevenDaysFromNow;
        }).map(item => mapItemToDisplayObject(item, 'case'));

        return [...upcomingEvents, ...upcomingCases].sort((a,b) => new Date(a.sortDate) - new Date(b.sortDate) || (a.time || '00:00').localeCompare(b.time || '00:00'));
    }, [events, cases, mapItemToDisplayObject, getCaseDateForFilter]);

    const renderItem = (item, showDate = false) => (
        <div 
            key={`${item.displayType}-${item.id}`}
            className={`p-4 rounded-lg border shadow-sm transition-all duration-200 ease-in-out cursor-pointer ${item.colorClasses}`}
            onClick={() => item.displayType === 'event' ? onViewEvent(item.id) : onViewCase(item.originalItem.id)}
        >
            <div className="flex justify-between items-start">
                <div className="flex-grow overflow-hidden pr-4">
                    <div className="flex items-center mb-2">
                        <div className="flex items-center font-bold text-blue-600 text-base mr-4">
                            <Clock size={16} className="mr-2" />
                            <span>{showDate && `${formatDateHK(item.sortDate)} `}{item.displayTime}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 truncate" title={item.displayTitle}>
                            {item.displayTitle}
                        </h3>
                    </div>
                    <div className="space-y-2 pl-1 text-sm text-gray-600">
                        {item.displayType === 'event' && (
                            <>
                                {item.details.caseRef && <div className="flex items-center"><Briefcase size={14} className="mr-2.5 text-gray-400 flex-shrink-0" /><span className="font-medium mr-2">{t('related_case')}:</span><button onClick={(e) => {e.stopPropagation(); onViewCase(item.case_id);}} className="text-indigo-600 hover:underline truncate">{item.details.caseRef}</button></div>}
                                {item.details.participantNames && <div className="flex items-start"><PersonIcon size={14} className="mr-2.5 mt-0.5 text-gray-400 flex-shrink-0" /><span className="font-medium mr-2 shrink-0">{t('related_participants')}:</span><span>{item.details.participantNames}</span></div>}
                                {item.details.attendeeNames && <div className="flex items-start"><Users size={14} className="mr-2.5 mt-0.5 text-gray-400 flex-shrink-0" /><span className="font-medium mr-2 shrink-0">{t('our_attendees')}:</span><span>{item.details.attendeeNames}</span></div>}
                                {item.details.location && <div className="flex items-center"><MapPin size={14} className="mr-2.5 text-gray-400 flex-shrink-0" /><span className="font-medium mr-2">{t('location')}:</span><span className="truncate">{item.details.location}</span></div>}
                                {item.details.notes && <div className="flex items-start"><FileText size={14} className="mr-2.5 mt-0.5 text-gray-400 flex-shrink-0" /><span className="font-medium mr-2">{t('notes')}:</span><span>{item.details.notes}</span></div>}
                            </>
                        )}
                        {item.displayType === 'case' && (
                            <>
                                <p className="flex items-center font-medium"><Briefcase size={14} className="mr-2.5 text-gray-400" />{item.details.eventType}</p>
                                {item.details.caseNumber && <p className="flex items-center"><Hash size={14} className="mr-2.5 text-gray-400" />{t('Case Number')}: {item.details.caseNumber}</p>}
                                {item.details.plaintiff && <p className="flex items-center"><Users size={14} className="mr-2.5 text-gray-400" />{t('Plaintiff')}: {item.details.plaintiff}</p>}
                                {item.details.defendant && <p className="flex items-center"><Users size={14} className="mr-2.5 text-gray-400" />{t('Defendant')}: {item.details.defendant}</p>}
                                {item.details.court && <p className="flex items-center"><Building size={14} className="mr-2.5 text-gray-400" />{t('Court Name')}: {item.details.court}</p>}
                                {item.details.limitationDate && <p className="flex items-center text-red-600 font-semibold"><AlertTriangle size={14} className="mr-2.5" />{t('Limitation Date')}: {formatDateHK(item.details.limitationDate)}</p>}
                                {item.details.nextStep && <p className="flex items-center"><ChevronsRight size={14} className="mr-2.5 text-gray-400" />{t('Next Step')}: {item.details.nextStep}</p>}
                                {item.details.notes && <p className="flex items-start"><FileText size={14} className="mr-2.5 mt-0.5 text-gray-400 flex-shrink-0" /><span className="font-medium mr-2">{t('notes')}:</span><span>{item.details.notes}</span></p>}
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); item.displayType === 'event' ? onEditEvent(item) : handleEditCase(item.id); }} className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-green-100" title={t('edit')}><Edit size={18} /></button>
                    {item.displayType === 'event' && <button onClick={(e) => { e.stopPropagation(); if (window.confirm(t('confirm_delete_event'))) eventActions.delete(item.id); }} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100" title={t('delete')}><Trash2 size={18} /></button>}
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Calendar size={24} className="mr-3 text-blue-600" />
                        {t('today_reminders')}
                    </h2>
                    <button onClick={() => onEditEvent(null)} className="flex items-center justify-center space-x-2 bg-blue-600 text-white h-10 px-5 rounded-lg font-semibold shadow-md hover:bg-blue-700">
                        <Plus size={20} /><span>{t('add_event')}</span>
                    </button>
                </div>
                <div className="space-y-4">
                    {getTodaysItems.length > 0 ? getTodaysItems.map(item => renderItem(item)) : <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg"><p>{t('no_events_today')}</p></div>}
                </div>
            </div>
            <div>
                 <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                    <Calendar size={24} className="mr-3 text-purple-600" />
                    {t('upcoming_reminders_seven_days')}
                </h2>
                <div className="space-y-4">
                    {getUpcomingItems.length > 0 ? getUpcomingItems.map(item => renderItem(item, true)) : <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg"><p>{t('no_upcoming_events')}</p></div>}
                </div>
            </div>
        </div>
    );
};

export default EventManagement;