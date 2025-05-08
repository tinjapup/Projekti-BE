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

/**
 * @api {post} /api/auth/login User Login
 * @apiName PostLogin
 * @apiGroup Authentication
 * @apiPermission all
 *
 * @apiDescription Authenticates a user with Kubios credentials and returns a JWT token for further API access.
 *
 * @apiBody {String} username The username of the user.
 * @apiBody {String} password The password of the user.
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Object} user User details fetched from Kubios.
 * @apiSuccess {String} user.first_name User's first name.
 * @apiSuccess {String} user.last_name User's last name.
 * @apiSuccess {String} user.email User's email address.
 * @apiSuccess {Number} user_id Local user ID.
 * @apiSuccess {String} token JWT token for authentication.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Logged in successfully with Kubios",
 *       "user": {
 *         "first_name": "John",
 *         "last_name": "Doe",
 *         "email": "johndoe@example.com"
 *       },
 *       "user_id": 123,
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 *
 * @apiError InvalidCredentials The provided username or password is incorrect.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Login with Kubios failed due bad username/password"
 *     }
 *
 * @apiError ServerError An internal server error occurred.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Login with Kubios failed"
 *     }
 */

/**
 * @api {get} /api/auth/me Get Current User
 * @apiName GetMe
 * @apiGroup Authentication
 * @apiPermission token
 *
 * @apiDescription Fetches the details of the currently authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {Object} user User details from the local database.
 * @apiSuccess {String} user.first_name User's first name.
 * @apiSuccess {String} user.last_name User's last name.
 * @apiSuccess {String} user.email User's email address.
 * @apiSuccess {String} kubios_token The Kubios ID token.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *         "first_name": "John",
 *         "last_name": "Doe",
 *         "email": "johndoe@example.com"
 *       },
 *       "kubios_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 *
 * @apiError Unauthorized The provided token is invalid or expired.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid token"
 *     }
 */

// Kubios API base URL should be set in .env
const baseUrl = process.env.KUBIOS_API_URI;

const kubiosLogin = async (username, password) => {
  const csrf = v4();
  const headers = new Headers();
  headers.append('Cookie', `XSRF-TOKEN=${csrf}`);
  headers.append('User-Agent', process.env.KUBIOS_USER_AGENT);
  const searchParams = new URLSearchParams();
  searchParams.set('username', username);
  searchParams.set('password', password);
  searchParams.set('client_id', process.env.KUBIOS_CLIENT_ID);
  searchParams.set('redirect_uri', process.env.KUBIOS_REDIRECT_URI);
  searchParams.set('response_type', 'token');
  searchParams.set('scope', 'openid');
  searchParams.set('_csrf', csrf);

  const options = {
    method: 'POST',
    headers: headers,
    redirect: 'manual',
    body: searchParams,
  };
  let response;
  try {
    response = await fetch(process.env.KUBIOS_LOGIN_URL, options);
  } catch (err) {
    console.error('Kubios login error', err);
    throw customError('Login with Kubios failed', 500);
  }
  const location = response.headers.raw().location[0];
  console.log(location);
  // If login fails, location contains 'login?null'
  if (location.includes('login?null')) {
    throw customError(
      'Login with Kubios failed due bad username/password',
      401,
    );
  }
  // If login success, Kubios response location header
  // contains id_token, access_token and expires_in
  const regex = /id_token=(.*)&access_token=(.*)&expires_in=(.*)/;
  const match = location.match(regex);
  const idToken = match[1];
  return idToken;
};

const kubiosUserInfo = async (idToken) => {
  const headers = new Headers();
  headers.append('User-Agent', process.env.KUBIOS_USER_AGENT);
  headers.append('Authorization', idToken);
  const response = await fetch(baseUrl + '/user/self', {
    method: 'GET',
    headers: headers,
  });
  const responseJson = await response.json();
  if (responseJson.status === 'ok') {
    return responseJson.user;
  } else {
    throw customError('Kubios user info failed', 500);
  }
};

const syncWithLocalUser = async (kubiosUser) => {
  // Check if user exists in local db
  let userId;
  const result = await selectUserByEmail(kubiosUser.email);
  // If user with the email not found, create new user, otherwise use existing
  if (result.error) {
    // Create user
    //TODO: ask for phone number
    const phoneNumber = `040${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newUser = {
      first_name: kubiosUser.given_name,
      last_name: kubiosUser.family_name,
      email: kubiosUser.email,
      reminder_email: kubiosUser.email,
      phone_number: phoneNumber,
    };
    const newUserResult = await insertUser(newUser);
    userId = newUserResult;
  } else {
    console.log('User already exists', result);
    userId = result.user_id;
  }
  console.log('syncWithLocalUser userId', userId);
  return userId;
};

const postLogin = async (req, res, next) => {
  const {username, password} = req.body;
  // console.log('login', req.body);
  try {
    // Try to login with Kubios
    const kubiosIdToken = await kubiosLogin(username, password);
    const kubiosUser = await kubiosUserInfo(kubiosIdToken);
    const localUserId = await syncWithLocalUser(kubiosUser);
    // Include kubiosIdToken in the auth token used in this app
    // Expiration time of the Kubios token is 1h
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

const getMe = async (req, res) => {
  const user = await selectUserById(req.user.userId);
  res.json({user, kubios_token: req.user.kubiosIdToken});
};

export {postLogin as login, getMe};
