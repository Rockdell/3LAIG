/**
 * MyGameModel
 */
class MyGameModel {

    constructor() {
        this.currentBoardLength = 5;
        this.currentConsecutive = 4;
        this.currentPlayer = 'b';

        this.board = null;
        this.lastMove = 'pmove(_,_,_)';

        this.templatePieces = [
            new MyPieceModel(-1, 1, "v", "o"),
            new MyPieceModel(-1, 2.3, "h", "o"),
            new MyPieceModel(-1, 3.6, "du", "o"),
            new MyPieceModel(-1, 4.9, "dd", "o"),
            new MyPieceModel(this.currentBoardLength + 1, 1, "v", "b"),
            new MyPieceModel(this.currentBoardLength + 1, 2.3, "h", "b"),
            new MyPieceModel(this.currentBoardLength + 1, 3.6, "du", "b"),
            new MyPieceModel(this.currentBoardLength + 1, 4.9, "dd", "b")
        ];

        this.pieces = [];
    }

    setBoardSettings(currentBoardLength, currentConsecutive) {
        let promise = makeRequest(`set_board_settings(${currentBoardLength},${currentConsecutive})`);

        let handler;
        promise.then(handler = (response) => {
            if (response !== 'Bad request') {
                this.currentBoardLength = currentBoardLength;
                this.currentConsecutive = currentConsecutive;
            }

            console.log(response);
        });
    }

    setGameMode(mode) {
        let promise = makeRequest(`set_game_mode(${mode})`);

        let handler;
        promise.then(handler = (response) => {
            console.log(response);
        })
    }

    createBoard() {
        let promise = makeRequest(`create_board(Board)`);

        let handler;
        promise.then(handler = (response) => {
            if (response !== 'Bad Request') {
                this.board = response;
            }

            console.log(response);
        });
    }

    // chooseMovePlayer(col, row, dir) {
    //     let move = `pmove(${col},${row},${dir})`;
    // }

    // chooseMoveBot(botType) {


    // }

    move(move) {

        // let move = `pmove(${col},${row},${dir})`;
        // console.log(move);
        
        // this.board = "[[bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' ')],[bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' ')],[bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' ')],[bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' ')],[bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' '), bpiece(-,' ')],]";
        // console.log(this.board);

        let validateMove = makeRequest(`validate_move(${this.board},${this.lastMove},${move})`);

        let handler1;
        validateMove.then(handler1 = (response) => {
            if (response !== 'Bad Request') {

                let makeMove = makeRequest(`move(${this.board},${this.currentPlayer},${move},NewBoard)`);

                let handler2;
                makeMove.then(handler2 = (response) => {
                    if (response !== 'Bad request') {
                        this.board = response;
                        this.lastMove = move;
                    }

                    console.log(response);
                })
            }

            console.log(response);
        });
    }
}