export const getAgencies = async () => {
    const response = await fetch('/api/auth/agencies', {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch agencies');
    return response.json();
};

export const createAgency = async (agency: any) => {
    const response = await fetch('/api/auth/agencies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(agency)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create agency');
    }
    return response.json();
};

export const updateAgency = async (id: number, agency: any) => {
    const response = await fetch(`/api/auth/agencies/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(agency)
    });
    if (!response.ok) throw new Error('Failed to update agency');
    return response.json();
};

export const deleteAgency = async (id: number) => {
    const response = await fetch(`/api/auth/agencies/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete agency');
    return response.json();
};

export const registerAgency = async (agency: any) => {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(agency)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Registration failed');
    }
    return response.json();
};

export const updateAgencyStatus = async (id: number, status: string) => {
    const response = await fetch(`/api/auth/agencies/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update agency status');
    return response.json();
};
