import { FamilyRole } from '../value-objects/FamilyRole';
import { FamilyRoleEnum } from '../value-objects/FamilyRoleEnum';
import {
  FamilyNameEmptyError,
  FamilyNameTooShortError,
  FamilyNameTooLongError,
  InvalidCreatorUserIdError,
  UserAlreadyMemberError,
  UserNotMemberError,
  LastAdminError,
} from '../errors/FamilyErrors';

/**
 * Value Object representing a family member with their role
 * Encapsulates member data and role-related behavior
 */
export class FamilyMemberData {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public role: FamilyRoleEnum, // Mutable to allow role updates
    public readonly joinedAt: Date
  ) {}

  /**
   * Check if this member has the ADMIN role
   * @returns true if member is an admin
   */
  isAdmin(): boolean {
    return this.role === FamilyRoleEnum.ADMIN;
  }

  /**
   * Get the full FamilyRole Value Object for this member
   * @returns FamilyRole instance
   */
  getRole(): FamilyRole {
    return new FamilyRole(this.role);
  }
}

export class Family {
  constructor(
    public readonly id: number,
    public name: string,
    public readonly createdAt: Date,
    public members: FamilyMemberData[] = []
  ) {}

  /**
   * Create an admin member data object
   * @param userId - User ID to create as admin
   * @returns FamilyMemberData with ADMIN role
   */
  private static createAdminMember(userId: number): FamilyMemberData {
    return new FamilyMemberData(0, userId, FamilyRoleEnum.ADMIN, new Date());
  }

  static create(params: { name: string; creatorUserId: number; id?: number }): Family {
    if (!params.name || params.name.trim() === '') {
      throw new FamilyNameEmptyError();
    }

    if (params.name.trim().length < 3) {
      throw new FamilyNameTooShortError(3);
    }

    if (params.name.trim().length > 255) {
      throw new FamilyNameTooLongError(255);
    }

    if (!params.creatorUserId || params.creatorUserId <= 0) {
      throw new InvalidCreatorUserIdError();
    }

    const family = new Family(params.id ?? 0, params.name.trim(), new Date(), []);

    // Add creator as ADMIN using factory method
    family.addMember(Family.createAdminMember(params.creatorUserId));

    return family;
  }

  addMember(memberData: FamilyMemberData): void {
    const existingMember = this.members.find(m => m.userId === memberData.userId);

    if (existingMember) {
      throw new UserAlreadyMemberError(memberData.userId);
    }

    this.members.push(memberData);
  }

  removeMember(userId: number): void {
    // Use getMember instead of findIndex to avoid duplication
    const member = this.getMember(userId);

    if (!member) {
      throw new UserNotMemberError(userId);
    }

    // Prevent removing the last admin
    if (member.isAdmin() && this.getAdmins().length === 1) {
      throw new LastAdminError('remove');
    }

    const index = this.members.indexOf(member);
    this.members.splice(index, 1);
  }

  getMember(userId: number): FamilyMemberData | undefined {
    return this.members.find(m => m.userId === userId);
  }

  isMember(userId: number): boolean {
    return this.members.some(m => m.userId === userId);
  }

  isAdmin(userId: number): boolean {
    const member = this.getMember(userId);
    if (!member) return false;

    return member.isAdmin();
  }

  updateMemberRole(userId: number, newRole: FamilyRoleEnum): void {
    const member = this.getMember(userId);

    if (!member) {
      throw new UserNotMemberError(userId);
    }

    // Prevent demoting the last admin
    if (member.isAdmin() && newRole !== FamilyRoleEnum.ADMIN && this.getAdmins().length === 1) {
      throw new LastAdminError('demote');
    }

    member.role = newRole;
  }

  getTotalMembers(): number {
    return this.members.length;
  }

  getAdmins(): FamilyMemberData[] {
    return this.members.filter(m => m.role === FamilyRoleEnum.ADMIN);
  }

  updateName(newName: string): void {
    if (!newName || newName.trim() === '') {
      throw new FamilyNameEmptyError();
    }

    if (newName.trim().length < 3) {
      throw new FamilyNameTooShortError(3);
    }

    if (newName.trim().length > 255) {
      throw new FamilyNameTooLongError(255);
    }

    this.name = newName.trim();
  }
}
