/**
 * MyGameController
 */
class MyGameController {

    constructor() {
        if (!MyGameController.instance) {
            MyGameController.instance = this;
        }
    }

    static getInstance() {
        return MyGameController.instance;
    }

    // setBoardSettings(5,4)
    // setGameSettings('user', 'user) ('user', 'easybot' ou 'hardbot')
    // createBoard()
    // gameLoop()

    gameLoop() {

        if (MyGameModel.getInstance().gameOver) return;

        let nextPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? MyGameModel.getInstance().b : MyGameModel.getInstance().o;

        if (nextPlayer === 'user') {
            return; // TODO later - move(InputController.getInstance().getNextMove())
        } else {
            this.genBotMove(nextPlayer);
        }
    }

    setBoardSettings(boardLength, consecutive) {
        let promise = makeRequest(`set_board_settings(${boardLength},${consecutive})`);

        let handler;
        promise.then(handler = (response) => {
            if (response === 'ok') {
                MyGameModel.getInstance().updateBoardSettings(boardLength, consecutive)
            } else if (response === 'no') {
                console.log('Error: setting game settings.');
            }
        });
    }

    setGameSettings(b, o) {

        if (b === 'hardbot' && b === o) {
            b += '1';
            o += '2';
        }

        let promise = makeRequest(`set_game_settings(${b},${o})`);

        let handler;
        promise.then(handler = (response) => {
            if (response === 'ok') {
                MyGameModel.getInstance().updateGameSettings(b, o);
            } else if (response === 'no') {
                console.log('Error: setting game settings.');
            }
        });
    }

    createBoard() {
        let promise = makeRequest(`create_board(Board)`);

        let handler;
        promise.then(handler = (board) => {
            if (board !== 'no') {
                MyGameModel.getInstance().boardModel.update(board);
            } else {
                console.log('Error: creating board');
            }
        });
    }

    genBotMove(botType) {

        let lastMove = MyGameModel.getInstance().moves[MyGameModel.getInstance().moves.length - 1];
        let promise = makeRequest(`choose_move(${MyGameModel.getInstance().boardModel.board},${botType},${lastMove},NextMove)`);

        let handler;
        promise.then(handler = (botMove) => {
            if (botMove !== 'no') {
                this.validate(botMove);
            } else {
                console.log('Error: generating bot move.');
            }
        });
    }

    validate(move) {

        let lastMove = MyGameModel.getInstance().moves[MyGameModel.getInstance().moves.length - 1];
        let promise = makeRequest(`validate_move(${MyGameModel.getInstance().boardModel.board},${lastMove},${move})`);

        let handler;
        promise.then(handler = (valid) => {
            if (valid === 'ok') {
                this.move(move);
            } else if (valid === 'no') {
                console.log('Error: validating move.');
            }
        });

    }

    move(move) {

        let promise = makeRequest(`move(${MyGameModel.getInstance().boardModel.board},${MyGameModel.getInstance().currentPlayer},${move},NewBoard)`);

        let handler;
        promise.then(handler = (newBoard) => {
            if (newBoard !== 'no') {
                MyGameModel.getInstance().boardModel.update(newBoard);
                MyGameModel.getInstance().addPiece(move);
                MyGameModel.getInstance().currentPlayer = (MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b');

                this.gameOver();
            } else {
                console.log('Error: making move.');
            }
        });

        // pmove(col,row,dir), dir = [v,h,du,dd]

        // let lastMove = MyGameModel.getInstance().moves[MyGameModel.getInstance().moves.length - 1];
        // let promise1 = makeRequest(`validate_move(${MyGameModel.getInstance().boardModel.board},${lastMove},${move})`);

        // let handler1;
        // promise1.then(handler1 = (valid) => {
        //     if (valid === 'ok') {

        //         let promise2 = makeRequest(`move(${MyGameModel.getInstance().boardModel.board},${MyGameModel.getInstance().currentPlayer},${move},NewBoard)`);

        //         let handler2;
        //         promise2.then(handler2 = (newBoard) => {
        //             if (newBoard !== 'no') {
        //                 MyGameModel.getInstance().boardModel.update(newBoard);
        //                 MyGameModel.getInstance().addPiece(move);
        //                 MyGameModel.getInstance().currentPlayer = (MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b');

                        


        //             } else {
        //                 console.log('Error: making move.');
        //             }
        //         })
        //     } else if (valid === 'no') {
        //         console.log('Error: validating move.');
        //     }
        // });
    }

    gameOver() {

        let lastMove = MyGameModel.getInstance().moves[MyGameModel.getInstance().moves.length - 1];
        let lastPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b';
        let promise = makeRequest(`game_over(${MyGameModel.getInstance().boardModel.board},${lastMove},${lastPlayer},${MyGameModel.getInstance().consecutive})`)

        let handler;
        promise.then(handler = (response) => {
            if (response === 'is_over') {
                MyGameModel.getInstance().gameOver = true;
                console.warn('Game over!');
            } else if (response === 'not_over') {
                MyGameModel.getInstance().gameOver = false;
            } else if (response === 'no') {
                console.log('Error: game over.');
            }
        })
    }
}



