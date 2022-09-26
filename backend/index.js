require('dotenv').config();

const express = require('express');
const app = express();

const mysql = require('mysql');
const connection = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASS,
	database: process.env.DB,
	multipleStatements: true
});

connection.connect();

verifyTables();

app.use(express.json());

// Get all match players
app.get('/players', (req, res) => {
	const page = Number.parseInt(req.query['page']);
	const limit = Number.parseInt(req.query['limit']);

	if (page === NaN || limit === NaN) {
		res.status(400).send('One of the parameters is not a number');
		throw new Error('One of the parameters is not a number');
	}

	const query = connection.query(
		`
		SELECT * FROM match_players
			ORDER BY setsWon DESC
		LIMIT ?, ?`,
		[page * limit, limit],

		(error, results, fields) => {
			if (error) {
				res.sendStatus(500);
				throw error;
			}

			res.status(200).send(results);
		}
	);
});

// Get player with id
app.get('/players/:id', (req, res) => {
	const { id } = req.params;

	if (Number.parseInt(id) === NaN) {
		res.status(400).send('Id is not a number');
		throw new Error('Id is not a number');
	}

	const query = connection.query('SELECT * FROM match_players WHERE id = ?', id, (error, results, felds) => {
		if (error) {
			res.sendStatus(500);
			throw error;
		}

		if (results.length === 0) {
			res.status(404).send(`Player not found.`);
			throw new Error(`Player with id ${id} not found.`);
		}

		res.status(200).send(results[0]);
	});
});

// Add a player
app.post('/players', (req, res) => {
	const { body } = req;

	delete body.id;

	if (!(body.name || body.setsWon === undefined)) {
		res.status(400).send('Request has no body');
		throw new Error('Request has no body');
	}
	connection.query('INSERT INTO match_players SET ?; SELECT LAST_INSERT_ID()', body, (error, results, fields) => {
		if (error) {
			res.sendStatus(500);
			throw error;
		}

		res.status(200).send({ id: results[1]['id'], ...body });
	});
});

// Update player info
app.put('/players/:id', (req, res) => {
	const { body, params } = req;

	const { id } = params;

	delete body.id;

	if (Number.parseInt(id) === NaN) res.type('text').status(400).send('Id is not a number');
	else if (!(body.name || body.setsWon)) res.type('text').status(400).send('Request has no body');
	else {
		connection.query(
			`
			UPDATE match_players SET ? WHERE id = ?;
			SELECT * FROM match_players WHERE id = ?;
			`,
			[body, id, id],
			(error, results, fields) => {
				if (error) {
					res.sendStatus(500);
					throw error;
				}

				console.table(results);

				res.status(200).send(results[1][0]);
			}
		);
	}
});

// Delete player info
app.delete('/players/:id', (req, res) => {
	const { id } = req.params;

	if (Number.parseInt(id) === NaN) {
		res.status(400).send('Id is not a number');
		throw new Error('Id is not a number!');
	}

	connection.query(
		`
		DELETE FROM match_players WHERE id = ?;
		SELECT * FROM match_players ORDER BY setsWon DESC;
		`,
		[id],
		(err, results, fields) => {
			if (err) {
				res.sendStatus(500);
				throw err;
			}

			res.status(200).send(results[1]);
		}
	);
});

// Get matches
app.get('/matches', (req, res) => {
	const page = Number.parseInt(req.query['page']);
	const limit = Number.parseInt(req.query['limit']);

	if (page === NaN || limit === NaN) {
		res.status(400).send('One of the parameters is not a number');
		throw new Error('One of the parameters is not a number');
	}

	connection.query(
		`
        SELECT matches.id, p.name AS winner, mp.id AS playerId, mp.name, JSON_ARRAYAGG(points) AS points FROM matches
            INNER JOIN player_matches ON player_matches.matchId = matches.id
            INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
            LEFT JOIN match_players AS p ON p.id = playerWon
        GROUP BY mp.name
        ORDER BY id, mp.name, setNum ASC
			LIMIT ?, ?;`,
		[page * limit * 2, limit * 2],
		(err, results, fields) => {
			if (err) {
				res.sendStatus(500);
				throw err;
			}

			const resultingObject = [];

			results.forEach((result) => {
				if (resultingObject.some((value) => value.id === result.id))
					resultingObject
						.find((object) => object.id === result.id)
						.players.push({
							id: result.playerId,
							name: result.name,
							points: JSON.parse(result.points)
						});
				else {
					resultingObject.push({
						id: result.id,
						players: [
							{
								id: result.playerId,
								name: result.name,
								points: JSON.parse(result.points)
							}
						],
						winner: result.winner
					});
				}
			});

			res.status(200).send(resultingObject);
		}
	);
});

