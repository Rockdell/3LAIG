/**
 * MyGameModel
 */
class MyGameModel {

    constructor() {

        // Board settings
        this.currentBoardLength = 7;
        this.currentConsecutive = 4;

        // Game settings
        this.p1 = "user";   // Player 1 will be brown and will start first
        this.p2 = "user";
        // this.p2 = "HardBot[1 or 2]";

        // Game state
        this.board = null;
        this.currentPlayer = 'b';
        this.lastMove = 'pmove(_,_,_)';

        let cx = (this.currentBoardLength - 5) / 2 + 0.625 + 0.5;

        // (length - 5) / 2                 -> espaço da ponta do board ao inicio do primeiro template (templates ocupam espaço de comprimento 5)
        // 5 / 4 = 1.25, 1.25 / 2 = 0.625   -> cada template ocupa 1.25, o raio do espaço de cada template sera 0.625
        // + 0.5                            -> compensar pelo translate de 0.5 do board.

        this.templatePieces = [
            // new MyPieceModel(-1, 1, "v", "o", 0),
            // new MyPieceModel(-1, 2.3, "h", "o", 1),
            // new MyPieceModel(-1, 3.6, "du", "o", 2),
            // new MyPieceModel(-1, 4.9, "dd", "o", 3),
            // new MyPieceModel(this.currentBoardLength + 1, 1, "v", "b"),
            // new MyPieceModel(this.currentBoardLength + 1, 2.3, "h", "b"),
            // new MyPieceModel(this.currentBoardLength + 1, 3.6, "du", "b"),
            // new MyPieceModel(this.currentBoardLength + 1, 4.9, "dd", "b")

            new MyPieceModel(cx, this.currentBoardLength + 1.5, "v", "b", 1),
            new MyPieceModel(cx + 1.25, this.currentBoardLength + 1.5, "h", "b", 2),
            new MyPieceModel(cx + 2.50, this.currentBoardLength + 1.5, "du", "b", 3),
            new MyPieceModel(cx + 3.75, this.currentBoardLength + 1.5, "dd", "b", 4),
            new MyPieceModel(cx + 3.75, -1, "v", "o", 1),
            new MyPieceModel(cx + 2.50, -1, "h", "o", 2),
            new MyPieceModel(cx + 1.25, -1, "du", "o", 3),
            new MyPieceModel(cx, -1, "dd", "o", 4)
        ];

        this.pieces = [
            new MyPieceModel(7, 7, "v", "b", 0)
        ];
    }

    setBoardSettings(currentBoardLength, currentConsecutive) {
        let promise = makeRequest(`set_board_settings(${currentBoardLength},${currentConsecutive})`);

        let handler;
        promise.then(handler = (response) => {
            if (response === 'ok') {
                this.currentBoardLength = currentBoardLength;
                this.currentConsecutive = currentConsecutive;
            } else if (response === 'no') {
                console.log('Error: setting game settings.');
            }
        });
    }

    setGameSettings(player1, player2) {
        let promise = makeRequest(`set_game_settings(${player1},${player2})`);

        let handler;
        promise.then(handler = (response) => {
            if (response === 'ok') {
                this.player1 = player1;
                this.player2 = player2;
            } else if (response === 'no') {
                console.log('Error: setting game settings.');
            }
        });
    }

    createBoard() {
        let promise = makeRequest(`create_board(Board)`);

        let handler;
        promise.then(handler = (response) => {
            if (response !== 'no') {
                this.board = response;
            } else {
                console.log('Error: creating board');
            }
        });
    }

    genBotMove(botType) {
        let promise = makeRequest(`choose_move(${this.board},${botType},${this.lastMove},NextMove)`);

        let handler;
        promise.then(handler = (response) => {
            if (response !== 'no') {
                console.log(response);
            } else {
                console.log('Error: generating bot move.');
            }
        });
    }

    move(move) {

        // pmove(col,row,dir), dir = [v,h,du,dd]

        move = encodeURI(move);
        // ^ Prob can remove later

        let promise1 = makeRequest(`validate_move(${this.board},${this.lastMove},${move})`);

        let handler1;
        promise1.then(handler1 = (response) => {
            if (response === 'ok') {

                let promise2 = makeRequest(`move(${this.board},${this.currentPlayer},${move},NewBoard)`);

                let handler2;
                promise2.then(handler2 = (response) => {
                    if (response !== 'no') {
                        this.board = response;
                        this.lastMove = move;
                        this.currentPlayer = (this.currentPlayer === 'b' ? 'o' : 'b');
                    } else {
                        console.log('Error: making move.');
                    }
                })
            } else if (response === 'no') {
                console.log('Error: validating move.');
            }
        });
    }

    gameOver() {

        let promise = makeRequest(`game_over(${this.board},${this.lastMove},${this.currentPlayer === 'b' ? 'o' : 'b'},${this.currentConsecutive})`)

        let handler;
        promise.then(handler = (response) => {
            if (response === 'is_over') {
                console.warn('Game over.');
            } else if (response === 'not_over') {
                console.warn('Game not over.');
            } else if (response === 'no') {
                console.log('Error: game over.');
            }
        })
    }
}