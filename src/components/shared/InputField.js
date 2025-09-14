// src/components/shared/InputField.js
import React from 'react';

const InputField = ({ label, ...props }) => (<div><label htmlFor={props.name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input id={props.name} {...props} className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>);

export default InputField;