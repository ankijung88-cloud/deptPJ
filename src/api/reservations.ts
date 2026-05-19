const API_URL = '/api/reservations';

export interface ReservationData {
  id?: number;
  user_id?: string;
  user_name?: string;
  user_phone?: string;
  product_id: string;
  product_name?: string;
  agency_id?: number | null;
  program_id: string;
  program_title: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  created_at?: string;
  updated_at?: string;
}

export const createReservation = async (reservationData: ReservationData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData)
  });
  if (!response.ok) throw new Error('Reservation creation failed');
  return response.json();
};

export const getReservations = async (): Promise<ReservationData[]> => {
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch reservations');
  return response.json();
};

export const updateReservationStatus = async (id: number, status: string) => {
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update reservation status');
  return response.json();
};

export const deleteReservation = async (id: number) => {
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete reservation');
  return response.json();
};
