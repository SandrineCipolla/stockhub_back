export interface CollaboratorData {
  id: number;
  stockId: number;
  userId: number;
  userEmail: string;
  role: string;
  grantedAt: Date;
  grantedBy: number | null;
}

export interface ICollaboratorRepository {
  findByStockId(stockId: number): Promise<CollaboratorData[]>;
  findById(collaboratorId: number): Promise<CollaboratorData | null>;
  findUserByEmail(email: string): Promise<{ id: number } | null>;
  isCollaborator(stockId: number, userId: number): Promise<boolean>;
  add(stockId: number, userId: number, role: string, grantedBy: number): Promise<CollaboratorData>;
  updateRole(collaboratorId: number, newRole: string): Promise<CollaboratorData>;
  remove(collaboratorId: number): Promise<void>;
}
