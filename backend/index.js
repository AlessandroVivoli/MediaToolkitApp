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
	const players = [];

	const page = Number.parseInt(req.query['page']);
	const limit = Number.parseInt(req.query['limit']);

	if (page === NaN || limit === NaN) res.sendStatus(400);

	const query = connection.query(
		`
		SELECT * FROM match_players
			ORDER BY setsWon DESC
		LIMIT ?, ?`,
		[0 + limit * page, limit + limit * page],
		(error, results, fields) => {
			if (error) {
				res.sendStatus(500);
				throw error;
			}

			if (results.length > 0) results.forEach((result) => players.push({ ...result }));

			res.status(200).send(players);
		}
	);
});

// Get player with id
app.get('/players/:id', (req, res) => {
	const playerId = req.params.id;

	const query = connection.query('SELECT * FROM match_players WHERE id = ?', playerId, (error, results, felds) => {
		if (error) {
			res.sendStatus(500);
			throw error;
		}

		if (results.length === 0) res.status(404).send(`Player with id ${playerId} not found.`);
		else res.status(200).send({ ...results[0] });
	});
});

// Add a player
app.post('/players', (req, res) => {
	const { body } = req;

	if (!(body.name && body.setsWon)) res.sendStatus(400);
	else {
		connection.query('INSERT INTO match_players SET ?', body, (error, results, fields) => {
			if (error) {
				res.sendStatus(500);
				throw error;
			}

			res.sendStatus(200);
		});
	}
});

// Update player info
app.put('/players/:id', (req, res) => {
	const { body, params } = req;

	const { id } = params;

	if (!(body.name || body.setsWon)) res.sendStatus(400);
	else {
		connection.query('UPDATE match_players SET ? WHERE id = ?', [body, id], (error) => {
			if (error) {
				res.sendStatus(500);
				throw error;
			}

			res.sendStatus(200);
		});
	}
});

// Delete player info
app.delete('/players/:id', (req, res) => {
	const { id } = req.params;

	connection.query('DELETE FROM match_players WHERE id = ?', [id], (err, results, fields) => {
		if (err) {
			res.sendStatus(500);
			throw err;
		}

		res.sendStatus(200);
	});
});

// Get matches
app.get('/matches', (req, res) => {
	const page = Number.parseInt(req.query['page']);
	const limit = Number.parseInt(req.query['limit']);

	console.log(page, limit);

	if (page === NaN || limit === NaN) res.sendStatus(400);

	connection.query(
		`
        SELECT matches.id, p.name AS winner, mp.id AS playerId, mp.name, JSON_ARRAYAGG(points) AS points FROM matches
            INNER JOIN player_matches ON player_matches.matchId = matches.id
            INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
            LEFT JOIN match_players AS p ON p.id = playerWon
        GROUP BY mp.name
        ORDER BY mp.name, setNum ASC
			LIMIT ?, ?;`,
		[0 + limit * page, limit + limit * page],
		(err, results, fields) => {
			if (err) {
				res.sendStatus(500);
				throw err;
			}

			const resultingObject = [];

			let i = -1;

			results.forEach((result) => {
				if (resultingObject.some((value) => value.id === result.id))
					resultingObject[i].players.push({
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
					i++;
				}
			});

			res.status(200).send(resultingObject);
		}
	);
});

// Get match by id
app.get('/matches/:id', (req, res) => {
	const { id } = req.params;

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

	connection.query('INSERT INTO matches SET ?', [{ playerWon: body.winner }], (err) => {
		if (err) {
			res.sendStatus(500);
			throw err;
		}
	});

	body.players.forEach((player) => {
		player.points.forEach((point, index) => {
			connection.query('INSERT INTO player_matches SET ?', [
				{ playerId: player.id, matchId: id, setNum: index + 1, points: point },
				(err) => {
					if (err) {
						res.sendStatus(500);
						throw err;
					}
				}
			]);
		});
	});

	if (!res.errored) res.sendStatus(200);
});

// Update match info
app.put('/matches/:id', (req, res) => {
	const { body } = req;
	const { id } = req.params;

	connection.query('UPDATE matches SET ? WHERE id = ?', [{ playerWon: body.winner }, id], (err) => {
		if (err) {
			res.sendStatus(500);
			throw err;
		}
	});

	connection.query('DELETE FROM player_matches WHERE matchId = ?', id, (err) => {
		if (err) {
			res.sendStatus(500);
			throw err;
		}
	});

	body.players.forEach((player) => {
		player.points.forEach((point, index) => {
			connection.query('INSERT INTO player_matches SET ?', [
				{ playerId: player.id, matchId: id, setNum: index + 1, points: point },
				(err) => {
					if (err) {
						res.sendStatus(500);
						throw err;
					}
				}
			]);
		});
	});

	if (!res.errored) res.sendStatus(200);
});

// Delete match
app.delete('/matches/:id', (req, res) => {
	const { id } = req.params;

	connection.query('DELETE FROM matches WHERE ?;', [id], (err) => {
		if (err) {
			res.sendStatus(500);
			throw err;
		}

		res.sendStatus(200);
	});
});

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
            PRIMARY KEY (playerId, matchId),
            CONSTRAINT Constr_PlayerMatches_Player_fk
                FOREIGN KEY Player_fk (playerId) REFERENCES match_players (id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT Constr_PlayerMatches_Match_fk
                FOREIGN KEY Match_fk (matchId) REFERENCES matches (id)
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
