import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as service from './visitor.service';

export const checkIn = asyncHandler(async (req, res) => sendSuccess(res, await service.checkIn(req.body, req.user!.id, req.user!.blockId!, req.ip), 'Visitor checked in successfully', 201));
export const checkOut = asyncHandler(async (req, res) => sendSuccess(res, await service.checkOut(String(req.params.visitorId), req.body.checkoutAt, req.user!.id, req.user!.blockId!, req.ip), 'Visitor checked out successfully'));
export const watchmanInside = asyncHandler(async (req, res) => sendSuccess(res, await service.inside(req.user!.blockId!), 'People inside loaded'));
export const watchmanHistory = asyncHandler(async (req, res) => { const result = await service.listVisitors(req.query as Record<string, unknown>, req.user!.blockId!); return sendSuccess(res, result.items, 'Visitor history loaded', 200, result.meta); });
export const visitorDetail = asyncHandler(async (req, res) => sendSuccess(res, await service.getVisitor(String(req.params.visitorId), req.user!.blockId!), 'Visitor loaded'));
export const adminVisitors = asyncHandler(async (req, res) => { const result = await service.listVisitors(req.query as Record<string, unknown>, typeof req.query.blockId === 'string' ? req.query.blockId : undefined); return sendSuccess(res, result.items, 'Visitors loaded', 200, result.meta); });
export const adminInside = asyncHandler(async (req, res) => sendSuccess(res, await service.inside(typeof req.query.blockId === 'string' ? req.query.blockId : undefined), 'People inside loaded'));
export const adminDetail = asyncHandler(async (req, res) => sendSuccess(res, await service.getVisitor(String(req.params.visitorId)), 'Visitor loaded'));
