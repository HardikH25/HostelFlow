import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../axiosCalls/axios';
import {
    User,
    Shield,
    Lock,
    Building2,
    MapPin,
    Phone,
    Mail,
    Key,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
    Save,
    Eye,
    EyeOff,
    Wrench,
    Sparkles
} from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();

    // Profile state
    const [profileData, setProfileData] = useState({
        fullname: user?.fullname || '',
        phone: user?.phone || '',
        hostel: user?.hostel || 'Neeladri Hostel',
        roomNumber: user?.roomNumber || '',
        specialization: user?.specialization || 'Plumbing'
    });

    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleProfileChange = (e) => {
        setProfileData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handlePasswordChange = (e) => {
        setPasswordData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileSuccess('');
        setProfileError('');

        try {
            const res = await axiosInstance.put('/auth/profile', profileData);
            if (res.data?.success) {
                setUser(res.data.user);
                setProfileSuccess('Profile details updated successfully!');
                setTimeout(() => setProfileSuccess(''), 4000);
            } else {
                setProfileError(res.data?.message || 'Failed to update profile.');
            }
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Error saving profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setPasswordSuccess('');
        setPasswordError('');

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long.');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New password and confirmation do not match.');
            return;
        }

        setSavingPassword(true);

        try {
            const res = await axiosInstance.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (res.data?.success) {
                setPasswordSuccess('Password changed successfully! Keep it safe.');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setPasswordSuccess(''), 5000);
            } else {
                setPasswordError(res.data?.message || 'Failed to change password.');
            }
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Error updating password.');
        } finally {
            setSavingPassword(false);
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'Warden':
                return 'bg-[#FF5252] text-white';
            case 'Technician':
                return 'bg-[#38E54D] text-black';
            case 'Student':
            default:
                return 'bg-[#FFD93D] text-black';
        }
    };

    const computedLocationPreview = user?.role === 'Student'
        ? `${profileData.hostel}, Room ${profileData.roomNumber ? profileData.roomNumber.trim().toUpperCase() : (user?.roomNumber || 'TBD')}`
        : user?.role === 'Technician'
            ? `${profileData.hostel}, Maintenance (${profileData.specialization})`
            : `${user?.hostel}, Warden Administration Office`;

    return (
        <div className="min-h-[calc(100vh-4.5rem)] bg-[#FFFDF5] p-4 sm:p-6 lg:p-8 text-black">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">

                {/* Back Link & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
                    <div>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-gray-600 hover:text-black mb-2 group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                            <span>Return to Operations Dashboard</span>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2">
                            <span>Account & Identity Profile</span>
                            <Sparkles className="w-5 h-5 text-[#FFD93D] fill-[#FFD93D]" />
                        </h1>
                        <p className="text-xs text-gray-600 mt-0.5">
                            Manage your personal details, campus room assignment, trade qualifications, and security credentials.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-black uppercase px-2.5 py-1 border-2 border-black rounded neo-shadow-sm ${getRoleBadgeStyle(user?.role)}`}>
                            {user?.role} Portal
                        </span>
                        <span className="text-xs font-mono font-bold bg-white text-black px-2.5 py-1 border-2 border-black rounded neo-shadow-sm flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{user?.hostel}</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: Profile Details Form (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="neo-card p-5 sm:p-6 bg-white">
                            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-5">
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#FFD93D] border border-black p-1.5 rounded neo-shadow-sm">
                                        <User className="w-4 h-4 text-black" />
                                    </div>
                                    <h2 className="text-base font-black text-black uppercase tracking-tight">
                                        Personal & Operational Profile
                                    </h2>
                                </div>
                                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">
                                    Live Sync
                                </span>
                            </div>

                            {profileSuccess && (
                                <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-500 rounded text-xs text-emerald-900 font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{profileSuccess}</span>
                                </div>
                            )}

                            {profileError && (
                                <div className="mb-4 p-3 bg-rose-50 border-2 border-rose-500 rounded text-xs text-rose-900 font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{profileError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                                
                                {/* Readonly Official Email */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-black uppercase">
                                            Official Campus Email
                                        </label>
                                        <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                                            <Lock className="w-2.5 h-2.5" /> Fixed Primary ID
                                        </span>
                                    </div>
                                    <div className="flex items-center border-2 border-gray-300 bg-gray-100 rounded px-3 py-2 text-xs text-gray-600 font-mono">
                                        <Mail className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                                        <span className="truncate">{user?.email}</span>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-xs font-bold text-black uppercase mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        required
                                        value={profileData.fullname}
                                        onChange={handleProfileChange}
                                        placeholder="Your full name"
                                        className="w-full px-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-bold text-black uppercase mb-1">
                                        Contact Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full pl-9 pr-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                                        />
                                    </div>
                                </div>

                                {/* STUDENT SPECIFIC: Hostel & Room Number */}
                                {user?.role === 'Student' && (
                                    <div className="pt-2 border-t border-gray-200 flex flex-col gap-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-black uppercase mb-1">
                                                    Assigned Hostel Block *
                                                </label>
                                                <select
                                                    name="hostel"
                                                    value={profileData.hostel}
                                                    onChange={handleProfileChange}
                                                    className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white font-medium"
                                                >
                                                    <option value="Neeladri Hostel">Neeladri Hostel</option>
                                                    <option value="Velankani Hostel">Velankani Hostel</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-black uppercase mb-1">
                                                    Assigned Room Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="roomNumber"
                                                    required
                                                    value={profileData.roomNumber}
                                                    onChange={handleProfileChange}
                                                    placeholder="e.g. A2-204"
                                                    className="w-full px-3 py-2 text-xs border-2 border-black rounded uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TECHNICIAN SPECIFIC: Specialization */}
                                {user?.role === 'Technician' && (
                                    <div className="pt-2 border-t border-gray-200">
                                        <label className="block text-xs font-bold text-black uppercase mb-1">
                                            Trade Specialization *
                                        </label>
                                        <select
                                            name="specialization"
                                            value={profileData.specialization}
                                            onChange={handleProfileChange}
                                            className="w-full px-3 py-2 text-xs border-2 border-black rounded bg-white font-medium"
                                        >
                                            <option value="Plumbing">Plumbing & Water Systems</option>
                                            <option value="Electrical">Electrical & Power MCB</option>
                                            <option value="IT & Network">IT, Wi-Fi & Network</option>
                                            <option value="Housekeeping">Housekeeping & Hygiene</option>
                                            <option value="Carpentry">Carpentry & Furniture</option>
                                        </select>
                                    </div>
                                )}

                                {/* Computed Location Preview */}
                                <div className="bg-[#FFFDF5] border-2 border-dashed border-black p-3 rounded text-xs font-mono">
                                    <div className="flex items-center gap-1.5 text-black font-bold text-[11px] mb-1">
                                        <MapPin className="w-3.5 h-3.5 text-black" />
                                        <span>Current Operational Location:</span>
                                    </div>
                                    <span className="font-extrabold text-black block truncate">
                                        {computedLocationPreview}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="neo-btn bg-[#FFD93D] text-black text-xs px-4 py-2.5 font-black uppercase flex items-center justify-center gap-2 mt-2"
                                >
                                    <Save className="w-4 h-4 text-black" />
                                    <span>{savingProfile ? 'Updating Profile...' : 'Save Profile Changes'}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Change Password & Security (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        
                        {/* Change Password Card */}
                        <div className="neo-card p-5 sm:p-6 bg-white">
                            <div className="flex items-center gap-2 pb-3 border-b-2 border-black mb-4">
                                <div className="bg-[#FF5252] border border-black p-1.5 rounded neo-shadow-sm text-white">
                                    <Key className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-black uppercase tracking-tight">
                                        Change Password
                                    </h2>
                                    <p className="text-[11px] text-gray-500 font-medium">
                                        Update your personal account login credentials.
                                    </p>
                                </div>
                            </div>

                            {passwordSuccess && (
                                <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-500 rounded text-xs text-emerald-900 font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{passwordSuccess}</span>
                                </div>
                            )}

                            {passwordError && (
                                <div className="mb-4 p-3 bg-rose-50 border-2 border-rose-500 rounded text-xs text-rose-900 font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSavePassword} className="flex flex-col gap-3.5">
                                
                                {/* Current Password */}
                                <div>
                                    <label className="block text-xs font-bold text-black uppercase mb-1">
                                        Current Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            name="currentPassword"
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter current password"
                                            className="w-full px-3 py-2 pr-9 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-2.5 top-2.5 text-gray-500 hover:text-black cursor-pointer"
                                        >
                                            {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-bold text-black uppercase mb-1">
                                        New Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            name="newPassword"
                                            required
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Min. 6 characters"
                                            className="w-full px-3 py-2 pr-9 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-2.5 top-2.5 text-gray-500 hover:text-black cursor-pointer"
                                        >
                                            {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label className="block text-xs font-bold text-black uppercase mb-1">
                                        Confirm New Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Re-type new password"
                                        className="w-full px-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="neo-btn bg-black text-[#FFD93D] text-xs px-4 py-2.5 font-black uppercase flex items-center justify-center gap-2 mt-2"
                                >
                                    <Key className="w-4 h-4 text-[#FFD93D]" />
                                    <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
                                </button>
                            </form>
                        </div>

                        {/* Account Privileges Capsule */}
                        <div className="bg-[#FFFDF5] border-2 border-black rounded-lg p-4 neo-shadow-sm text-xs font-mono">
                            <span className="font-black uppercase text-black block mb-2 flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                <span>Security & Role Boundaries</span>
                            </span>
                            <ul className="text-gray-600 space-y-1.5 text-[11px]">
                                <li>• Role: <strong className="text-black">{user?.role}</strong></li>
                                <li>• Active Hostel: <strong className="text-black">{user?.hostel}</strong></li>
                                {user?.role === 'Student' && (
                                    <li>• Maintenance tickets automatically inherit your designated room location.</li>
                                )}
                                {user?.role === 'Technician' && (
                                    <li>• Only issues matching {user?.hostel} can be assigned to your maintenance queue.</li>
                                )}
                                {user?.role === 'Warden' && (
                                    <li>• Administrative authority to onboard staff and oversee SLA compliance.</li>
                                )}
                            </ul>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
