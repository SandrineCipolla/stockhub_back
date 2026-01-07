import { FamilyRoleEnum } from '@domain/authorization/common/value-objects/FamilyRoleEnum';
import { createMemberData, createTestFamily } from './Family.helpers';

describe('Family', () => {
  describe('isAdmin()', () => {
    describe('when the user is an admin', () => {
      it('should return true', () => {
        const family = createTestFamily({ creatorUserId: 1 });

        expect(family.isAdmin(1)).toBe(true);
      });
    });

    describe('when the user is a regular member', () => {
      it('should return false', () => {
        const family = createTestFamily();
        family.addMember(createMemberData({ userId: 2, role: FamilyRoleEnum.MEMBER }));

        expect(family.isAdmin(2)).toBe(false);
      });
    });

    describe('when the user is not a member', () => {
      it('should return false', () => {
        const family = createTestFamily();

        expect(family.isAdmin(999)).toBe(false);
      });
    });
  });

  describe('updateMemberRole()', () => {
    describe('when updating a member to admin', () => {
      it('should update the member role', () => {
        const family = createTestFamily();
        family.addMember(createMemberData({ userId: 2, role: FamilyRoleEnum.MEMBER }));

        family.updateMemberRole(2, FamilyRoleEnum.ADMIN);

        expect(family.isAdmin(2)).toBe(true);
      });
    });

    describe('when demoting an admin to member and another admin exists', () => {
      it('should update the member role', () => {
        const family = createTestFamily({ creatorUserId: 1 });
        family.addMember(createMemberData({ userId: 2, role: FamilyRoleEnum.ADMIN }));

        family.updateMemberRole(1, FamilyRoleEnum.MEMBER);

        expect(family.isAdmin(1)).toBe(false);
        expect(family.isAdmin(2)).toBe(true);
      });
    });

    describe('when demoting the last admin', () => {
      it('should throw an error', () => {
        const family = createTestFamily({ creatorUserId: 1 });

        expect(() => family.updateMemberRole(1, FamilyRoleEnum.MEMBER)).toThrow(
          'Cannot demote the last admin'
        );
      });
    });

    describe('when updating a non-existent member', () => {
      it('should throw an error', () => {
        const family = createTestFamily();

        expect(() => family.updateMemberRole(999, FamilyRoleEnum.ADMIN)).toThrow(
          'User 999 is not a member of this family'
        );
      });
    });
  });

  describe('getAdmins()', () => {
    describe('when the family has multiple admins', () => {
      it('should return all admin members', () => {
        const family = createTestFamily({ creatorUserId: 1 });
        family.addMember(createMemberData({ userId: 2, role: FamilyRoleEnum.ADMIN }));
        family.addMember(createMemberData({ userId: 3, role: FamilyRoleEnum.MEMBER }));

        const admins = family.getAdmins();

        expect(admins).toHaveLength(2);
        expect(admins.map(a => a.userId)).toContain(1);
        expect(admins.map(a => a.userId)).toContain(2);
        expect(admins.map(a => a.userId)).not.toContain(3);
      });
    });

    describe('when the family has only the creator admin', () => {
      it('should return only the creator', () => {
        const family = createTestFamily({ creatorUserId: 1 });

        const admins = family.getAdmins();

        expect(admins).toHaveLength(1);
        expect(admins[0].userId).toBe(1);
      });
    });
  });
});
