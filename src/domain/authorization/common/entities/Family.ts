import { FamilyRole, FamilyRoleEnum } from '../value-objects/FamilyRole';

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

  static create(params: { name: string; creatorUserId: number; id?: number }): Family {
    if (!params.name || params.name.trim() === '') {
      throw new Error('Family name cannot be empty');
    }

    if (params.name.trim().length < 3) {
      throw new Error('Family name must be at least 3 characters');
    }

    if (params.name.trim().length > 255) {
      throw new Error('Family name must not exceed 255 characters');
    }

    if (!params.creatorUserId || params.creatorUserId <= 0) {
      throw new Error('Creator user ID must be valid');
    }

    const family = new Family(params.id ?? 0, params.name.trim(), new Date(), []);

    // Add creator as ADMIN
    family.addMember({
      id: 0,
      userId: params.creatorUserId,
      role: FamilyRoleEnum.ADMIN,
      joinedAt: new Date(),
    });

    return family;
  }

  addMember(memberData: FamilyMemberData): void {
    const existingMember = this.members.find(m => m.userId === memberData.userId);

    if (existingMember) {
      throw new Error(`User ${memberData.userId} is already a member of this family`);
    }

    this.members.push(memberData);
  }

  removeMember(userId: number): void {
    const index = this.members.findIndex(m => m.userId === userId);

    if (index === -1) {
      throw new Error(`User ${userId} is not a member of this family`);
    }

    const member = this.members[index];
    const role = new FamilyRole(member.role);

    // Prevent removing the last admin
    if (role.isAdmin()) {
      const adminCount = this.members.filter(m => m.role === FamilyRoleEnum.ADMIN).length;
      if (adminCount === 1) {
        throw new Error('Cannot remove the last admin from the family');
      }
    }

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
      throw new Error(`User ${userId} is not a member of this family`);
    }

    const currentRole = new FamilyRole(member.role);

    // Prevent demoting the last admin
    if (currentRole.isAdmin() && newRole !== FamilyRoleEnum.ADMIN) {
      const adminCount = this.members.filter(m => m.role === FamilyRoleEnum.ADMIN).length;
      if (adminCount === 1) {
        throw new Error('Cannot demote the last admin');
      }
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
      throw new Error('Family name cannot be empty');
    }

    if (newName.trim().length < 3) {
      throw new Error('Family name must be at least 3 characters');
    }

    if (newName.trim().length > 255) {
      throw new Error('Family name must not exceed 255 characters');
    }

    this.name = newName.trim();
  }
}
