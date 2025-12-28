import { FamilyRole, FamilyRoleEnum } from '@domain/authorization/common/value-objects/FamilyRole';

describe('FamilyRole', () => {
  describe('when the role is invalid', () => {
    it('should throw an error', () => {
      expect(() => new FamilyRole('INVALID_ROLE')).toThrow(
        'Invalid family role: INVALID_ROLE. Must be one of: ADMIN, MEMBER'
      );
    });

    it('should throw an error for empty string', () => {
      expect(() => new FamilyRole('')).toThrow('Invalid family role');
    });
  });

  describe('when the role is ADMIN', () => {
    it('should return ADMIN for getValue', () => {
      const role = new FamilyRole(FamilyRoleEnum.ADMIN);
      expect(role.getValue()).toBe(FamilyRoleEnum.ADMIN);
    });

    it('should return true for isAdmin', () => {
      const role = new FamilyRole(FamilyRoleEnum.ADMIN);
      expect(role.isAdmin()).toBe(true);
    });

    it('should return false for isMember', () => {
      const role = new FamilyRole(FamilyRoleEnum.ADMIN);
      expect(role.isMember()).toBe(false);
    });
  });

  describe('when the role is MEMBER', () => {
    it('should return MEMBER for getValue', () => {
      const role = new FamilyRole(FamilyRoleEnum.MEMBER);
      expect(role.getValue()).toBe(FamilyRoleEnum.MEMBER);
    });

    it('should return false for isAdmin', () => {
      const role = new FamilyRole(FamilyRoleEnum.MEMBER);
      expect(role.isAdmin()).toBe(false);
    });

    it('should return true for isMember', () => {
      const role = new FamilyRole(FamilyRoleEnum.MEMBER);
      expect(role.isMember()).toBe(true);
    });
  });

  describe('factory methods', () => {
    it('should create ADMIN role with createAdmin', () => {
      const role = FamilyRole.createAdmin();
      expect(role.getValue()).toBe(FamilyRoleEnum.ADMIN);
      expect(role.isAdmin()).toBe(true);
    });

    it('should create MEMBER role with createMember', () => {
      const role = FamilyRole.createMember();
      expect(role.getValue()).toBe(FamilyRoleEnum.MEMBER);
      expect(role.isMember()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true when comparing two ADMIN roles', () => {
      const role1 = FamilyRole.createAdmin();
      const role2 = FamilyRole.createAdmin();
      expect(role1.equals(role2)).toBe(true);
    });

    it('should return true when comparing two MEMBER roles', () => {
      const role1 = FamilyRole.createMember();
      const role2 = FamilyRole.createMember();
      expect(role1.equals(role2)).toBe(true);
    });

    it('should return false when comparing ADMIN and MEMBER roles', () => {
      const admin = FamilyRole.createAdmin();
      const member = FamilyRole.createMember();
      expect(admin.equals(member)).toBe(false);
    });
  });
});
