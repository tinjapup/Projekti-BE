import express from 'express';
import cors from 'cors';
import userRouter from './routes/user-router.js';
import authRouter from './routes/auth-router.js';
import entryRouter from './routes/entry-router.js';
import {errorHandler, notFoundHandler} from './middlewares/error-handler.js';
import kubiosRouter from './routes/kubios-router.js';
const hostname = '127.0.0.1';
const app = express();
const port = 3000;

/**
 * @api {get} / Serve static HTML site
 * @apiName ServeStatic
 * @apiGroup General
 * @apiDescription Serves a static HTML site at the root of the server.
 */


/**
 * @api {use} /api/entries Entries API
 * @apiName EntriesAPI
 * @apiGroup Entries
 * @apiDescription Endpoints for managing diary entries.
 */

/**
 * @api {use} /api/kubios-data Kubios API
 * @apiName KubiosAPI
 * @apiGroup Kubios
 * @apiDescription Endpoints for fetching data from the Kubios API.
 */

/**
 * @api {use} /api Serve API Documentation
 * @apiName APIDocs
 * @apiGroup General
 * @apiDescription Serves REST API documentation under the /api root path.
 */



// Middleware required for front-end (Vite)
app.use(cors());

// Serve a static HTML site at the root of the server
app.use('/', express.static('public'));
// Middleware to parse JSON data from the body of POST requests
app.use(express.json());

// Serve REST API documentation under the /api root path
app.use('/api', express.static('docs'));

// Endpoints for the Users resource
app.use('/api/users', userRouter);
// User authentication (login)
app.use('/api/auth', authRouter);
// Diary entries
app.use('/api/entries', entryRouter);
// Kubios data endpoints
app.use('/api/kubios-data', kubiosRouter);

// For 404 errors
app.use(notFoundHandler);
// General error handler for all error situations
app.use(errorHandler);

// Start the server after all configurations
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
