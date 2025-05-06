import promisePool from '../utils/database.js';

/**
 * Insert a new diary entry to the database
 * @param {object} entry Diary entry details
 * @returns
 */
const insertEntry = async (entry) => {
  console.log("entry-model.js insertEntry", entry);
  entry.user_id = parseInt(entry.user_id);
  console.log("entry", entry);
  try {
    const [result] = await promisePool.query(
      `INSERT INTO Entries
      (user_id, date, bed_time, asleep_delay, wakeups, time_awake, wakeup_time, total_sleep, total_bed_time, sleep_quality, daytime_alertness, sleep_mgmt_methods, sleep_factors)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.user_id,
        entry.date,
        entry.bed_time,
        entry.asleep_delay,
        entry.wakeups,
        entry.time_awake,
        entry.wakeup_time,
        entry.total_sleep,
        entry.total_bed_time,
        entry.sleep_quality,
        entry.daytime_alertness,
        entry.sleep_mgmt_methods,
        entry.sleep_factors,
      ],
    )

    // delete draft entry if it exists
    await promisePool.query(
      `DELETE FROM entry_drafts WHERE user_id = ? AND date = ?`,
      [
        entry.user_id,
        entry.date,
      ],
    )

    console.log('insertEntry', result);
    // return only first item of the result array
    return result.insertId;
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

/**
 * Select all diary entries by user id
 * @param {number} userId
 * @returns {array} Array of diary entries
 */
const selectEntriesByUserId = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM entries WHERE user_id=?',
      [userId],
    );
    console.log(rows);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

/**
 * Select a single diary entry by entry id
 * @param {number} entryId
 * @returns {object} Diary entry object
 */
const selectEntryById = async (entryId) => {
  const [rows] = await promisePool.query(
    'SELECT * FROM entries WHERE entry_id=?',
    [entryId],
  );
  console.log(rows);
  return rows[0];
};

/**
 * User can update their own entries
 * @param {object} entry
 * @returns
 */

// TODO: UPDATE THE updateEntry-function to use the new database structure -Mei

const updateEntry = async (entry) => {
  try {
    const [rows] = await promisePool.query(
      `UPDATE DiaryEntries (entry_date, mood, weight, sleep_hours, notes)
       VALUES (?, ?, ?, ?, ? ,?) WHERE entry_id = ? AND user_id = ?`,
      [
        entry.entry_date,
        entry.mood,
        entry.weight,
        entry.sleep_hours,
        entry.notes,
        entry.entryId,
        entry.user_id,
      ],
    );
    console.log('update entry', rows);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

/**
 * Insert a new diary entry to the database
 * @param {object} entry Diary entry details
 * @returns
 */
const insertDraft = async (entry) => {
  console.log("entry-model.js insertDraft", entry);
  //entry.user_id = parseInt(entry.user_id);
  console.log("entry", entry.user_id, entry.date);
  try {


    // Check if an entry already exists for this user and date
    const [existingEntries] = await promisePool.query(
      `SELECT * FROM entries WHERE user_id = ? AND date = ?`,
      [entry.user_id, entry.date]
    );

    if (existingEntries.length > 0) {
      console.log("Entry already exists for this date", existingEntries[0]);
      return {
        error: `Päivämäärällä ${entry.date} on jo merkintä!`,
        entry: typeof existingEntries[0] === 'string'
      ? JSON.parse(existingEntries[0])
      : existingEntries[0]
      };
    };


    // Check if a draft already exists for this user and date
    const [existingDrafts] = await promisePool.query(
      `SELECT * FROM entry_drafts WHERE user_id = ? AND date = ?`,
      [entry.user_id, entry.date]
    );

    if (existingDrafts.length > 0) {
      console.log("Draft already exists for this date");
      return {
        error: `Päivämäärällä ${entry.date} on jo luonnos!`,
        rows: typeof existingDrafts[0].data === 'string'
      ? JSON.parse(existingDrafts[0].data)
      : existingDrafts[0].data
      };
    };

    const [result] = await promisePool.query(
      `INSERT INTO entry_drafts (user_id, date, data)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       data = VALUES(data)`,
      [
        entry.user_id,
        entry.date,
        JSON.stringify(entry) // Save the full entry as JSON
      ]
    );

    console.log('insertDraft', result);
    // return only first item of the result array
    return result.insertId;

  } catch (error) {
    console.error("insertDraft", error);
    return { error: error.sqlMessage };
}
}
;

/**
 * Update draft entry
 * @param {object} entry Diary entry details
 * @returns
 */
const editDraft = async (entry) => {

  await promisePool.query(
    `INSERT INTO entry_drafts (user_id, date, data)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
     data = VALUES(data)`,
    [
      entry.user_id,
      entry.date,
      JSON.stringify(entry) // Save the full entry as JSON
    ]);


  const [updatedDraft] = await promisePool.query(
    `SELECT * FROM entry_drafts WHERE user_id = ? AND date = ?`,
    [entry.user_id, entry.date]
  );

  return {
    error: `Draft already exists for date ${entry.date}!`,
    rows: typeof updatedDraft[0].data === 'string'
      ? JSON.parse(updatedDraft[0].data)
      : updatedDraft[0].data
  };
};

export {insertEntry, selectEntriesByUserId, selectEntryById, updateEntry, insertDraft, editDraft};
