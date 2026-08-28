import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as service from './report.service';
export const summary = asyncHandler(async (req, res) => sendSuccess(res, await service.summary(req.query as Record<string, unknown>), 'Report summary loaded'));
export const trend = asyncHandler(async (req, res) => sendSuccess(res, await service.trend(req.query as Record<string, unknown>), 'Visitor trend loaded'));
export const blockSummary = asyncHandler(async (req, res) => sendSuccess(res, await service.blockSummary(req.query as Record<string, unknown>), 'Block summary loaded'));
export const exportReport = asyncHandler(async (req, res) => { res.type('text/csv').setHeader('Content-Disposition', 'attachment; filename="visitor-report.csv"').send(await service.exportCsv(req.query as Record<string, unknown>)); });
