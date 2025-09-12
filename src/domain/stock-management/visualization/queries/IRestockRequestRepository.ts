import {CreateRestockRequestData, RestockRequest, RestockRequestStatus} from "../../common/entities/RestockRequest";


export interface IRestockRequestRepository {
    create(data: CreateRestockRequestData): Promise<RestockRequest>;

    findByUser(userEmail: string): Promise<RestockRequest[]>;

    findAll(): Promise<RestockRequest[]>;

    findById(requestId: number): Promise<RestockRequest | null>;

    updateStatus(requestId: number, status: RestockRequestStatus, approvedBy: string): Promise<RestockRequest>;
}