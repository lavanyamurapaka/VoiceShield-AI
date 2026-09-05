import React, { useState } from 'react';
import { 
  User, Mail, Phone, Building2, Briefcase, Shield, 
  Calendar, Key, CheckCircle2, AlertCircle, Edit3, Save, X, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProfileView() {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [jobRole, setJobRole] = useState(user?.jobRole || '');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Phone number is required.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        organization: organization.trim(),
        jobRole: jobRole.trim()
      });
      setIsEditing(false);
      setToastMessage('Profile updated successfully.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'ANALYST':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div id="profile-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-zinc-700 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-2xl text-blue-400 font-mono shadow-xl">
                  {user.fullName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600 border-2 border-[#111114] flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-zinc-100">{user.fullName}</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRoleBadgeStyle(user.accountRole)}`}>
                  {user.accountRole}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-mono flex items-center gap-2">
                <span>{user.email}</span>
                <span className="text-zinc-600">•</span>
                <span>{user.jobRole || 'Biometric Security Specialist'}</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since {new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button
                id="btn-edit-profile"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition uppercase tracking-wider">
                <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-lg border border-zinc-800 transition">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6 font-mono flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" /> User Profile Information
        </h3>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Job Role
                </label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-500">
              Note: Immutable security attributes (UID, Email, and Account Role) cannot be changed without CISO administrator clearance.
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-800 transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition uppercase tracking-wider">
                <Save className="w-3.5 h-3.5" /> {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block mb-1">Full Name</span>
              <div className="font-semibold text-zinc-100 text-sm">{user.fullName}</div>
            </div>

            <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block mb-1">Email Address</span>
              <div className="font-mono text-zinc-100 text-sm flex items-center justify-between">
                <span>{user.email}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  VERIFIED
                </span>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block mb-1">Phone Number</span>
              <div className="font-mono text-zinc-100 text-sm">{user.phoneNumber}</div>
            </div>

            <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block mb-1">Organization</span>
              <div className="font-semibold text-zinc-100 text-sm">{user.organization || 'VoiceShield Enterprise'}</div>
            </div>

            <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block mb-1">Job Role</span>
              <div className="font-semibold text-zinc-100 text-sm">{user.jobRole || 'Biometric Security Specialist'}</div>
            </div>

            <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block mb-1">Account Role</span>
              <div className="font-mono font-bold text-blue-400 text-sm flex items-center gap-2">
                <span>{user.accountRole}</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  ({user.accountRole === 'ADMIN' ? 'Full Security Control' : user.accountRole === 'ANALYST' ? 'SOC Triage & Analytics' : 'Voice Protection Client'})
                </span>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block mb-1">Authentication Provider</span>
              <div className="font-mono text-zinc-300 text-sm capitalize">{user.authProvider}</div>
            </div>

            <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 text-[10px] font-mono uppercase block mb-1">Firestore UID</span>
              <div className="font-mono text-zinc-400 text-xs truncate">{user.uid}</div>
            </div>
          </div>
        )}
      </div>

      {/* Security & Access Policies */}
      <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 text-xs text-zinc-400">
        <h4 className="font-bold text-zinc-200 mb-2 flex items-center gap-2 font-mono uppercase text-[11px]">
          <Key className="w-3.5 h-3.5 text-blue-400" /> Cloud Firestore Security Enforcement
        </h4>
        <p className="leading-relaxed text-zinc-400">
          User profiles are isolated under zero-trust Firestore Security Rules. Authenticated sessions grant read and write access strictly to matching UID documents. Privilege escalation attempts are prevented by Firestore security invariants.
        </p>
      </div>
    </div>
  );
}
