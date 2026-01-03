import { Seminar } from '../../shared/types';

export class SquareService {
    private accessToken: string;
    private locationId: string;
    private isSandbox: boolean;

    constructor() {
        const props = PropertiesService.getScriptProperties();
        this.accessToken = props.getProperty('SQUARE_ACCESS_TOKEN') || '';
        this.locationId = props.getProperty('SQUARE_LOCATION_ID') || '';
        this.isSandbox = props.getProperty('SQUARE_ENV') === 'sandbox';

        if (!this.accessToken) {
            console.warn('SQUARE_ACCESS_TOKEN is not set');
        }
    }

    createCheckoutLink(booking: any, seminar: Seminar): string {
        const baseUrl = this.isSandbox
            ? 'https://connect.squareupsandbox.com'
            : 'https://connect.squareup.com';

        const url = `${baseUrl}/v2/online-checkout/payment-links`;

        const payload = {
            idempotency_key: Utilities.getUuid(),
            quick_pay: {
                name: seminar.title,
                price_money: {
                    amount: seminar.price,
                    currency: 'JPY'
                },
                location_id: this.locationId
            },
            pre_populated_data: {
                buyer_email: booking.email || undefined
            },
            payment_note: `Seminar ID: ${seminar.id}, Booking ID: ${booking.id}`
        };

        const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            method: 'post',
            headers: {
                'Square-Version': '2023-12-13',
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(url, options);
        const json = JSON.parse(response.getContentText());

        if (response.getResponseCode() >= 400) {
            console.error('Square Error', json);
            throw new Error('Payment Link Creation Failed');
        }

        return json.payment_link.url;
    }

    handleWebhook(payload: any) {
        // Check if it's payment.updated event
        if (payload.type === 'payment.updated') {
            const payment = payload.data.object.payment;
            if (payment.status === 'COMPLETED') {
                // In a real scenario, you'd match this payment to the booking via Order ID or Note
                // Since we can't easily attach metadata to Quick Pay without creating an order first,
                // we rely on the note or we have to store the Order ID returned from createPaymentLink response.
                // For MVP, if we stored the Order ID from the response of createCheckoutLink, we could match it here.
                // But createCheckoutLink returns an Order ID.

                const orderId = payment.order_id;
                // Now notify SheetService
                // const sheetService = new SheetService();
                // sheetService.updateBookingStatus(orderId, 'PAID');
                // sheetService.getBookingByOrderId(orderId) -> then send email
            }
        }
    }
}
