// src/components/shared/InfoRow.js
import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

const InfoRow = ({ label, value, isLink = false, onClick }) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 col-span-2">
                {isLink ? (
                    <button onClick={onClick} className="text-blue-600 hover:underline">{value}</button>
                ) : (
                    value
                )}
            </dd>
        </div>
    );
};
export default InfoRow;