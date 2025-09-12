import {PrismaClient} from "@prisma/client";
import {IRestockRequestRepository} from "../../domain/stock-management/visualization/queries/IRestockRequestRepository";
import {
    CreateRestockRequestData,
    RestockRequest,
    RestockRequestStatus
} from "../../domain/stock-management/common/entities/RestockRequest";
import {rootMain} from "../../Utils/logger";

const prisma = new PrismaClient();

export class PrismaRestockRequestRepository implements IRestockRequestRepository {

    async create(data: CreateRestockRequestData): Promise<RestockRequest> {
        try {
            const createdRequest = await prisma.restock_requests.create({
                data: {
                    STOCK_ID: data.stockId,
                    ITEM_ID: data.itemId,
                    REQUESTED_BY: data.requestedBy,
                    REQUESTED_QUANTITY: data.requestedQuantity,
                    REASON: data.reason || null,
                    STATUS: RestockRequestStatus.PENDING
                },
                include: {
                    stock: true,
                    item: true
                }
            });

            return this.mapPrismaToEntity(createdRequest);
        } catch (error) {
            rootMain.error('Error creating restock request:', error);
            throw new Error('Failed to create restock request');
        }
    }

    async findByUser(userEmail: string): Promise<RestockRequest[]> {
        try {
            const requests = await prisma.restock_requests.findMany({
                where: {
                    REQUESTED_BY: userEmail
                },
                include: {
                    stock: true,
                    item: true
                },
                orderBy: {
                    CREATED_AT: 'desc'
                }
            });

            return requests.map(request => this.mapPrismaToEntity(request));
        } catch (error) {
            rootMain.error('Error fetching user restock requests:', error);
            throw new Error('Failed to fetch user restock requests');
        }
    }

    async findAll(): Promise<RestockRequest[]> {
        try {
            const requests = await prisma.restock_requests.findMany({
                include: {
                    stock: true,
                    item: true
                },
                orderBy: {
                    CREATED_AT: 'desc'
                }
            });

            return requests.map(request => this.mapPrismaToEntity(request));
        } catch (error) {
            rootMain.error('Error fetching all restock requests:', error);
            throw new Error('Failed to fetch restock requests');
        }
    }

    async findById(requestId: number): Promise<RestockRequest | null> {
        try {
            const request = await prisma.restock_requests.findUnique({
                where: {
                    ID: requestId
                },
                include: {
                    stock: true,
                    item: true
                }
            });

            if (!request) {
                return null;
            }

            return this.mapPrismaToEntity(request);
        } catch (error) {
            rootMain.error('Error fetching restock request by ID:', error);
            throw new Error('Failed to fetch restock request');
        }
    }

    async updateStatus(
        requestId: number,
        status: RestockRequestStatus,
        approvedBy: string
    ): Promise<RestockRequest> {
        try {
            const updatedRequest = await prisma.restock_requests.update({
                where: {
                    ID: requestId
                },
                data: {
                    STATUS: status,
                    APPROVED_BY: approvedBy,
                    APPROVED_AT: new Date()
                },
                include: {
                    stock: true,
                    item: true
                }
            });

            return this.mapPrismaToEntity(updatedRequest);
        } catch (error) {
            rootMain.error('Error updating restock request status:', error);
            throw new Error('Failed to update restock request status');
        }
    }

    private mapPrismaToEntity(prismaRequest: any): RestockRequest {
        return new RestockRequest(
            prismaRequest.id,
            prismaRequest.stock_id,
            prismaRequest.item_id,
            prismaRequest.requested_by,
            prismaRequest.requested_quantity,
            prismaRequest.reason,
            prismaRequest.status as RestockRequestStatus,
            prismaRequest.created_at,
            prismaRequest.approved_by,
            prismaRequest.approved_at
        );
    }
}