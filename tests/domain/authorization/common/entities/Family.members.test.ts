import { FamilyRoleEnum } from '@domain/authorization/common/value-objects/FamilyRoleEnum';
import { createMemberData, createTestFamily } from './Family.helpers';

describe('Family', () => {
  describe('addMember()', () => {
    describe('when adding a valid member', () => {
      it('should add the member to the family', () => {
        const family = createTestFamily();

        family.addMember(createMemberData({ userId: 2 }));

        expect(family.members).toHaveLength(2);
        expect(family.isMember(2)).toBe(true);
      });
    });

    describe('when adding a duplicate member', () => {
      it('should throw an error', () => {
        const family = createTestFamily();

        family.addMember(createMemberData({ userId: 2 }));

        expect(() => family.addMember(createMemberData({ userId: 2 }))).toThrow(
          'User 2 is already a member of this family'
        );
      });
    });
  });

  describe('removeMember()', () => {
    describe('when removing a regular member', () => {
      it('should remove the member from the family', () => {
        const family = createTestFamily();
        family.addMember(createMemberData({ userId: 2, role: FamilyRoleEnum.MEMBER }));

        family.removeMember(2);

        expect(family.members).toHaveLength(1);
        expect(family.isMember(2)).toBe(false);
      });
    });

    describe('when removing a non-existent member', () => {
      it('should throw an error', () => {
        const family = createTestFamily();

        expect(() => family.removeMember(999)).toThrow('User 999 is not a member of this family');
      });
    });

    describe('when removing the last admin', () => {
      it('should throw an error', () => {
        const family = createTestFamily({ creatorUserId: 1 });

        expect(() => family.removeMember(1)).toThrow(
          'Cannot remove the last admin from the family'
        );
      });
    });

    describe('when removing an admin but another admin exists', () => {
      it('should successfully remove the admin', () => {
        const family = createTestFamily({ creatorUserId: 1 });
        family.addMember(createMemberData({ userId: 2, role: FamilyRoleEnum.ADMIN }));

        family.removeMember(1);

        expect(family.members).toHaveLength(1);
        expect(family.isMember(1)).toBe(false);
        expect(family.isMember(2)).toBe(true);
        expect(family.isAdmin(2)).toBe(true);
      });
    });
  });

  describe('getMember()', () => {
    describe('when the user is a member', () => {
      it('should return the member data', () => {
        const family = createTestFamily();
        family.addMember(createMemberData({ userId: 2, role: FamilyRoleEnum.MEMBER }));

        const member = family.getMember(2);

        expect(member).toBeDefined();
        expect(member?.userId).toBe(2);
        expect(member?.role).toBe(FamilyRoleEnum.MEMBER);
      });
    });

    describe('when the user is not a member', () => {
      it('should return undefined', () => {
        const family = createTestFamily();

        const member = family.getMember(999);

        expect(member).toBeUndefined();
      });
    });
  });

  describe('isMember()', () => {
    describe('when the user is a member', () => {
      it('should return true', () => {
        const family = createTestFamily({ creatorUserId: 1 });

        expect(family.isMember(1)).toBe(true);
      });
    });

    describe('when the user is not a member', () => {
      it('should return false', () => {
        const family = createTestFamily();

        expect(family.isMember(999)).toBe(false);
      });
    });
  });
});
