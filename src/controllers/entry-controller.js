import {insertEntry, selectEntriesByUserId, updateEntry, insertDraft, editDraft} from '../models/entry-model.js';

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
const postEntry = async (req, res, next) => {
  console.log("entry-controller.js postEntry", req.body);
  const newEntry = req.body;
  newEntry.user_id = req.user.userId;
  console.log("newEntry", newEntry, newEntry.user_id);
  try {
    await insertEntry(newEntry);
    res.status(201).json({message: "Entry added."});
  } catch (error) {
    next(error);
  }
};

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
 * @apiBody {String} [date] Entry date in YYYY-MM-DD format (optional).
 * @apiBody {String} [bed_time] Bedtime in ISO8601 format (optional).
 * @apiBody {Number} [asleep_delay] Time taken to fall asleep in minutes (optional).
 * @apiBody {Number} [time_awake] Time spent awake during the night in minutes (optional).
 * @apiBody {String} [wakeup_time] Wake-up time in ISO8601 format (optional).
 * @apiBody {Number} [total_sleep] Total sleep time in minutes (optional).
 * @apiBody {Number} [total_bed_time] Total time spent in bed in minutes (optional).
 * @apiBody {Number} [sleep_quality] Sleep quality rating (optional).
 * @apiBody {Number} [daytime_alertness] Daytime alertness rating (optional).
 * @apiBody {String} [sleep_mgmt_methods] Sleep management methods (optional).
 * @apiBody {String} [sleep_factors] Sleep factors (optional).
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Entry modified."
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
const putEntry = async (req, res, next) => {
  const editedEntry = req.body;
  if (editedEntry.user_id == req.user.user_id) {
    try {
      await updateEntry(editedEntry);
      res.status(200).json({message: "Entry modified."});
    } catch (error) {
      next(error);
    }
  }
};

/**
 * @api {get} /api/entries Get all entries
 * @apiName GetEntries
 * @apiGroup Entries
 * @apiPermission token
 *
 * @apiDescription Retrieves all diary entries for the authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess {Object[]} entries List of diary entries.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "entry_id": 1,
 *         "date": "2025-05-08",
 *         "bed_time": "2025-05-07T22:00:00Z",
 *         ...
 *       }
 *     ]
 */
const getEntries = async (req, res, next) => {
  try {
    const entries = await selectEntriesByUserId(req.user.userId);
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

/**
 * @api {post} /api/entries/draft Save a draft
 * @apiName SaveDraft
 * @apiGroup Entries
 * @apiPermission token
 *
 * @apiDescription Saves a draft entry for the authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiBody {Object} draft Draft data.
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Draft saved."
 *     }
 */
const saveDraft = async (req, res, next) => {
  console.log("entry-controller.js saveDraft", req.body);
  const newEntry = req.body;
  try {
    const response = await insertDraft(newEntry, res);
    res.status(201).json({message: response.message, error: response.error, rows: response.rows, entry: response.entry});
  } catch (error) {
    next(error);
  }
};

/**
 * @api {put} /api/entries/draft Update a draft
 * @apiName UpdateDraft
 * @apiGroup Entries
 * @apiPermission token
 *
 * @apiDescription Updates an existing draft entry for the authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiBody {Object} draft Updated draft data.
 *
 * @apiSuccess {String} message Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Draft edited."
 *     }
 */
const updateDraft = async (req, res, next) => {
  console.log("entry-controller.js updateDraft", req.body);
  const updatedEntry = req.body;
  try {
    const response = await editDraft(updatedEntry, res);
    res.status(201).json({message: "Draft edited.", rows: response.rows});
  } catch (error) {
    next(error);
  }
};

export {putEntry, postEntry, getEntries, saveDraft, updateDraft};
