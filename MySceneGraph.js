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

        // XML structure of the YAS file, including, order of attributes/elements, variable types and save options
        this.structure = makeYasStructure();

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

        this.parsedXML = parser.parseBlock(rootElement, this.structure.yas);

        if (this.parsedXML == null)
            return;

        if (parser.checkConstraints(this.parsedXML))
            return;

        this.loadedOk = true;

        this.log('Parsed and checked XML document.');
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

        const { animations } = this.parsedXML;
        const { components } = this.parsedXML;
        
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

                //console.log(currAnimID.id);
                if (currAnim.type == "linear") {
                    console.log("Linear animation created! : " + currAnimID);
                    aux_anim.push(new LinearAnimation(this.scene, currAnim.span, currAnim.list));
                }
                else if(currAnim.type == "circular") {
                    console.log("Circular animation created! : " + currAnimID);
                    aux_anim.push(new CircularAnimation(this.scene, currAnim.span, vec3.fromValues(currAnim.x, currAnim.y, currAnim.z), currAnim.radius, currAnim.startang, currAnim.rotang));
                }
            }
            //console.log(aux_anim);

            //Tells the first animation to activate
            aux_anim[0].animating = true;

            let obj = { anims: aux_anim, animIndex: 0 };

            this.componentsAnimations[componentKey] = obj;
        }

        /* for (let animID in animations) {

            let currAnim = animations[animID];

            if (currAnim.type == "linear") {
                console.log("Linear animation created! : " + animID);
                this.displayAnimations[animID] = new LinearAnimation(this.scene, currAnim.span, currAnim.list);
            }
            else if(currAnim.type == "circular") {
                console.log("Circular animation created! : " + animID);
                this.displayAnimations[animID] = new CircularAnimation(this.scene, currAnim.span, vec3.fromValues(currAnim.x, currAnim.y, currAnim.z), currAnim.radius, currAnim.startang, currAnim.rotang);
            }
        } */

        console.log('Loaded animations and binded them with their respectives components.');
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {

        // Adjust material
        if (this.changeMaterial) {
            for (let id in this.parsedXML.components) {
                this.compMat[id] + 1 >= this.parsedXML.components[id].materials.list.length ? this.compMat[id] = 0 : this.compMat[id]++;
                //console.log(id + " : " + this.compMat[id]);
                //TODO Remove console.log
            }
        }

        this.scene.pushMatrix();
        this.processNode(false, this.parsedXML.scene.root, this.scene.getMatrix());
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
            this.adjustMatrix(currentComp);

            //Apply Animations
            this.applyAnimations(currentComp);

            for (let childID in currentComp.children) {

                if (!currentComp.children.hasOwnProperty(childID)) continue;

                let child = currentComp.children[childID];

                this.processNode(child.type === 'primitiveref', child.id, newMat, newText, newLs, newLt);
            }

            this.scene.popMatrix();
        }
    }

    /**
     * Adjusts the transformation matrix of the component.
     * @param component Component to be adjusted.
     */
    adjustMatrix(component) {

        // Checks if it has any transformations
        if (component.transformation.list.length == 0)
            return;

        // Checks if it's a transformation reference or a new transformation
        if (component.transformation.list[0].type === 'transformationref') {

            // Transformation reference
            let tf = this.parsedXML.transformations[component.transformation.list[0].id];

            for (let i = 0; i < tf.list.length; i++)
                this.readTransformations(tf.list[i]);
        }
        else {

            // New transformation
            for (let i = 0; i < component.transformation.list.length; i++)
                this.readTransformations(component.transformation.list[i]);
        }
    }

    /**
     * Processes a transformation and aplies it to the scene.
     * @param transf Transformation to be read.
     */
    readTransformations(transf) {

        switch (transf.type) {
            case 'translate':
                this.scene.translate(transf.x, transf.y, transf.z);
                break;
            case 'scale':
                this.scene.scale(transf.x, transf.y, transf.z);
                break;
            case 'rotate':
                switch (transf.axis) {
                    case 'x':
                        this.scene.rotate(transf.angle * DEGREE_TO_RAD, 1, 0, 0);
                        break;
                    case 'y':
                        this.scene.rotate(transf.angle * DEGREE_TO_RAD, 0, 1, 0);
                        break;
                    case 'z':
                        this.scene.rotate(transf.angle * DEGREE_TO_RAD, 0, 0, 1);
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

        

        if (!obj.anims[obj.animIndex].animating) {
            if (obj.animIndex + 1 < obj.anims.length) {
                obj.animIndex++;
                obj.anims[obj.animIndex].animating = true;
                obj.anims[obj.animIndex].update(this.scene.deltaTime / 1000.0);
            }
        }  

        obj.anims[obj.animIndex].apply();

      /*   for (let i = 0; i < componentAnimations.length; i++) {
            componentAnimations[i].apply();
            console.log("YEAHHHHH - " + componentAnimations[i + 1].finalMatrixApplied);
            if (componentAnimations[i].finalMatrixApplied) {
                if (i + 1 < componentAnimations.length) {
                    console.log("YEAH - " + componentAnimations[i + 1].finalMatrixApplied);
                    componentAnimations[i + 1].animating = true;
                }
            }
        } */
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