// Get match by id
app.get('/matches/:id', (req, res) => {
	const { id } = req.params;

	if (Number.parseInt(id) === NaN) {
		res.sendStatus(400);
		throw new Error('Id is not a number!');
	}

	connection.query(
		`
        SELECT matches.id, setNum, p.name AS winner, mp.id AS playerId, mp.name, JSON_ARRAYAGG(points) AS points FROM matches
            INNER JOIN player_matches ON player_matches.matchId = matches.id
            INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
            LEFT JOIN match_players AS p ON p.id = playerWon
        WHERE matches.id = ?
            GROUP BY mp.name
            ORDER BY mp.name, setNum ASC;`,
		[id],
		(err, results, fields) => {
			if (err) {
				res.sendStatus(500);
				throw err;
			}

			console.table(results);

			let resultingObject = null;

			results.forEach((result) => {
				if (!resultingObject)
					resultingObject = {
						id: result.id,
						players: [
							{
								id: result.playerId,
								name: result.name,
								points: JSON.parse(result.points)
							}
						],
						winner: result.winner
					};
				else
					resultingObject.players.push({
						id: result.playerId,
						name: result.name,
						points: JSON.parse(result.points)
					});
			});

			res.status(200).send(resultingObject);
		}
	);
});

// Add match info
app.post('/matches', (req, res) => {
	const { body } = req;

	if (!body.winner || !body.players || !body.players.length) {
		res.status(400).send('Request has no body');
		throw new Error('Request has no body');
	}

	const queries = [];

	queries.push(connection.format('INSERT INTO matches SET ?;', [{ playerWon: body.players.find((player) => player.name === body.winner).id }]));
	queries.push('INSERT INTO player_matches (playerId, matchId, setNum, points) VALUES', ' ');

	const valueQueries = [];

	body.players.forEach((player) => {
		player.points.forEach((point, index) => {
			valueQueries.push(connection.format('(?, ?, ?, ?)', [player.id, id, index + 1, point]));
		});
	});

	queries.push(valueQueries.join(', '), ';');

	connection.query(queries.join(''), (err, results, fields) => {
		if (err) {
			res.sendStatus(500);
			throw err;
		}

		res.sendStatus(200);
	});

	updatePlayers();
	updateWinners();
});

// Update match info
app.put('/matches/:id', (req, res) => {
	const { body } = req;
	const { id } = req.params;

	if (Number.parseInt(id) === NaN) {
		res.status(400).send('Id is not a number');
		throw new Error('Id is not a number');
	}

	if (!body.winner || !body.players || !body.players.length) {
		res.status(400).send('Request has no body');
		throw new Error('Request has no body');
	}

	const queries = [];

	queries.push(
		connection.format('UPDATE matches SET ? WHERE id = ?;', [
			{ playerWon: body.players.find((player) => player.name === body.winner).id },
			Number.parseInt(id)
		])
	);
	queries.push(connection.format('DELETE FROM player_matches WHERE matchId = ?;', [Number.parseInt(id)]));

	queries.push('INSERT INTO player_matches (playerId, matchId, setNum, points) VALUES', ' ');

	const vlaueQueries = [];

	body.players.forEach((player) => {
		player.points.forEach((point, index) => {
			vlaueQueries.push(connection.format('(?, ?, ?, ?)', [player.id, Number.parseInt(id), index + 1, point]));
		});
	});

	queries.push(vlaueQueries.join(', '), ';');

	queries.push(
		connection.format(
			`SELECT matches.id, setNum, p.name AS winner, mp.id AS playerId, mp.name, JSON_ARRAYAGG(points) AS playerPoints FROM matches
				INNER JOIN player_matches ON player_matches.matchId = matches.id
				INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
				LEFT JOIN match_players AS p ON p.id = playerWon
			WHERE matches.id = ?
				GROUP BY mp.name
				ORDER BY id, mp.name, setNum ASC;`,
			[Number.parseInt(id)]
		)
	);

	connection.query(queries.join(''), (err, results, fields) => {
		if (err) {
			res.sendStatus(500);
			throw err;
		}

		results = results.splice(results.length - 1, 1)[0];

		console.log(results);

		let resultingObject = null;

		results.forEach((result) => {
			if (!resultingObject)
				resultingObject = {
					id: result.id,
					players: [
						{
							id: result.playerId,
							name: result.name,
							points: JSON.parse(result.playerPoints)
						}
					],
					winner: result.winner
				};
			else
				resultingObject.players.push({
					id: result.playerId,
					name: result.name,
					points: JSON.parse(result.playerPoints)
				});
		});

		res.status(200).send(resultingObject);

		updatePlayers();
		updateWinners();
	});
});

