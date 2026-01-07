import { Family, FamilyMemberData } from '@domain/authorization/common/entities/Family';
import { FamilyRoleEnum } from '@domain/authorization/common/value-objects/FamilyRoleEnum';

/**
 * Test helper to create a test family
 */
export const createTestFamily = (overrides?: { name?: string; creatorUserId?: number }) => {
  return Family.create({
    name: overrides?.name ?? 'Test Family',
    creatorUserId: overrides?.creatorUserId ?? 1,
  });
};

/**
 * Test helper to create member data
 */
export const createMemberData = (overrides?: {
  id?: number;
  userId?: number;
  role?: FamilyRoleEnum;
  joinedAt?: Date;
}): FamilyMemberData => {
  return new FamilyMemberData(
    overrides?.id ?? 0,
    overrides?.userId ?? 2,
    overrides?.role ?? FamilyRoleEnum.MEMBER,
    overrides?.joinedAt ?? new Date()
  );
};
