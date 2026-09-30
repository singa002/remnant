const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// LOG a completed pomodoro session
router.post('/', async (req, res) => {
  const { started_at, duration_sec } = req.body;
  if (!started_at || !duration_sec) {
    return res.status(400).json({ error: 'started_at and duration_sec are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO pomodoro_sessions (started_at, duration_sec)
       VALUES ($1, $2)
       RETURNING *`,
      [started_at, duration_sec]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log session' });
  }
});

// GET today's sessions + count
router.get('/today', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pomodoro_sessions
       WHERE completed_at >= CURRENT_DATE
       ORDER BY completed_at ASC`
    );
    res.json({ count: result.rows.length, sessions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch today's sessions" });
  }
});

module.exports = router;
