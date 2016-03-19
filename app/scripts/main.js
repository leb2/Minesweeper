;(function() {

    var NUM_ROWS = 16;
    var NUM_COLS = 30;
    var NUM_BOMBS = 99;

    class Tile {
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


    class Board {

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
            console.log(safeCoords);

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


    function play() {
        let board = new Board();

        var tileElement = function(row, col) {
            return $('.tile[row='+row+'][col='+col+']');
        }

        var showSolution = function() {
            board.forEachTile(tile => {
                let $tile = tileElement(tile.row, tile.col);
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

        var uncoverTile = function(tile) {
            tile.marked = true;
            let $tile = tileElement(tile.row, tile.col);

            if (tile.count != 0) {
                $tile.text(tile.count);
                $tile.attr('count', tile.count);
            } else {
                for (let coords of tile.surroundingCoords()) {
                    let adjacentTile = board.getTile(...coords);
                    if (!adjacentTile.marked) {
                        uncoverTile(board.getTile(...coords));
                    }
                }
            }

            $tile.addClass('uncovered');
            board.tilesRemaining -= 1;
        }

        var restart = function() {
            board = new Board();
            $('.win-screen').addClass('hidden');
            $('.tile').removeClass('bomb uncovered flagged incorrect correct').text('');
            $('.seconds').text('00');
            $('.minutes').text('0');
        }

        var advanceClock = function() {

            if (board.setup && !board.gameOver) {

                board.incrementTime();
                var seconds = board.seconds;
                if (board.seconds < 10) {
                    seconds = "0" + board.seconds;
                }
                $('.timer .minutes').text(board.minutes);
                $('.timer .seconds').text(seconds);

                if (!board.gameOver) {
                    setTimeout(advanceClock, 1000);
                }
            }
        }

        var startClock = function() {
            $('.timer .minutes').text("0");
            $('.timer .seconds').text("00");
            setTimeout(advanceClock, 1000);
        }

        $('.restart').click(restart);

        $('.tile-container').mousedown(function(event) {
            console.log("test");
            console.log(event.which);
            console.log("test2");
            if (board.gameOver) { return; }

            let $tile = $(this).children('.tile');
            let row = $tile.attr('row');
            let col = $tile.attr('col');
            let tile = board.getTile(row, col);

            if (!$tile.hasClass('uncovered')) {

                // Left click
                if (event.which == 1 && !tile.marked) {
                    if (!board.isSetup) {
                        board.setup(row, col);
                        startClock();
                    }
                    if (tile.hasBomb) {
                        $tile.addClass('incorrect');
                        board.gameOver = true;
                        showSolution();
                    } else {
                        uncoverTile(tile);
                    }

                // Right click
                } else if (event.which == 3) {
                    $tile.toggleClass('flagged');
                    tile.marked = $tile.hasClass('flagged');
                    tile.flagged = $tile.hasClass('flagged');

                    if ($tile.hasClass('flagged')) {
                        board.bombsRemaining -= 1;

                        var burst = new mojs.Burst({
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
                    } else {
                        board.bombsRemaining += 1;
                    }

                    $('.info .remaining span').text(board.bombsRemaining);
                }
            }

            // WIN!
            console.log(board.tilesRemaining == NUM_BOMBS);
            if (NUM_BOMBS == board.tilesRemaining) {
                board.gameOver = true;
                console.log(" you win ");
                $('.win-screen').removeClass('hidden').css('opacity', '0');
                $('.win-screen').animate({'opacity': '1'});
                var seconds = board.seconds;
                if (board.seconds < 10) {
                    seconds = "0" + board.seconds;
                }
                $('.win-screen .seconds').text(seconds);
                $('.win-screen .minutes').text(board.minutes);
            }
        });
    }

    play();
})();
