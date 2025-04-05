import express from 'express';
// replaced with kubios login
//import {getMe, login} from '../controllers/auth-controller.js';
import {getMe, login} from '../controllers/kubios-auth-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';

const authRouter = express.Router();

/**
 * @apiDefine all No authentication needed.
 */

/**
 * @apiDefine token Logged in user access only
 * Valid authentication token must be provided within request.
 */

/**
 * @api {post} /api/auth/login User login
 * @apiName PostLogin
 * @apiGroup Authentication
 * @apiPermission all
 *
 * @apiBody {String} email User's email address
 * @apiBody {String} password User's password
 * @apiParamExample {json} Request-Example:
 *  {
 *    "email": "myemail@example.com",
 *    "password": "mypassword"
 *  }
 *
 * @apiSuccess {String} message Result of the request
 * @apiSuccess {Object} user User details
 * @apiSuccess {Number} user.user_id User ID
 * @apiSuccess {String} user.first_name User's first name
 * @apiSuccess {String} user.last_name User's last name
 * @apiSuccess {String} user.email User's email address
 * @apiSuccess {String} user.phone_number User's phone number
 * @apiSuccess {String} user.user_level User's access level (e.g., "admin", "user")
 * @apiSuccess {String} token Authentication token
 */
authRouter.post('/login', login);

/**
 * @api {get} /api/auth/me Request information about the current user
 * @apiName GetMe
 * @apiGroup Authentication
 * @apiPermission token
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {Object} user User info.
 * @apiSuccess {Number} user.user_id User ID.
 * @apiSuccess {String} user.first_name User's first name.
 * @apiSuccess {String} user.last_name User's last name.
 * @apiSuccess {String} user.email User's email address.
 * @apiSuccess {String} user.phone_number User's phone number.
 * @apiSuccess {String} user.user_level User's access level (e.g., "admin", "user").
 * @apiSuccess {Number} user.iat Token creation timestamp.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user_id": 21,
 *       "first_name": "John",
 *       "last_name": "Doe",
 *       "email": "johnd@example.com",
 *       "phone_number": "123456789",
 *       "user_level": "user",
 *       "iat": 1701279021
 *     }
 *
 * @apiError InvalidToken Authentication token was invalid.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "invalid token"
 *     }
 */
authRouter.get('/me/', authenticateToken, getMe);

export default authRouter;
