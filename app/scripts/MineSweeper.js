import Board from './Board';
import {NUM_ROWS, NUM_COLS, NUM_BOMBS} from './constants';

export default class MineSweeper {
    constructor() {
        this.board = new Board();
        var self = this;

        $('.restart').click(function() {
            self.restart();
        });

        $('.tile-container').mousedown(function(event) {
            if (self.board.gameOver) { return; }

            let $tile = $(this).children('.tile');
            let row = $tile.attr('row');
            let col = $tile.attr('col');
            let tile = self.board.getTile(row, col);

            if (!$tile.hasClass('uncovered')) {

                // Left click
                if (event.which == 1 && !tile.marked) {
                    if (!self.board.isSetup) {
                        self.board.setup(row, col);
                        self.startClock();
                    }
                    if (tile.hasBomb) {
                        $tile.addClass('incorrect');
                        self.board.gameOver = true;
                        self.showSolution();
                    } else {
                        self.uncoverTile(tile);
                    }

                // Right click
                } else if (event.which == 3) {
                    $tile.toggleClass('flagged');
                    tile.marked = $tile.hasClass('flagged');
                    tile.flagged = $tile.hasClass('flagged');

                    if ($tile.hasClass('flagged')) {
                        self.board.bombsRemaining -= 1;
                        self.generateBurst($tile);
                    } else {
                        self.board.bombsRemaining += 1;
                    }

                    $('.info .remaining span').text(self.board.bombsRemaining);
                }
            }

            // WIN!
            if (NUM_BOMBS == self.board.tilesRemaining) {
                self.board.gameOver = true;
                self.showWinScreen();
            }
        });
    }

    showWinScreen() {
        $('.win-screen').removeClass('hidden').css('opacity', '0');
        $('.win-screen').animate({'opacity': '1'});
        var seconds = this.board.seconds;
        if (this.board.seconds < 10) {
            seconds = "0" + this.board.seconds;
        }
        $('.win-screen .seconds').text(seconds);
        $('.win-screen .minutes').text(this.board.minutes);
    }

    generateBurst($tile) {
        return new mojs.Burst({
            parent: $tile.get(0),
            x: '50%',
            y: '50%',
            shape : 'circle',
            fill : 'white',
            duration: 400,
            childOptions: {
                radius: {10:0},
                type: 'line',
                stroke: '#5C6B95',
                strokeWidth: 2
            },
            radius: {25:35},
            count: 8,
            easing: mojs.easing.bezier(0.1, 1, 0.3, 1)
        });
    }

    tileElement(row, col) {
        return $('.tile[row='+row+'][col='+col+']');
    }

    showSolution() {
        this.board.forEachTile(tile => {
            let $tile = this.tileElement(tile.row, tile.col);
            if (tile.hasBomb) {
                $tile.addClass('bomb');
            }
            if (tile.flagged) {
                if (!tile.hasBomb) {
                    $tile.addClass('incorrect');
                } else {
                    $tile.addClass('correct');
                }
            }
        });
    }

    uncoverTile(tile) {
        tile.marked = true;
        let $tile = this.tileElement(tile.row, tile.col);

        if (tile.count != 0) {
            $tile.text(tile.count);
            $tile.attr('count', tile.count);
        } else {
            for (let coords of tile.surroundingCoords()) {
                let adjacentTile = this.board.getTile(...coords);
                if (!adjacentTile.marked) {
                    this.uncoverTile(this.board.getTile(...coords));
                }
            }
        }

        $tile.addClass('uncovered');
        this.board.tilesRemaining -= 1;
    }

    restart() {
        this.board = new Board();
        $('.win-screen').addClass('hidden');
        $('.tile').removeClass('bomb uncovered flagged incorrect correct').text('');
        $('.seconds').text('00');
        $('.minutes').text('0');
    }

    advanceClock() {
        if (this.board.isSetup && !this.board.gameOver) {
            this.board.incrementTime();
            var seconds = this.board.seconds;
            if (this.board.seconds < 10) {
                seconds = "0" + this.board.seconds;
            }
            $('.timer .minutes').text(this.board.minutes);
            $('.timer .seconds').text(seconds);
            if (!this.board.gameOver) {

                var self = this;
                setTimeout(function(){self.advanceClock()}, 1000);
            }
        }
    }

    startClock() {
        $('.timer .minutes').text("0");
        $('.timer .seconds').text("00");
        var self = this;
        setTimeout(function(){self.advanceClock()}, 1000);
    }
}
