/**
 * MyGameController
 */
class MyInputController {

    constructor() {

        if (!MyInputController.instance) {
            this.cell = null;
            this.direction = null;

            MyInputController.instance = this;
        }
    }

    static getInstance() {
        return MyInputController.instance;
    }

    updatePick(scene) {

        if (scene.pickMode == false) {
            if (scene.pickResults != null && scene.pickResults.length > 0) {
                for (let i = 0; i < scene.pickResults.length; i++) {
                    let obj = scene.pickResults[i][0];
                    if (obj) { 
                        let customId = scene.pickResults[i][1];
                        Number.isInteger(customId) ? this.direction = customId : this.cell = customId;

                        console.log("Picked object: " + obj + ", with pick id " + customId);
                    }
                }
                scene.pickResults.splice(0, scene.pickResults.length);
            }
        }

        scene.clearPickRegistration();
    }

    getUserMove() {

        if (this.direction == null || this.cell == null)
            return null;

        let col = parseInt(this.cell[0]) - 1;
        let row = parseInt(this.cell[1]) - 1;
        let dir;

        switch(this.direction) {
            case 1:
                dir = 'v';
                break;
            case 2:
                dir = 'h';
                break;
            case 3:
                dir = 'du'
                break;
            case 4:
                dir = 'dd'
                break;
        }

        let move = `pmove(${col},${row},${dir})`;

        this.reset();

        return move;
    }

    reset() {
        this.cell = null;
        this.direction = null;
    }
}