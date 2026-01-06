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
  return {
    id: overrides?.id ?? 0,
    userId: overrides?.userId ?? 2,
    role: overrides?.role ?? FamilyRoleEnum.MEMBER,
    joinedAt: overrides?.joinedAt ?? new Date(),
  };
};
