// src/components/auth/MfaSetup.js

import React, { useState } from 'react';

const MfaSetup = ({ supabase }) => {
    // 翻譯文字的簡易版本
    const t = (key) => ({
        'multi_factor_authentication': '多重要素驗證 (MFA)',
        'enable_mfa': '啟用 MFA',
        'mfa_enroll_error': '啟用 MFA 失敗: ',
        'mfa_scan_qr_code': '請使用您的驗證器 App (例如 Google Authenticator 或 Microsoft Authenticator) 掃描下方的 QR Code，然後輸入 6 位數驗證碼。',
        'verification_code': '驗證碼',
        'verify_and_enable': '驗證並啟用',
        'cancel': '取消',
        'mfa_verify_error': '驗證碼錯誤或已過期: ',
        'mfa_enable_success': 'MFA 已成功啟用！',
    }[key] || key);

    const [isEnrolling, setIsEnrolling] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [factorId, setFactorId] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEnroll = async () => {
        setError('');
        setSuccess('');
        try {
            const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
            if (error) throw error;
            
            setQrCode(data.totp.qr_code);
            setFactorId(data.id);
            setIsEnrolling(true);
        } catch (err) {
            setError(t('mfa_enroll_error') + err.message);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            // 修正：使用 challengeAndVerify 這個輔助函式，它會自動處理 challenge 和 verify 兩個步驟，確保 challengeId 不會遺失。
            const { error } = await supabase.auth.mfa.challengeAndVerify({
                factorId,
                code: verifyCode
            });

            if (error) {
                // 如果有錯誤，直接拋出，讓 catch 區塊處理
                throw error;
            }
            
            setSuccess(t('mfa_enable_success'));
            setIsEnrolling(false);
            setQrCode(null);

        } catch (err) {
            // 這裡會捕捉到 'challenge ID not found' 或 'Invalid TOTP code' 等錯誤
            setError(t('mfa_verify_error') + err.message);
        }
    };

    return (
        <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">{t('multi_factor_authentication')}</h3>
            <p className="text-sm text-gray-600 mb-4">啟用後，登入時除了密碼，還需要輸入手機驗證器 App 的動態驗證碼以增加帳號安全性。</p>
            {!isEnrolling ? (
                <button onClick={handleEnroll} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
                    {t('enable_mfa')}
                </button>
            ) : (
                <form onSubmit={handleVerify} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{t('mfa_scan_qr_code')}</p>
                    <div className="bg-white p-4 inline-block border rounded-md" dangerouslySetInnerHTML={{ __html: qrCode }} />
                    
                    <div>
                        <label htmlFor="mfa-verify-code" className="block text-sm font-medium text-gray-700 mb-1">{t('verification_code')}</label>
                        <input
                            id="mfa-verify-code"
                            type="text"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123456"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">{t('verify_and_enable')}</button>
                         <button type="button" onClick={() => setIsEnrolling(false)} className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100">{t('cancel')}</button>
                    </div>
                </form>
            )}
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            {success && <p className="text-green-600 mt-2 text-sm">{success}</p>}
        </div>
    );
};

export default MfaSetup;