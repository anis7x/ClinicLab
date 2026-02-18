import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);

    // 2FA flow state
    const [pending2FA, setPending2FA] = useState(null); // { tempToken, user }
    const [totpUri, setTotpUri] = useState(null);       // QR code URI after registration

    // Check existing token on mount
    useEffect(() => {
        const token = api.getToken();
        if (token) {
            api.getMe()
                .then(data => {
                    setUser({ ...data.user, profile: data.profile });
                    if (data.org) setOrg(data.org);
                })
                .catch(() => {
                    api.logout();
                    setUser(null);
                    setOrg(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const result = await api.login(email, password);

        if (result.requires_2fa) {
            setPending2FA({
                tempToken: result.temp_token,
                user: result.user,
            });
            return { requires_2fa: true };
        }

        setUser(result.user);
        if (result.org) setOrg(result.org);
        return result;
    }, []);

    const verify2FA = useCallback(async (code, trustDevice = false) => {
        if (!pending2FA) throw new Error('No pending 2FA');

        const result = await api.verify2FA(
            pending2FA.tempToken,
            code,
            trustDevice,
            navigator.userAgent.substring(0, 50)
        );

        setUser(result.user);
        if (result.org) setOrg(result.org);
        setPending2FA(null);
        return result;
    }, [pending2FA]);

    const registerPatient = useCallback(async (data) => {
        const result = await api.registerPatient(data);
        setUser(result.user);
        return result;
    }, []);

    const registerProfessional = useCallback(async (data) => {
        const result = await api.registerProfessional(data);
        setUser(result.user);
        if (result.org) setOrg(result.org);
        if (result.totp_uri) setTotpUri(result.totp_uri);
        return result;
    }, []);

    const setup2FA = useCallback(async (code) => {
        const result = await api.setup2FA(code);
        // Update user to reflect 2FA enabled
        setUser(prev => prev ? { ...prev, is_2fa_enabled: true } : prev);
        return result;
    }, []);

    const logout = useCallback(() => {
        api.logout();
        setUser(null);
        setOrg(null);
        setPending2FA(null);
        setTotpUri(null);
    }, []);

    const value = {
        user,
        org,
        loading,
        login,
        verify2FA,
        registerPatient,
        registerProfessional,
        setup2FA,
        logout,
        isAuthenticated: !!user,
        isProfessional: user?.role === 'CLINIC_ADMIN' || user?.role === 'LAB_ADMIN',
        pending2FA,
        totpUri,
        clearTotpUri: () => setTotpUri(null),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
