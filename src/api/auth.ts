export const getAgencies = async () => {
    const response = await fetch('/api/auth/agencies', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
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
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete agency');
    return response.json();
};
