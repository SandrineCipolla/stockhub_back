import { StockRoleEnum } from '@domain/authorization/common/value-objects/StockRoleEnum';

/**
 * Roles that can be granted to a collaborator (OWNER is never granted via this API)
 */
const GRANTABLE_ROLES: Record<string, StockRoleEnum[]> = {
  [StockRoleEnum.OWNER]: [
    StockRoleEnum.EDITOR,
    StockRoleEnum.VIEWER,
    StockRoleEnum.VIEWER_CONTRIBUTOR,
  ],
  [StockRoleEnum.EDITOR]: [StockRoleEnum.VIEWER, StockRoleEnum.VIEWER_CONTRIBUTOR],
};

/**
 * Check if the granter is allowed to assign/act on the given target role
 * OWNER can manage EDITOR, VIEWER, VIEWER_CONTRIBUTOR
 * EDITOR can manage VIEWER, VIEWER_CONTRIBUTOR only
 */
export function canActOnRole(granterRole: string, targetRole: string): boolean {
  const allowed = GRANTABLE_ROLES[granterRole];
  return allowed !== undefined && allowed.includes(targetRole as StockRoleEnum);
}
