import { Seminar, UserData, MyPageData } from '../../shared/types';

export class SheetService {
    private ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
    private seminarSheet: GoogleAppsScript.Spreadsheet.Sheet;
    private bookingSheet: GoogleAppsScript.Spreadsheet.Sheet;

    constructor() {
        const scriptProperties = PropertiesService.getScriptProperties();
        const spreadsheetId = scriptProperties.getProperty('SPREADSHEET_ID');

        if (spreadsheetId) {
            this.ss = SpreadsheetApp.openById(spreadsheetId);
        } else {
            // Fallback for container-bound scripts, though this app is likely standalone
            try {
                this.ss = SpreadsheetApp.getActiveSpreadsheet();
            } catch (e) {
                throw new Error('Spreadsheet ID not found. Please set SPREADSHEET_ID in Script Properties.');
            }
        }

        if (!this.ss) {
            throw new Error('Spreadsheet not found. Please check SPREADSHEET_ID.');
        }

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

        if (!bRow) throw new Error('無効なトークンです');

        // booking row map
        const booking = {
            id: bRow[0],
            seminarId: bRow[1],
            user: { name: bRow[2], email: bRow[3], dob: bRow[4] },
            status: bRow[5] as any
        };

        const seminar = this.getSeminarById(booking.seminarId as string);
        if (!seminar) throw new Error('セミナーデータが見つかりません');

        return {
            bookingId: booking.id as string,
            user: booking.user as UserData,
            seminar: seminar,
            status: booking.status,
            zoomUrl: booking.status === 'PAID' ? 'SEMINAR_ZOOM_URL_PLACEHOLDER' : undefined // Ideally fetch from seminar sheet if not secret, or secret handling
        };
    }
    saveSeminar(seminar: Seminar): Seminar {
        const data = this.seminarSheet.getDataRange().getValues();
        let rowIndex = -1;

        // Check if updating existing
        if (seminar.id) {
            for (let i = 1; i < data.length; i++) {
                if (String(data[i][0]) === seminar.id) {
                    rowIndex = i + 1;
                    break;
                }
            }
        }

        if (rowIndex === -1) {
            // New Seminar
            seminar.id = Utilities.getUuid();
            rowIndex = this.seminarSheet.getLastRow() + 1;
        }

        // 'id', 'title', 'startAt', 'endAt', 'capacity', 'booked_count', 'zoom_url', 'price', 'description'
        const rowData = [
            seminar.id,
            seminar.title,
            seminar.startAt,
            seminar.endAt,
            seminar.capacity,
            seminar.booked_count || 0,
            seminar.zoom_url || '',
            seminar.price,
            seminar.description || ''
        ];

        // Write row
        // If rowIndex > lastRow, usage of getRange might differ but setValues handles expansion usually if contiguous.
        // Actually for new row better to use appendRow if we are sure it is new? 
        // But getRange().setValues() allows specific row update.
        if (rowIndex > this.seminarSheet.getLastRow()) {
            this.seminarSheet.appendRow(rowData);
        } else {
            this.seminarSheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
        }

        return seminar;
    }

    deleteSeminar(id: string): void {
        const data = this.seminarSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][0]) === id) {
                this.seminarSheet.deleteRow(i + 1);
                return;
            }
        }
        throw new Error('セミナーが見つかりません');
    }
}
