/**
 * MyGameController
 */
class MyGameController {

    constructor() {
        if (!MyGameController.instance) {
            this.waitingServer = false;
            this.replayPlaying = false;
            MyGameController.instance = this;
        }
    }

    static getInstance() {
        return MyGameController.instance;
    }

    startGame() {

        //If the game is over / hasn't begun
        if (MyGameModel.getInstance().gameOver) {

            this.setSettings(MyGameModel.getInstance().boardModel.boardLength, MyGameModel.getInstance().consecutive, MyGameModel.getInstance().timer, MyGameModel.getInstance().b, MyGameModel.getInstance().o);

            console.log("Game Started!");

            MyGameView.getInstance().scene.interface.removeGameSettings();
            MyGameView.getInstance().scene.interface.addStartGameOptions();

            MyGameModel.getInstance().scoreBoardModel.start();
        }
    }

    gameLoop() {

        if (MyGameModel.getInstance().gameOver) return;
        
        if (MyGameModel.getInstance().scoreBoardModel.time <= 0) {
            this.alertGameOver(MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b', 'User Timed Out!');
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

    setSettings(boardLength, consecutive, timer, b, o) {

        if (MyGameController.getInstance().waitingServer) return;

        if (b === 'hardbot' && b === o) {
            b += '1';
            o += '2';
        }

        let promise = makeRequest(`set_settings(${boardLength},${consecutive},${b},${o},Board)`);

        let handler;
        promise.then(handler = (board) => {
            if (board !== 'no') {
                MyGameModel.getInstance().updateBoardSettings(boardLength, consecutive);
                MyGameModel.getInstance().updateTimer(timer);
                MyGameModel.getInstance().updateGameSettings(b, o);
                MyGameModel.getInstance().boardModel.update(board);
                MyGameModel.getInstance().gameOver = false;
                MyInputController.getInstance().reset();
            } else if (board === 'no') {
                console.log('Error: settings.');
            }
        });
    }

    genBotMove(botType) {

        if (!MyGameModel.getInstance().boardModel.getBoard() || MyGameController.getInstance().waitingServer) return;

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

        if (!MyGameModel.getInstance().boardModel.getBoard() || MyGameController.getInstance().waitingServer) return;

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

        if (!MyGameModel.getInstance().boardModel.getBoard() || MyGameController.getInstance().waitingServer) return;

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

        if (!MyGameModel.getInstance().boardModel.getBoard() || MyGameController.getInstance().waitingServer) return;

        let lastPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b';
        let promise = makeRequest(`game_over(${MyGameModel.getInstance().boardModel.getBoard()},${MyGameModel.getInstance().getLastMove()},${lastPlayer},${MyGameModel.getInstance().consecutive})`)

        let handler;
        promise.then(handler = (response) => {
            if (response === 'is_over') {
                this.alertGameOver(lastPlayer, 'Game over!');
            } else if (response === 'not_over') {
                this.validMoves();
            } else if (response === 'no') {
                console.log('Error: game over.');
            }
        })
    }

    alertGameOver(winner, warning) {

        MyGameModel.getInstance().gameOver = true;

        console.warn(warning);

        if(winner != null)
            console.warn(winner == 'b' ? 'Brown' : 'Orange' + ' has Won!');

        MyGameModel.getInstance().scoreBoardModel.stop();
        MyGameModel.getInstance().scoreBoardModel.gameWonBy(winner);

        MyGameView.getInstance().scene.interface.removeStartGameOptions();
        MyGameView.getInstance().scene.interface.addGameSettings();
    }

    quitGame() {
        // MyGameModel.getInstance().boardModel.boards = [];
        this.alertGameOver(null, 'Game Ended!');
    }

    validMoves() {

        if (!MyGameModel.getInstance().boardModel.getBoard() || MyGameController.getInstance().waitingServer) return;

        let promise = makeRequest(`valid_moves(${MyGameModel.getInstance().boardModel.getBoard()},${MyGameModel.getInstance().getLastMove()},ListOfMoves)`);

        let handler;
        promise.then(handler = (response) => {
            if (response !== 'no') {
                // MyGameModel.getInstance().removeValidMoves();
                MyGameModel.getInstance().addValidMoves(response);
            } else {
                console.log('Error: getting valid moves.');
            }
        });
    }

    undoMove() {

        if (MyGameModel.getInstance().getLastMove() === 'pmove(_,_,_)') {
            console.log('Error: can\'t undo more moves.');
            return;
        }

        MyGameModel.getInstance().templatePiecesModels.forEach(piece => {
            piece.setVisible(true);
            piece.animation = null;
        });

        MyGameModel.getInstance().piecesModels.forEach(piece => {
            piece.animation = null;
        });

        let currentPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? MyGameModel.getInstance().b : MyGameModel.getInstance().o;
        let lastPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? MyGameModel.getInstance().o : MyGameModel.getInstance().b;

        if (currentPlayer === 'user' && lastPlayer !== 'user') {
            MyGameModel.getInstance().boardModel.removePiece();
            MyGameModel.getInstance().removePiece();
            MyGameModel.getInstance().removeValidMoves();

            if (MyGameModel.getInstance().getLastMove() !== 'pmove(_,_,_)') {
                MyGameModel.getInstance().boardModel.removePiece();
                MyGameModel.getInstance().removePiece();
                MyGameModel.getInstance().removeValidMoves();
            } else {
                MyGameModel.getInstance().currentPlayer = (MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b');
            }
        } else {
            MyGameModel.getInstance().boardModel.removePiece();
            MyGameModel.getInstance().removePiece();
            MyGameModel.getInstance().removeValidMoves();
            MyGameModel.getInstance().currentPlayer = (MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b');
        }

        this.validMoves();

        MyInputController.getInstance().reset();
        MyGameModel.getInstance().gameOver = false;
        MyGameModel.getInstance().scoreBoardModel.setTimer(MyGameModel.getInstance().timer);
    }

    replay() {

        if (!MyGameModel.getInstance().gameOver) return;

        if (MyGameModel.getInstance().piecesModels.length == 0) {
            console.warn("No replay available!");
            return;
        };

        if(!this.replayPlaying) {
            this.replayPlaying = true;
            MyGameView.getInstance().scene.interface.removeGameSettings();
        }
        else
            return;

        // Clean state
        MyGameModel.getInstance().currentPlayer = 'b';

        let moves = [];
        MyGameModel.getInstance().piecesModels.forEach(moveModel => {
            moves.push(`pmove(${moveModel.x - 1},${moveModel.z - 1},${moveModel.direction})`)
        });

        MyGameModel.getInstance().piecesModels = [];

        let timeout = 1000;
        moves.forEach(move => {
                setTimeout(() => {
                MyGameModel.getInstance().addPiece(move);
                MyGameModel.getInstance().currentPlayer = MyGameModel.getInstance().currentPlayer === 'b' ? 'o' : 'b';
            }, timeout);

            timeout += 1000;
        });

        timeout += 600;
        setTimeout(() => {
            this.replayPlaying = false;
            MyGameView.getInstance().scene.interface.addGameSettings();
        }, timeout);
    }
}