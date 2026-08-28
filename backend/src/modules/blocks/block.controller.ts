import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as service from './block.service';

export const listBlocks = asyncHandler(async (_req, res) => sendSuccess(res, await service.listBlocks(), 'Blocks loaded'));
export const getBlock = asyncHandler(async (req, res) => sendSuccess(res, await service.getBlock(String(req.params.blockId)), 'Block loaded'));
export const createBlock = asyncHandler(async (req, res) => sendSuccess(res, await service.createBlock(req.body, req.user!.id, req.ip), 'Block created', 201));
export const updateBlock = asyncHandler(async (req, res) => sendSuccess(res, await service.updateBlock(String(req.params.blockId), req.body, req.user!.id, req.ip), 'Block updated'));
export const configureCredentials = asyncHandler(async (req, res) => sendSuccess(res, await service.configureCredentials(String(req.params.blockId), req.body, req.user!.id, req.ip), 'Watchman credentials saved'));
export const resetPassword = asyncHandler(async (req, res) => sendSuccess(res, await service.resetPassword(String(req.params.blockId), req.body.password, req.user!.id, req.ip), 'Watchman password reset'));
export const setStatus = asyncHandler(async (req, res) => sendSuccess(res, await service.setBlockStatus(String(req.params.blockId), req.body.isActive, req.user!.id, req.ip), 'Block status updated'));
