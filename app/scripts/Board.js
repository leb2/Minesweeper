import Tile from './Tile';
import {NUM_ROWS, NUM_COLS, NUM_BOMBS} from './constants';

export default class Board {
    constructor() {
        this.rows = [];
        this.isSetup = false;
        this.gameOver = false;
        this.bombsRemaining = NUM_BOMBS;
        this.tilesRemaining = NUM_ROWS * NUM_COLS;
        this.seconds = 0;
        this.minutes = 0;

        for (var i=0; i<NUM_ROWS; i++) {
            var row = [];
            this.rows.push(row);

            for (var j=0; j<NUM_COLS; j++) {
                row.push(new Tile(i, j));
            }
        }
    }

    incrementTime() {
        this.seconds += 1;
        if (this.seconds == 60) {
            this.seconds = 0;
            this.minutes += 1;
        }
    }

    getTile(row, col) {
        return this.rows[parseInt(row)][parseInt(col)];
    }

    forEachTile(func) {
        for (let row of this.rows) {
            for (let tile of row) {
                func(tile);
            }
        }
    }

    setup(initialRow, initialCol) {
        var initialTile = new Tile(initialRow, initialCol);
        var safeCoords = initialTile.surroundingCoords();

        // Setup bombs
        for (var i=0; i<NUM_BOMBS; i++) {
            var placedBomb = false;

            while (!placedBomb) {
                var r = parseInt(Math.random() * NUM_ROWS * NUM_COLS);
                var row = parseInt(r / NUM_COLS);
                var col = r % NUM_COLS;
                var tile = this.getTile(row, col);

                let shouldPlace = true;
                for (let coords of safeCoords) {
                    if (coords.toString() == [row, col].toString()) {
                        shouldPlace = false;
                    }
                }

                if (!tile.hasBomb && shouldPlace) {
                    tile.hasBomb = true;
                    placedBomb = true;
                }
            }
        }

        // Count Bombs
        this.forEachTile(tile => {
            tile.count = 0;
            for (let coords of tile.surroundingCoords()) {
                let adjacentTile = this.getTile(...coords);
                if (adjacentTile.hasBomb) {
                    tile.count += 1;
                }
            }
        });

        this.isSetup = true;
    }
}
