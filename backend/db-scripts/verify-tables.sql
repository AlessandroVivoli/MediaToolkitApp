/**
 * This table represents created players
 */
CREATE TABLE IF NOT EXISTS
  players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name CHAR(12) NOT NULL,
    setsWon INTEGER DEFAULT 0
  );

/**
 * This table represents created matches
 */
CREATE TABLE IF NOT EXISTS
  matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playerWon INTEGER NOT NULL,
    CONSTRAINT Player_fk FOREIGN KEY (playerWon) REFERENCES players (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

/**
 * This table represents match info for each match that is played.
 * Even if that match already exists.
 *
 * For example, if the same match is played by 4 individual players. The match info will be created twice to hold info of all players, 1 match round for each pair.
 */
CREATE TABLE IF NOT EXISTS
  match_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matchId INTEGER NOT NULL,
    CONSTRAINT Match_fk FOREIGN KEY (matchId) REFERENCES matches (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

/**
 * This table represents a single match round between 2 players.
 */
CREATE TABLE IF NOT EXISTS
  match_rounds (
    matchInfoId INTEGER NOT NULL,
    playerId INTEGER NOT NULL,
    set1 INTEGER NOT NULL,
    set2 INTEGER NOT NULL,
    set3 INTEGER NOT NULL,
    set4 INTEGER NOT NULL,
    set5 INTEGER NOT NULL,
    CONSTRAINT MatchInfo_fk FOREIGN KEY (matchInfoId) REFERENCES matchInfo (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT Player_fk FOREIGN KEY (playerId) REFERENCES match_players (id) ON DELETE CASCADE ON UPDATE CASCADE
  )
