const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET all habits
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM habits ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// CREATE a habit
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO habits (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// MARK habit complete for today, update streak
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const habitResult = await client.query('SELECT * FROM habits WHERE id = $1 FOR UPDATE', [id]);
    if (habitResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Habit not found' });
    }
    const habit = habitResult.rows[0];

    const inserted = await client.query(
      `INSERT INTO habit_completions (habit_id, completed_on)
       VALUES ($1, CURRENT_DATE)
       ON CONFLICT (habit_id, completed_on) DO NOTHING
       RETURNING id`,
      [id]
    );

    if (inserted.rows.length === 0) {
      await client.query('COMMIT');
      return res.json(habit);
    }

    let newStreak = 1;
    if (habit.last_completed_on) {
      const last = new Date(habit.last_completed_on);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isSameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      if (isSameDay(last, yesterday)) {
        newStreak = habit.current_streak + 1;
      }
    }
    const newLongest = Math.max(newStreak, habit.longest_streak);

    const updated = await client.query(
      `UPDATE habits
       SET current_streak = $1, longest_streak = $2, last_completed_on = CURRENT_DATE
       WHERE id = $3
       RETURNING *`,
      [newStreak, newLongest, id]
    );

    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to complete habit' });
  } finally {
    client.release();
  }
});

module.exports = router;
