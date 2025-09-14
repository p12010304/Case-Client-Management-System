import React from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { formatDateHK, formatTime } from '../../utils/formatDate';
import Modal from './Modal';
import InfoRow from './InfoRow';
import { Link as LinkIcon, User, User as PersonIcon, Briefcase, Users, Clock, MapPin, FileText, Calendar } from 'lucide-react';

const Section = ({ icon, title, children }) => (
    <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-base font-semibold text-gray-500 mb-3 flex items-center">
            {icon}
            {title}
        </h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const EventInfoModal = ({ event, onClose, getPersonName, getCaseRef, getUserName, onPersonClick, onCaseClick }) => {
    const t = useTranslation();

    if (!event) return null;

    const participantNames = (event.participants || [])
        .map(p => ({ id: p.personId, name: p.personName }))
        .filter(p => p.name);

    return (
        <Modal title={event.title || t('event_details')} onClose={onClose}>
            <div className="p-6 text-base">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                    <InfoRow 
                        label={t('date')} 
                        value={formatDateHK(event.date)} 
                        icon={<Calendar size={16} className="text-gray-400" />}
                    />
                    <InfoRow 
                        label={t('time')} 
                        value={event.time ? formatTime(event.time, t) : t('all_day')} 
                        icon={<Clock size={16} className="text-gray-400" />}
                    />
                    {event.location && (
                         <InfoRow 
                            label={t('location')} 
                            value={event.location} 
                            icon={<MapPin size={16} className="text-gray-400" />}
                            fullWidth
                        />
                    )}
                </div>

                {event.notes && (
                    <Section icon={<FileText size={16} className="mr-2" />} title={t('notes')}>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{event.notes}</p>
                    </Section>
                )}

                {event.case_id && (
                    <Section icon={<Briefcase size={16} className="mr-2" />} title={t('related_case')}>
                        <button 
                            onClick={() => onCaseClick(event.case_id)} 
                            className="text-blue-600 hover:underline flex items-center text-left text-base"
                        >
                            <LinkIcon size={14} className="mr-2 shrink-0"/>
                            {getCaseRef(event.case_id)}
                        </button>
                    </Section>
                )}

                {participantNames.length > 0 && (
                    <Section icon={<PersonIcon size={16} className="mr-2" />} title={t('related_participants')}>
                         <div className="bg-gray-50 p-3 rounded-md space-y-2">
                            {participantNames.map((p, index) => (
                               <div key={index} className="flex items-center">
                                   {p.id ? (
                                        <button 
                                            onClick={() => onPersonClick(p.id)} 
                                            className="text-blue-600 hover:underline flex items-center text-left text-base"
                                        >
                                            <LinkIcon size={14} className="mr-2 shrink-0"/>
                                            {p.name}
                                        </button>
                                   ) : (
                                       <span className="flex items-center text-gray-700 text-base">
                                           <User size={14} className="mr-2 text-gray-400 shrink-0" />
                                           {p.name}
                                       </span>
                                   )}
                               </div>
                            ))}
                        </div>
                    </Section>
                )}

                {event.attendees && event.attendees.length > 0 && (
                     <Section icon={<Users size={16} className="mr-2" />} title={t('our_attendees')}>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                            {event.attendees.map(getUserName).join(', ')}
                        </p>
                    </Section>
                )}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t text-right">
                 <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                    {t('close')}
                </button>
            </div>
        </Modal>
    );
};

export default EventInfoModal;
