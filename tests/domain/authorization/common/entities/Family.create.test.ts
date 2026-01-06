import { Family } from '@domain/authorization/common/entities/Family';
import { FamilyRoleEnum } from '@domain/authorization/common/value-objects/FamilyRoleEnum';

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
});
