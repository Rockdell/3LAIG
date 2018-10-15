var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.lightValues = {};
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();
        
        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);

        this.materialDefault = new CGFappearance(this);
		this.materialDefault.setAmbient(0,0,0,1);
		this.materialDefault.setDiffuse(0,0.5,0.5,1);
		this.materialDefault.setSpecular(0.2,0.2,0.2,1);
        this.materialDefault.setShininess(10);

    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        console.log("Initialized camera.");
    }

    /**
     * Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {

        // Create primitives
        this.graph.createPrimitives();

        // Create materials
        this.graph.createMaterials();
        
        // Create textures
        this.graph.createTextures();

        // Initialize axis
        this.initAxis();
            
        // Initialize views
        this.initViews();
        
        // Initialize ambient
        this.initAmbient();
        
        // Initialize lights
        this.initLights();

        // Adds lights group.
        this.interface.addLightsGroup(this.graph.parsedXML.lights);

        this.sceneInited = true;
    }

    /**
     * Initialze the axis, according to parsed data.
     */
    initAxis() {
        this.axis = new CGFaxis(this, this.graph.parsedXML.scene.axis_length);

        console.log("Initialized axis.");
    }

    /**
     * Initialize views, according to parsed data.
     */
    initViews() {

        //TODO add other cameras here

        var default_view = this.graph.parsedXML.views[this.graph.parsedXML.views.default];

        switch(default_view.type) {
            case "perspective":
                this.camera.near = default_view.near;
                this.camera.far = default_view.far;
                this.camera.fov = default_view.angle;
                this.camera.setPosition(vec3.fromValues(default_view.from.x, default_view.from.y, default_view.from.z));
                this.camera.setTarget(vec3.fromValues(default_view.to.x, default_view.to.y, default_view.to.z));
                break;
            case "ortho":

            //this.camera = new CGFcameraOrtho(default_view.)
            break;
        }

        console.log("Initialized views.");
    }

    /**
     * Initialize ambient, according to parsed data.
     */
    initAmbient() {

        var ambient = this.graph.parsedXML.ambient.ambient;

        this.setGlobalAmbientLight(ambient.r, ambient.g, ambient.b, ambient.a);

        var background = this.graph.parsedXML.ambient.background;

        this.gl.clearColor(background.r, background.g, background.b, background.a);

        console.log("Initialized ambient.");
    }

    /**
     * Initialize lights, according to parsed data.
     */
    initLights() {

        var i = 0;

        for(var key in this.graph.parsedXML.lights) {

            if(i >= 8)
                break;

            if(this.graph.parsedXML.lights[key]) {

                var light = this.graph.parsedXML.lights[key];

                this.lights[i].setVisible(true);

                this.lights[i].setPosition(light.location.x, light.location.y, light.location.z, light.location.w);
                this.lights[i].setAmbient(light.ambient.r, light.ambient.g, light.ambient.b, light.ambient.a);
                this.lights[i].setDiffuse(light.diffuse.r, light.diffuse.g, light.diffuse.b, light.diffuse.a);
                this.lights[i].setSpecular(light.specular.r, light.specular.g, light.specular.b, light.specular.a);

                if(light.enabled)
                    this.lights[i].enable()
                else
                    this.lights[i].disable();

                this.lights[i].update();

                ++i;
            }
        }

        console.log("Initialized lights.");
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        if (this.sceneInited) {

            // Draw axis
            this.axis.display();

            this.materialDefault.apply();
            
            var i = 0;
            for (var key in this.lightValues) {
                if (this.lightValues[key]) {
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                }
                else {
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }

                this.lights[i].update();

                ++i;
            }
            
            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }
        else {
            // Draw axis
            this.axis.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}