import { ApiResponse } from '../../shared/types';

// Type definition for google.script.run
declare const google: any;

const isProd = typeof google !== 'undefined' && google.script;

export const gasBackend = {
    run(functionName: string, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!isProd) {
                console.log(`[Mock GAS] Calling ${functionName} with`, args);
                // Mock responses for local dev
                setTimeout(() => {
                    if (functionName === 'getSeminars') {
                        resolve({
                            success: true,
                            data: [
                                { id: '1', title: 'Vue3入門', startAt: '2024-02-01T10:00:00', endAt: '2024-02-01T12:00:00', capacity: 10, remaining: 5, price: 5000, description: 'Vue3の基礎を学びます' },
                                { id: '2', title: 'GAS活用術', startAt: '2024-02-05T13:00:00', endAt: '2024-02-05T15:00:00', capacity: 20, remaining: 0, price: 3000, description: '業務効率化のためのGAS' }
                            ]
                        });
                    } else if (functionName === 'bookSeminar') {
                        resolve({ success: true, paymentLink: 'https://square.link/mock', bookingId: 'mock-booking-id' });
                    } else if (functionName === 'adminLogin') {
                        // Mock password check
                        if (args[0] === 'password') {
                            resolve({ success: true, data: true });
                        } else {
                            resolve({ success: false, error: 'パスワードが違います' });
                        }
                    } else if (functionName === 'saveSeminar') {
                        resolve({ success: true, data: args[0] });
                    } else if (functionName === 'deleteSeminar') {
                        resolve({ success: true });
                    } else {
                        resolve({ success: true });
                    }
                }, 1000);
                return;
            }

            google.script.run
                .withSuccessHandler((response: any) => resolve(response))
                .withFailureHandler((error: any) => reject(error))
            [functionName](...args);
        });
    }
};
