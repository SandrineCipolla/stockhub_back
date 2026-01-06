import { StockRoleEnum } from './StockRoleEnum';

export class StockRole {
  private readonly value: StockRoleEnum;

  constructor(role: string) {
    if (!Object.values(StockRoleEnum).includes(role as StockRoleEnum)) {
      throw new Error(
        `Invalid stock role: ${role}. Must be one of: ${Object.values(StockRoleEnum).join(', ')}`
      );
    }

    this.value = role as StockRoleEnum;
  }

  public getValue(): StockRoleEnum {
    return this.value;
  }

  public isOwner(): boolean {
    return this.value === StockRoleEnum.OWNER;
  }

  public isEditor(): boolean {
    return this.value === StockRoleEnum.EDITOR;
  }

  public isViewer(): boolean {
    return this.value === StockRoleEnum.VIEWER;
  }

  public isViewerContributor(): boolean {
    return this.value === StockRoleEnum.VIEWER_CONTRIBUTOR;
  }

  public canWrite(): boolean {
    return this.value === StockRoleEnum.OWNER || this.value === StockRoleEnum.EDITOR;
  }

  public canRead(): boolean {
    return true; // All roles can read
  }

  public canSuggest(): boolean {
    return (
      this.value === StockRoleEnum.VIEWER_CONTRIBUTOR ||
      this.value === StockRoleEnum.OWNER ||
      this.value === StockRoleEnum.EDITOR
    );
  }

  /**
   * Check if the role has the required permission
   * @param permission - Required permission (read, write, suggest)
   * @returns true if the role has the required permission
   */
  public hasRequiredPermission(permission: 'read' | 'write' | 'suggest'): boolean {
    switch (permission) {
      case 'read':
        return this.canRead();
      case 'write':
        return this.canWrite();
      case 'suggest':
        return this.canSuggest();
      default:
        return false;
    }
  }

  public static createOwner(): StockRole {
    return new StockRole(StockRoleEnum.OWNER);
  }

  public static createEditor(): StockRole {
    return new StockRole(StockRoleEnum.EDITOR);
  }

  public static createViewer(): StockRole {
    return new StockRole(StockRoleEnum.VIEWER);
  }

  public static createViewerContributor(): StockRole {
    return new StockRole(StockRoleEnum.VIEWER_CONTRIBUTOR);
  }

  public equals(other: StockRole): boolean {
    return this.value === other.value;
  }
}
