import { SheetService } from './services/SheetService';
import { SquareService } from './services/SquareService';
import { MailService } from './services/MailService';
import { LockServiceWrapper } from './services/LockService';
import { BookingRequest, BookingResponse, MyPageData, ApiResponse, Seminar } from '../shared/types';

// Global objects for GAS
const global = globalThis as any;

/**
 * Serve the Vue app
 */
function doGet(e: GoogleAppsScript.Events.DoGet) {
    return HtmlService.createHtmlOutputFromFile('index')
        .setTitle('Web Seminar System')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handle Webhooks from Square
 */
function doPost(e: GoogleAppsScript.Events.DoPost) {
    try {
        const squareService = new SquareService();
        // Verify signature (Simplified for MVP, requires raw body which might be tricky in GAS)
        // In production, you must verify the signature using e.postData.contents and X-Square-HmacSha256 header.

        // Process the event
        if (e.postData && e.postData.contents) {
            const payload = JSON.parse(e.postData.contents);
            squareService.handleWebhook(payload);
        }

        return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
    } catch (err: any) {
        console.error('Webhook Error', err);
        return ContentService.createTextOutput('Error').setMimeType(ContentService.MimeType.TEXT);
    }
}

// API Functions exposed to Frontend

function getSeminars(): ApiResponse<Seminar[]> {
    try {
        const sheetService = new SheetService();
        const seminars = sheetService.getAvailableSeminars();
        return { success: true, data: seminars };
    } catch (e: any) {
        return { success: false, error: e.toString() };
    }
}

function bookSeminar(request: BookingRequest): BookingResponse {
    const lock = new LockServiceWrapper();
    if (lock.tryLock()) {
        try {
            const sheetService = new SheetService();
            const squareService = new SquareService();
            const mailService = new MailService();

            // Check availability
            const seminar = sheetService.getSeminarById(request.seminarId);
            if (!seminar) throw new Error('Seminar not found');
            if (seminar.remaining <= 0) throw new Error('Full capacity');

            // Create Booking (PENDING)
            const booking = sheetService.createBooking(request.seminarId, request.user);

            // Create Payment Link
            const paymentLink = squareService.createCheckoutLink(booking, seminar);

            // Updates Booking with Square Info if needed (or just rely on webhook later)
            // For now, let's assume we send the link via email
            mailService.sendPaymentLink(request.user.email, paymentLink, seminar.title);

            return { success: true, paymentLink: paymentLink, bookingId: booking.id };

        } catch (e: any) {
            console.error(e);
            return { success: false, message: e.toString() };
        } finally {
            lock.releaseLock();
        }
    } else {
        return { success: false, message: 'Server is busy. Please try again.' };
    }
}

function getMyPageData(token: string): ApiResponse<MyPageData> {
    try {
        const sheetService = new SheetService();
        const data = sheetService.getBookingByToken(token);
        return { success: true, data: data };
    } catch (e: any) {
        return { success: false, error: e.toString() };
    }
}

// Expose functions to global scope for GAS
global.doGet = doGet;
global.doPost = doPost;
global.getSeminars = getSeminars;
global.bookSeminar = bookSeminar;
global.getMyPageData = getMyPageData;
