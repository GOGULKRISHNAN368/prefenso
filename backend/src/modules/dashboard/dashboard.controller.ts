import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as service from './dashboard.service';
export const adminDashboard = asyncHandler(async (_req, res) => sendSuccess(res, await service.dashboard(), 'Dashboard loaded'));
export const watchmanDashboard = asyncHandler(async (req, res) => sendSuccess(res, await service.dashboard(req.user!.blockId!), 'Dashboard loaded'));
