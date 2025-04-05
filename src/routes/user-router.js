import express from 'express';
import {body} from 'express-validator';
import {
  addUser,
  deleteUser,
  editUser,
  getUserById,
  getUsers,
} from '../controllers/user-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import {validationErrorHandler} from '../middlewares/error-handler.js';
const userRouter = express.Router();

// all routes to /api/users
userRouter
  .route('/')
  // only logged in user can fetch the user list
  // TODO: add admin role check -Mei
  .get(authenticateToken, getUsers)
  //TODO: review functionality -Mei
  .post(
    body('first_name').trim().isLength({min: 2, max: 50}).isAlphanumeric(),
    body('last_name').trim().isLength({min: 2, max: 50}).isAlphanumeric(),
    body('email').trim().isEmail(),
    body('phone_number').trim().isMobilePhone(),
    validationErrorHandler,
    addUser,
  );

// TODO: check if needed -Mei
// all routes to /api/users/:id
userRouter.route('/:id').get(getUserById).put(editUser).delete(deleteUser);

export default userRouter;
