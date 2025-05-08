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

// all routes to /api/users, some for testing and further development
userRouter
  .route('/')
  // only logged in user can fetch the user list
  .get(authenticateToken, getUsers)
  .post(
    body('first_name').trim().isLength({min: 2, max: 50}).isAlphanumeric(),
    body('last_name').trim().isLength({min: 2, max: 50}).isAlphanumeric(),
    body('email').trim().isEmail(),
    body('phone_number').trim().isMobilePhone(),
    validationErrorHandler,
    addUser,
  );

// all routes to /api/users/:id for testing and further development
userRouter.route('/:id').get(getUserById).put(editUser).delete(deleteUser);

export default userRouter;
