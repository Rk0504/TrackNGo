import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [language, setLanguage] = useState('en');
    const [notifications, setNotifications] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return; // Use default if not logged in

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/settings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLanguage(data.language);
                    setNotifications(data.notifications);
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            }
        };

        fetchSettings();
    }, [user, API_URL]);

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        setError('');

        if (!user) {
            // Guest mode: Save to local storage
            localStorage.setItem('guest_settings', JSON.stringify({ language, notifications }));
            setMessage('Settings saved to device (Guest Mode)');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ language, notifications })
            });

            if (response.ok) {
                setMessage('✅ Settings updated successfully in backend!');
            } else {
                setError('❌ Failed to update settings');
            }
        } catch (err) {
            setError('❌ Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center transition-colors duration-200">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 p-6 text-white flex justify-between items-center shadow-lg">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold">{language === 'ta' ? 'அமைப்புகள்' : 'Settings'}</h1>
                    </div>
                    <button onClick={() => navigate('/track')} className="text-sm bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-lg transition-all border border-white/10">
                        Back to Map
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Language Setting */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            {language === 'ta' ? 'மொழி' : 'Language'}
                        </label>
                        <div className="relative">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="en">English (Default)</option>
                                <option value="ta">Tamil (தமிழ்)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Notification Setting */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                {language === 'ta' ? 'அறிவிப்புகள்' : 'Notifications'}
                            </span>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={notifications}
                                onChange={(e) => setNotifications(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* User Info / Login Prompt */}
                    {!user && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                You are not logged in. Settings will only be saved on this device.
                                <button onClick={() => navigate('/login')} className="underline font-bold ml-1 hover:text-yellow-800 dark:hover:text-yellow-300">
                                    Login to sync.
                                </button>
                            </p>
                        </div>
                    )}

                    {user && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-700/30 py-2 rounded-lg">
                            Logged in as: <span className="font-semibold text-gray-700 dark:text-gray-200">{user.name || user.mobile}</span>
                        </div>
                    )}

                    {/* Feedback Messages */}
                    {message && (
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-center text-sm border border-green-200 dark:border-green-800">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-center text-sm border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`w-full font-bold py-3.5 px-4 rounded-xl text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                            }`}
                    >
                        {loading ? 'Saving...' : (language === 'ta' ? 'சேமி' : 'Save Settings')}
                    </button>

                    {user && (
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="w-full text-red-500 dark:text-red-400 text-sm mt-4 hover:underline hover:text-red-600 dark:hover:text-red-300 transition-colors"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
