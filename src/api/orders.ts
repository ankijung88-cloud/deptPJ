const API_URL = '/api/orders';

export const createOrder = async (orderData: any) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!response.ok) throw new Error('Order creation failed');
  return response.json();
};

export const getOrders = async () => {
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const updateOrderStatus = async (id: number, status: string) => {
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
};

export const deleteOrder = async (id: number) => {
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete order');
  return response.json();
};
