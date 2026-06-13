import {SharingService, sharingService} from '../../../src/services/sharing/sharingService';

describe('SharingService', () => {
  it('exports a singleton instance', () => {
    expect(sharingService).toBeInstanceOf(SharingService);
  });

  it('startP2PServer returns offline-mode', async () => {
    const result = await sharingService.startP2PServer({id: 't1'});
    expect(result).toBe('offline-mode');
  });

  it('scanAndConnect returns null', async () => {
    const result = await sharingService.scanAndConnect();
    expect(result).toBeNull();
  });

  it('stop resolves without error', async () => {
    await expect(sharingService.stop()).resolves.toBeUndefined();
  });
});
