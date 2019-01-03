/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();
        // add a group of controls (and open/expand by defult)

        return true;
    }

    /**
     * Adds a folder containing the active camera and a list of available cameras.
     * @param {array} views
     */
    addViewsGroup(views) {

        let group = this.gui.addFolder('Cameras');
        group.open();

        let i = 0;
        for(let key in views) {

            if(key === 'default') continue;

            this.scene.viewValues[key] = i;
            ++i;
        }

        let cameras = this.gui.add(this.scene, 'currentCamera', this.scene.viewValues);
        cameras.name('Current Camera');

        cameras.onChange(function(value){
            this.object.updateCamera();
            console.log("Camera Updated.");
        });
    }

    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {array} lights
     */
    addLightsGroup(lights) {

        let group = this.gui.addFolder('Lights');
        group.open();

        // add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
        // e.g. this.option1=true; this.option2=false;

        for (let key in lights) {
            this.scene.lightValues[key] = lights[key].enabled;
            let tmp = group.add(this.scene.lightValues, key);
        }
    }

    /**
    * Adds a camera rotation setting
    */
    addCameraRotation() {
        this.cameraRotationGroup = this.gameSettings.add(MyGameView.getInstance(), 'cameraRotation').name('Camera Rotation');
    }

    /**
     * Adds a folder containing Coffee's main game settings.
     */
    addGameSettings() {

        if (!this.gui.__folders.hasOwnProperty('Coffee Settings')) {
            this.gameSettings = this.gui.addFolder('Coffee Settings');
            this.gameSettings.open();
        }

        this.startGroup = this.gameSettings.add(MyGameController.getInstance(), 'startGame').name('Start Game');

        this.Board_Size = MyGameModel.getInstance().boardModel.boardLength;
        this.Consecutive = MyGameModel.getInstance().consecutive;
        this.Minutes = Math.floor(MyGameModel.getInstance().scoreBoardModel.time / 60);;
        this.Seconds = MyGameModel.getInstance().scoreBoardModel.time % 60;

        this.boardLengthGroup = this.gameSettings.add(this, 'Board_Size', [5, 6, 7]).name('Board Size');
        this.consecutiveGroup = this.gameSettings.add(this, 'Consecutive', [3, 4, 5, 6, 7]);
        this.minutesGroup = this.gameSettings.add(this, 'Minutes', 0, 60).step(1);
        this.secondsGroup = this.gameSettings.add(this, 'Seconds', 0, 59).step(1);

        this.playerB = this.gameSettings.add(MyGameModel.getInstance(), 'b', { 'Player': 'user', 'Easy Bot': 'easybot', 'Hard Bot': 'hardbot' }).name('Brown');
        this.playerO = this.gameSettings.add(MyGameModel.getInstance(), 'o', { 'Player': 'user', 'Easy Bot': 'easybot', 'Hard Bot': 'hardbot' }).name('Orange');

        this.replayGroup = this.gameSettings.add(MyGameController.getInstance(), 'replay').name('Replay Last Game');

        this.boardLengthGroup.onFinishChange(function (value) {
            
            if (parseInt(value) < parseInt(this.object.Consecutive)) {
                this.object.consecutiveGroup.setValue(value);
                alert("Consecutive Pieces must be equal or less than Board Size!");
            }

            MyGameModel.getInstance().updateBoardSettings(parseInt(this.object.Board_Size), parseInt(this.object.Consecutive));
        });

        this.consecutiveGroup.onFinishChange(function (value) {

            if (parseInt(value) > parseInt(this.object.Board_Size)) {
                this.object.consecutiveGroup.setValue(this.object.Board_Size);
                alert("Consecutive Pieces must be equal or less than Board Size!");
            }

            MyGameModel.getInstance().updateBoardSettings(parseInt(this.object.Board_Size), parseInt(this.object.Consecutive));
        });

        this.minutesGroup.onFinishChange(function (value) {

            if (parseInt(value) == 0 && parseInt(this.object.Seconds) < 10) {
                this.object.secondsGroup.setValue(10);
                alert("Minimal Timer = 10 seconds!");
            }

            MyGameModel.getInstance().updateTimer(parseInt(this.object.Minutes) * 60 + parseInt(this.object.Seconds));
        });

        this.secondsGroup.onFinishChange(function (value) {

            if (parseInt(value) < 10 && parseInt(this.object.Minutes) == 0) {
                this.object.secondsGroup.setValue(10);
                alert("Minimal Timer = 10 seconds!");
            }

            MyGameModel.getInstance().updateTimer(parseInt(this.object.Minutes) * 60 + parseInt(this.object.Seconds));
        });

    }

    /**
    * Removes the folder containing Coffee's game settings.
    */
    removeGameSettings() {
        this.startGroup.remove();
        this.boardLengthGroup.remove();
        this.consecutiveGroup.remove();
        this.minutesGroup.remove();
        this.secondsGroup.remove();
        this.playerB.remove();
        this.playerO.remove();
        this.replayGroup.remove();
    }

    /**
    * Adds a folder containing Coffee's game options.
    */
    addStartGameOptions() {
        this.undoGroup = this.gameSettings.add(MyGameController.getInstance(), 'undoMove').name('Undo Move');
        this.quitGroup = this.gameSettings.add(MyGameController.getInstance(), 'quitGame').name('Quit Game');
    }

     /**
    * Removes the folder containing Coffee's game options.
    */
    removeStartGameOptions() {
        this.undoGroup.remove();
        this.quitGroup.remove();
    }

    /**
	 * processKeyboard
	 * @param event {Event}
	 */
    processKeyboard(event) {
        
        super.processKeyboard(event);

        if (event.keyCode === 77 || event.keyCode === 109) {
            this.scene.graph.changeMaterial = true;
            console.log('Materials switched.');
        }
    }
}