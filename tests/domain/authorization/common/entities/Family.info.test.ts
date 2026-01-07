import { createMemberData, createTestFamily } from './Family.helpers';

describe('Family', () => {
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
