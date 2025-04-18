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
        1,
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
    );
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

export {insertEntry, selectEntriesByUserId, selectEntryById, updateEntry};
