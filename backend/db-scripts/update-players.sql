SELECT COUNT(pm1.playerId) AS totalSetsWon, pm1.playerId FROM player_matches pm1, player_matches pm2
  WHERE pm1.points > pm2.points AND
      pm1.matchId = pm2.matchId AND
      pm1.playerId != pm2.playerId AND
      pm1.setNum = pm2.setNum
GROUP BY pm1.playerId;
