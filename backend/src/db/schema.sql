CREATE TABLE IF NOT EXISTS tasks (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS habits (
  id                SERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  current_streak    INTEGER NOT NULL DEFAULT 0,
  longest_streak    INTEGER NOT NULL DEFAULT 0,
  last_completed_on DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_completions (
  id            SERIAL PRIMARY KEY,
  habit_id      INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_on  DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (habit_id, completed_on)
);

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id            SERIAL PRIMARY KEY,
  started_at    TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_sec  INTEGER NOT NULL
);
