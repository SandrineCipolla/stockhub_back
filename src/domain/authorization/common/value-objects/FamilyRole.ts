export enum FamilyRoleEnum {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class FamilyRole {
  private readonly value: FamilyRoleEnum;

  constructor(role: string) {
    if (!Object.values(FamilyRoleEnum).includes(role as FamilyRoleEnum)) {
      throw new Error(
        `Invalid family role: ${role}. Must be one of: ${Object.values(FamilyRoleEnum).join(', ')}`
      );
    }

    this.value = role as FamilyRoleEnum;
  }

  public getValue(): FamilyRoleEnum {
    return this.value;
  }

  public isAdmin(): boolean {
    return this.value === FamilyRoleEnum.ADMIN;
  }

  public isMember(): boolean {
    return this.value === FamilyRoleEnum.MEMBER;
  }

  public static createAdmin(): FamilyRole {
    return new FamilyRole(FamilyRoleEnum.ADMIN);
  }

  public static createMember(): FamilyRole {
    return new FamilyRole(FamilyRoleEnum.MEMBER);
  }

  public equals(other: FamilyRole): boolean {
    return this.value === other.value;
  }
}
