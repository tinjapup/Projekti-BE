import express from 'express';
import {
  getEntries,
  postEntry,
  //putEntry,
  saveDraft,
  updateDraft
} from '../controllers/entry-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import {
  body,
  //param
} from 'express-validator';
import {validationErrorHandler} from '../middlewares/error-handler.js';

const entryRouter = express.Router();

/**
 * @api {post} /api/entries Add a new entry
 * @apiName PostEntry
 * @apiGroup Entries
 * @apiPermission token
 *
 * @apiDescription Adds a new diary entry for the authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiBody {String} date Entry date in YYYY-MM-DD format.
 * @apiBody {String} bed_time Bedtime in ISO8601 format.
 * @apiBody {Number} asleep_delay Time taken to fall asleep in minutes (0-1440).
 * @apiBody {Number} time_awake Time spent awake during the night in minutes (0-1440).
 * @apiBody {String} wakeup_time Wake-up time in ISO8601 format.
 * @apiBody {Number} total_sleep Total sleep time in minutes (0-1440).
 * @apiBody {Number} total_bed_time Total time spent in bed in minutes (0-1440).
 * @apiBody {Number} sleep_quality Sleep quality rating (1-10).
 * @apiBody {Number} daytime_alertness Daytime alertness rating (1-10).
 * @apiBody {String} [sleep_mgmt_methods] Sleep management methods (optional).
 * @apiBody {String} [sleep_factors] Sleep factors (optional).
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Entry added."
 *     }
 *
 * @apiError ValidationError Invalid input data.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Validation error",
 *       "errors": [...]
 *     }
 */
entryRouter
  .route('/')
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
  // get from /api/entries
  .get(authenticateToken, getEntries);

/**
 * @api {post} /api/entries/draft Save a draft entry
 * @apiName SaveDraft
 * @apiGroup Entries
 * @apiPermission token
 *
 * @apiDescription Saves a draft entry for the authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiBody {String} date Entry date in YYYY-MM-DD format.
 * @apiBody {Object} data Draft data in JSON format.
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Draft saved."
 *     }
 */
entryRouter
.route('/draft')
.post(
  body('date').notEmpty().isDate(),
  validationErrorHandler,
  saveDraft,
)
.put(
  body('date').notEmpty().isDate(),
  validationErrorHandler,
  updateDraft,
);



/**
 * @api {put} /api/entries/:id Update an entry
 * @apiName PutEntry
 * @apiGroup Entries
 * @apiPermission token
 *
 * @apiDescription Updates an existing diary entry for the authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam {Number} id Entry ID.
 *
 * @apiBody {String} [entry_date] Entry date in YYYY-MM-DD format (optional).
 * @apiBody {String} [mood] Mood description (optional).
 * @apiBody {Number} [weight] Weight in kilograms (optional, 2-200).
 * @apiBody {Number} [sleep_hours] Sleep hours (optional, 0-24).
 * @apiBody {String} [notes] Notes (optional, max 1500 characters).
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Entry updated."
 *     }
 */
entryRouter
  .route('/:id')
//  .get(authenticateToken, getEntryById)
  .put(
    //authenticateToken,
    body('entry_id').isInt(), // entry_id parameter is part of the request URL, no request body
    body('entry_date').optional().isDate(),
    body('mood').trim().optional().isLength({min: 3, max: 25}).escape(),
    body('weight', 'must be number between 2-200')
      .optional()
      .isFloat({min: 2, max: 200}),
    body('sleep_hours').optional().isInt({min: 0, max: 24}),
    body('notes').optional().isLength({min: 0, max: 1500}).escape(),
    validationErrorHandler,
    //putEntry,
  );

export default entryRouter;
