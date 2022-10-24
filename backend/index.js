"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var dotenv = require("dotenv");
var express = require("express");
var Database = require("better-sqlite3");
var fs = require("fs");
dotenv.config();
var app = express();
var db = new Database(process.env['DB'] + '.sqlite', {
    verbose: console.log
});
verifyTables();
app.use(express.json());
// Get all match players
app.get('/players', function (req, res) {
    var page = Number.parseInt(req.query['page']);
    var limit = Number.parseInt(req.query['limit']);
    if (Number.isNaN(page) || Number.isNaN(limit)) {
        res.status(400).send('One of the parameters is not a number');
        return console.error('One of the parameters is not a number');
    }
    var stmt = db.prepare('SELECT * FROM match_players ORDER BY setsWon DESC LIMIT ?, ?');
    var rows = stmt.all(page * limit, limit);
    res.status(200).send(rows);
});
// Get player with id
app.get('/players/:id', function (req, res) {
    var id = req.params.id;
    if (Number.isNaN(Number.parseInt(id))) {
        res.status(400).send('ID is not a number');
        return console.error('ID is not a number');
    }
    var stmt = db.prepare('SELECT * FROM match_players WHERE id = ?');
    var row = stmt.get();
    res.status(200).send(row);
});
// Add a player
app.post('/players', function (req, res) {
    var body = req.body;
    console.log(body);
    delete body.id;
    if (!body.name || (!body.setsWon && body.setsWon != 0)) {
        res.status(400).send('Request has no body');
        return console.error('Request has no body');
    }
    var id = db
        .prepare('INSERT INTO match_players (name, setsWon) VALUES (?, ?)')
        .run(body.name, body.setsWon).lastInsertRowid;
    res.status(200).send(__assign({ id: id }, body));
});
// Update player info
app.put('/players/:id', function (req, res) {
    var body = req.body, params = req.params;
    var id = params.id;
    console.table(body);
    delete body.id;
    if (Number.isNaN(Number.parseInt(id)))
        res.type('text').status(400).send('ID is not a number');
    else if (!(body.name || body.setsWon))
        res.type('text').status(400).send('Request has no body');
    else {
        db.prepare('UPDATE match_players SET name = $name, setsWon = $setsWon WHERE id = $id').run(__assign({ id: id }, body));
        var stmt = db.prepare('SELECT * FROM match_players WHERE id = ?');
        var rows = stmt.all(id);
        res.status(200).send(rows);
    }
});
// Delete player info
app["delete"]('/players/:id', function (req, res) {
    var id = req.params.id;
    if (Number.isNaN(Number.parseInt(id))) {
        res.status(400).send('Id is not a number');
        throw new Error('Id is not a number!');
    }
    db.prepare('DELETE FROM match_players WHERE id = ?').run(id);
    var rows = db
        .prepare('SELECT * FROM match_players ORDER BY setsWon DESC')
        .all();
    res.status(200).send(rows);
});
// Get matches
app.get('/matches', function (req, res) {
    var page = Number.parseInt(req.query['page']);
    var limit = Number.parseInt(req.query['limit']);
    if (Number.isNaN(page) || Number.isNaN(limit)) {
        res.status(400).send('One of the parameters is not a number');
        return console.error('One of the parameters is not a number');
    }
    var stmt = db.prepare("SELECT matches.id as matchId, p.name AS winner, mp.id AS playerId, mp.name, GROUP_CONCAT(points) AS points FROM matches\n\t\t\tINNER JOIN player_matches ON player_matches.matchId = matches.id\n\t\t\tINNER JOIN match_players AS mp ON mp.id = player_matches.playerId\n\t\t\tLEFT JOIN match_players AS p ON p.id = playerWon\n\t\tGROUP BY mp.name\n\t\tORDER BY matches.id, mp.name, setNum ASC\n\t\tLIMIT ?, ?");
    var rows = stmt.all(page * limit * 2, limit * 2);
    console.log('Rows:', rows);
    var result;
    if (rows.length > 0) {
        result = rows.reduce(function (acc, post) {
            var _a;
            var matchId = post.matchId, playerId = post.playerId, winner = post.winner, name = post.name, playerPoints = post.playerPoints;
            return __assign(__assign({}, acc), (_a = {}, _a[matchId] = {
                players: __spreadArray(__spreadArray([], (acc[matchId].players || []), true), [
                    { id: playerId, name: name, points: JSON.parse(playerPoints) },
                ], false),
                winner: winner
            }, _a));
        });
    }
    var resultMatch = [];
    if (rows.length > 0)
        Object.keys(result).forEach(function (key) {
            resultMatch.push(__assign({ id: key }, result[key]));
        });
    console.log(resultMatch);
    res.status(200).send(resultMatch);
});
// Get match by id
app.get('/matches/:id', function (req, res) {
    var id = req.params.id;
    if (Number.isNaN(Number.parseInt(id))) {
        res.status(400).send('ID is not a number!');
        return console.error('Id is not a number!');
    }
    var stmt = db.prepare("SELECT matches.id as matchId, setNum, p.name AS winner, mp.id AS playerId, mp.name, GROUP_CONCAT(points) AS points FROM matches\n        INNER JOIN player_matches ON player_matches.matchId = matches.id\n        INNER JOIN match_players AS mp ON mp.id = player_matches.playerId\n        LEFT JOIN match_players AS p ON p.id = playerWon\n    WHERE matchId = ?\n        GROUP BY mp.name\n        ORDER BY matchId, mp.name, setNum ASC;");
    var rows = stmt.all(id);
    var result;
    if (rows.length > 0) {
        result = rows.reduce(function (acc, post) {
            var _a;
            var matchId = post.matchId, playerId = post.playerId, winner = post.winner, name = post.name, playerPoints = post.playerPoints;
            return __assign(__assign({}, acc), (_a = {}, _a[matchId] = {
                players: __spreadArray(__spreadArray([], (acc[matchId].players || []), true), [
                    { id: playerId, name: name, points: JSON.parse(playerPoints) },
                ], false),
                winner: winner
            }, _a));
        });
    }
    var resultingMatch = [];
    if (rows.length > 0)
        Object.keys(result).forEach(function (key) {
            resultingMatch.push(__assign({ id: key }, result[key]));
        });
    console.log(resultingMatch);
    res.status(200).send(resultingMatch[0]);
});
// Add match info
app.post('/matches', function (req, res) {
    var body = req.body;
    console.dir(body);
    if (!body.winner || !body.players || !body.players.length) {
        res.status(400).send('Request has no body');
        return console.error('Request has no body');
    }
    var id = db
        .prepare('INSERT INTO matches (playerWon) VALUES (?)')
        .run(body.players.find(function (player) { return player.name === body.winner; }).id).lastInsertRowid;
    var insert = db.prepare('INSERT INTO player_matches (playerId, matchId, setNum, points VALUES (?, ?, ?, ?)');
    var insertMany = db.transaction(function (players) {
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var player = players_1[_i];
            var index = 1;
            for (var _a = 0, _b = player.points; _a < _b.length; _a++) {
                var point = _b[_a];
                insert.run(player.id, id, index++, point);
            }
        }
    });
    insertMany(body.players);
    var stmt = db.prepare("SELECT matches.id as matchId, setNum, p.name AS winner, mp.id AS playerId, mp.name, GROUP_CONCAT(points) AS playerPoints FROM matches\n\t\t\tINNER JOIN player_matches ON player_matches.matchId = matches.id\n\t\t\tINNER JOIN match_players AS mp ON mp.id = player_matches.playerId\n\t\t\tLEFT JOIN match_players AS p ON p.id = playerWon\n\t\tWHERE matchId = ?\n\t\t\tGROUP BY mp.name\n\t\t\tORDER BY matchId, mp.name, setNum ASC");
    var rows = stmt.all(id);
    var result;
    if (rows.length > 0) {
        result = rows.reduce(function (acc, post) {
            var _a;
            var matchId = post.matchId, playerId = post.playerId, winner = post.winner, name = post.name, playerPoints = post.playerPoints;
            return __assign(__assign({}, acc), (_a = {}, _a[matchId] = {
                players: __spreadArray(__spreadArray([], (acc[matchId].players || []), true), [
                    { id: playerId, name: name, points: JSON.parse(playerPoints) },
                ], false),
                winner: winner
            }, _a));
        });
    }
    var resultingMatch = [];
    if (rows.length > 0)
        Object.keys(result).forEach(function (key) {
            resultingMatch.push(__assign({ id: key }, result[key]));
        });
    console.log(resultingMatch);
    res.status(200).send(resultingMatch[0]);
    updatePlayers();
    updateWinners();
});
// Update match info
app.put('/matches/:id', function (req, res) {
    var body = req.body;
    var id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).send('ID is not a number');
        throw new Error('ID is not a number');
    }
    if (!body.winner || !body.players || !body.players.length) {
        res.status(400).send('Request has no body');
        return console.error('Request has no body');
    }
    db.prepare('UPDATE matches SET playerWon = $playerWon WHERE id = $id').run({
        playerWon: body.players.find(function (player) { return player.name === body.winner; }).id,
        id: id
    });
    db.prepare('DELETE FROM player_matches WHERE matchId = $id').run({ id: id });
    var insert = db.prepare('INSERT INTO player_matches (playerId, matchId, setNum, points VALUES (?, ?, ?, ?)');
    var insertMany = db.transaction(function (players) {
        for (var _i = 0, players_2 = players; _i < players_2.length; _i++) {
            var player = players_2[_i];
            var index = 1;
            for (var _a = 0, _b = player.points; _a < _b.length; _a++) {
                var point = _b[_a];
                insert.run(player.id, id, index++, point);
            }
        }
    });
    insertMany(body.players);
    var stmt = db.prepare("SELECT matches.id as matchId, setNum, p.name AS winner, mp.id AS playerId, mp.name, GROUP_CONCAT(points) AS playerPoints FROM matches\n\t\t\tINNER JOIN player_matches ON player_matches.matchId = matches.id\n\t\t\tINNER JOIN match_players AS mp ON mp.id = player_matches.playerId\n\t\t\tLEFT JOIN match_players AS p ON p.id = playerWon\n\t\tWHERE matchId = ?\n\t\t\tGROUP BY mp.name\n\t\t\tORDER BY matchId, mp.name, setNum ASC");
    var rows = stmt.all(id);
    var result;
    if (rows.length > 0) {
        result = rows.reduce(function (acc, post) {
            var _a;
            var matchId = post.matchId, playerId = post.playerId, winner = post.winner, name = post.name, playerPoints = post.playerPoints;
            return __assign(__assign({}, acc), (_a = {}, _a[matchId] = {
                players: __spreadArray(__spreadArray([], (acc[matchId].players || []), true), [
                    { id: playerId, name: name, points: JSON.parse(playerPoints) },
                ], false),
                winner: winner
            }, _a));
        });
    }
    var resultingMatch = [];
    if (rows.length > 0)
        Object.keys(result).forEach(function (key) {
            resultingMatch.push(__assign({ id: key }, result[key]));
        });
    console.log(resultingMatch);
    res.status(200).send(resultingMatch[0]);
    updatePlayers();
    updateWinners();
});
// Delete match
app["delete"]('/matches/:id', function (req, res) {
    var id = req.params.id;
    if (Number.isNaN(Number.parseInt(id))) {
        res.status(400).send('ID is not a number');
        return console.error('ID is not a number');
    }
    var stmt = db.prepare("DELETE FROM matches WHERE ID = $id");
    stmt.run({ id: id });
    var selectSQL = fs.readFileSync('./backend/db-scripts/select-all-matches.sql', 'utf-8');
    var result = db.prepare(selectSQL).all();
    res.status(200).send(result);
    updatePlayers();
    updateWinners();
});
function updatePlayers() {
    var updateSQL = fs.readFileSync('./backend/db-scripts/update-players.sql', 'utf-8');
    db.exec(updateSQL);
}
function updateWinners() {
    var updateSQL = fs.readFileSync('./backend/db-scripts/update-winners.sql', 'utf-8');
    db.exec(updateSQL);
}
function verifyTables() {
    var verifySQL = fs.readFileSync('./backend/db-scripts/verify-tables.sql', 'utf-8');
    db.exec(verifySQL);
}
app.listen(3000, function () {
    console.log("App listening on port ".concat(3000, "."));
});
process.on('exit', function () {
    console.info('Exiting...');
    db.close();
});
