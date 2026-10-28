import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Eğitim' | 'A Sınıfı' | 'B Sınıfı' | 'C Sınıfı' | 'Admin';
export type AssociationType = 'Üye' | 'Gönüllü' | 'Yok';

export interface UserProfile {
    firstName: string;
    lastName: string;
    fullName?: string; // Legacy compatibility
    email: string;
    callSign?: string;
    role: UserRole;
    dmrId?: string;
    region?: string;
    bloodType?: string;
    association?: string;
    associationStatus?: AssociationType;
    isApproved: boolean;
}

interface AuthContextType {
    user: UserProfile | null;
    isGuest: boolean;
    login: (userData: UserProfile) => void;
    logout: () => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const splitLegacyFullName = (fullName?: string) => {
    const normalized = (fullName ?? '').trim();
    if (!normalized) {
        return { firstName: '', lastName: '' };
    }

    const parts = normalized.split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
};

const normalizeUserProfile = (raw: Partial<UserProfile> & { fullName?: string }): UserProfile => {
    const legacy = splitLegacyFullName(raw.fullName);
    const firstName = (raw.firstName ?? legacy.firstName ?? '').trim();
    const lastName = (raw.lastName ?? legacy.lastName ?? '').trim();
    const fullName = `${firstName} ${lastName}`.trim();

    return {
        firstName,
        lastName,
        fullName,
        email: (raw.email ?? '').trim().toLowerCase(),
        callSign: raw.callSign?.trim().toUpperCase() || undefined,
        role: (raw.role ?? 'Eğitim') as UserRole,
        dmrId: raw.dmrId?.trim() || undefined,
        region: raw.region?.trim() || undefined,
        bloodType: raw.bloodType?.trim() || undefined,
        association: raw.association?.trim() || undefined,
        associationStatus: (raw.associationStatus ?? 'Yok') as AssociationType,
        isApproved: Boolean(raw.isApproved),
    };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const savedUser = localStorage.getItem('dilaver_user');
        if (savedUser) {
            const normalizedUser = normalizeUserProfile(JSON.parse(savedUser));
            setUser(normalizedUser);
            localStorage.setItem('dilaver_user', JSON.stringify(normalizedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (userData: UserProfile) => {
        const normalizedUser = normalizeUserProfile(userData);
        setUser(normalizedUser);
        localStorage.setItem('dilaver_user', JSON.stringify(normalizedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('dilaver_user');
    };

    const updateProfile = (updates: Partial<UserProfile>) => {
        if (user) {
            const updatedUser = normalizeUserProfile({ ...user, ...updates });
            setUser(updatedUser);
            localStorage.setItem('dilaver_user', JSON.stringify(updatedUser));

            // Sync with registered users list (Mock Database)
            try {
                const registeredUsers = JSON.parse(localStorage.getItem('dilaver_registered_users') || '[]');
                const index = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === updatedUser.email.toLowerCase());

                if (index !== -1) {
                    // Update user while preserving password and other fields not in UserProfile
                    registeredUsers[index] = { ...registeredUsers[index], ...updatedUser };
                    localStorage.setItem('dilaver_registered_users', JSON.stringify(registeredUsers));
                }
            } catch (e) {
                console.error('Failed to sync changes to mock database', e);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, isGuest: !user, login, logout, updateProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
