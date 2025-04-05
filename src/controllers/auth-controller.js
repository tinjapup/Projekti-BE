import jwt from 'jsonwebtoken'; // Library for generating and verifying JSON Web Tokens
import 'dotenv/config'; // Loads environment variables from a .env file
import {customError} from '../middlewares/error-handler.js'; // Custom error handler for consistent error responses


// Returns the currently authenticated user's data
const getMe = (req, res) => {
  const user = req.user; // Extract user data from the request (set by authentication middleware)
  res.json(user); // Respond with the user data
};

export {getMe};
