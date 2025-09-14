// src/components/shared/EventFormModal.js

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { User, X, Plus } from 'lucide-react';
import Modal from './Modal';
import ConfirmationDialog from './ConfirmationDialog';
import CustomDatePicker from './CustomDatePicker';
import CustomTimePicker from './CustomTimePicker';
import TextAreaField from './TextAreaField';
import UserSelector from './UserSelector';

const EventFormModal = React.memo(({
    event,
    people,
    cases,
    allUsers,
    currentUser,
    onSave,
    onClose,
    onViewPerson
}) => {
    const t = useTranslation();
    const [formData, setFormData] = useState({
        participants: [],
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        location: '',
        notes: '',
        attendees: [],
        case_id: '',
        visibility: 'private',
        shared_with: []
    });

    const [participantInput, setParticipantInput] = useState('');
    const [showParticipantDropdown, setShowParticipantDropdown] = useState(false);
    const [isConfirmingClose, setIsConfirmingClose] = useState(false);
    
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    
    const participantInputRef = useRef(null);

    useEffect(() => {
        if (event) {
            setFormData(prev => ({
                ...prev,
                id: event.id || undefined,
                participants: event.participants || [],
                date: event.date || new Date().toISOString().split('T')[0],
                time: event.time || '09:00',
                location: event.location || '',
                notes: event.notes || '',
                attendees: event.attendees || [],
                case_id: event.case_id || '',
                visibility: event.visibility || 'private',
                shared_with: event.shared_with || []
            }));
        }
    }, [event]);

    const relevantCases = useMemo(() => {
        if (formData.participants.length === 0) return cases;
        const participantIds = formData.participants.map(p => p.personId).filter(Boolean);
        if (participantIds.length === 0) return cases;
        return cases.filter(c =>
            participantIds.some(pId => Object.values(c.roles).includes(pId))
        );
    }, [formData.participants, cases]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredPeople = useMemo(() => {
        if (!participantInput) return [];
        const lowerCaseInput = participantInput.toLowerCase();
        const existingParticipantIds = formData.participants.map(p => p.personId);
        return people.filter(p =>
            !existingParticipantIds.includes(p.id) &&
            ((p.name_en && p.name_en.toLowerCase().includes(lowerCaseInput)) ||
             (p.name_zh && p.name_zh.toLowerCase().includes(lowerCaseInput)))
        );
    }, [participantInput, people, formData.participants]);

    const addParticipant = useCallback((participant) => {
        if (formData.participants.some(p => p.personId === participant.personId && p.personName === participant.personName)) return;
        setFormData(prev => ({
            ...prev,
            participants: [...prev.participants, participant]
        }));
        setParticipantInput('');
        setShowParticipantDropdown(false);
        setHighlightedIndex(-1);
    }, [formData.participants]);

    const handleSelectPerson = useCallback((person) => {
        addParticipant({ personId: person.id, personName: person.name_en || person.name_zh });
    }, [addParticipant]);

    const handleAddParticipant = useCallback(() => {
        if (!participantInput.trim()) return;
        addParticipant({ personName: participantInput.trim() });
    }, [addParticipant, participantInput]);

    const removeParticipant = (index) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.filter((_, i) => i !== index)
        }));
    };

    const handleKeyDown = (e) => {
        if (showParticipantDropdown && filteredPeople.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % filteredPeople.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + filteredPeople.length) % filteredPeople.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSelectPerson(filteredPeople[highlightedIndex]);
                } else {
                    handleAddParticipant();
                }
            } else if (e.key === 'Escape') {
                setShowParticipantDropdown(false);
                setHighlightedIndex(-1);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (participantInputRef.current && !participantInputRef.current.contains(event.target)) {
                setShowParticipantDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.participants.length === 0) {
            alert(t('error_no_participant'));
            return;
        }
        const finalData = {
            ...formData,
            case_id: formData.case_id ? formData.case_id : null,
        };
        onSave(finalData);
    };

    const handleCloseRequest = () => setIsConfirmingClose(true);

    return (
        <>
            <Modal title={event && event.id ? t('edit_event') : t('add_event')} onClose={handleCloseRequest}>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('related_participants')}</label>
                            <div ref={participantInputRef} className="relative">
                                <div className="flex items-center">
                                    <div className="relative w-full">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            placeholder={t('search_or_add_person')}
                                            value={participantInput}
                                            onChange={e => {
                                                setParticipantInput(e.target.value);
                                                setHighlightedIndex(-1);
                                            }}
                                            onFocus={() => setShowParticipantDropdown(true)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </div>
                                    <button type="button" onClick={handleAddParticipant} className="bg-blue-600 text-white h-10 px-4 rounded-r-md hover:bg-blue-700 flex items-center space-x-2 shrink-0">
                                        <Plus size={18} />
                                        <span>{t('add')}</span>
                                    </button>
                                </div>
                                {showParticipantDropdown && filteredPeople.length > 0 && (
                                    <ul className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {filteredPeople.map((person, index) => (
                                            <li
                                                key={person.id}
                                                onClick={() => handleSelectPerson(person)}
                                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                                    index === highlightedIndex ? 'bg-blue-100' : ''
                                                }`}
                                            >
                                                {person.name_en || person.name_zh}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="mt-2 space-y-2">
                                {formData.participants.map((p, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                        <div className="flex items-center space-x-2">
                                            <User size={16} className="text-gray-600" />
                                            {p.personId ? (
                                                <button type="button" onClick={() => onViewPerson(p.personId)} className="text-blue-600 hover:underline">
                                                    {p.personName}
                                                </button>
                                            ) : (
                                                <span>{p.personName}</span>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => removeParticipant(index)} className="p-1 text-red-500 hover:text-red-700">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('date')}</label>
                                <CustomDatePicker
                                    value={formData.date}
                                    onChange={(e) => handleChange({ target: { name: 'date', value: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('time')}</label>
                                <CustomTimePicker
                                    value={formData.time}
                                    onChange={(timeValue) => handleChange({ target: { name: 'time', value: timeValue } })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('location')}</label>
                            <input name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        
                        {/* --- CORRECTED AND SEPARATED ATTENDEE & SHARING FIELDS --- */}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('our_attendees')}</label>
                            <UserSelector
                                allUsers={allUsers}
                                currentUser={currentUser}
                                value={formData.attendees}
                                onChange={(selectedIds) => setFormData(prev => ({ ...prev, attendees: selectedIds }))}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('permission')}</label>
                            <select name="visibility" value={formData.visibility} onChange={handleChange} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="private">{t('private')}</option>
                                <option value="public">{t('public')}</option>
                                <option value="custom">{t('custom_share')}</option>
                            </select>
                        </div>

                        {formData.visibility === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('share_with')}</label>
                                <UserSelector
                                    allUsers={allUsers}
                                    currentUser={currentUser}
                                    value={formData.shared_with}
                                    onChange={(selectedIds) => setFormData(prev => ({ ...prev, shared_with: selectedIds }))}
                                />
                            </div>
                        )}
                        {/* --- END OF CORRECTION --- */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('related_case_optional')}</label>
                            <select name="case_id" value={formData.case_id} onChange={handleChange} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">{t('no_related_case')}</option>
                                {relevantCases.map(c => <option key={c.id} value={c.id}>{c.reference_id}</option>)}
                            </select>
                        </div>

                        <TextAreaField label={t('notes')} name="notes" value={formData.notes} onChange={handleChange} rows="3" />

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <button type="button" onClick={handleCloseRequest} className="px-6 py-2 border rounded-lg">{t('cancel')}</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t('save')}</button>
                        </div>
                    </form>
                </div>
            </Modal>
            {isConfirmingClose && <ConfirmationDialog onConfirm={onClose} onCancel={() => setIsConfirmingClose(false)} />}
        </>
    );
});

export default EventFormModal;