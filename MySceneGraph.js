var DEGREE_TO_RAD = Math.PI / 180;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {

    /**
     * @constructor
     */
    constructor(filename, scene) {

        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        // File reading
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open(`scenes/${filename}`, this);

        // XML structure of the YAS file, including, order of attributes/elements, variable types and save options
        this.structure = makeYasStructure();


        this.parsedXML = null;
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

        this.parsedXML = this.parseBlock(rootElement, this.structure.yas);

        if (this.parsedXML == null)
            return;

        if (this.checkConstraints())
            return;

        this.loadedOk = true;

        this.log('Parsed and checked XML document.');
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

        console.log('Loaded Primitives.');
    }

    /**
     * Create materials from parsed data.
     */
    createMaterials() {

        const { materials } = this.parsedXML;

        this.displayMaterials = {};

        for (let matID in materials) {

            if (!materials.hasOwnProperty(matID)) continue;

            let currMat = materials[matID];

            let mat = new CGFappearance(this.scene);
            mat.setAmbient(currMat.ambient.r, currMat.ambient.g, currMat.ambient.b, currMat.ambient.a);
            mat.setDiffuse(currMat.diffuse.r, currMat.diffuse.g, currMat.diffuse.b, currMat.diffuse.a);
            mat.setSpecular(currMat.specular.r, currMat.specular.g, currMat.specular.b, currMat.specular.a);
            mat.setEmission(currMat.emission.r, currMat.emission.g, currMat.emission.b, currMat.emission.a);
            mat.setShininess(currMat.shininess);

            this.displayMaterials[matID] = mat;
        }

        console.log('Loaded Materials.');
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

            let tex = new CGFappearance(this.scene);
            tex.loadTexture(`../scenes${currTex.file.substring(1)}`);

            this.displayTextures[texID] = tex;
        }

        console.log('Loaded Textures.');
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {

        this.scene.pushMatrix();
        this.processNode(false, this.parsedXML.scene.root, this.scene.getMatrix());
        this.scene.popMatrix();

    }

    /**
     * Processes node from graph (either a component or a primitive).
     */
    processNode(prim, id, mat, tex, ls, lt) {

        const { primitives, components } = this.parsedXML;

        if (prim) {

            // Apply material
            this.displayMaterials[mat].apply();

            // Apply texture
            if (tex) {
                if (primitives[id].list[0].type === 'rectangle' || primitives[id].list[0].type === 'triangle')
                    this.displayPrimitives[id].updateTextST(ls, lt);

                this.displayTextures[tex].apply();
            }

            // Draw element
            this.displayPrimitives[id].display();
        }
        else {

            let currentComp = components[id];

            //TODO alter later to multiple materials
            // Adjust material
            let newMat = currentComp.materials.list[0].id !== 'inherit' ? currentComp.materials.list[0].id : mat;

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
                    newLs = currentComp.texture.length_s;
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
     * Parses an attribute.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     * @param type Type of the attribute.
     */
    parseAttribute(element, attribute, type) {

        let value;

        switch (type) {
            case 'ii':
                value = this.parseInt(element, attribute);
                break;
            case 'ff':
                value = this.parseFloat(element, attribute);
                break;
            case 'ss':
                value = this.parseString(element, attribute);
                break;
            case 'cc':
                value = this.parseChar(element, attribute);
                break;
            case 'tt':
                value = this.parseBool(element, attribute);
                break;
            default:
                this.onXMLError(`Type of attribute \"${attribute}\" is not expected (at \"${element.nodeName}\").`);
                return null;
        }

        // Check if attribute RGB is between [0.0, 1.0]
        if ((attribute === 'r' || attribute === 'g' || attribute === 'b') && (value < 0 || value > 1)) {
            this.onXMLError(`Attribute \"${attribute}\" is not between 0.0 and 1.0 (at \"${element.nodeName}\").`);
            return null;
        }

        return (value == null ? null : value);
    }

    /**
     * Parses an int.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseInt(element, attribute) {

        let value = this.reader.getInteger(element, attribute, false);

        if (value == null || isNaN(value)) {
            this.onXMLError(`Attribute \"${attribute}\" is not an integer (at \"${element.nodeName}\").`);
            return null;
        }

        return value;
    }

    /**
     * Parses a float.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseFloat(element, attribute) {

        let value = this.reader.getFloat(element, attribute, false);

        if (value == null || isNaN(value)) {
            this.onXMLError(`Attribute \"${attribute}\" is not an float (at \"${element.nodeName}\").`);
            return null;
        }

        return value;
    }

    /**
     * Parses a string.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseString(element, attribute) {

        let value = this.reader.getString(element, attribute, false);

        if (value == null || value === "") {
            this.onXMLError(`Attribute \"${attribute}\" is not an string (at \"${element.nodeName}\").`);
            return null;
        }

        return value;
    }

    /**
     * Parses a char.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseChar(element, attribute) {

        let value = this.reader.getString(element, attribute, false);

        if (value == null || (value !== "x" && value !== "y" && value !== "z")) {
            this.onXMLError(`Attribute \"${attribute}\" is not an char (at \"${element.nodeName}\").`);
            return null;
        }

        return value;
    }

    /**
     * Parses a bool.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseBool(element, attribute) {

        let value = this.reader.getBoolean(element, attribute, false);

        if (value == null) {
            this.onXMLError(`Attribute \"${attribute}\" is not an bool (at \"${element.nodeName}\").`);
            return null;
        }

        return value;
    }

    /**
     * Parses a block of XML, according to the defined structure.
     * @param element Element to be parsed.
     * @param structure Defined structure of the element.
     */
    parseBlock(element, structure) {

        const { attributes, options } = structure;

        // Create new object
        let obj = {};

        // Check attribute order
        if (this.validateBlock(element, structure))
            return null;

        // Iterate through attributes
        for (let i = 0; i < attributes.length; ++i) {

            let attributeName = attributes[i][0];
            let attributeType = attributes[i][1];

            let value = this.parseAttribute(element, attributeName, attributeType);

            if (value == null) return null;

            obj[attributeName] = value;
        }

        // Check "type" option
        if (options.includes('type'))
            obj.type = element.nodeName;

        // Check "list" option
        if (options.includes('list'))
            obj.list = [];

        // Iterate through children
        for (let i = 0; i < element.children.length; ++i) {

            let child = element.children[i];
            let childStructure = structure[child.nodeName];
            let childBlock = this.parseBlock(child, childStructure);

            if (childStructure == null || childBlock == null)
                return null;

            // Check "list" option
            if (options.includes('list')) {
                obj.list.push(childBlock);
            }
            // Check "id" option
            else if (childStructure.options.includes('id')) {

                // Check for existing ID
                if (obj[childBlock.id]) {
                    this.onXMLError(`Element with ID \"${childBlock.id}\" already exists (at \"${element.nodeName}\").`);
                    return null;
                }
                else
                    obj[childBlock.id] = childBlock;
            }
            else
                obj[child.nodeName] = childBlock;
        }

        // Check "log" option
        if (options.includes('log'))
            this.log(`Parsed element \"${element.nodeName}\".`);

        return obj;
    }

    /**
     * Validates a block of XML, according to the defined structure.
     * @param element Element to be validated
     * @param attributes Ordered list of the element's attributes.
     * @param tags Ordered list of the element's tags.
     * @param options Validation options of the element.
     * @returns {number} Returns 0 if valid, 1 otherwise.
     */
    validateBlock(element, { attributes, tags, options }) {

        // Check "id" option
        if (options.includes('id') && !element.hasAttribute('id')) {
            this.onXMLError(`Element \"${element.nodeName}\" has no ID to be used.`);
            return 1;
        }

        // Check "order" option
        if (options.includes('order') && tags.length === 0) {
            this.onXMLError(`Element \"${element.nodeName}\" needs to define order of children.`);
            return 1;
        }

        // Check number of attributes
        if (element.attributes.length !== attributes.length) {
            this.onXMLError(`Element \"${element.nodeName}\" has wrong number of attributes.`);
            return 1;
        }

        // Check order of attributes
        for (let i = 0; i < element.attributes.length; ++i) {

            let attributeName = element.attributes[i].name;

            if (attributeName !== attributes[i][0]) {

                if (!attributes.includes(attributeName)) {
                    this.onXMLError(`Attribute \"${attributeName}\" is not expected (at \"${element.nodeName}\").`);
                    return 1;
                }
                else if (!element.hasAttribute(attributes[i])) {
                    this.onXMLError(`Attribute \"${attributes[i]}\" is missing (at \"${element.nodeName}\").`);
                    return 1;
                }
                else
                    this.onXMLMinorError(`Attribute \"${attributeName}\" is out of order (at \"${element.nodeName}\").`);
            }
        }

        // Check "order" option
        if (options.includes('order')) {

            // Check number of children
            if (element.children.length !== tags.length) {
                this.onXMLError(`Element \"${element.nodeName}\" has wrong number of children.`);
                return 1;
            }

            // Check order of children
            for (let i = 0; i < element.children.length; ++i) {

                let childName = element.children[i].nodeName;

                if (childName !== tags[i]) {

                    if (!tags.includes(childName)) {
                        this.onXMLError(`Element \"${childName}\" is not expected (at \"${element.nodeName}\").`);
                        return 1;
                    }
                    else if (!element.hasOwnProperty(tags[i])) {
                        this.onXMLError(`Element \"${tags[i]}\" is missing (at \"${element.nodeName}\").`);
                        return 1;
                    }
                    else
                        this.onXMLMinorError(`Tag \"${childName}\" is out of order (at \"${element.nodeName}\").`);
                }
            }
        }

        return 0;
    }

    /**
     * Check YAS constraints on parsed data.
     */
    checkConstraints() {

        const { scene, views, lights, textures, materials, transformations, primitives, components } = this.parsedXML;

        // <views>

        // Check minimum number of views
        if (Object.keys(views).length < 2) {
            this.onXMLError('Need at least one view.');
            return 1;
        }

        // Check reference to default view
        if (!views[views.default]) {
            this.onXMLError('Default view does not exist.');
            return 1;
        }

        // <lights>

        // Check minimum number of lights
        if (Object.keys(lights).length < 1) {
            this.onXMLError('Need at least one light.');
            return 1;
        }

        // <textures>

        // Check minimum number of textures
        if (Object.keys(textures).length < 1) {
            this.onXMLError('Need at least one texture.');
            return 1;
        }

        // <materials

        // Check minimum number of materials
        if (Object.keys(materials).length < 1) {
            this.onXMLError('Need at least one material.');
            return 1;
        }

        // <transformations>

        // Check minimum number of complex transformations
        if (Object.keys(transformations).length < 1) {
            this.onXMLError('Need at least one complex transformation.');
            return 1;
        }

        // Check minimum number of simple transformations
        for (let key in transformations) {
            if (transformations[key].list.length < 1) {
                this.onXMLError(`Need at least one simple transformation (at \"${key}\").`);
                return 1;
            }
        }

        //<primitives>

        // Check minimum number of primitives
        if (Object.keys(primitives).length < 1) {
            this.onXMLError('Need at least one primitive.');
            return 1;
        }

        // Check unique primitive type
        for (let key in primitives) {
            if (primitives[key].list.length !== 1) {
                this.onXMLError(`Can only have one primitive type (at \"${key}\").`);
                return 1;
            }
        }

        //<components>

        // Check minimum number of components
        if (Object.keys(components).length < 1) {
            this.onXMLError('Need at least one component.');
            return 1;
        }

        // Check properties of components
        for (let componentKey in components) {

            const component = components[componentKey];

            const transfList = component.transformation.list;

            // Check component's transformation
            if (transfList.includes('transformationref')) {

                // Check if component has both reference and explicit transformations
                if (transfList.includes('translate') || transfList.includes('rotate') || transfList.includes('scale')) {
                    this.onXMLError(`Component cannot have both references and explicit transformations (at \"${componentKey}\").`);
                    return 1;
                }

                const transf = transfList[0].id;

                // Check reference to transformation
                if (!transformations[transf]) {
                    this.onXMLError(`Transformation \"${transf}\" does not exist (at \"${componentKey}\").`);
                    return 1;
                }
            }

            // Check minimum number of materials
            if (component.materials.list.length < 1) {
                this.onXMLError(`Need at least one material per component (at \"${componentKey}\").`);
                return 1;
            }

            // Check references to materials
            for (let i = 0; i < component.materials.list.length; ++i) {

                const material = component.materials.list[i].id;

                if (material !== 'inherit' && !materials[material]) {
                    this.onXMLError(`Material \"${material}\" does not exist (at \"${componentKey}\").`);
                    return 1;
                }
            }

            // Check reference to texture
            const texture = component.texture.id;

            if (texture !== 'none' && texture !== 'inherit' && !textures[texture]) {
                this.onXMLError(`Texture \"${texture}\" does not exist (at \"${componentKey}\").`);
                return 1;
            }

            // Check minimum amount of children
            if (Object.keys(component.children).length < 1) {
                this.onXMLError(`Need at least one child per component (at \"${componentKey}\").`);
                return 1;
            }

            // Check references to children
            for (let childKey in component.children) {

                const child = component.children[childKey];

                switch (child.type) {
                    case 'componentref':
                        if (!components[child.id]) {
                            this.onXMLError(`Component \"${childKey}\" does not exist (at \"${componentKey}\").`);
                            return 1;
                        }
                        break;
                    case 'primitiveref':
                        if (!primitives[child.id]) {
                            this.onXMLError(`Primitive \"${childKey}\" does not exist (at \"${componentKey}\").`);
                            return 1;
                        }
                        break;
                }
            }
        }

        const root = scene.root;

        // Check reference to root
        if (!components[root]) {
            this.onXMLError('Component root does not exist.');
            return 1;
        }

        // Check if root inherits materials
        for (let i = 0; i < components[root].materials.list.length; ++i) {

            if (components[root].materials.list[i].id === 'inherit') {
                this.onXMLError('Component root cannot inherit a material (at \"${root}\").');
                return 1;
            }
        }

        // Check if root inherits texture
        if (components[root].texture.id === 'inherit') {
            this.onXMLError('Component root cannot inherit a texture (at \"${root}\").');
            return 1;
        }

        // Check for cycles in graph
        let visited = {};
        for (let key in components)
            visited[key] = false;

        const checkCyclicGraph = function (node) {
            visited[node] = true;

            for (let child in components[node].children) {

                if (components[node].children[child].type === 'primitiveref') continue;

                if (!visited[child]) {
                    if (checkCyclicGraph(child))
                        return 1;
                }
                else
                    return 1;

                visited[child] = false;
            }

            return 0;
        };

        if (checkCyclicGraph(scene.root)) {
            this.onXMLError('Found a cycle in graph.');
            return 1;
        }

        /*
        let stack = [];

        stack.push(scene.root);

        while(stack.length > 0) {

            let node = stack.pop();

            if(!visited[node]) {
                visited[node] = true;

                console.log(`Processed ${node}.`);

                for(let child in components[node].children) {
                    if(components[node].children[child].type === 'primitiveref') continue;

                    if(!stack.includes(child))
                        stack.push(child);

                    if(visited[child] && stack.includes(child)) {
                        this.onXMLError(`Cycle detected in the graph (at \"${node}\").`);
                        return 1;
                    }
                }
            }
        }
        */

        return 0;
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