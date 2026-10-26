import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { axiosInstance } from "../axiosCalls/axios";
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
} from "lucide-react";

const Profile = () => {
    const { user, setUser } = useAuth();

    // Profile state
    const [profileData, setProfileData] = useState({
        fullname: user?.fullname || "",
        phone: user?.phone || "",
        hostel: user?.hostel || "Neeladri Hostel",
        roomNumber: user?.roomNumber || "",
        specialization: user?.specialization || "Plumbing"
    });

    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState("");
    const [profileError, setProfileError] = useState("");

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

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
        setProfileSuccess("");
        setProfileError("");

        try {
            const res = await axiosInstance.put("/auth/profile", profileData);
            if (res.data?.success) {
                setUser(res.data.user);
                setProfileSuccess("Profile details updated successfully!");
                setTimeout(() => setProfileSuccess(""), 4000);
            } else {
                setProfileError(res.data?.message || "Failed to update profile.");
            }
        } catch (err) {
            setProfileError(err.response?.data?.message || "Error saving profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setPasswordSuccess("");
        setPasswordError("");

        if (passwordData.newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters long.");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }

        setSavingPassword(true);

        try {
            const res = await axiosInstance.put("/auth/change-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (res.data?.success) {
                setPasswordSuccess("Password changed successfully!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setTimeout(() => setPasswordSuccess(""), 5000);
            } else {
                setPasswordError(res.data?.message || "Failed to change password.");
            }
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Error updating password.");
        } finally {
            setSavingPassword(false);
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case "Warden":
                return "bg-rose-950/60 border border-rose-800/40 text-rose-300";
            case "Technician":
                return "bg-emerald-950/60 border border-emerald-800/40 text-emerald-300";
            case "Student":
            default:
                return "bg-[#141414] border border-[#222222] text-[#3fd6c6]";
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#050505] p-4 sm:p-6 lg:p-8 text-[#f2f2f2] font-sans">
            <div className="max-w-[1360px] mx-auto">
                
                {/* Top Nav */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="px-4 py-2 rounded-full bg-[#0e0e0e] border border-[#222222] hover:border-[#303030] text-[#a6a9ad] hover:text-[#f2f2f2] text-xs font-medium flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#8a8d91]">Role:</span>
                        <span className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full ${getRoleBadgeStyle(user?.role)}`}>
                            {user?.role}
                        </span>
                    </div>
                </div>

                {/* 12-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT PANEL: Profile Details */}
                    <div className="lg:col-span-6 rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-6 shadow-2xl">
                        
                        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#222222]">
                            <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#222222] flex items-center justify-center">
                                <User className="w-5 h-5 text-[#f2f2f2]" />
                            </div>
                            <div>
                                <h2 className="text-base font-medium text-[#f2f2f2] tracking-tight">
                                    Personal Profile
                                </h2>
                                <p className="text-xs text-[#8a8d91]">
                                    Manage your contact details and operational parameters.
                                </p>
                            </div>
                        </div>

                        {profileSuccess && (
                            <div className="mb-4 p-3 bg-[#0a180e] border border-emerald-800/50 rounded-[6px] text-xs text-emerald-200/90 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#3fd6c6] shrink-0" />
                                <span>{profileSuccess}</span>
                            </div>
                        )}

                        {profileError && (
                            <div className="mb-4 p-3 bg-[#180a0a] border border-red-800/50 rounded-[6px] text-xs text-red-200/90 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                <span>{profileError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullname"
                                    required
                                    value={profileData.fullname}
                                    onChange={handleProfileChange}
                                    className="w-full px-3.5 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                    Email Address (Immutable)
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ""}
                                    className="w-full px-3.5 py-2 text-xs border border-[#1f1f1f] rounded-[6px] bg-[#050505] text-[#8a8d91] cursor-not-allowed font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                        Hostel
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={user?.hostel || "Neeladri Hostel"}
                                        className="w-full px-3.5 py-2 text-xs border border-[#1f1f1f] rounded-[6px] bg-[#050505] text-[#8a8d91] cursor-not-allowed font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                        Room Number
                                    </label>
                                    <input
                                        type="text"
                                        name="roomNumber"
                                        disabled={user?.role !== "Student"}
                                        value={profileData.roomNumber}
                                        onChange={handleProfileChange}
                                        placeholder="e.g. A1-101"
                                        className="w-full px-3.5 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] font-mono uppercase focus:outline-none focus:border-[#3fd6c6]"
                                    />
                                </div>
                            </div>

                            {user?.role === "Technician" && (
                                <div>
                                    <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                        Assigned Specialization
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={user?.specialization || "General Maintenance"}
                                        className="w-full px-3.5 py-2 text-xs border border-[#1f1f1f] rounded-[6px] bg-[#050505] text-[#8a8d91] cursor-not-allowed font-mono"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+91 9876543210"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                    className="w-full px-3.5 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="w-fit px-5 py-2.5 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium flex items-center gap-1.5 transition-colors mt-2 disabled:opacity-50"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>{savingProfile ? "Saving Details..." : "Save Profile Details"}</span>
                            </button>
                        </form>
                    </div>

                    {/* RIGHT PANEL: Security & Password */}
                    <div className="lg:col-span-6 flex flex-col gap-6">
                        
                        {/* Change Password Card */}
                        <div className="rounded-[6px] bg-[#0e0e0e] border border-[#222222] p-6 shadow-2xl">
                            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#222222]">
                                <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#222222] flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-[#f2f2f2]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-medium text-[#f2f2f2] tracking-tight">
                                        Change Password
                                    </h2>
                                    <p className="text-xs text-[#8a8d91]">
                                        Update your personal account login credentials.
                                    </p>
                                </div>
                            </div>

                            {passwordSuccess && (
                                <div className="mb-4 p-3 bg-[#0a180e] border border-emerald-800/50 rounded-[6px] text-xs text-emerald-200/90 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#3fd6c6] shrink-0" />
                                    <span>{passwordSuccess}</span>
                                </div>
                            )}

                            {passwordError && (
                                <div className="mb-4 p-3 bg-[#180a0a] border border-red-800/50 rounded-[6px] text-xs text-red-200/90 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSavePassword} className="flex flex-col gap-3.5">
                                <div>
                                    <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                        Current Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrent ? "text" : "password"}
                                            name="currentPassword"
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter current password"
                                            className="w-full px-3.5 py-2 pr-9 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-3 top-2.5 text-[#8a8d91] hover:text-[#f2f2f2] cursor-pointer"
                                        >
                                            {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                        New Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? "text" : "password"}
                                            name="newPassword"
                                            required
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Min. 6 characters"
                                            className="w-full px-3.5 py-2 pr-9 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-2.5 text-[#8a8d91] hover:text-[#f2f2f2] cursor-pointer"
                                        >
                                            {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono text-[#8a8d91] uppercase mb-1.5">
                                        Confirm New Password *
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Re-type new password"
                                        className="w-full px-3.5 py-2 text-xs border border-[#222222] rounded-[6px] bg-[#080808] text-[#f2f2f2] focus:outline-none focus:border-[#3fd6c6]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="w-fit px-5 py-2.5 rounded-full bg-[#f2f2f2] text-[#0a0a0a] hover:bg-white text-xs font-medium flex items-center gap-1.5 transition-colors mt-2 disabled:opacity-50"
                                >
                                    <Key className="w-3.5 h-3.5" />
                                    <span>{savingPassword ? "Updating Password..." : "Update Password"}</span>
                                </button>
                            </form>
                        </div>

                        {/* Account Privileges Capsule */}
                        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-[6px] p-4 text-xs font-mono">
                            <span className="text-[#f2f2f2] block mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#3fd6c6]" />
                                <span>Security &amp; Role Boundaries</span>
                            </span>
                            <ul className="text-[#8a8d91] space-y-1.5 text-[11px]">
                                <li>• Role: <strong className="text-[#f2f2f2] font-semibold">{user?.role}</strong></li>
                                <li>• Active Hostel: <strong className="text-[#f2f2f2] font-semibold">{user?.hostel}</strong></li>
                                {user?.role === "Student" && (
                                    <li>• Maintenance tickets automatically inherit your designated room location.</li>
                                )}
                                {user?.role === "Technician" && (
                                    <li>• Only issues matching {user?.hostel} are routed to your maintenance queue.</li>
                                )}
                                {user?.role === "Warden" && (
                                    <li>• Administrative authority to onboard staff and oversee resolution deadlines.</li>
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
