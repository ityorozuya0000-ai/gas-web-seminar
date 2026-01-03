export class AdminService {
    verifyPassword(password: string): boolean {
        const scriptProperties = PropertiesService.getScriptProperties();
        const adminPassword = scriptProperties.getProperty('ADMIN_PASSWORD');

        // If password is not set in script properties, deny access for security
        if (!adminPassword) {
            console.error('ADMIN_PASSWORD Script Property is not set.');
            return false;
        }

        return password === adminPassword;
    }
}
