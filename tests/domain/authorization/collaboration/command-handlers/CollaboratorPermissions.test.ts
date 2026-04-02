import { canActOnRole } from '@domain/authorization/collaboration/command-handlers/CollaboratorPermissions';

describe('canActOnRole', () => {
  describe('when granter is OWNER', () => {
    it('should allow granting EDITOR', () => {
      expect(canActOnRole('OWNER', 'EDITOR')).toBe(true);
    });

    it('should allow granting VIEWER', () => {
      expect(canActOnRole('OWNER', 'VIEWER')).toBe(true);
    });

    it('should allow granting VIEWER_CONTRIBUTOR', () => {
      expect(canActOnRole('OWNER', 'VIEWER_CONTRIBUTOR')).toBe(true);
    });

    it('should not allow granting OWNER', () => {
      expect(canActOnRole('OWNER', 'OWNER')).toBe(false);
    });
  });

  describe('when granter is EDITOR', () => {
    it('should allow granting VIEWER', () => {
      expect(canActOnRole('EDITOR', 'VIEWER')).toBe(true);
    });

    it('should allow granting VIEWER_CONTRIBUTOR', () => {
      expect(canActOnRole('EDITOR', 'VIEWER_CONTRIBUTOR')).toBe(true);
    });

    it('should not allow granting EDITOR', () => {
      expect(canActOnRole('EDITOR', 'EDITOR')).toBe(false);
    });

    it('should not allow granting OWNER', () => {
      expect(canActOnRole('EDITOR', 'OWNER')).toBe(false);
    });
  });

  describe('when granter is VIEWER or VIEWER_CONTRIBUTOR', () => {
    it('should not allow VIEWER to grant any role', () => {
      expect(canActOnRole('VIEWER', 'VIEWER')).toBe(false);
      expect(canActOnRole('VIEWER', 'VIEWER_CONTRIBUTOR')).toBe(false);
    });

    it('should not allow VIEWER_CONTRIBUTOR to grant any role', () => {
      expect(canActOnRole('VIEWER_CONTRIBUTOR', 'VIEWER')).toBe(false);
      expect(canActOnRole('VIEWER_CONTRIBUTOR', 'EDITOR')).toBe(false);
    });
  });
});
