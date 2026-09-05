import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, RegisterPayload, AccountRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string, rememberMe: boolean) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'fullName' | 'phoneNumber' | 'organization' | 'jobRole'>>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'voiceshield_firestore_users';
const CURRENT_SESSION_KEY = 'voiceshield_auth_session';

// Pre-seeded enterprise profiles stored in Firestore collection 'users'
const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'usr-admin-001',
    fullName: 'David Sterling',
    email: 'admin@voiceshield.ai',
    phoneNumber: '+91 9812345670',
    organization: 'VoiceShield Security Operations',
    jobRole: 'Chief Information Security Officer',
    accountRole: 'ADMIN',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isActive: true,
    authProvider: 'password'
  },
  {
    uid: 'usr-analyst-002',
    fullName: 'Priya Sharma',
    email: 'analyst@voiceshield.ai',
    phoneNumber: '+91 9876543210',
    organization: 'Apex Cyber Defence SOC',
    jobRole: 'Senior Biometrics Threat Analyst',
    accountRole: 'ANALYST',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isActive: true,
    authProvider: 'password'
  },
  {
    uid: 'usr-operator-003',
    fullName: 'Rahul Verma',
    email: 'user@voiceshield.ai',
    phoneNumber: '+91 9845123980',
    organization: 'FinTrust Global Banking',
    jobRole: 'Executive Verification Agent',
    accountRole: 'USER',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isActive: true,
    authProvider: 'password'
  }
];

// Helper to hash passwords client-side using Web Crypto SHA-256 for secure local credentials
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password + '_voiceshield_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and load persistent session
  useEffect(() => {
    try {
      // Check localStorage or sessionStorage
      const savedSession = localStorage.getItem(CURRENT_SESSION_KEY) || sessionStorage.getItem(CURRENT_SESSION_KEY);
      if (savedSession) {
        const parsedUser = JSON.parse(savedSession) as UserProfile;
        setUser(parsedUser);
      }
      
      // Ensure initial users are in Firestore mock table
      const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!existingUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      }
    } catch (err) {
      console.error('Failed to restore authentication session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStoredUsers = (): UserProfile[] => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) return INITIAL_USERS;
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  };

  const saveUsers = (users: UserProfile[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = async (email: string, pass: string, rememberMe: boolean): Promise<UserProfile> => {
    // Normalization & Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email.');
    }
    if (!pass) {
      throw new Error('Please enter your password.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    // Artificial tiny network delay for realistic auth roundtrip
    await new Promise(res => setTimeout(res, 450));

    const users = getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    // Secure failure: do not reveal whether the email exists
    if (!found) {
      throw new Error('Invalid email or password.');
    }

    if (!found.isActive) {
      throw new Error('This account has been deactivated by an administrator.');
    }

    // Verify password: for pre-seeded users default password is 'VoiceShield#2026' or check custom stored hash
    const storedHash = localStorage.getItem(`voiceshield_pwd_${found.uid}`);
    const inputHash = await hashPassword(pass);

    let passwordMatch = false;
    if (storedHash) {
      passwordMatch = storedHash === inputHash;
    } else {
      // Default demo password for seeded accounts
      passwordMatch = pass === 'VoiceShield#2026' || pass === 'Password123';
    }

    if (!passwordMatch) {
      throw new Error('Invalid email or password.');
    }

    // Update lastLoginAt
    const updatedUser: UserProfile = {
      ...found,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedList = users.map(u => u.uid === updatedUser.uid ? updatedUser : u);
    saveUsers(updatedList);

    // Save session based on rememberMe
    if (rememberMe) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(updatedUser));
      sessionStorage.removeItem(CURRENT_SESSION_KEY);
    } else {
      sessionStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(updatedUser));
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }

    setUser(updatedUser);
    return updatedUser;
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    await new Promise(res => setTimeout(res, 600));

    // Simulated Google OAuth profile based on Google Workspace identity
    const googleEmail = 'analyst.user@voiceshield.ai';
    const googleName = 'Lavanya M.';
    const googlePhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const users = getStoredUsers();
    let existing = users.find(u => u.email.toLowerCase() === googleEmail.toLowerCase());

    let finalUser: UserProfile;
    if (existing) {
      finalUser = {
        ...existing,
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedList = users.map(u => u.uid === finalUser.uid ? finalUser : u);
      saveUsers(updatedList);
    } else {
      const newUid = 'usr-goog-' + Math.random().toString(36).substring(2, 9);
      finalUser = {
        uid: newUid,
        fullName: googleName,
        email: googleEmail,
        phoneNumber: '+91 9876543210',
        organization: 'Enterprise Security Division',
        jobRole: 'Cybersecurity Associate',
        accountRole: 'USER', // Requirement: Set default role to USER
        photoURL: googlePhoto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        authProvider: 'google'
      };
      saveUsers([finalUser, ...users]);
    }

    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(finalUser));
    setUser(finalUser);
    return finalUser;
  };

  const register = async (payload: RegisterPayload): Promise<UserProfile> => {
    // Normalization & Validation
    const cleanName = payload.fullName.trim();
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanPhone = payload.phoneNumber.trim();

    if (!cleanName) throw new Error('Please enter your full name.');
    if (!cleanEmail) throw new Error('Please enter your email.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) throw new Error('Please enter a valid email address.');
    if (!cleanPhone) throw new Error('Please enter your phone number.');

    // Password requirements: min 8 chars, 1 upper, 1 lower, 1 number
    if (payload.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(payload.password)) {
      throw new Error('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(payload.password)) {
      throw new Error('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(payload.password)) {
      throw new Error('Password must contain at least one number.');
    }

    // Role safety: normal users cannot register as ADMIN
    const allowedRole: AccountRole = payload.accountRole === 'ANALYST' ? 'ANALYST' : 'USER';

    await new Promise(res => setTimeout(res, 500));

    const users = getStoredUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newUid = 'usr-' + Math.random().toString(36).substring(2, 10);
    const pwdHash = await hashPassword(payload.password);
    localStorage.setItem(`voiceshield_pwd_${newUid}`, pwdHash);

    const newUser: UserProfile = {
      uid: newUid,
      fullName: cleanName,
      email: cleanEmail,
      phoneNumber: cleanPhone,
      organization: payload.organization?.trim() || 'Enterprise Organization',
      jobRole: payload.jobRole?.trim() || (allowedRole === 'ANALYST' ? 'Security Analyst' : 'Operations Officer'),
      accountRole: allowedRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      authProvider: 'password'
    };

    saveUsers([newUser, ...users]);

    // Automatically log in the newly registered user
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    localStorage.removeItem(CURRENT_SESSION_KEY);
    sessionStorage.removeItem(CURRENT_SESSION_KEY);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Please enter your email.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) throw new Error('Please enter a valid email address.');

    await new Promise(res => setTimeout(res, 400));
    // Requirement 11: Do not reveal whether an email account exists.
    // Always resolve successfully.
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'fullName' | 'phoneNumber' | 'organization' | 'jobRole'>>): Promise<UserProfile> => {
    if (!user) throw new Error('User is not authenticated.');

    await new Promise(res => setTimeout(res, 350));

    const updatedUser: UserProfile = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const users = getStoredUsers();
    const updatedList = users.map(u => u.uid === user.uid ? updatedUser : u);
    saveUsers(updatedList);

    // Update current active session
    if (localStorage.getItem(CURRENT_SESSION_KEY)) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(updatedUser));
    }

    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        updateProfile
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