// Delete match
app.delete('/matches/:id', (req, res) => {
	const { id } = req.params;

	if (Number.parseInt(id) === NaN) {
		res.status(400).send('Id is not a number');
		throw new Error('Id is not a number');
	}

	connection.query(
		`
		DELETE FROM matches WHERE ID = ?;
		SELECT matches.id, p.name AS winner, mp.id AS playerId, mp.name, JSON_ARRAYAGG(points) AS points FROM matches
			INNER JOIN player_matches ON player_matches.matchId = matches.id
			INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
			LEFT JOIN match_players AS p ON p.id = playerWon
		GROUP BY mp.name
		ORDER BY id, mp.name, setNum ASC`,
		[Number.parseInt(id)],
		(err, results) => {
			if (err) {
				res.sendStatus(500);
				throw err;
			}

			res.status(200).send(results.splice(1));
		}
	);

	updatePlayers();
	updateWinners();
});

function updatePlayers() {
	connection.query(
		`SELECT COUNT(pm1.playerId) AS totalSetsWon, pm1.playerId FROM player_matches pm1, player_matches pm2
			WHERE pm1.points > 10 AND
				  pm1.points > pm2.points AND
				  pm1.matchId = pm2.matchId AND
				  pm1.playerId != pm2.playerId AND
				  pm1.setNum = pm2.setNum
		GROUP BY pm1.playerId;`,
		(err, results, fields) => {
			if (err) console.log(err);

			results.forEach(({ totalSetsWon, playerId }) => {
				connection.query('UPDATE match_players SET setsWon = ? WHERE id = ?', [totalSetsWon, playerId], (err) => (err ? console.log(err) : () => {}));
			});
		}
	);
}

function updateWinners() {
	connection.query(
		`SELECT MAX(myCount), winnerId, winnerMatch FROM (
			SELECT COUNT(pm1.playerId) AS myCount, pm1.playerId AS winnerId, pm1.matchId AS winnerMatch FROM player_matches pm1, player_matches pm2
				WHERE pm1.points > 10 AND
				pm1.points > pm2.points AND
				pm1.matchId = pm2.matchId AND
				pm1.playerId != pm2.playerId AND
				pm1.setNum = pm2.setNum
			GROUP BY pm1.playerId, pm1.matchId) AS winnerTable
		 GROUP BY winnerMatch;`,
		(err, results, fields) => {
			if (err) return;

			results.forEach(({ winnerId, winnerMatch }) => {
				connection.query('UPDATE matches SET playerWon = ? WHERE id = ?', [winnerId, winnerMatch]);
			});
		}
	);
}

function verifyTables() {
	connection.query(
		`
        CREATE TABLE IF NOT EXISTS match_players (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name CHAR(12) NOT NULL,
            setsWon INT NOT NULL 
        );

        CREATE TABLE IF NOT EXISTS matches (
            id INT PRIMARY KEY AUTO_INCREMENT,
            playerWon INT NOT NULL,
            CONSTRAINT Constr_Matches_Player_fk
                FOREIGN KEY Player_fk (playerWon) REFERENCES match_players (id)
                ON DELETE CASCADE ON UPDATE CASCADE
        );

        CREATE TABLE IF NOT EXISTS player_matches (
            playerId INT NOT NULL,
            matchId INT NOT NULL,
            setNum INT NOT NULL CHECK (setNum between 1 and 5),
            points INT NOT NULL,
            CONSTRAINT Player_fk
                FOREIGN KEY (playerId) REFERENCES match_players (id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT Match_fk
                FOREIGN KEY (matchId) REFERENCES matches (id)
                ON DELETE CASCADE ON UPDATE CASCADE
        );
        `
	);
}

app.listen(3000, () => {
	console.log(`App listening on port ${3000}.`);
});

process.on('exit', () => {
	console.info('Exiting...');
	connection.end();
});
