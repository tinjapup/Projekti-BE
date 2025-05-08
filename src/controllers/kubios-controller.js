import 'dotenv/config';
import fetch from 'node-fetch';
// import {customError} from '../middlewares/error-handler.js';

// Kubios API base URL should be set in .env
const baseUrl = process.env.KUBIOS_API_URI;

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
const getUserData = async (req, res, next) => {
  const {kubiosIdToken} = req.user;
  const headers = new Headers();
  headers.append('User-Agent', process.env.KUBIOS_USER_AGENT);
  headers.append('Authorization', kubiosIdToken);

  const response = await fetch(
    // for testing and further development, set the from date in request parameters
    baseUrl + '/result/self?from=2024-01-01T00%3A00%3A00%2B00%3A00',
    {
      method: 'GET',
      headers: headers,
    },
  );
  const results = await response.json();

  // manipulate data if required

  return res.json(results);
};

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
const getUserInfo = async (req, res, next) => {
  const {kubiosIdToken} = req.user;
  const headers = new Headers();
  headers.append('User-Agent', process.env.KUBIOS_USER_AGENT);
  headers.append('Authorization', kubiosIdToken);

  const response = await fetch(baseUrl + '/user/self', {
    method: 'GET',
    headers: headers,
  });
  const userInfo = await response.json();
  return res.json(userInfo);
};

export {getUserData, getUserInfo};
