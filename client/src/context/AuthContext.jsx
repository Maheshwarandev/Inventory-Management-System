import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        navigate('/dashboard');
    };

    const refreshUser = async () => {
        const res = await api.get('/auth/me');
        setUser(res.data);
        return res.data;
    };

    const updateProfile = async (profileData) => {
        const res = await api.put('/auth/profile', profileData);
        if (res.data?.token) {
            localStorage.setItem('token', res.data.token);
        }
        await refreshUser();
        return res.data;
    };

    const updatePassword = async (passwordData) => {
        const res = await api.put('/auth/password', passwordData);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
