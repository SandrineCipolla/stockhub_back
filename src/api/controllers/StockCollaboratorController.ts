import express from 'express';
import { AuthorizedRequest } from '@authorization/authorizeMiddleware';
import {
  AddCollaboratorRequest,
  UpdateCollaboratorRequest,
  RemoveCollaboratorRequest,
} from '@api/types/StockRequestTypes';
import { AddCollaboratorCommandHandler } from '@domain/authorization/collaboration/command-handlers/AddCollaboratorCommandHandler';
import { UpdateCollaboratorRoleCommandHandler } from '@domain/authorization/collaboration/command-handlers/UpdateCollaboratorRoleCommandHandler';
import { RemoveCollaboratorCommandHandler } from '@domain/authorization/collaboration/command-handlers/RemoveCollaboratorCommandHandler';
import { AddCollaboratorCommand } from '@domain/authorization/collaboration/commands/AddCollaboratorCommand';
import { UpdateCollaboratorRoleCommand } from '@domain/authorization/collaboration/commands/UpdateCollaboratorRoleCommand';
import { RemoveCollaboratorCommand } from '@domain/authorization/collaboration/commands/RemoveCollaboratorCommand';
import { ICollaboratorRepository } from '@domain/authorization/collaboration/repositories/ICollaboratorRepository';
import { HTTP_CODE_CREATED, HTTP_CODE_OK } from '@utils/httpCodes';
import { rootController } from '@utils/logger';

const logger = rootController.getChildCategory('StockCollaboratorController');

export class StockCollaboratorController {
  constructor(
    private readonly repository: ICollaboratorRepository,
    private readonly addHandler: AddCollaboratorCommandHandler,
    private readonly updateHandler: UpdateCollaboratorRoleCommandHandler,
    private readonly removeHandler: RemoveCollaboratorCommandHandler
  ) {}

  async listCollaborators(req: AuthorizedRequest, res: express.Response): Promise<void> {
    const stockId = parseInt(req.params.stockId, 10);

    try {
      const collaborators = await this.repository.findByStockId(stockId);
      res.status(HTTP_CODE_OK).json(collaborators);
    } catch (error) {
      logger.error('listCollaborators error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addCollaborator(
    req: AddCollaboratorRequest & AuthorizedRequest,
    res: express.Response
  ): Promise<void> {
    const stockId = parseInt(req.params.stockId, 10);
    const { email, role } = req.body;
    const granterEmail = req.userID;
    const granterRole = req.stockRole ?? '';

    if (!email || !role) {
      res.status(400).json({ error: 'email and role are required' });
      return;
    }

    try {
      const command = new AddCollaboratorCommand(stockId, granterEmail, granterRole, email, role);
      const collaborator = await this.addHandler.handle(command);
      res.status(HTTP_CODE_CREATED).json(collaborator);
    } catch (error) {
      const message = (error as Error).message;
      logger.error('addCollaborator error:', error);
      if (message.includes('Forbidden')) {
        res.status(403).json({ error: message });
      } else if (message.includes('not found') || message.includes('already a collaborator')) {
        res.status(400).json({ error: message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateCollaboratorRole(
    req: UpdateCollaboratorRequest & AuthorizedRequest,
    res: express.Response
  ): Promise<void> {
    const stockId = parseInt(req.params.stockId, 10);
    const collaboratorId = parseInt(req.params.collaboratorId, 10);
    const { role } = req.body;
    const granterRole = req.stockRole ?? '';

    if (isNaN(collaboratorId)) {
      res.status(400).json({ error: 'Invalid collaborator ID' });
      return;
    }

    if (!role) {
      res.status(400).json({ error: 'role is required' });
      return;
    }

    try {
      const command = new UpdateCollaboratorRoleCommand(stockId, collaboratorId, granterRole, role);
      const collaborator = await this.updateHandler.handle(command);
      res.status(HTTP_CODE_OK).json(collaborator);
    } catch (error) {
      const message = (error as Error).message;
      logger.error('updateCollaboratorRole error:', error);
      if (message.includes('Forbidden')) {
        res.status(403).json({ error: message });
      } else if (message.includes('not found')) {
        res.status(404).json({ error: message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async removeCollaborator(
    req: RemoveCollaboratorRequest & AuthorizedRequest,
    res: express.Response
  ): Promise<void> {
    const stockId = parseInt(req.params.stockId, 10);
    const collaboratorId = parseInt(req.params.collaboratorId, 10);
    const granterRole = req.stockRole ?? '';

    if (isNaN(collaboratorId)) {
      res.status(400).json({ error: 'Invalid collaborator ID' });
      return;
    }

    try {
      const command = new RemoveCollaboratorCommand(stockId, collaboratorId, granterRole);
      await this.removeHandler.handle(command);
      res.status(204).send();
    } catch (error) {
      const message = (error as Error).message;
      logger.error('removeCollaborator error:', error);
      if (message.includes('Forbidden')) {
        res.status(403).json({ error: message });
      } else if (message.includes('not found')) {
        res.status(404).json({ error: message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
