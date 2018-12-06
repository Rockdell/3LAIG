var DEGREE_TO_RAD = Math.PI / 180;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {

    /**
     * @constructor
     */
    constructor(filename, scene) {

        this.loadedOk = false;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        // XML schema of the YAS file, including, order of attributes/elements, variable types and save options
        this.schema = makeYasSchema();

        // Parsed XML
        this.parsedXML = null;

        // File reading
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open(`scenes/${filename}`, this);
    }

    /**
     * Callback to be executed after successful reading
     */
    onXMLReady() {

        this.log('XML loading finished with success.');

        const rootElement = this.reader.xmlDoc.documentElement;

        if (rootElement.nodeName !== 'yas')
            this.onXMLError('Tag <yas> is missing.');

        this.parseXMLFile(rootElement);

        if (!this.loadedOk)
            return;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param rootElement Root element of the XML document.
     */
    parseXMLFile(rootElement) {

        let parser = new MyParser(this);

        this.parsedXML = parser.parseBlock(rootElement, this.schema.yas);

        if (this.parsedXML == null)
            return;

        if (parser.checkConstraints(this.parsedXML))
            return;

        this.loadedOk = true;

        console.log('Parsed and checked XML document.');
    }

    /**
	 * Binds the components with the respective materials
	 */
    bindComponentsMaterials() {

        const { components } = this.parsedXML;

        this.compMat = {};

        for (let componentKey in components)
            this.compMat[componentKey] = 0;

        console.log('Binded components and primitives.');
    }

    /**
     * Creates primitives from parsed data.
     */
    createPrimitives() {

        const { primitives } = this.parsedXML;

        this.displayPrimitives = {};

        //Cycles through all parsed primitives
        for (let primID in primitives) {

            if (!primitives.hasOwnProperty(primID)) continue;

            let currPrim = primitives[primID].list[0];

            switch (currPrim.type) {
                case 'rectangle':
                    this.displayPrimitives[primID] = new MyRectangle(this.scene, currPrim.x1, currPrim.y1, currPrim.x2, currPrim.y2);
                    break;
                case 'triangle':
                    this.displayPrimitives[primID] = new MyTriangle(this.scene, currPrim.x1, currPrim.y1, currPrim.z1, currPrim.x2, currPrim.y2, currPrim.z2, currPrim.x3, currPrim.y3, currPrim.z3);
                    break;
                case 'cylinder':
                    this.displayPrimitives[primID] = new MyCylinder(this.scene, currPrim.base, currPrim.top, currPrim.height, currPrim.slices, currPrim.stacks);
                    break;
                case 'sphere':
                    this.displayPrimitives[primID] = new MySphere(this.scene, currPrim.radius, currPrim.slices, currPrim.stacks);
                    break;
                case 'torus':
                    this.displayPrimitives[primID] = new MyTorus(this.scene, currPrim.inner, currPrim.outer, currPrim.slices, currPrim.loops);
                    break;
                case 'plane':
                    this.displayPrimitives[primID] = new MyPlane(this.scene, currPrim.npartsU, currPrim.npartsV);
                    break;
                case 'patch':
                    this.displayPrimitives[primID] = new MyPatch(this.scene, currPrim.npointsU, currPrim.npointsV, currPrim.npartsU, currPrim.npartsV, currPrim.list);
                    break;
                case 'cylinder2':
                    this.displayPrimitives[primID] = new MyCylinder2(this.scene, currPrim.base, currPrim.top, currPrim.height, currPrim.slices, currPrim.stacks);
                    break;
                case 'vehicle':
                    this.displayPrimitives[primID] = new MyVehicle(this.scene);
                    break;
                case 'terrain':
                    this.displayPrimitives[primID] = new MyTerrain(this.scene, currPrim.idtexture, currPrim.idheightmap, currPrim.parts, currPrim.heightscale);
                    break;
                case 'water':
                    this.displayPrimitives[primID] = new MyWater(this.scene, currPrim.idtexture, currPrim.idwavemap, currPrim.parts, currPrim.heightscale, currPrim.texscale);
                    break;
                case 'piece':
                    this.displayPrimitives[primID] = new MyPiece(this.scene, currPrim.dir);
                    break;
            }
        }

        console.log('Loaded primitives.');
    }

    /**
     * Create materials from parsed data.
     */
    createMaterials() {

        const { materials } = this.parsedXML;

        this.displayMaterials = {};

        for (let matID in materials) {

            if (!materials.hasOwnProperty(matID)) continue;

            let appearance = new CGFappearance(this.scene);
            let mat = materials[matID];
            appearance.setAmbient(mat.ambient.r, mat.ambient.g, mat.ambient.b, mat.ambient.a);
            appearance.setDiffuse(mat.diffuse.r, mat.diffuse.g, mat.diffuse.b, mat.diffuse.a);
            appearance.setSpecular(mat.specular.r, mat.specular.g, mat.specular.b, mat.specular.a);
            appearance.setEmission(mat.emission.r, mat.emission.g, mat.emission.b, mat.emission.a);
            appearance.setShininess(mat.shininess);

            this.displayMaterials[matID] = appearance;
        }

        console.log('Loaded materials.');
    }

    /**
     * Create textures from parsed data.
     */
    createTextures() {

        const { textures } = this.parsedXML;

        this.displayTextures = {};

        for (let texID in textures) {

            if (!textures.hasOwnProperty(texID)) continue;

            let currTex = textures[texID];
            let path = currTex.file;
            let important = path.split('/');
            important = important.pop();
            important = "../scenes/images/" + important;
            let tex = new CGFtexture(this.scene, important);

            this.displayTextures[texID] = tex;
        }

        console.log('Loaded textures.');
    }

    /**
    * Create animations from parsed data.
    */
    createBindComponentsAnimations() {

        const { animations, components } = this.parsedXML;
        
        this.componentsAnimations = {};
        
        for (let componentKey in components) {

            let currComp = components[componentKey];
   
            //If it contains the animations section
            if(!currComp.animations)
                continue;
                
            //And if that section contains any animations
            if(currComp.animations.list.length == 0)
                continue;    
                
            let aux_anim = [];

            for (let i = 0; i < currComp.animations.list.length; i++) {
                let currAnimID = currComp.animations.list[i].id;
                let currAnim = animations[currAnimID];

                if (currAnim.type == "linear")
                    aux_anim.push(new LinearAnimation(this.scene, currAnim.span, currAnim.list));
                else if(currAnim.type == "circular")
                    aux_anim.push(new CircularAnimation(this.scene, currAnim.span, vec3.fromValues(currAnim.center.x, currAnim.center.y, currAnim.center.z), currAnim.radius, currAnim.startang, currAnim.rotang));
            }

            //Tells the first animation to activate
            aux_anim[0].animating = true;

            let obj = { anims: aux_anim, animIndex: 0 };

            this.componentsAnimations[componentKey] = obj;
        }
        
        console.log('Binded animations and components.');
    }

    /**
    * Concatenates all transformations into a single transformation matrix for all components
    */
    concatenateComponentsTransformations(currentCompID) {

        const { components } = this.parsedXML;
        let currentComp = components[currentCompID];

        this.concatenateTransformations(currentComp);

        for (let childID in currentComp.children) {

            if(currentComp.children[childID].type === 'primitiveref') continue;

            this.concatenateComponentsTransformations(childID);
        }
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {

        // Adjust material
        if (this.changeMaterial) {
            for (let id in this.parsedXML.components) {
                this.compMat[id] + 1 >= this.parsedXML.components[id].materials.list.length ? this.compMat[id] = 0 : this.compMat[id]++;
            }
        }

        this.scene.pushMatrix();
            this.processNode(false, this.parsedXML.scene.root);
        this.scene.popMatrix();

        this.changeMaterial = false;
    }

    /**
     * Processes node from graph (either a component or a primitive).
     */
    processNode(prim, id, mat, tex, ls, lt) {

        const { primitives, components } = this.parsedXML;

        if (prim) {

            //Apply Materials and Textures
            let appearance = this.displayMaterials[mat];

            if (tex) {
                if (primitives[id].list[0].type === 'rectangle' || primitives[id].list[0].type === 'triangle')
                    this.displayPrimitives[id].updateTextST(ls, lt);

                appearance.setTexture(this.displayTextures[tex]);
            }
            else
                appearance.setTexture(null);

            if (!(primitives[id].type === 'terrain' || primitives[id].type === 'water'))
                appearance.apply();

            // Draw element
            this.displayPrimitives[id].display();
        }
        else {

            let currentComp = components[id];

            let newMat = currentComp.materials.list[this.compMat[id]].id !== 'inherit' ? currentComp.materials.list[this.compMat[id]].id : mat;

            // Adjust texture
            let newText = tex;
            let newLs = ls;
            let newLt = lt;

            switch (currentComp.texture.id) {
                case 'none':
                    newText = null;
                    newLs = null;
                    newLt = null;
                    break;
                case 'inherit':
                    if (currentComp.texture["length_s"])
                        newLs = currentComp.texture.length_s;

                    if (currentComp.texture["length_t"])
                        newLt = currentComp.texture.length_t;
                    break;
                default:
                    newText = currentComp.texture.id;
                    newLs = currentComp.texture.length_s;
                    newLt = currentComp.texture.length_t;
                    break;
            }

            this.scene.pushMatrix();

            //Adjust transformation matrix
            this.scene.multMatrix(currentComp.tranfsMatrix);

            //Apply Animations
            this.applyAnimations(currentComp);

            for (let childID in currentComp.children) {

                let child = currentComp.children[childID];

                this.processNode(child.type === 'primitiveref', child.id, newMat, newText, newLs, newLt);
            }

            this.scene.popMatrix();
        }
    }

    /**
     * Puts the transformations of the component into one single Transformation Matrix.
     * @param component Component to be adjusted.
     */
    concatenateTransformations(component) {

        component['tranfsMatrix'] = mat4.create();

        // Checks if it has any transformations
        if (component.transformation.list.length == 0)
            return;

        this.scene.pushMatrix();

        // Checks if it's a transformation reference or a new transformation
        if (component.transformation.list[0].type === 'transformationref') {

            // Transformation reference
            let tf = this.parsedXML.transformations[component.transformation.list[0].id];

            for (let i = 0; i < tf.list.length; i++)
                this.readTransformations(tf.list[i], component['tranfsMatrix']);
        }
        else {

            // New transformation
            for (let i = 0; i < component.transformation.list.length; i++)
                this.readTransformations(component.transformation.list[i], component['tranfsMatrix']);
        }

        this.scene.popMatrix();
    }

    /**
     * Processes a transformation and aplies it to the scene.
     * @param transf Transformation to be read.
     */
    readTransformations(transf, matrix) {

        switch (transf.type) {
            case 'translate':
                mat4.translate(matrix, matrix, vec3.fromValues(transf.x, transf.y, transf.z));
                break;
            case 'scale':
                mat4.scale(matrix, matrix, vec3.fromValues(transf.x, transf.y, transf.z));
                break;
            case 'rotate':
                switch (transf.axis) {
                    case 'x':
                        mat4.rotate(matrix, matrix, transf.angle * DEGREE_TO_RAD, vec3.fromValues(1,0,0));
                        break;
                    case 'y':
                        mat4.rotate(matrix, matrix, transf.angle * DEGREE_TO_RAD, vec3.fromValues(0,1,0));
                        break;
                    case 'z':
                        mat4.rotate(matrix, matrix, transf.angle * DEGREE_TO_RAD, vec3.fromValues(0,0,1));
                        break;
                }
                break;
        }
    }

    applyAnimations(currentComp) {

        //If it contains the animations section
        if (!currentComp.animations)
            return;

        //And if that section contains any animations
        if (currentComp.animations.list.length == 0)
            return;

        let obj = this.componentsAnimations[currentComp.id];

        obj.anims[obj.animIndex].apply();
    }

    /**
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error(`Error: ${message}`);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn(`Warning: ${message}`);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log(`   ${message}`);
    }
}