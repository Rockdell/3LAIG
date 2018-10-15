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

        var group = this.gui.addFolder("Cameras");
        group.open();

        var i = 0;
        for(var key in views) {

            if(key == "default")  continue;

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

        var group = this.gui.addFolder("Lights");
        group.open();

        // add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
        // e.g. this.option1=true; this.option2=false;

        for (var key in lights) {

            this.scene.lightValues[key] = lights[key].enabled;
            group.add(this.scene.lightValues, key);

            // if (lights[key)) {
            //     this.scene.lightValues[key] = lights[key].enabled;
            //     group.add(this.scene.lightValues, key);
            // }
        }
    }

    /**
	 * processKeyboard
	 * @param event {Event}
	 */
    processKeyboard(event) {
        // call CGFinterface default code (omit if you want to override)
        super.processKeyboard(event);
        // Check key codes e.g. here: http://www.asciitable.com/
        // or use String.fromCharCode(event.keyCode) to compare chars

        // for better cross-browser support, you may also check suggestions on using event.which in http://www.w3schools.com/jsref/event_key_keycode.asp

        /**
         * Determines the size of an object (how many attributes does it have).
         */
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        }

        //console.log(Object.size(this.scene.graph.parsedXML.materials));

        if (event.keyCode == 77 || event.keyCode == 109) {
            this.scene.graph.changeMaterial = true;
            
            console.log("Materials Switched!");
        }
       
    };

}