const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');
const habitsRouter = require('./routes/habits');
const pomodoroRouter = require('./routes/pomodoro');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/tasks', tasksRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/pomodoro', pomodoroRouter);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
