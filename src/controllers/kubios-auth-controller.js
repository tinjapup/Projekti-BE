/**
 * Authentication resource controller using Kubios API for login
 * @module controllers/auth-controller
 * @requires jsonwebtoken
 * @requires bcryptjs
 * @requires dotenv
 * @requires models/user-model
 * @requires middlewares/error-handler
 * @exports postLogin
 * @exports getMe
 */

import 'dotenv/config';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import {v4} from 'uuid';
import {customError} from '../middlewares/error-handler.js';
import {
  insertUser,
  selectUserByEmail,
  selectUserById,
} from '../models/user-model.js';

// Kubios API base URL should be set in .env
const baseUrl = process.env.KUBIOS_API_URI;

/**
 * @api {post} /api/auth/login Login with Kubios
 * @apiName PostLogin
 * @apiGroup Authentication
 * @apiPermission all
 *
 * @apiDescription Authenticates the user using Kubios API and synchronizes the user with the local database.
 *
 * @apiBody {String} username User's Kubios username.
 * @apiBody {String} password User's Kubios password.
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Object} user User details from Kubios.
 * @apiSuccess {Number} user_id User ID in the local database.
 * @apiSuccess {String} token Authentication token for accessing protected endpoints.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Logged in successfully with Kubios",
 *       "user": {
 *         "given_name": "John",
 *         "family_name": "Doe",
 *         "email": "johndoe@example.com"
 *       },
 *       "user_id": 1,
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 *
 * @apiError InvalidCredentials The username or password provided is incorrect.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Login with Kubios failed due bad username/password"
 *     }
 *
 * @apiError InternalServerError An error occurred during the login process.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Login with Kubios failed"
 *     }
 */
const postLogin = async (req, res, next) => {
  const {username, password} = req.body;
  try {
    const kubiosIdToken = await kubiosLogin(username, password);
    const kubiosUser = await kubiosUserInfo(kubiosIdToken);
    const localUserId = await syncWithLocalUser(kubiosUser);
    const token = jwt.sign(
      {userId: localUserId, kubiosIdToken},
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    return res.json({
      message: 'Logged in successfully with Kubios',
      user: kubiosUser,
      user_id: localUserId,
      token,
    });
  } catch (err) {
    console.error('Kubios login error', err);
    return next(err);
  }
};

/**
 * @api {get} /api/auth/me Get authenticated user's data
 * @apiName GetMe
 * @apiGroup Authentication
 * @apiPermission token
 *
 * @apiDescription Retrieves the details of the currently authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {Object} user User details from the local database.
 * @apiSuccess {String} kubios_token Kubios authentication token.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *         "user_id": 1,
 *         "first_name": "John",
 *         "last_name": "Doe",
 *         "email": "johndoe@example.com"
 *       },
 *       "kubios_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 *
 * @apiError InvalidToken The provided token is invalid or expired.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Invalid token"
 *     }
 */
const getMe = async (req, res) => {
  const user = await selectUserById(req.user.userId);
  res.json({user, kubios_token: req.user.kubiosIdToken});
};

export {postLogin as login, getMe};
