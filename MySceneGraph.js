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
	bindCompMat() {

        const { components } = this.parsedXML;

		this.compMat = {};

		for(let componentKey in components) {
			let component = components[componentKey];
			
			let obj = {};
			obj.currMat = 0;

			this.compMat[componentKey] = obj;
		}

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
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {

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

            let appearance = new CGFappearance(this.scene);

            let currMat = this.parsedXML.materials[mat];
            appearance.setAmbient(currMat.ambient.r, currMat.ambient.g, currMat.ambient.b, currMat.ambient.a);
            appearance.setDiffuse(currMat.diffuse.r, currMat.diffuse.g, currMat.diffuse.b, currMat.diffuse.a);
            appearance.setSpecular(currMat.specular.r, currMat.specular.g, currMat.specular.b, currMat.specular.a);
            appearance.setEmission(currMat.emission.r, currMat.emission.g, currMat.emission.b, currMat.emission.a);
            appearance.setShininess(currMat.shininess);

            if(tex) {
                if (primitives[id].list[0].type === 'rectangle' || primitives[id].list[0].type === 'triangle')
                    this.displayPrimitives[id].updateTextST(ls, lt);

                appearance.setTexture(this.displayTextures[tex]);
            }

            appearance.apply();
            
            // Draw element
            this.displayPrimitives[id].display();
        }
        else {

            let currentComp = components[id];

            // Adjust material
			if(this.changeMaterial)
                this.compMat[id].currMat + 1 >= currentComp.materials.list.length ? this.compMat[id].currMat = 0 : this.compMat[id].currMat++;
            
            let newMat = currentComp.materials.list[this.compMat[id].currMat].id !== 'inherit' ? currentComp.materials.list[this.compMat[id].currMat].id : mat;
            
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
                    if(currentComp.texture["length_s"])
                        newLs = currentComp.texture.length_s;
                    
                    if(currentComp.texture["length_t"])
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
        if (!component.transformation.list[0])
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