import express from 'express';
import {
  getEntries,
  postEntry,
  putEntry,
  saveDraft,
} from '../controllers/entry-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import {body, param} from 'express-validator';
import {validationErrorHandler} from '../middlewares/error-handler.js';

const entryRouter = express.Router();

entryRouter
  .route('/')
  // post to /api/entries
  .post(
    authenticateToken,
    body('date').notEmpty().isDate(),
    body('bed_time').notEmpty().isISO8601(), // datetime
    body('asleep_delay').notEmpty().isInt({min: 0, max: 1440}), // minutes (0-1440)
    body('time_awake').notEmpty().isInt({min: 0, max: 1440}), // minutes (0-1440)
    body('wakeup_time').notEmpty().isISO8601(), // datetime
    body('total_sleep').notEmpty().isInt({min: 0, max: 1440}), // minutes (0-1440)
    body('total_bed_time').notEmpty().isInt({min: 0, max: 1440}), // minutes (0-1440)
    body('sleep_quality').notEmpty().isInt({min: 1, max: 10}), // rating (1-10)
    body('daytime_alertness').notEmpty().isInt({min: 1, max: 10}), // rating (1-10)
    body('sleep_mgmt_methods').optional().isString().trim().escape(),
    body('sleep_factors').optional().isString().trim().escape(),
    validationErrorHandler,
    postEntry,
  )
  .get(authenticateToken, getEntries);


entryRouter
.route('/draft')
.post(
  saveDraft,
);


  // TODO: do we need these? -Mei
entryRouter
  .route('/:id')
//  .get(authenticateToken, getEntryById)
  .put(
    //authenticateToken,
    param('entry_id').isInt(), // entry_id parameter is part of the request URL, no request body
    body('entry_date').optional().isDate(),
    body('mood').trim().optional().isLength({min: 3, max: 25}).escape(),
    body('weight', 'must be number between 2-200')
      .optional()
      .isFloat({min: 2, max: 200}),
    body('sleep_hours').optional().isInt({min: 0, max: 24}),
    body('notes').optional().isLength({min: 0, max: 1500}).escape(),
    validationErrorHandler,
    putEntry,
  );

export default entryRouter;
