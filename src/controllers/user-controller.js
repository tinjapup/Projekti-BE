import bcrypt from 'bcryptjs';
import {validationResult} from 'express-validator';
import {
  insertUser,
  selectAllUsers,
  selectUserById,
} from '../models/user-model.js';
import {customError} from '../middlewares/error-handler.js';

// TODO: not updated for kubios, but implement db modification functions for admin users -Mei

// Fetch all user data
const getUsers = async (req, res) => {
  // in a real-world application, password properties should never be sent to the client
  const users = await selectAllUsers();
  res.json(users);
};

// Fetch a user by id
const getUserById = async (req, res, next) => {
  console.log('getUserById', req.params.id);

  try {
    const user = await selectUserById(req.params.id);
    console.log('User found:', user);
    // if the user was found, i.e., the value is not undefined, send it as a response
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (error) {
    next(error);
  }
};

// Add a user (registration)
// better error handling will be added later
const addUser = async (req, res, next) => {
  console.log('addUser request body', req.body);
  // introduce 3 new variables to store the values of the corresponding properties in req.body
  const {username, password, email} = req.body;
  // create a hash from the plaintext password, which will be stored in the database
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // create a new user object and add it to the database using the model
  const newUser = {
    username,
    password: hashedPassword,
    email,
  };
  try {
    const result = await insertUser(newUser);
    res.status(201);
    return res.json({message: 'User added. id: ' + result});
  } catch (error) {
    return next(customError(error.message, 400));
  }
};

// Edit a user by id (TODO: use DB)
const editUser = (req, res) => {
  console.log('editUser request body', req.body);
  const user = users.find((user) => user.id == req.params.id);
  if (user) {
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    res.json({message: 'User updated.'});
  } else {
    res.status(404).json({message: 'User not found'});
  }
};

// Delete a user by id (TODO: use DB)
const deleteUser = (req, res) => {
  console.log('deleteUser', req.params.id);
  const index = users.findIndex((user) => user.id == req.params.id);
  //console.log('index', index);
  // findIndex returns -1 if the user is not found
  if (index !== -1) {
    // remove one user from the array based on index
    users.splice(index, 1);
    res.json({message: 'User deleted.'});
  } else {
    res.status(404).json({message: 'User not found'});
  }
};

export {getUsers, getUserById, addUser, editUser, deleteUser};
