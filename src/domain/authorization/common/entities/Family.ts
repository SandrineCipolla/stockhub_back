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

export interface FamilyMemberData {
  id: number;
  userId: number;
  role: FamilyRoleEnum;
  joinedAt: Date;
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
    return {
      id: 0,
      userId,
      role: FamilyRoleEnum.ADMIN,
      joinedAt: new Date(),
    };
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

    const role = new FamilyRole(member.role);

    // Prevent removing the last admin
    if (role.isAdmin() && this.getAdmins().length === 1) {
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

    const role = new FamilyRole(member.role);
    return role.isAdmin();
  }

  updateMemberRole(userId: number, newRole: FamilyRoleEnum): void {
    const member = this.getMember(userId);

    if (!member) {
      throw new UserNotMemberError(userId);
    }

    const currentRole = new FamilyRole(member.role);

    // Prevent demoting the last admin
    if (
      currentRole.isAdmin() &&
      newRole !== FamilyRoleEnum.ADMIN &&
      this.getAdmins().length === 1
    ) {
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
