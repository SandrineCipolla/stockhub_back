import {IRestockRequestRepository} from "../../visualization/queries/IRestockRequestRepository";
import {IStockVisualizationRepository} from "../../visualization/queries/IStockVisualizationRepository";
import {CreateRestockRequestData, RestockRequest, RestockRequestStatus} from "../../common/entities/RestockRequest";

export class RestockRequestService {
    constructor(
        private restockRepository: IRestockRequestRepository,
        private stockRepository: IStockVisualizationRepository
    ) {
    }

    async createRestockRequest(data: CreateRestockRequestData): Promise<RestockRequest> {

        const stock = await this.stockRepository.getStockById(data.stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }

        const item = await this.stockRepository.getStockItemById(data.itemId);
        if (!item) {
            throw new Error("Stock item not found");
        }

        if (data.requestedQuantity <= 0) {
            throw new Error("Requested quantity must be positive");
        }

        return await this.restockRepository.create(data);
    }

    async getRestockRequestsByUser(userEmail: string): Promise<RestockRequest[]> {
        return await this.restockRepository.findByUser(userEmail);
    }

    async getAllRestockRequests(): Promise<RestockRequest[]> {
        return await this.restockRepository.findAll();
    }

    async approveRestockRequest(
        requestId: number,
        approvedBy: string,
        newQuantity?: number
    ): Promise<{ request: RestockRequest; stockUpdated: boolean }> {
        const request = await this.restockRepository.findById(requestId);
        if (!request) {
            throw new Error("Restock request not found");
        }

        if (!request.isPending()) {
            throw new Error("Request already processed");
        }


        const updatedRequest = await this.restockRepository.updateStatus(
            requestId,
            RestockRequestStatus.APPROVED,
            approvedBy
        );


        let stockUpdated = false;
        if (newQuantity !== undefined && newQuantity >= 0) {
            await this.stockRepository.updateStockItemQuantity(
                request.itemId,
                newQuantity
            );
            stockUpdated = true;
        }

        return {request: updatedRequest, stockUpdated};
    }

    async rejectRestockRequest(requestId: number, rejectedBy: string): Promise<RestockRequest> {
        const request = await this.restockRepository.findById(requestId);
        if (!request) {
            throw new Error("Restock request not found");
        }

        if (!request.isPending()) {
            throw new Error("Request already processed");
        }

        return await this.restockRepository.updateStatus(
            requestId,
            RestockRequestStatus.REJECTED,
            rejectedBy
        );
    }
}