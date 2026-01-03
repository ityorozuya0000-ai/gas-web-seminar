export class LockServiceWrapper {
    private lock: GoogleAppsScript.Lock.Lock;

    constructor() {
        this.lock = LockService.getScriptLock();
    }

    /**
     * Try to acquire the lock.
     * @param timeoutMs Timeout in milliseconds (default 30000)
     * @returns true if lock acquired, false otherwise
     */
    tryLock(timeoutMs: number = 30000): boolean {
        try {
            this.lock.waitLock(timeoutMs);
            return true;
        } catch (e) {
            console.warn('Could not acquire lock', e);
            return false;
        }
    }

    /**
     * Release the lock.
     */
    releaseLock(): void {
        this.lock.releaseLock();
    }
}
