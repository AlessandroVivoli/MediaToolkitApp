export type Player = {
	id: number;
	name: string;
	setsWon: number;
};

export type Match = {
	id: number;
	players: MatchPlayer[];
	winner: string;
};

export type MatchPlayer = {
	id: number;
	name: string;
	points: number[];
};

export type MatchInfo = {
	[matchInfoId: number]: {
    matchId: number;
		players: MatchPlayer[];
		winner: string;
	};
};
