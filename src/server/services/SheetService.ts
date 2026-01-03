import { Seminar, UserData, MyPageData } from '../../shared/types';

export class SheetService {
    private ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
    private seminarSheet: GoogleAppsScript.Spreadsheet.Sheet;
    private bookingSheet: GoogleAppsScript.Spreadsheet.Sheet;

    constructor() {
        // Uses the active spreadsheet
        this.ss = SpreadsheetApp.getActiveSpreadsheet();
        this.seminarSheet = this.getOrCreateSheet('Seminars');
        this.bookingSheet = this.getOrCreateSheet('Bookings');
    }

    private getOrCreateSheet(name: string): GoogleAppsScript.Spreadsheet.Sheet {
        let sheet = this.ss.getSheetByName(name);
        if (!sheet) {
            sheet = this.ss.insertSheet(name);
            // Initialize headers
            if (name === 'Seminars') {
                sheet.appendRow(['id', 'title', 'startAt', 'endAt', 'capacity', 'booked_count', 'zoom_url', 'price', 'description']);
            } else if (name === 'Bookings') {
                sheet.appendRow(['id', 'seminar_id', 'name', 'email', 'dob', 'status', 'token', 'square_order_id', 'created_at']);
            }
        }
        return sheet;
    }

    getAvailableSeminars(): Seminar[] {
        const data = this.seminarSheet.getDataRange().getValues();
        const headers = data[0];
        const rows = data.slice(1);

        const seminars: Seminar[] = [];

        rows.forEach(row => {
            const remaining = Number(row[4]) - Number(row[5]);
            // Only return future seminars with capacity
            // For now just return all valid ones
            seminars.push({
                id: String(row[0]),
                title: String(row[1]),
                startAt: String(row[2]),
                endAt: String(row[3]),
                capacity: Number(row[4]),
                remaining: remaining,
                price: Number(row[7]),
                description: String(row[8])
            });
        });

        return seminars;
    }

    getSeminarById(id: string): Seminar | null {
        const seminars = this.getAvailableSeminars();
        return seminars.find(s => s.id === id) || null;
    }

    createBooking(seminarId: string, user: UserData): any {
        const id = Utilities.getUuid();
        const token = Utilities.getUuid();
        const now = new Date().toISOString();

        // id, seminar_id, name, email, dob, status, token, square_order_id, created_at
        this.bookingSheet.appendRow([
            id,
            seminarId,
            user.name,
            user.email,
            user.dob,
            'PENDING',
            token,
            '', // square_order_id (updated later)
            now
        ]);

        // Update booking count in Seminar Sheet
        // Note: This is a simple increment. In a robust system, you might recalc from bookings.
        this.incrementBookingCount(seminarId);

        return { id, token };
    }

    private incrementBookingCount(seminarId: string) {
        const data = this.seminarSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][0]) === seminarId) {
                const current = Number(data[i][5]);
                this.seminarSheet.getRange(i + 1, 6).setValue(current + 1);
                break;
            }
        }
    }

    updateBookingStatus(squareOrderId: string, status: string) {
        const data = this.bookingSheet.getDataRange().getValues();
        // find row by square_order_id? Or should we store bookingId in Square metadata?
        // Assuming we can search.
    }

    updateBookingSquareOrderId(bookingId: string, orderId: string) {
        const data = this.bookingSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][0]) === bookingId) { // id column
                this.bookingSheet.getRange(i + 1, 8).setValue(orderId); // square_order_id column
                break;
            }
        }
    }

    getBookingByToken(token: string): MyPageData {
        const bData = this.bookingSheet.getDataRange().getValues();
        const bRow = bData.find(r => r[6] === token);

        if (!bRow) throw new Error('Invalid Token');

        // booking row map
        const booking = {
            id: bRow[0],
            seminarId: bRow[1],
            user: { name: bRow[2], email: bRow[3], dob: bRow[4] },
            status: bRow[5] as any
        };

        const seminar = this.getSeminarById(booking.seminarId as string);
        if (!seminar) throw new Error('Seminar data missing');

        return {
            bookingId: booking.id as string,
            user: booking.user as UserData,
            seminar: seminar,
            status: booking.status,
            zoomUrl: booking.status === 'PAID' ? 'SEMINAR_ZOOM_URL_PLACEHOLDER' : undefined // Ideally fetch from seminar sheet if not secret, or secret handling
        };
    }
}
