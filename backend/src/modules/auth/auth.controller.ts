import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { login, logout, refresh } from './auth.service';

export const loginController = (portal: 'admin' | 'watchman') => asyncHandler(async (req, res) => sendSuccess(res, await login(portal, req.body.username, req.body.password, req, res), 'Signed in successfully'));
export const refreshController = (portal: 'admin' | 'watchman') => asyncHandler(async (req, res) => sendSuccess(res, await refresh(portal, req, res), 'Session refreshed'));
export const logoutController = (portal: 'admin' | 'watchman') => asyncHandler(async (req, res) => { await logout(portal, req, res); sendSuccess(res, null, 'Signed out'); });
export const meController = asyncHandler(async (req, res) => sendSuccess(res, req.user, 'Current user'));
