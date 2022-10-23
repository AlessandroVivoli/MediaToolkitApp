require('dotenv').config();

const express = require('express');
const app = express();

const Database = require('better-sqlite3');
const db = new Database(process.env.DB + '.sqlite', { verbose: console.log });

const fs = require('fs');

verifyTables();

app.use(express.json());

// Get all match players
app.get('/players', (req, res) => {
	const page = Number.parseInt(req.query['page']);
	const limit = Number.parseInt(req.query['limit']);

	if (Number.isNaN(page) || Number.isNaN(limit)) {
		res.status(400).send('One of the parameters is not a number');
		return console.error('One of the parameters is not a number');
	}

	const stmt = db.prepare('SELECT * FROM match_players ORDER BY setsWon DESC LIMIT ?, ?');
	const rows = stmt.all(page * limit, limit);

	res.status(200).send(rows);
});

// Get player with id
app.get('/players/:id', (req, res) => {
	const { id } = req.params;

	if (Number.parseInt(id) === NaN) {
		res.status(400).send('ID is not a number');
		return console.error('ID is not a number');
	}

	const stmt = db.prepare('SELECT * FROM match_players WHERE id = ?');
	const row = stmt.get();

	res.status(200).send(row);
});

// Add a player
app.post('/players', (req, res) => {
	const { body } = req;

	console.log(body);

	delete body.id;

	if (!(body.name || body.setsWon === undefined)) {
		res.status(400).send('Request has no body');
		return console.error('Request has no body');
	}

	const id = db
		.prepare('INSERT INTO match_players (name, setsWon) VALUES (?, ?)')
		.run(body.name, body.setsWon).lastInsertRowid;

	res.status(200).send({ id: id, ...body });
});

// Update player info
app.put('/players/:id', (req, res) => {
	const { body, params } = req;

	const { id } = params;

	console.table(body);

	delete body.id;

	if (Number.isNaN(Number.parseInt(id))) res.type('text').status(400).send('ID is not a number');
	else if (!(body.name || body.setsWon)) res.type('text').status(400).send('Request has no body');
	else {
		db.prepare('UPDATE match_players SET name = $name, setsWon = $setsWon WHERE id = $id').run({
			id: id,
			...body
		});

		const stmt = db.prepare('SELECT * FROM match_players WHERE id = ?');
		const rows = stmt.all(id);

		res.status(200).send(rows);
	}
});

// Delete player info
app.delete('/players/:id', (req, res) => {
	const { id } = req.params;

	if (Number.isNaN(Number.parseInt(id))) {
		res.status(400).send('Id is not a number');
		throw new Error('Id is not a number!');
	}

	db.prepare('DELETE FROM match_players WHERE id = ?').run(id);
	const rows = db.prepare('SELECT * FROM match_players ORDER BY setsWon DESC').all();

	res.status(200).send(rows);
});

// Get matches
app.get('/matches', (req, res) => {
	const page = Number.parseInt(req.query['page']);
	const limit = Number.parseInt(req.query['limit']);

	if (Number.isNaN(page) || Number.isNaN(limit)) {
		res.status(400).send('One of the parameters is not a number');
		return console.error('One of the parameters is not a number');
	}

	const stmt = db.prepare(
		`SELECT matches.id as matchId, p.name AS winner, mp.id AS playerId, mp.name, GROUP_CONCAT(points) AS points FROM matches
    INNER JOIN player_matches ON player_matches.matchId = matches.id
    INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
    LEFT JOIN match_players AS p ON p.id = playerWon
  GROUP BY mp.name
  ORDER BY matches.id, mp.name, setNum ASC
  LIMIT ?, ?`
	);

	const rows = stmt.all(page * limit * 2, limit * 2);

  console.log('Rows:', rows);

	const result = rows.reduce((acc, post) => {
		const { matchId, playerId, winner, name, playerPoints } = post;
		return {
			...acc,
			[matchId]: {
				players: [
					...(acc[matchId].players || []),
					{ id: playerId, name: name, points: JSON.parse(playerPoints) }
				],
				winner: winner
			}
		};
	});

	const resultingObject = [];

	Object.keys(result).forEach((key) => {
		resultingObject.push({ id: key, ...result[key] });
	});

	console.log(resultingObject);

	res.status(200).send(resultingObject);
});

// Get match by id
app.get('/matches/:id', (req, res) => {
	const { id } = req.params;

	if (Number.isNaN(Number.parseInt(id))) {
		res.status(400).send('ID is not a number!');
		return console.error('Id is not a number!');
	}

	const stmt = db.prepare(
		`SELECT matches.id as matchId, setNum, p.name AS winner, mp.id AS playerId, mp.name, GROUP_CONCAT(points) AS points FROM matches
        INNER JOIN player_matches ON player_matches.matchId = matches.id
        INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
        LEFT JOIN match_players AS p ON p.id = playerWon
    WHERE matchId = ?
        GROUP BY mp.name
        ORDER BY matchId, mp.name, setNum ASC;`
	);

	const rows = stmt.all(id);

	const result = rows.reduce((acc, post) => {
		const { matchId, playerId, winner, name, playerPoints } = post;
		return {
			...acc,
			[matchId]: {
				players: [
					...(acc[matchId].players || []),
					{ id: playerId, name: name, points: JSON.parse(playerPoints) }
				],
				winner: winner
			}
		};
	});

	const resultingObject = [];

	Object.keys(result).forEach((key) => {
		resultingObject.push({ id: key, ...result[key] });
	});

	console.log(resultingObject);

	res.status(200).send(resultingObject[0]);
});

