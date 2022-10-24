SELECT winnerId FROM (
  SELECT COUNT(pm1.playerId) AS myCount, pm1.playerId AS winnerId, pm1.matchId AS winnerMatch FROM player_matches AS pm1, player_matches AS pm2
    WHERE pm1.points > 10 AND
    pm1.points > pm2.points AND
    pm1.matchId = pm2.matchId AND
    pm1.playerId != pm2.playerId AND
    pm1.setNum = pm2.setNum
  GROUP BY pm1.playerId, pm1.matchId) AS winnerTable
GROUP BY winnerMatch;
