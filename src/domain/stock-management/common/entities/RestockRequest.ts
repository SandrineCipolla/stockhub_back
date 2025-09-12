export class RestockRequest {
    constructor(
        public readonly id: number,
        public readonly stockId: number,
        public readonly itemId: number,
        public readonly requestedBy: string,
        public readonly requestedQuantity: number,
        public readonly reason: string | null,
        public readonly status: RestockRequestStatus,
        public readonly createdAt: Date,
        public readonly approvedBy: string | null = null,
        public readonly approvedAt: Date | null = null
    ) {
    }

    isApproved(): boolean {
        return this.status === RestockRequestStatus.APPROVED;
    }

    isRejected(): boolean {
        return this.status === RestockRequestStatus.REJECTED;
    }

    isPending(): boolean {
        return this.status === RestockRequestStatus.PENDING;
    }
}

export enum RestockRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface CreateRestockRequestData {
    stockId: number;
    itemId: number;
    requestedBy: string;
    requestedQuantity: number;
    reason?: string;
}