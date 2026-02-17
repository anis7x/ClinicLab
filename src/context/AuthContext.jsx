import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check existing token on mount
    useEffect(() => {
        const token = api.getToken();
        if (token) {
            api.getMe()
                .then(data => {
                    setUser({ ...data.user, profile: data.profile });
                })
                .catch(() => {
                    api.logout();
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const result = await api.login(email, password);
        setUser(result.user);
        return result;
    }, []);

    const registerPatient = useCallback(async (data) => {
        const result = await api.registerPatient(data);
        setUser(result.user);
        return result;
    }, []);

    const registerProfessional = useCallback(async (data) => {
        const result = await api.registerProfessional(data);
        setUser(result.user);
        return result;
    }, []);

    const logout = useCallback(() => {
        api.logout();
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        login,
        registerPatient,
        registerProfessional,
        logout,
        isAuthenticated: !!user,
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
