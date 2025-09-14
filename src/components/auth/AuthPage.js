// src/components/auth/AuthPage.js

import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageProvider';
import { Mail, Lock, Briefcase, AlertTriangle, User } from 'lucide-react';

const AuthPage = ({ onLogin, onRegister }) => {
    const t = useTranslation();
    const [isRegisterView, setIsRegisterView] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState(''); 
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isRegisterView) {
            if (password !== confirmPassword) {
                setError(t('passwords_do_not_match'));
                setIsLoading(false);
                return;
            }
            try {
                await onRegister(email, password, username);
            } catch (err) {
                const errorMessage = err && err.message ? err.message : t('error_unknown');
                setError(errorMessage);
            }
        } else {
            try {
                await onLogin(email, password);
            } catch (err) {
                setError(t('error_invalid_credentials'));
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="text-center mb-8">
                <Briefcase size={48} className="text-blue-600 mx-auto mb-4"/>
                <h1 className="text-3xl font-bold text-gray-800">{t('app_title')}</h1>
            </div>
            <div className="max-w-sm w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {isRegisterView ? t('register') : t('login')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center">
                            <AlertTriangle size={20} className="mr-3" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                    
                    {isRegisterView && (
                        <div>
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">{t('username')}</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input id="username" name="username" type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('username')} />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">{t('email')}</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@email.com" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password">{t('password')}</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********" />
                        </div>
                    </div>
                     {isRegisterView && (
                        <div>
                            <label htmlFor="confirm-password">{t('confirm_password')}</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********" />
                            </div>
                        </div>
                    )}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                            {isLoading ? t('loading') : (isRegisterView ? t('register') : t('login'))}
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => { setIsRegisterView(!isRegisterView); setError(''); }} className="text-sm text-blue-600 hover:underline">
                        {isRegisterView ? t('already_have_account') : t('dont_have_account')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;