/**
 * Auth API service for agency-specific information and management.
 */

export const getAgencyInfo = async (id: string | number) => {
    try {
        const response = await fetch(`/api/auth/agency/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch agency info:', error);
        return null;
    }
};

export const getAgencies = async () => {
    try {
        // First try public route, then fallback to protected if admin token exists
        const token = sessionStorage.getItem('admin_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const url = token ? '/api/auth/agencies' : '/api/auth/agencies/public';
        const response = await fetch(url, { headers });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch agencies:', error);
        return [];
    }
};

export const createAgency = async (agencyData: any) => {
    const response = await fetch('/api/auth/agencies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(agencyData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create agency');
    }
    return response.json();
};

export const updateAgency = async (id: string | number, agencyData: any) => {
    const response = await fetch(`/api/auth/agencies/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(agencyData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update agency');
    }
    return response.json();
};

export const deleteAgency = async (id: string | number) => {
    const response = await fetch(`/api/auth/agencies/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        }
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete agency');
    }
    return response.json();
};

export const updateAgencyStatus = async (id: string | number, status: string) => {
    const response = await fetch(`/api/auth/agencies/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ status })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update agency status');
    }
    return response.json();
};

export const registerAgency = async (agencyData: any) => {
    // Map frontend fields to backend fields if necessary
    const mappedData = {
        username: agencyData.email, // Using email as username for registration
        password: 'temporary-password-1234', // In a real app, this would be user-provided
        agencyName: agencyData.agency_name,
        phoneMobile: agencyData.phone,
        address: agencyData.address,
        ...agencyData
    };

    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mappedData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }
    return response.json();
};
