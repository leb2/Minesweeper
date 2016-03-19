import {NUM_ROWS, NUM_COLS, NUM_BOMBS} from './constants';

export default class Tile {
    constructor(row, col) {
        this.count = 0;
        this.hasBomb = false;
        this.covered = false;
        this.flagged = false;

        this.row = parseInt(row);
        this.col = parseInt(col);
    }

    surroundingCoords() {
        var coords = [];
        for (var i=Math.max(this.row-1, 0); i<=Math.min(this.row+1, NUM_ROWS-1); i++) {
            for (var j=Math.max(this.col-1, 0); j<=Math.min(this.col+1, NUM_COLS-1); j++) {
                coords.push([i, j]);
            }
        }
        return coords;
    }
}