// Add match info
app.post('/matches', (req, res) => {
	const { body } = req;

	console.dir(body);

	let errored = false;

	if (!body.winner || !body.players || !body.players.length) {
		res.status(400).send('Request has no body');
		return console.error('Request has no body');
	}

	const id = db
		.prepare('INSERT INTO matches (playerWon) VALUES (?)')
		.run(body.players.find((player) => player.name === body.winner).id).lastInsertRowid;

	const insert = db.prepare(
		'INSERT INTO player_matches (playerId, matchId, setNum, points VALUES (?, ?, ?, ?)'
	);

	const insertMany = db.transaction((players) => {
		for (const player of players) {
			let index = 1;
			for (const point of player.points) {
				insert.run(player.id, id, index++, point);
			}
		}
	});

	insertMany(body.players);

	const stmt = db.prepare(
		`SELECT matches.id as matchId, setNum, p.name AS winner, mp.id AS playerId, mp.name, GROUP_CONCAT(points) AS playerPoints FROM matches
			INNER JOIN player_matches ON player_matches.matchId = matches.id
			INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
			LEFT JOIN match_players AS p ON p.id = playerWon
		WHERE matchId = ?
			GROUP BY mp.name
			ORDER BY matchId, mp.name, setNum ASC`
	);

	const rows = stmt.all(id);

	const result = rows.reduce((acc, post) => {
		const { matchId, playerId, winner, name, playerPoints } = post;
		return {
			...acc,
			[matchId]: {
				players: [
					...(acc[matchId].players || []),
					{ id: playerId, name: name, points: JSON.parse(playerPoints) }
				],
				winner: winner
			}
		};
	});

	const resultingObject = [];

	Object.keys(result).forEach((key) => {
		resultingObject.push({ id: key, ...result[key] });
	});

	console.log(resultingObject);

	res.status(200).send(resultingObject[0]);

	updatePlayers();
	updateWinners();
});

// Update match info
app.put('/matches/:id', (req, res) => {
	const { body } = req;
	const id = Number.parseInt(req.params.id);

	let errored = false;

	if (Number.isNaN(id)) {
		res.status(400).send('ID is not a number');
		throw new Error('ID is not a number');
	}

	if (!body.winner || !body.players || !body.players.length) {
		res.status(400).send('Request has no body');
		return console.error('Request has no body');
	}

	db.prepare('UPDATE matches SET playerWon = $playerWon WHERE id = $id').run({
		playerWon: body.players.find((player) => player.name === body.winner).id,
		id: id
	});

	db.prepare('DELETE FROM player_matches WHERE matchId = $id').run({ id: id });

	const insert = db.prepare(
		'INSERT INTO player_matches (playerId, matchId, setNum, points VALUES (?, ?, ?, ?)'
	);

	const insertMany = db.transaction((players) => {
		for (const player of players) {
			let index = 1;
			for (const point of player.points) {
				insert.run(player.id, id, index++, point);
			}
		}
	});

	insertMany(body.players);

	const stmt = db.prepare(
		`SELECT matches.id as matchId, setNum, p.name AS winner, mp.id AS playerId, mp.name, GROUP_CONCAT(points) AS playerPoints FROM matches
			INNER JOIN player_matches ON player_matches.matchId = matches.id
			INNER JOIN match_players AS mp ON mp.id = player_matches.playerId
			LEFT JOIN match_players AS p ON p.id = playerWon
		WHERE matchId = ?
			GROUP BY mp.name
			ORDER BY matchId, mp.name, setNum ASC`
	);

	const rows = stmt.all(id);

	const result = rows.reduce((acc, post) => {
		const { matchId, playerId, winner, name, playerPoints } = post;
		return {
			...acc,
			[matchId]: {
				players: [
					...(acc[matchId].players || []),
					{ id: playerId, name: name, points: JSON.parse(playerPoints) }
				],
				winner: winner
			}
		};
	});

	const resultingObject = [];

	Object.keys(result).forEach((key) => {
		resultingObject.push({ id: key, ...result[key] });
	});

	console.log(resultingObject);

	res.status(200).send(resultingObject[0]);

	updatePlayers();
	updateWinners();
});

// Delete match
app.delete('/matches/:id', (req, res) => {
	const { id } = req.params;

	if (Number.isNaN(Number.parseInt(id))) {
		res.status(400).send('ID is not a number');
		return console.error('ID is not a number');
	}

	const stmt = db.prepare(`DELETE FROM matches WHERE ID = $id`);

	stmt.run({ id: id });

	const selectSQL = fs.readFileSync('./backend/db-schematics/select-all-matches.sql', 'utf-8');
	const result = db.prepare(selectSQL).all();

	res.status(200).send(result);

	updatePlayers();
	updateWinners();
});

function updatePlayers() {
	const updateSQL = fs.readFileSync('./backend/db-schematics/update-players.sql', 'utf-8');
	db.exec(updateSQL);
}

function updateWinners() {
	const updateSQL = fs.readFileSync('./backend/db-schematics/update-winners.sql', 'utf-8');
	db.exec(updateSQL);
}

function verifyTables() {
	const verifySQL = fs.readFileSync('./backend/db-schematics/verify-tables.sql', 'utf-8');
	db.exec(verifySQL);
}

app.listen(3000, () => {
	console.log(`App listening on port ${3000}.`);
});

process.on('exit', () => {
	console.info('Exiting...');
	db.close();
});
