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

    addViewsGroup(views) {

        let group = this.gui.addFolder('Cameras');
        group.open();

        let i = 0;
        for(let key in views) {

            if(key === 'default')  continue;

            this.scene.viewValues[key] = i;
            ++i;
        }

        this.gui.add(this.scene, 'currentCamera', this.scene.viewValues);
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
            group.add(this.scene.lightValues, key);
        }
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