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
     * Adds a folder containing Coffee's game settings.
     */
    addGameSettings() {

        this.gameSettings = this.gui.addFolder('Coffee Settings');
        this.gameSettings.open();

        this.gameSettings.add(MyGameController.getInstance(), 'Start_Game');

        this.Board_Size = 5;
        this.Consecutive = 4;
        this.Timer = 30;

        this.boardLengthGroup = this.gameSettings.add(this, 'Board_Size', [5, 6, 7]);
        this.consecutiveGroup = this.gameSettings.add(this, 'Consecutive', [3, 4, 5, 6, 7]);
        this.timerGroup = this.gameSettings.add(this, 'Timer' , 10, 100 * 60 - 1);

        this.boardLengthGroup.onFinishChange(function (value) {

            if (parseInt(value) < parseInt(this.object.Consecutive)) {
                this.object.consecutiveGroup.setValue(value);
                alert("Consecutive Pieces must be equal or less than Board Size!");
            }

            MyGameModel.getInstance().updateBoardSettings(parseInt(this.object.Board_Size), parseInt(this.object.Consecutive), parseInt(this.object.Timer));
        });

        this.consecutiveGroup.onFinishChange(function (value) {

            if (parseInt(value) > parseInt(this.object.Board_Size)) {
                this.object.consecutiveGroup.setValue(this.object.Board_Size);
                alert("Consecutive Pieces must be equal or less than Board Size!");
                return;
            }

            MyGameModel.getInstance().updateBoardSettings(parseInt(this.object.Board_Size), parseInt(this.object.Consecutive), parseInt(this.object.Timer));
        });

        this.timerGroup.onFinishChange(function (value) {
            MyGameModel.getInstance().updateBoardSettings(parseInt(this.object.Board_Size), parseInt(this.object.Consecutive), parseInt(this.object.Timer));
        });
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