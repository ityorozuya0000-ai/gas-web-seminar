export interface Seminar {
    id: string;
    title: string;
    startAt: string; // ISO string
    endAt: string;   // ISO string
    capacity: number;
    remaining: number;
    booked_count?: number;
    zoom_url?: string;
    price: number;
    description?: string;
}

export interface UserData {
    name: string;
    email: string;
    dob: string; // YYYY-MM-DD
}

export interface BookingRequest {
    seminarId: string;
    user: UserData;
}

export interface BookingResponse {
    success: boolean;
    message?: string;
    paymentLink?: string;
    bookingId?: string;
}

export interface MyPageData {
    bookingId: string;
    user: UserData;
    seminar: Seminar;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    zoomUrl?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
