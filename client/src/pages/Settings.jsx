import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Key } from 'lucide-react';

const Settings = () => {
    const { user, updateProfile, updatePassword } = useAuth();
    const [profileForm, setProfileForm] = useState({ name: '', email: '', role: 'employee' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileForm({ name: user.name || '', email: user.email || '', role: user.role || 'employee' });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileMessage({ type: '', text: '' });

        try {
            await updateProfile(profileForm);
            setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch (error) {
            setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Unable to update profile.' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordSaving(true);
        setPasswordMessage({ type: '', text: '' });

        try {
            await updatePassword(passwordForm);
            setPasswordForm({ currentPassword: '', newPassword: '' });
            setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Unable to update password.' });
        } finally {
            setPasswordSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-slide-up max-w-4xl">
            <div><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences</p></div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e4dccf] dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Profile Information</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your personal details and role.</p>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 font-bold text-2xl uppercase border-4 border-white dark:border-slate-800 shadow-sm">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <button type="button" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">Change Avatar</button>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><User className="w-4 h-4 text-slate-400"/> Full Name</label>
                                <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400"/> Email Address</label>
                                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2"><Shield className="w-4 h-4 text-slate-400"/> Role</label>
                                <select value={profileForm.role} onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        {profileMessage.text ? (
                            <p className={`text-sm ${profileMessage.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>{profileMessage.text}</p>
                        ) : null}

                        <div className="pt-2">
                            <button type="submit" disabled={profileSaving} className="px-4 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
                                {profileSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e4dccf] dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Security</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your password to keep your account secure.</p>
                </div>
                <div className="p-6">
                    <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                            <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                        </div>
                        {passwordMessage.text ? (
                            <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>{passwordMessage.text}</p>
                        ) : null}
                        <div className="pt-2">
                            <button type="submit" disabled={passwordSaving} className="px-4 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"><Key className="w-4 h-4"/> {passwordSaving ? 'Updating...' : 'Update Password'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
