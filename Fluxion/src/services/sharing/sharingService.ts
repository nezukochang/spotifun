export class SharingService {
    async startP2PServer(track: any): Promise<string> {
        console.log('Sharing is currently disabled for stability');
        return 'offline-mode';
    }

    async scanAndConnect(): Promise<any> {
        console.log('Sharing is currently disabled for stability');
        return null;
    }

    async stop(): Promise<void> {
        // No-op
    }
}

export const sharingService = new SharingService();
