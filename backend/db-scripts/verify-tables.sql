CREATE TABLE IF NOT EXISTS match_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name CHAR(12) NOT NULL,
  setsWon INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playerWon INTEGER NOT NULL,
  CONSTRAINT Constr_Matches_Player_fk
    FOREIGN KEY (playerWon) REFERENCES match_players (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS player_matches (
  playerId INTEGER NOT NULL,
  matchId INTEGER NOT NULL,
  setNum INTEGER NOT NULL CHECK (
    setNum between 1 and 5
  ),
  points INTEGER NOT NULL,
  CONSTRAINT Player_fk
    FOREIGN KEY (playerId) REFERENCES match_players (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT Match_fk
    FOREIGN KEY (matchId) REFERENCES matches (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TRIGGER update_player_sets_on_insert
	AFTER insert on player_matches
FOR EACH ROW
BEGIN
    UPDATE match_players
    	SET setswon = (
			SELECT COUNT(pm1.playerId) AS totalSetsWon FROM player_matches pm1, player_matches pm2
          		WHERE pm1.points > pm2.points AND
					pm1.matchId = pm2.matchId AND
					pm1.playerId != pm2.playerId AND
					pm1.setNum = pm2.setNum AND
					pm1.playerId = match_players.id
			GROUP BY pm1.playerId
        )
     WHERE id in(select playerId from player_matches);
 END;
 
CREATE TRIGGER update_player_sets_on_update
	AFTER UPDATE on player_matches
FOR EACH ROW
BEGIN
    UPDATE match_players
    	SET setswon = (
			SELECT COUNT(pm1.playerId) AS totalSetsWon FROM player_matches pm1, player_matches pm2
          		WHERE pm1.points > pm2.points AND
					pm1.matchId = pm2.matchId AND
					pm1.playerId != pm2.playerId AND
					pm1.setNum = pm2.setNum AND
					pm1.playerId = match_players.id
			GROUP BY pm1.playerId
        )
     WHERE id in(select playerId from player_matches);
 END;