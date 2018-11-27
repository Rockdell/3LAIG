
/**
 * MyParser class, representing the parser.
 */
class MyParser {

    /**
     * @constructor
     * @param sceneGraph Scene graph
     */
    constructor(sceneGraph) {
        this.sceneGraph = sceneGraph;
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
            case 'ff ff ff':
                value = this.parseSetFloat(element, attribute);
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
                this.sceneGraph.onXMLError(`Type of attribute \"${attribute}\" is not expected (at \"${element.nodeName}\").`);
                return null;
        }

        // Check if attribute RGB is between [0.0, 1.0]
        if ((attribute === 'r' || attribute === 'g' || attribute === 'b') && (value < 0 || value > 1)) {
            this.sceneGraph.onXMLError(`Attribute \"${attribute}\" is not between 0.0 and 1.0 (at \"${element.nodeName}\").`);
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

        let value = this.sceneGraph.reader.getInteger(element, attribute, false);

        if (value == null || isNaN(value)) {
            this.sceneGraph.onXMLError(`Attribute \"${attribute}\" is not an integer (at \"${element.nodeName}\").`);
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

        let value = this.sceneGraph.reader.getFloat(element, attribute, false);

        if (value == null || isNaN(value)) {
            this.sceneGraph.onXMLError(`Attribute \"${attribute}\" is not a float (at \"${element.nodeName}\").`);
            return null;
        }

        return value;
    }

    /**
     * Parses a set of floats
     * @param element Element of the attribute.
     * @param attribute Name of the attribute.
     */
    parseSetFloat(element, attribute) {

        let floats = this.sceneGraph.reader.getString(element, attribute, false).split(' ');

        if (floats == null) {
            this.sceneGraph.onXMLError(`Attribute \"${attribute}\" is not a float (at \"${element.nodeName}\").`);
            return null;
        }

        let value = {
            x: parseFloat(floats[0]),
            y: parseFloat(floats[1]),
            z: parseFloat(floats[2])
        };

        if (isNaN(value.x) || isNaN(value.y) || isNaN(value.z)) {
            this.sceneGraph.onXMLError(`Attribute \"${attribute}\" is not a float (at \"${element.nodeName}\").`);
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

        let value = this.sceneGraph.reader.getString(element, attribute, false);

        if (value == null || value === "") {
            this.sceneGraph.onXMLError(`Attribute \"${attribute}\" is not a string (at \"${element.nodeName}\").`);
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

        let value = this.sceneGraph.reader.getString(element, attribute, false);

        if (value == null || (value !== 'x' && value !== 'y' && value !== 'z')) {
            this.sceneGraph.onXMLError(`Attribute \"${attribute}\" is not a char (at \"${element.nodeName}\").`);
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

        let value = this.sceneGraph.reader.getBoolean(element, attribute, false);

        if (value == null) {
            this.sceneGraph.onXMLError(`Attribute \"${attribute}\" is not a bool (at \"${element.nodeName}\").`);
            return null;
        }

        return value;
    }

    /**
     * Parses a block of XML, according to the defined schema.
     * @param element Element to be parsed.
     * @param schema Defined schema of the element.
     */
    parseBlock(element, schema) {

        const { attributes, options } = schema;

        let obj = {};

        if (this.validateBlock(element, schema) != 0)
            return null;

        if (options.includes(opt.SAVE_TYPE)) obj['type'] = element.nodeName;
        if (options.includes(opt.SAVE_LIST)) obj['list'] = [];

        for (let i = 0; i < element.attributes.length; i++) {
            let attribute = element.attributes[i];
            let name = attribute.name;
            let type = attributes.find(function(a) { if(a.name === name) return a; }).type;
            let value = this.parseAttribute(element, name, type)

            if (value == null) return null;

            obj[name] = value;
        }

        for (let i = 0; i < element.children.length; i++) {
            let child = element.children[i];
            let childSchema = schema[child.nodeName];
            let childBlock = this.parseBlock(child, childSchema);

            if (childBlock == null || childSchema == null)
                return null;

            if (options.includes(opt.SAVE_LIST)) {
                obj['list'].push(childBlock);
            }
            else if (childSchema.options.includes(opt.SAVE_ID)) {

                if (obj[childBlock.id]) {
                    this.sceneGraph.onXMLError(`Element with ID \"${childBlock.id}\" already exists (at \"${element.nodeName}\").`);
                    return null;
                }
                else {
                    obj[childBlock.id] = childBlock;
                }
            }
            else {
                obj[child.nodeName] = childBlock;
            }
        }

        if (options.includes(opt.LOG_TAG))
            this.sceneGraph.log(`Parsed element \"${element.nodeName}\".`);

        return obj;
    }

    /**
     * Validates a block of XML, according to the defined schema.
     * @param element Element to be validated
     * @param attributes Ordered list of the element's attributes.
     * @param tags Ordered list of the element's tags.
     * @param options Validation options of the element.
     * @returns {number} Returns 0 if valid, 1 otherwise.
     */
    validateBlock(element, { attributes, tags, options }) {

        // Check "parsererror"
        if (element.children.length > 0 && element.children[0].nodeName === "parsererror") {
            this.sceneGraph.onXMLError('Document is not a valid XML file.');
            return 1;
        }

        // Check "id" option
        if (options.includes(opt.SAVE_ID) && !element.hasAttribute('id')) {
            this.sceneGraph.onXMLError(`Element \"${element.nodeName}\" has no ID to be used.`);
            return 1;
        }

        // Check "order" option
        if (options.includes(opt.ORDER_TAG) && tags.length === 0) {
            this.sceneGraph.onXMLError(`Element \"${element.nodeName}\" needs to define order of children.`);
            return 1;
        }

        // Check number of attributes
        if (element.attributes.length > attributes.length) {
            this.sceneGraph.onXMLError(`Element \"${element.nodeName}\" has wrong number of attributes.`);
            return 1;
        }

        if (this.validateAttributes(element, attributes) != 0)
            return 1;


        if (this.validateTags(element, tags, options) != 0)
            return 1;

        return 0;
    }

    /**
     * Validates the attributes of an element.
     * @param element Element of the attributes to validate.
     * @param attributes Attributes of the schema.
     */
    validateAttributes(element, attributes) {

        // Check if required attributes are present
        let not_required = 0;

        for (let i in attributes) {
            let attribute = attributes[i];

            if (element.hasAttribute(attribute.name)) {
                if (element.attributes[i - not_required] == undefined || element.attributes[i - not_required].name != attribute.name)
                    this.sceneGraph.onXMLMinorError(`Attribute \"${attribute.name}\" is out of order (at \"${element.nodeName}\").`);
            }
            else {
                if (!attribute.required) {
                    not_required++;
                    continue;
                }

                this.sceneGraph.onXMLError(`Attribute \"${attribute.name}\" is missing (at \"${element.nodeName}\").`);
                return 1;
            }
        }

        // Check for unexpected attributes
        for (let i = 0; i < element.attributes.length; i++) {

            let attribute = element.attributes[i];

            if (attributes.find(function (a) { if (a.name == attribute.name) return a; }) == undefined) {
                this.sceneGraph.onXMLError(`Attribute \"${attribute.name}\" is not expected (at \"${element.nodeName}\").`)
                return 1;
            }
        }

        return 0;
    }

    /**
     * Validates the tags of an element.
     * @param element Element of the tags to validate.
     * @param tags Tags of the schema.
     * @param options Options of the schema.
     */
    validateTags(element, tags, options) {

        const hasTag = function(element, tag) {
            for (let i = 0; i < element.children.length; i++) {
                if (element.children[i].nodeName == tag.name)
                    return true;
            }
            return false;
        }

        // Check if required tags are present
        let not_required = 0;

        for (let i in tags) {
            let tag = tags[i];

            if (hasTag(element, tag)) {
                if (!options.includes(opt.ORDER_TAG)) continue;

                if (element.children[i - not_required] == undefined || element.children[i - not_required].nodeName != tag.name)
                    this.sceneGraph.onXMLMinorError(`Tag \"${tag.name}\" is out of order (at \"${element.nodeName}\").`);
            }
            else {
                if (!tag.required) {
                    not_required++;
                    continue;
                }

                this.sceneGraph.onXMLError(`Tag \"${tag.name}\" is missing (at \"${element.nodeName}\").`);
                return 1;
            }
        }

        // Check for unexpected tags
        for (let i = 0; i < element.children.length; i++) {
            let tag = element.children[i];

            if (tags.find(function (t) { if (t.name == tag.nodeName) return t; }) == undefined) {
                this.sceneGraph.onXMLError(`Tag \"${tag.nodeName}\" is not expected (at \"${element.nodeName}\").`);
                return 1;
            }
        }

        return 0;
    }

    /**
     * Checks constraints of parsed XML.
     * @param parsedXML Parsed XML.
     */
    checkConstraints(parsedXML) {

        if (this.checkViews(parsedXML) != 0 || this.checkLights(parsedXML) != 0 || this.checkTextures(parsedXML) != 0
            || this.checkMaterials(parsedXML) != 0 || this.checkTransformations(parsedXML) != 0 
            || this.checkAnimations(parsedXML) != 0 || this.checkPrimitives(parsedXML) != 0 || this.checkComponents(parsedXML) != 0)
            return 1;

        return 0;
    }

    /**
     * Checks views.
     * @param views Views of parsed XML.
     */
    checkViews({ views }) {

        // Check minimum number of views
        if (Object.keys(views).length < 2) {
            this.sceneGraph.onXMLError(`Need at least one view.`);
            return 1;
        }

        // Check reference to default view
        if (!views[views.default])
            this.sceneGraph.onXMLMinorError(`Default view does not exist. Using another.`); 

        return 0;
    }

    /**
     * Checks lights.
     * @param lights Lights of parsed XML.
     */
    checkLights({ lights }) {

        // Check minimum number of lights
        if (Object.keys(lights).length < 1) {
            this.sceneGraph.onXMLError(`Need at least one light.`);
            return 1;
        }

        return 0;
    }

    /**
     * Checks textures.
     * @param textures Textures of parsed XML.
     */
    checkTextures({ textures }) {

        // Check minimum number of textures
        if (Object.keys(textures).length < 1) {
            this.sceneGraph.onXMLError(`Need at least one texture.`);
            return 1;
        }

        return 0;        
    }

    /**
     * Checks materials.
     * @param materials Materials of parsed XML.
     */
    checkMaterials({ materials }) {

        // Check minimum number of materials
        if (Object.keys(materials).length < 1) {
            this.sceneGraph.onXMLError(`Need at least one material.`);
            return 1;
        }

        return 0;
    }

    /**
     * Checks transformations.
     * @param transformations Transformations of parsed XML.
     */
    checkTransformations({ transformations }) {

        // Check minimum number of complex transformations
        if (Object.keys(transformations).length < 1) {
            this.sceneGraph.onXMLError(`Need at least one complex transformation.`);
            return 1;
        }

        // Check minimum number of simple transformations
        for (let key in transformations) {
            if (transformations[key].list.length < 1) {
                this.sceneGraph.onXMLError(`Need at least one simple transformation (at \"${key}\").`);
                return 1;
            }
        }

        return 0;
    }

    /**
     * Checks animations.
     * @param animations Animations of parsed XML.
     */
    checkAnimations({ animations }) {

        for (let key in animations) {

            const animation = animations[key];

            if (animation.type === 'linear' && animation.list.length < 2) {
                this.sceneGraph.onXMLError(`Need at least two control points (at \"${key}\").`);
                return 1;
            }
        }

        return 0;
    }

    /**
     * Checks primitives.
     * @param primitives Primitives of parsed XML.
     */
    checkPrimitives({ primitives }) {

        // Check minimum number of primitives
        if (Object.keys(primitives).length < 1) {
            this.sceneGraph.onXMLError(`Need at least one primitive.`);
            return 1;
        }

        // Check unique primitive type
        for (let key in primitives) {

            if (primitives[key].list.length !== 1) {
                this.sceneGraph.onXMLError(`Can only have one primitive type (at \"${key}\").`);
                return 1;
            }

            const primitive = primitives[key].list[0];

            if (primitive.type === 'patch' && primitive.list.length != primitive.npointsU * primitive.npointsV) {
                this.sceneGraph.onXMLError(`Patch has wrong number of control points (at \"${key}\").`);
                return 1;
            }
        }

        return 0;
    }

    /**
     * Checks components.
     * @param scene Scene of parsed XML.
     * @param textures Textures of parsed XML.
     * @param materials Materials of parsed XML.
     * @param animations Animations of parsed XML.
     * @param transformations Transformations of parsed XML.
     * @param primitives Primitives of parsed XML.
     * @param components Components of parsed XML.
     */
    checkComponents({ scene, textures, materials, animations, transformations, primitives, components }) {

        // Check minimum number of components
        if (Object.keys(components).length < 1) {
            this.sceneGraph.onXMLError(`Need at least one component.`);
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
                    this.sceneGraph.onXMLError(`Component cannot have both references and explicit transformations (at \"${componentKey}\").`);
                    return 1;
                }

                const transf = transfList[0].id;

                // Check reference to transformation
                if (!transformations[transf]) {
                    this.sceneGraph.onXMLError(`Transformation \"${transf}\" does not exist (at \"${componentKey}\").`);
                    return 1;
                }
            }

            // Check references to animations, if there are any
            if (component.animations != undefined) {
                for (let i = 0; i < component.animations.list.length; ++i) {

                    const animation = component.animations.list[i].id;

                    if (!animations[animation]) {
                        this.sceneGraph.onXMLError(`Animation \"${animation}\" does not exist (at \"${componentKey}\").`);
                        return 1;
                    }
                }
            }

            // Check minimum number of materials
            if (component.materials.list.length < 1) {
                this.sceneGraph.onXMLError(`Need at least one material per component (at \"${componentKey}\").`);
                return 1;
            }

            // Check references to materials
            for (let i = 0; i < component.materials.list.length; ++i) {

                const material = component.materials.list[i].id;

                if (material !== 'inherit' && !materials[material]) {
                    this.sceneGraph.onXMLError(`Material \"${material}\" does not exist (at \"${componentKey}\").`);
                    return 1;
                }
            }

            // Check reference to texture
            const texture = component.texture.id;

            if (texture !== 'none' && texture !== 'inherit') {

                if (!textures[texture]) {
                    this.sceneGraph.onXMLError(`Texture \"${texture}\" does not exist (at \"${componentKey}\").`);
                    return 1;
                }

                if (!component.texture.hasOwnProperty('length_s') || !component.texture.hasOwnProperty('length_t')) {
                    this.sceneGraph.onXMLError(`Texture \"${texture}\" has no length_s/length_t defined (at \"${componentKey}\").`);
                    return 1;
                }

                if(component.texture.length_s === 0 || component.texture.length_t === 0)
                    this.sceneGraph.onXMLMinorError(`Texture \"${texture}\" has length_s/length_t with value 0.0 (at \"${componentKey}\").`);
            }

            // Check minimum amount of children
            if (Object.keys(component.children).length < 1) {
                this.sceneGraph.onXMLError(`Need at least one child per component (at \"${componentKey}\").`);
                return 1;
            }

            // Check references to children
            for (let childKey in component.children) {

                const child = component.children[childKey];

                switch (child.type) {
                    case 'componentref':
                        if (!components[child.id]) {
                            this.sceneGraph.onXMLError(`Component \"${childKey}\" does not exist (at \"${componentKey}\").`);
                            return 1;
                        }
                        break;
                    case 'primitiveref':
                        if (!primitives[child.id]) {
                            this.sceneGraph.onXMLError(`Primitive \"${childKey}\" does not exist (at \"${componentKey}\").`);
                            return 1;
                        }
                        break;
                }
            }
        }

        const root = scene.root;

        // Check reference to root
        if (!components[root]) {
            this.sceneGraph.onXMLError(`Component root does not exist.`);
            return 1;
        }

        // Check if root inherits materials
        for (let i = 0; i < components[root].materials.list.length; ++i) {

            if (components[root].materials.list[i].id === 'inherit') {
                this.sceneGraph.onXMLError(`Component root cannot inherit a material (at \"${root}\").`);
                return 1;
            }
        }

        // Check if root inherits texture
        if (components[root].texture.id === 'inherit') {
            this.sceneGraph.onXMLError(`Component root cannot inherit a texture (at \"${root}\").`);
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
            this.sceneGraph.onXMLError(`Found a cycle in graph.`);
            return 1;
        }

        return 0;
    }
}