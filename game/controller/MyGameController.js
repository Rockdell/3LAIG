/**
 * MyGameController
 */
class MyGameController {

    constructor() {
        if (!MyGameController.instance) {
            this.waitingServer = false;
            MyGameController.instance = this;
        }
    }

    static getInstance() {
        return MyGameController.instance;
    }

    Start_Game() {

        //If the game is over / hasn't begun
        if (MyGameModel.getInstance().gameOver) {

            MyGameView.getInstance().scene.interface.boardLengthGroup.remove();
            MyGameView.getInstance().scene.interface.consecutiveGroup.remove();

            this.setBoardSettings(MyGameModel.getInstance().boardModel.boardLength, MyGameModel.getInstance().consecutive, MyGameModel.getInstance().timer);

            setTimeout(() => {
                // this.setGameSettings(MyGameModel.getInstance().b, MyGameModel.getInstance().o);
                this.setGameSettings("user", "user");
            }, 500);

            setTimeout(() => {
                this.createBoard();
                MyGameView.getInstance().scene.interface.gameSettings.add(MyGameController.getInstance(), "Undo_Move");
                MyGameModel.getInstance().scoreBoardModel.start();
                console.log("Game Started!");
            }, 1000);

        }

    }

    gameLoop() {

        if (MyGameModel.getInstance().gameOver) return;
        
        if (MyGameModel.getInstance().scoreBoardModel.time <= 0) {
            MyGameModel.getInstance().gameOver = true;
            console.log("User Timed Out!");
            return;
        }

        let nextPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? MyGameModel.getInstance().b : MyGameModel.getInstance().o;

        if (nextPlayer === 'user') {
            let nextMove = MyInputController.getInstance().getUserMove();
            if (nextMove) this.validate(nextMove);
        } else {
            this.genBotMove(nextPlayer);
        }
    }

    setBoardSettings(boardLength, consecutive, timer) {

        if (MyGameController.getInstance().waitingServer) return;

        let promise = makeRequest(`set_board_settings(${boardLength},${consecutive})`);

        let handler;
        promise.then(handler = (response) => {
            if (response === 'ok') {
                MyGameModel.getInstance().updateBoardSettings(boardLength, consecutive, timer);
            } else if (response === 'no') {
                console.log('Error: setting game settings.');
            }
        });
    }

    setGameSettings(b, o) {

        if (MyGameController.getInstance().waitingServer) return;

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

        if (MyGameController.getInstance().waitingServer) return;  

        let promise = makeRequest(`create_board(Board)`);

        let handler;
        promise.then(handler = (board) => {
            if (board !== 'no') {
                MyGameModel.getInstance().boardModel.update(board);
                MyGameModel.getInstance().gameOver= false;
            } else {
                console.log('Error: creating board');
            }
        });
    }

    genBotMove(botType) {

        if (MyGameController.getInstance().waitingServer) return;

        let promise = makeRequest(`choose_move(${MyGameModel.getInstance().boardModel.getBoard()},${botType},${MyGameModel.getInstance().getLastMove()},NextMove)`);

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

        if (MyGameController.getInstance().waitingServer) return;

        let promise = makeRequest(`validate_move(${MyGameModel.getInstance().boardModel.getBoard()},${MyGameModel.getInstance().getLastMove()},${move})`);

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

        if (MyGameController.getInstance().waitingServer) return;

        let promise = makeRequest(`move(${MyGameModel.getInstance().boardModel.getBoard()},${MyGameModel.getInstance().currentPlayer},${move},NewBoard)`);

        let handler;
        promise.then(handler = (newBoard) => {
            if (newBoard !== 'no') {
                MyGameModel.getInstance().boardModel.update(newBoard);
                MyGameModel.getInstance().addPiece(move);
                MyGameModel.getInstance().currentPlayer = (MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b');
                MyGameModel.getInstance().scoreBoardModel.setTimer(MyGameModel.getInstance().timer);

                this.gameOver();
            } else {
                console.log('Error: making move.');
            }
        });
    }

    gameOver() {

        if (MyGameController.getInstance().waitingServer) return;

        let lastPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b';
        let promise = makeRequest(`game_over(${MyGameModel.getInstance().boardModel.getBoard()},${MyGameModel.getInstance().getLastMove()},${lastPlayer},${MyGameModel.getInstance().consecutive})`)

        let handler;
        promise.then(handler = (response) => {
            if (response === 'is_over') {
                MyGameModel.getInstance().gameOver = true;
                MyGameModel.getInstance().removeValidMoves();
                console.warn('Game over!');
            } else if (response === 'not_over') {
                this.validMoves();
            } else if (response === 'no') {
                console.log('Error: game over.');
            }
        })
    }

    validMoves() {

        if (MyGameController.getInstance().waitingServer) return;

        let promise = makeRequest(`valid_moves(${MyGameModel.getInstance().boardModel.getBoard()},${MyGameModel.getInstance().getLastMove()},ListOfMoves)`);

        let handler;
        promise.then(handler = (response) => {
            if (response !== 'no') {
                MyGameModel.getInstance().removeValidMoves();
                MyGameModel.getInstance().addValidMoves(response);
            } else {
                console.log('Error: getting valid moves.');
            }
        });
    }

    Undo_Move() {

        if (MyGameModel.getInstance().getLastMove() === 'pmove(_,_,_)') {
            console.log('Error: can\'t undo more moves.');
            return;
        }

        let currentPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? MyGameModel.getInstance().b : MyGameModel.getInstance().o;
        let lastPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? MyGameModel.getInstance().o : MyGameModel.getInstance().b;

        if (currentPlayer === 'user' && lastPlayer !== 'user') {
            MyGameModel.getInstance().boardModel.removePiece();
            MyGameModel.getInstance().removePiece();

            if (MyGameModel.getInstance().getLastMove() !== 'pmove(_,_,_)') {
                MyGameModel.getInstance().boardModel.removePiece();
                MyGameModel.getInstance().removePiece();
            } else {
                MyGameModel.getInstance().currentPlayer = (MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b');
            }
        } else {
            MyGameModel.getInstance().boardModel.removePiece();
            MyGameModel.getInstance().removePiece();
            MyGameModel.getInstance().currentPlayer = (MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b');
        }

        MyInputController.getInstance().reset();
        MyGameModel.getInstance().gameOver = false;

        MyGameModel.getInstance().scoreBoardModel.setTimer(MyGameModel.getInstance().timer);
    }
}



