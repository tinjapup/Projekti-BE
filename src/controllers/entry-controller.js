import {insertEntry, selectEntriesByUserId, updateEntry, insertDraft, editDraft} from '../models/entry-model.js';

const postEntry = async (req, res, next) => {
  // user_id, date, bed_time, asleep_delay, time_awake, wakeup_time, total_sleep, total_bed_time, sleep_quality, daytime_alertness, sleep_mgmt_methods, sleep_factors
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
 * Controller for updating an entry
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

// TODO: UPDATE THE putEntry-function to use the new database structure -Mei

const putEntry = async (req, res, next) => {
  // user_id, date, bed_time, asleep_delay, time_awake, wakeup_time, total_sleep, total_bed_time, sleep_quality, daytime_alertness, sleep_mgmt_methods, sleep_factors

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
 * Get all entries of the logged in user
 * @param {*} req
 * @param {*} res
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
 * Controller for posting an draft
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const saveDraft = async (req, res, next) => {
  console.log("entry-controller.js saveDraft", req.body);
    const newEntry = req.body;
    console.log("newEntry", newEntry, newEntry.user_id);
    try {
      const response = await insertDraft(newEntry, res);
      res.status(201).json({message: "Draft added.", rows: response.rows});
    } catch (error) {
      next(error);
    }
  };


/**
 * Controller for updating a draft
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

  const updateDraft = async (req, res, next) => {
    console.log("entry-controller.js updateDraft", req.body);
      const updatedEntry = req.body;
      console.log("updatedEntry", updatedEntry, updatedEntry.user_id);
      try {
        const response = await editDraft(updatedEntry, res);
        res.status(201).json({message: "Draft edited.", rows: response.rows});
      } catch (error) {
        next(error);
      }
    };

export {putEntry, postEntry, getEntries, saveDraft, updateDraft};
