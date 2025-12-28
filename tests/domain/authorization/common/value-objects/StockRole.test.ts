import { StockRole, StockRoleEnum } from '@domain/authorization/common/value-objects/StockRole';

describe('StockRole', () => {
  describe('when the role is invalid', () => {
    it('should throw an error', () => {
      expect(() => new StockRole('INVALID_ROLE')).toThrow(
        'Invalid stock role: INVALID_ROLE. Must be one of: OWNER, EDITOR, VIEWER, VIEWER_CONTRIBUTOR'
      );
    });

    it('should throw an error for empty string', () => {
      expect(() => new StockRole('')).toThrow('Invalid stock role');
    });
  });

  describe('when the role is OWNER', () => {
    it('should return OWNER for getValue', () => {
      const role = new StockRole(StockRoleEnum.OWNER);
      expect(role.getValue()).toBe(StockRoleEnum.OWNER);
    });

    it('should return true for isOwner', () => {
      const role = new StockRole(StockRoleEnum.OWNER);
      expect(role.isOwner()).toBe(true);
    });

    it('should return false for isEditor', () => {
      const role = new StockRole(StockRoleEnum.OWNER);
      expect(role.isEditor()).toBe(false);
    });

    it('should return false for isViewer', () => {
      const role = new StockRole(StockRoleEnum.OWNER);
      expect(role.isViewer()).toBe(false);
    });

    it('should return false for isViewerContributor', () => {
      const role = new StockRole(StockRoleEnum.OWNER);
      expect(role.isViewerContributor()).toBe(false);
    });

    it('should return true for canRead', () => {
      const role = new StockRole(StockRoleEnum.OWNER);
      expect(role.canRead()).toBe(true);
    });

    it('should return true for canWrite', () => {
      const role = new StockRole(StockRoleEnum.OWNER);
      expect(role.canWrite()).toBe(true);
    });

    it('should return true for canSuggest', () => {
      const role = new StockRole(StockRoleEnum.OWNER);
      expect(role.canSuggest()).toBe(true);
    });
  });

  describe('when the role is EDITOR', () => {
    it('should return EDITOR for getValue', () => {
      const role = new StockRole(StockRoleEnum.EDITOR);
      expect(role.getValue()).toBe(StockRoleEnum.EDITOR);
    });

    it('should return false for isOwner', () => {
      const role = new StockRole(StockRoleEnum.EDITOR);
      expect(role.isOwner()).toBe(false);
    });

    it('should return true for isEditor', () => {
      const role = new StockRole(StockRoleEnum.EDITOR);
      expect(role.isEditor()).toBe(true);
    });

    it('should return false for isViewer', () => {
      const role = new StockRole(StockRoleEnum.EDITOR);
      expect(role.isViewer()).toBe(false);
    });

    it('should return false for isViewerContributor', () => {
      const role = new StockRole(StockRoleEnum.EDITOR);
      expect(role.isViewerContributor()).toBe(false);
    });

    it('should return true for canRead', () => {
      const role = new StockRole(StockRoleEnum.EDITOR);
      expect(role.canRead()).toBe(true);
    });

    it('should return true for canWrite', () => {
      const role = new StockRole(StockRoleEnum.EDITOR);
      expect(role.canWrite()).toBe(true);
    });

    it('should return true for canSuggest', () => {
      const role = new StockRole(StockRoleEnum.EDITOR);
      expect(role.canSuggest()).toBe(true);
    });
  });

  describe('when the role is VIEWER', () => {
    it('should return VIEWER for getValue', () => {
      const role = new StockRole(StockRoleEnum.VIEWER);
      expect(role.getValue()).toBe(StockRoleEnum.VIEWER);
    });

    it('should return false for isOwner', () => {
      const role = new StockRole(StockRoleEnum.VIEWER);
      expect(role.isOwner()).toBe(false);
    });

    it('should return false for isEditor', () => {
      const role = new StockRole(StockRoleEnum.VIEWER);
      expect(role.isEditor()).toBe(false);
    });

    it('should return true for isViewer', () => {
      const role = new StockRole(StockRoleEnum.VIEWER);
      expect(role.isViewer()).toBe(true);
    });

    it('should return false for isViewerContributor', () => {
      const role = new StockRole(StockRoleEnum.VIEWER);
      expect(role.isViewerContributor()).toBe(false);
    });

    it('should return true for canRead', () => {
      const role = new StockRole(StockRoleEnum.VIEWER);
      expect(role.canRead()).toBe(true);
    });

    it('should return false for canWrite', () => {
      const role = new StockRole(StockRoleEnum.VIEWER);
      expect(role.canWrite()).toBe(false);
    });

    it('should return false for canSuggest', () => {
      const role = new StockRole(StockRoleEnum.VIEWER);
      expect(role.canSuggest()).toBe(false);
    });
  });

  describe('when the role is VIEWER_CONTRIBUTOR', () => {
    it('should return VIEWER_CONTRIBUTOR for getValue', () => {
      const role = new StockRole(StockRoleEnum.VIEWER_CONTRIBUTOR);
      expect(role.getValue()).toBe(StockRoleEnum.VIEWER_CONTRIBUTOR);
    });

    it('should return false for isOwner', () => {
      const role = new StockRole(StockRoleEnum.VIEWER_CONTRIBUTOR);
      expect(role.isOwner()).toBe(false);
    });

    it('should return false for isEditor', () => {
      const role = new StockRole(StockRoleEnum.VIEWER_CONTRIBUTOR);
      expect(role.isEditor()).toBe(false);
    });

    it('should return false for isViewer', () => {
      const role = new StockRole(StockRoleEnum.VIEWER_CONTRIBUTOR);
      expect(role.isViewer()).toBe(false);
    });

    it('should return true for isViewerContributor', () => {
      const role = new StockRole(StockRoleEnum.VIEWER_CONTRIBUTOR);
      expect(role.isViewerContributor()).toBe(true);
    });

    it('should return true for canRead', () => {
      const role = new StockRole(StockRoleEnum.VIEWER_CONTRIBUTOR);
      expect(role.canRead()).toBe(true);
    });

    it('should return false for canWrite', () => {
      const role = new StockRole(StockRoleEnum.VIEWER_CONTRIBUTOR);
      expect(role.canWrite()).toBe(false);
    });

    it('should return true for canSuggest', () => {
      const role = new StockRole(StockRoleEnum.VIEWER_CONTRIBUTOR);
      expect(role.canSuggest()).toBe(true);
    });
  });

  describe('factory methods', () => {
    it('should create OWNER role with createOwner', () => {
      const role = StockRole.createOwner();
      expect(role.getValue()).toBe(StockRoleEnum.OWNER);
      expect(role.isOwner()).toBe(true);
    });

    it('should create EDITOR role with createEditor', () => {
      const role = StockRole.createEditor();
      expect(role.getValue()).toBe(StockRoleEnum.EDITOR);
      expect(role.isEditor()).toBe(true);
    });

    it('should create VIEWER role with createViewer', () => {
      const role = StockRole.createViewer();
      expect(role.getValue()).toBe(StockRoleEnum.VIEWER);
      expect(role.isViewer()).toBe(true);
    });

    it('should create VIEWER_CONTRIBUTOR role with createViewerContributor', () => {
      const role = StockRole.createViewerContributor();
      expect(role.getValue()).toBe(StockRoleEnum.VIEWER_CONTRIBUTOR);
      expect(role.isViewerContributor()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true when comparing two OWNER roles', () => {
      const role1 = StockRole.createOwner();
      const role2 = StockRole.createOwner();
      expect(role1.equals(role2)).toBe(true);
    });

    it('should return false when comparing OWNER and EDITOR roles', () => {
      const owner = StockRole.createOwner();
      const editor = StockRole.createEditor();
      expect(owner.equals(editor)).toBe(false);
    });

    it('should return false when comparing VIEWER and VIEWER_CONTRIBUTOR roles', () => {
      const viewer = StockRole.createViewer();
      const contributor = StockRole.createViewerContributor();
      expect(viewer.equals(contributor)).toBe(false);
    });
  });
});
