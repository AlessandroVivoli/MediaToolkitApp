SELECT matches.id, p.name AS winner, mp.id AS playerId, mp.name, GROUP_CONCAT(points) AS points FROM matches
  INNER JOIN player_matches ON player_matches.matchId = matches.id
  INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
  LEFT JOIN match_players AS p ON p.id = playerWon
GROUP BY mp.name
ORDER BY matches.id, mp.name, setNum ASC
