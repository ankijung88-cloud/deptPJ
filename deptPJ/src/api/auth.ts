import client from './client';

export interface User {
    id: number;
    email: string;
    name: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
};

export const register = async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/register', { email, password, name });
    return response.data;
};
