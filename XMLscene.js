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
        this.viewValues = {};
        this.lightValues = {};
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param application Application.
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));

        this.currentCamera = 0;
        this.cameras = [];

        this.materialDefault = new CGFappearance(this);
        this.materialDefault.setAmbient(0, 0, 0, 1);
        this.materialDefault.setDiffuse(0, 0.5, 0.5, 1);
        this.materialDefault.setSpecular(0.2, 0.2, 0.2, 1);
        this.materialDefault.setShininess(10);
    }

    /**
     * Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {

        // Bind Components with materials
        this.graph.bindCompMat();
        
        // Create primitives
        this.graph.createPrimitives();

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

        // Adds views group
        this.interface.addViewsGroup(this.graph.parsedXML.views);

        // Adds lights group.
        this.interface.addLightsGroup(this.graph.parsedXML.lights);

        this.sceneInited = true;
    }

    /**
     * Initialze the axis, according to parsed data.
     */
    initAxis() {

        const { scene } = this.graph.parsedXML;

        this.axis = new CGFaxis(this, scene.axis_length);

        console.log('Initialized axis.');
    }

    /**
     * Initialize views, according to parsed data.
     */
    initViews() {

        const { views } = this.graph.parsedXML;

        let i = 0;

        for (let key in views) {

            if (key === 'default') continue;

            let view = views[key];

            if (view.id === views.default)
                this.currentCamera = i;

            let camera;

            switch (view.type) {
                case 'perspective':
                    camera = new CGFcamera(
                        view.angle * DEGREE_TO_RAD, view.near, view.far,
                        vec3.fromValues(view.from.x, view.from.y, view.from.z),
                        vec3.fromValues(view.to.x, view.to.y, view.to.z)
                    );
                    break;
                case 'ortho':

                    let y_vector = vec3.fromValues(0, 1, 0);

                    let look_vector = vec3.create();
                    vec3.subtract(look_vector, vec3.fromValues(view.to.x, view.to.y, view.to.z), vec3.fromValues(view.from.x, view.from.y, view.from.y));

                    let side_vector = vec3.create();
                    vec3.cross(side_vector, y_vector, look_vector);

                    let up_vector = vec3.create();
                    vec3.cross(up_vector, look_vector, side_vector);

                    vec3.normalize(up_vector, up_vector);

                    if (up_vector.len < 0.1)
                        look_vector[1] > 0 ? up_vector = vec3.fromValues(1, 0, 0) : up_vector = vec3.fromValues(-1, 0, 0);

                    camera = new CGFcameraOrtho(
                        view.left, view.right, view.bottom, view.top, view.near, view.far,
                        vec3.fromValues(view.from.x, view.from.y, view.from.z),
                        vec3.fromValues(view.to.x, view.to.y, view.to.z),
                        up_vector
                    );
                    break;
            }

            this.cameras.push(camera);

            ++i;
        }

        console.log('Initialized views.');
    }

    /**
     * Initialize ambient, according to parsed data.
     */
    initAmbient() {

        const { ambient, background } = this.graph.parsedXML.ambient;

        this.setGlobalAmbientLight(ambient.r, ambient.g, ambient.b, ambient.a);

        this.gl.clearColor(background.r, background.g, background.b, background.a);

        console.log('Initialized ambient.');
    }

    /**
     * Initialize lights, according to parsed data.
     */
    initLights() {

        const { lights } = this.graph.parsedXML;

        let i = 0;

        for (let key in lights) {

            if (i >= 8)
                break;

            let light = this.graph.parsedXML.lights[key];

            this.lights[i].setVisible(true);

            this.lights[i].setPosition(light.location.x, light.location.y, light.location.z, light.location.w);
            this.lights[i].setAmbient(light.ambient.r, light.ambient.g, light.ambient.b, light.ambient.a);
            this.lights[i].setDiffuse(light.diffuse.r, light.diffuse.g, light.diffuse.b, light.diffuse.a);
            this.lights[i].setSpecular(light.specular.r, light.specular.g, light.specular.b, light.specular.a);

            if (light.type === 'spot') {
                this.lights[i].setSpotCutOff(light.angle * DEGREE_TO_RAD);
                this.lights[i].setSpotExponent(light.exponent);
                this.lights[i].setSpotDirection(light.target.x - light.location.x, light.target.y - light.location.y, light.target.z - light.location.z);
            }

            if (light.enabled)
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this.lights[i].update();

            ++i;
        }

        console.log('Initialized lights.');
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

            // Update camera;
            this.camera = this.cameras[this.currentCamera];
            this.interface.setActiveCamera(this.camera);

            // Update lights
            let i = 0;
            for (let key in this.lightValues) {

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

            // Display scene
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