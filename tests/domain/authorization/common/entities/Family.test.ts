import { Family, FamilyMemberData } from '@domain/authorization/common/entities/Family';
import { FamilyRoleEnum } from '@domain/authorization/common/value-objects/FamilyRole';

// Test helper to create a test family
const createTestFamily = (overrides?: { name?: string; creatorUserId?: number }) => {
  return Family.create({
    name: overrides?.name ?? 'Test Family',
    creatorUserId: overrides?.creatorUserId ?? 1,
  });
};

// Test helper to create member data
const createMemberData = (overrides?: {
  id?: number;
  userId?: number;
  role?: FamilyRoleEnum;
  joinedAt?: Date;
}): FamilyMemberData => {
  return {
    id: overrides?.id ?? 0,
    userId: overrides?.userId ?? 2,
    role: overrides?.role ?? FamilyRoleEnum.MEMBER,
    joinedAt: overrides?.joinedAt ?? new Date(),
  };
};

describe('Family', () => {
  describe('create()', () => {
    describe('when creating with valid parameters', () => {
      it('should create a family with the creator as ADMIN', () => {
        const family = Family.create({
          name: 'My Family',
          creatorUserId: 123,
        });

        expect(family.name).toBe('My Family');
        expect(family.members).toHaveLength(1);
        expect(family.members[0].userId).toBe(123);
        expect(family.members[0].role).toBe(FamilyRoleEnum.ADMIN);
      });

      it('should trim the family name', () => {
        const family = Family.create({
          name: '  My Family  ',
          creatorUserId: 1,
        });

        expect(family.name).toBe('My Family');
      });
    });

    describe('when name is empty', () => {
      it('should throw an error', () => {
        expect(() =>
          Family.create({
            name: '',
            creatorUserId: 1,
          })
        ).toThrow('Family name cannot be empty');
      });
    });

    describe('when name has only spaces', () => {
      it('should throw an error', () => {
        expect(() =>
          Family.create({
            name: '   ',
            creatorUserId: 1,
          })
        ).toThrow('Family name cannot be empty');
      });
    });

    describe('when name is shorter than 3 characters', () => {
      it('should throw an error', () => {
        expect(() =>
          Family.create({
            name: 'AB',
            creatorUserId: 1,
          })
        ).toThrow('Family name must be at least 3 characters');
      });
    });

    describe('when name exceeds 255 characters', () => {
      it('should throw an error', () => {
        const longName = 'A'.repeat(256);
        expect(() =>
          Family.create({
            name: longName,
            creatorUserId: 1,
          })
        ).toThrow('Family name must not exceed 255 characters');
      });
    });

    describe('when creator user ID is zero', () => {
      it('should throw an error', () => {
        expect(() =>
          Family.create({
            name: 'Test Family',
            creatorUserId: 0,
          })
        ).toThrow('Creator user ID must be valid');
      });
    });

    describe('when creator user ID is negative', () => {
      it('should throw an error', () => {
        expect(() =>
          Family.create({
            name: 'Test Family',
            creatorUserId: -1,
          })
        ).toThrow('Creator user ID must be valid');
      });
    });
  });

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

  describe('getTotalMembers()', () => {
    describe('when the family has multiple members', () => {
      it('should return the correct number of members', () => {
        const family = createTestFamily();
        family.addMember(createMemberData({ userId: 2 }));
        family.addMember(createMemberData({ userId: 3 }));

        expect(family.getTotalMembers()).toBe(3);
      });
    });

    describe('when the family has only the creator', () => {
      it('should return 1', () => {
        const family = createTestFamily();

        expect(family.getTotalMembers()).toBe(1);
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

  describe('updateName()', () => {
    describe('when updating with a valid name', () => {
      it('should update the family name', () => {
        const family = createTestFamily({ name: 'Old Name' });

        family.updateName('New Name');

        expect(family.name).toBe('New Name');
      });

      it('should trim the new name', () => {
        const family = createTestFamily();

        family.updateName('  New Name  ');

        expect(family.name).toBe('New Name');
      });
    });

    describe('when updating with an empty name', () => {
      it('should throw an error', () => {
        const family = createTestFamily();

        expect(() => family.updateName('')).toThrow('Family name cannot be empty');
      });
    });

    describe('when updating with a name with only spaces', () => {
      it('should throw an error', () => {
        const family = createTestFamily();

        expect(() => family.updateName('   ')).toThrow('Family name cannot be empty');
      });
    });

    describe('when updating with a name shorter than 3 characters', () => {
      it('should throw an error', () => {
        const family = createTestFamily();

        expect(() => family.updateName('AB')).toThrow('Family name must be at least 3 characters');
      });
    });

    describe('when updating with a name exceeding 255 characters', () => {
      it('should throw an error', () => {
        const family = createTestFamily();
        const longName = 'A'.repeat(256);

        expect(() => family.updateName(longName)).toThrow(
          'Family name must not exceed 255 characters'
        );
      });
    });
  });
});
