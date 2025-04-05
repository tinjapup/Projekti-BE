import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Middleware to authenticate a user using a JWT token
const authenticateToken = (req, res, next) => {
  console.log('authenticateToken', req.headers);

  // Extract the Authorization header
  const authHeader = req.headers['authorization'];

  // Extract the token from the "Bearer <token>" format
  const token = authHeader && authHeader.split(' ')[1];
  console.log('token', token);

  // If no token is provided, return a 401 Unauthorized status
  if (token == undefined) {
    return res.sendStatus(401);
  }

  try {
    // Verify the token using the secret key and attach the decoded user data to the request object
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('req.user', req.user);

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token verification fails, set the error status to 403 Forbidden and pass the error to the next middleware
    error.status = 403;
    next(error);
  }
};

export {authenticateToken};
