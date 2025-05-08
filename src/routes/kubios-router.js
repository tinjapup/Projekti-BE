import express from 'express';
import {authenticateToken} from '../middlewares/authentication.js';
import {getUserData, getUserInfo} from '../controllers/kubios-controller.js';

const kubiosRouter = express.Router();

/**
 * @api {get} /api/kubios-data/user-data Get Kubios user data
 * @apiName GetUserData
 * @apiGroup Kubios
 * @apiPermission token
 *
 * @apiDescription Fetches user data from the Kubios API for the authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {Object} data User data from Kubios.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {
 *         "heart_rate": 72,
 *         "stress_level": "low",
 *         ...
 *       }
 *     }
 *
 * @apiError InvalidToken The provided token is invalid or expired.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Invalid token"
 *     }
 */
kubiosRouter.get('/user-data', authenticateToken, getUserData);

/**
 * @api {get} /api/kubios-data/user-info Get Kubios user info
 * @apiName GetUserInfo
 * @apiGroup Kubios
 * @apiPermission token
 *
 * @apiDescription Fetches user information from the Kubios API for the authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {Object} user User information from Kubios.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *         "first_name": "John",
 *         "last_name": "Doe",
 *         "email": "johndoe@example.com",
 *         ...
 *       }
 *     }
 *
 * @apiError InvalidToken The provided token is invalid or expired.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Invalid token"
 *     }
 */
kubiosRouter.get('/user-info', authenticateToken, getUserInfo);

export default kubiosRouter;
