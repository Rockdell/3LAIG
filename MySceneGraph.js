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
                this.onXMLError(`Type of attribute \"${attribute}\" is not expected.`);
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

        let integer = this.reader.getInteger(element, attribute, false);

        if (integer == null || isNaN(integer)) {
            this.onXMLError(`Attribute \"${attribute}\" in \"${element.nodeName}\" is not an integer.`);
            return null;
        }

        return integer;
    }

    /**
     * Parses a float.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseFloat(element, attribute) {

        let float = this.reader.getFloat(element, attribute, false);

        if (float == null || isNaN(float)) {
            this.onXMLError(`Attribute \"${attribute}\" in \"${element.nodeName}\" is not an float.`);
            return null;
        }

        return float;
    }

    /**
     * Parses a string.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseString(element, attribute) {

        let string = this.reader.getString(element, attribute, false);

        if (string == null || string === "") {
            this.onXMLError(`Attribute \"${attribute}\" in \"${element.nodeName}\" is not an string.`);
            return null;
        }

        return string;
    }

    /**
     * Parses a char.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseChar(element, attribute) {

        let char = this.reader.getString(element, attribute, false);

        if (char == null || (char !== "x" && char !== "y" && char !== "z")) {
            this.onXMLError(`Attribute \"${attribute}\" in \"${element.nodeName}\" is not an char.`);
            return null;
        }

        return char;
    }

    /**
     * Parses a bool.
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseBool(element, attribute) {

        let bool = this.reader.getBoolean(element, attribute, false);

        if (bool == null || isNaN(bool)) {
            this.onXMLError(`Attribute \"${attribute}\" in \"${element.nodeName}\" is not an bool.`);
            return null;
        }

        return bool;
    }

    /**
     * Parses a block of XML, according to the defined structure.
     * @param element Element to be parsed.
     * @param struct Defined structure of the element.
     */
    parseBlock(element, struct) {

        const { attributes, options } = struct;

        // Create new object
        let obj = {};

        // Check attribute order
        if (this.validateBlock(element, struct))
            return null;

        // Iterate through attributes
        for (let i = 0; i < attributes.length; ++i) {

            let attributeName = struct.attributes[i][0];
            let attributeType = struct.attributes[i][1];

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
            let childStructure = struct[child.nodeName];
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
                    this.onXMLError(`Element with ID \"${childBlock.id}\" already exists.`);
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
            this.log(`Parsed element <${element.nodeName}> with success.`);

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
                    this.onXMLError(`Attribute \"${attributeName}\" is not expected.`);
                    return 1;
                }
                else if (!element.hasAttribute(attributes[i])) {
                    this.onXMLError(`Attribute \"${attributes[i]}\" is missing.`);
                    return 1;
                }
                else
                    MySceneGraph.onXMLMinorError(`Attribute \"{attributeName} is out of order.`);
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

                    if (!children.includes(childName)) {
                        this.onXMLError(`Tag <${childName}> is not expected.`);
                        return 1;
                    }
                    else if (!element.hasOwnProperty(tags[i])) {
                        this.onXMLError(`Tag <${tags[i]}> is missing.`);
                        return 1;
                    }
                    else
                        MySceneGraph.onXMLMinorError(`Tag <${childName}> is out of order.`);
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

        //<views>

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

        //<lights>

        // Check minimum number of lights
        if (Object.keys(lights).length < 1) {
            this.onXMLError('Need at least one light.');
            return 1;
        }

        //<textures>

        // Check minimum number of textures
        if (Object.keys(textures).length < 1) {
            this.onXMLError('Need at least one texture.');
            return 1;
        }

        //<materials>

        // Check minimum number of materials
        if (Object.keys(materials).length < 1) {
            this.onXMLError('Need at least one material.');
            return 1;
        }

        //<transformations>

        // Check minimum number of complex transformations
        if (Object.keys(transformations).length < 1) {
            this.onXMLError('Need at least one complex transformation.');
            return 1;
        }

        // Check minimum number of simple transformations
        for (let key in transformations) {

            if (!transformations.hasOwnProperty(key)) continue;

            if (transformations[key].list.length < 1) {
                this.onXMLError('Need at least one simple transformation.');
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

            if (!primitives.hasOwnProperty(key)) continue;

            if (primitives[key].list.length !== 1) {
                this.onXMLError('Can only have one primitive type.');
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

            if (!components.hasOwnProperty(componentKey)) continue;

            const component = components[componentKey];

            const transfList = component.transformation.list;

            // Check component's transformation
            if (transfList.includes('transformationref')) {

                // Check if component has both reference and explicit transformations
                if (transfList.includes('translate') || transfList.includes('rotate') || transfList.includes('scale')) {
                    this.onXMLError('Component cannot have both references and explicit transformations.');
                    return 1;
                }

                const transf = transfList[0].id;

                // Check reference to transformation
                if (!transformations[transf]) {
                    this.onXMLError(`Transformation \"${transf}\" does not exist.`);
                    return 1;
                }
            }

            // Check minimum number of materials
            if (component.materials.list.length < 1) {
                this.onXMLError('Need at least one material per component.');
                return 1;
            }

            // Check references to materials
            for (let i = 0; i < component.materials.list.length; ++i) {

                const material = component.materials.list[i].id;

                if (material !== 'inherit' && !materials[material]) {
                    this.onXMLError(`Material \"${material}\" does not exist.`);
                    return 1;
                }
            }

            // Check reference to texture
            const texture = component.texture.id;

            if (texture !== 'none' && texture !== 'inherit' && !textures[texture]) {
                this.onXMLError(`Texture \"${texture}\" does not exist.`);
                return 1;
            }

            // Check minimum amount of children
            if (Object.keys(component.children).length < 1) {
                this.onXMLError('Need at least one child per component.');
                return 1;
            }

            // Check references to children
            for (let childKey in component.children) {

                if (!component.children.hasOwnProperty(childKey)) continue;

                const child = component.children[childKey];

                switch (child.type) {
                    case 'componentref':
                        if (!components[child.id]) {
                            this.onXMLError(`Component \"${child.id}\" does not exist.`);
                            return 1;
                        }
                        break;
                    case 'primitiveref':
                        if (!primitives[child.id]) {
                            this.onXMLError(`Primitive \"${child.id}\" does not exist.`);
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
                this.onXMLError('Component root cannot inherit a material.');
                return 1;
            }
        }

        // Check if root inherits texture
        if (components[root].texture.id === 'inherit') {
            this.onXMLError('Component root cannot inherit a texture.');
            return 1;
        }

        return 0;
    }

    /**
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error(`Error: ${message}.`);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn(`Warning: ${message}.`);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log(`   ${message}.`);
    }
}