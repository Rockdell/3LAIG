
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

        if (value == null || (value !== "x" && value !== "y" && value !== "z")) {
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
     * Parses a block of XML, according to the defined structure.
     * @param element Element to be parsed.
     * @param structure Defined structure of the element.
     */
    parseBlock(element, structure) {

        const getAttrType = function (array, attr) {

            for (let i = 0; i < array.length; ++i) {
                if (array[i][0] === attr)
                    return array[i][1];
            }
            return null;
        };

        const { attributes, options } = structure;

        // Create new object
        let obj = {};

        // Check attribute order
        if (this.validateBlock(element, structure))
            return null;

        for (let i = 0; i < element.attributes.length; ++i) {

            let attributeName = element.attributes[i].name;

            let attributeType = getAttrType(attributes, attributeName);

            if (element.hasAttribute(attributeName)) {

                let value = this.parseAttribute(element, attributeName, attributeType);

                if (value == null) return null;

                obj[attributeName] = value;
            }
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
                    this.sceneGraph.onXMLError(`Element with ID \"${childBlock.id}\" already exists (at \"${element.nodeName}\").`);
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
            this.sceneGraph.log(`Parsed element \"${element.nodeName}\".`);

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
            this.sceneGraph.onXMLError(`Element \"${element.nodeName}\" has no ID to be used.`);
            return 1;
        }

        // Check "order" option
        if (options.includes('order') && tags.length === 0) {
            this.sceneGraph.onXMLError(`Element \"${element.nodeName}\" needs to define order of children.`);
            return 1;
        }

        // Check number of attributes
        if (element.attributes.length > attributes.length) {
            this.sceneGraph.onXMLError(`Element \"${element.nodeName}\" has wrong number of attributes.`);
            return 1;
        }

        let attributesList = [];
        for (let i = 0; i < attributes.length; ++i)
            attributesList.push(attributes[i][0])

        for (let i = 0; i < attributes.length; ++i) {

            let attributeName = attributes[i][0];
            let attributeCode = attributes[i][2];

            if (element.attributes[i] === undefined) {

                if (attributeCode === undefined || attributeCode !== "#") {
                    this.sceneGraph.onXMLError(`Attribute \"${attributeName}\" is missing (at \"${element.nodeName}\").`);
                    return 1;
                }
            }
            else if (attributeName !== element.attributes[i].name) {

                if (!attributesList.includes(element.attributes[i].name)) {
                    this.sceneGraph.onXMLError(`Attribute \"${element.attributes[i].name}\" is not expected (at \"${element.nodeName}\").`);
                    return 1;
                }
                else if (!element.hasAttribute(attributeName)) {

                    if (attributeCode === "#") continue;

                    this.sceneGraph.onXMLError(`Attribute \"${attributeName}\" is missing (at \"${element.nodeName}\").`);
                    return 1;
                }
                else
                    this.sceneGraph.onXMLMinorError(`Attribute \"${attributeName}\" is out of order (at \"${element.nodeName}\").`);
            }
        }

        // Check "order" option
        if (options.includes('order')) {

            // Check number of children
            if (element.children.length !== tags.length) {
                this.sceneGraph.onXMLError(`Element \"${element.nodeName}\" has wrong number of children.`);
                return 1;
            }

            let childrenList = [];
            for (let i = 0; i < element.children.length; ++i)
                childrenList.push(element.children[i].nodeName)

            // Check order of children
            for (let i = 0; i < element.children.length; ++i) {

                let childName = element.children[i].nodeName;

                if (childName !== tags[i]) {

                    if (!tags.includes(childName)) {
                        this.sceneGraph.onXMLError(`Element \"${childName}\" is not expected (at \"${element.nodeName}\").`);
                        return 1;
                    }
                    else if (!childrenList.includes(tags[i])) {
                        this.sceneGraph.onXMLError(`Element \"${tags[i]}\" is missing (at \"${element.nodeName}\").`);
                        return 1;
                    }
                    else
                        this.sceneGraph.onXMLMinorError(`Tag \"${childName}\" is out of order (at \"${element.nodeName}\").`);
                }
            }
        }

        return 0;
    }

    /**
     * Check YAS constraints on parsed data.
     */
    checkConstraints(parsedXML) {

        const { scene, views, lights, textures, materials, transformations, primitives, components } = parsedXML;

        // <views>

        // Check minimum number of views
        if (Object.keys(views).length < 2) {
            this.sceneGraph.onXMLError('Need at least one view.');
            return 1;
        }

        // Check reference to default view
        if (!views[views.default])
            this.sceneGraph.onXMLMinorError('Default view does not exist. Using another.'); 

        // <lights>

        // Check minimum number of lights
        if (Object.keys(lights).length < 1) {
            this.sceneGraph.onXMLError('Need at least one light.');
            return 1;
        }

        // <textures>

        // Check minimum number of textures
        if (Object.keys(textures).length < 1) {
            this.sceneGraph.onXMLError('Need at least one texture.');
            return 1;
        }

        // <materials

        // Check minimum number of materials
        if (Object.keys(materials).length < 1) {
            this.sceneGraph.onXMLError('Need at least one material.');
            return 1;
        }

        // <transformations>

        // Check minimum number of complex transformations
        if (Object.keys(transformations).length < 1) {
            this.sceneGraph.onXMLError('Need at least one complex transformation.');
            return 1;
        }

        // Check minimum number of simple transformations
        for (let key in transformations) {
            if (transformations[key].list.length < 1) {
                this.sceneGraph.onXMLError(`Need at least one simple transformation (at \"${key}\").`);
                return 1;
            }
        }

        //<primitives>

        // Check minimum number of primitives
        if (Object.keys(primitives).length < 1) {
            this.sceneGraph.onXMLError('Need at least one primitive.');
            return 1;
        }

        // Check unique primitive type
        for (let key in primitives) {
            if (primitives[key].list.length !== 1) {
                this.sceneGraph.onXMLError(`Can only have one primitive type (at \"${key}\").`);
                return 1;
            }
        }

        //<components>

        // Check minimum number of components
        if (Object.keys(components).length < 1) {
            this.sceneGraph.onXMLError('Need at least one component.');
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

                if (!component.texture.hasOwnProperty("length_s") || !component.texture.hasOwnProperty("length_t")) {
                    this.sceneGraph.onXMLError(`Texture \"${texture}\" has no length_s/length_t defined (at \"${componentKey}\").`);
                    return 1;
                }

                if(component.texture.length_s === 0 || component.texture.length_t === 0)
                    this.sceneGraph.onXMLMinorError(`Texture \"${texture}\" has length_s/length_t with value 0.0 (at \"${componentKey}\").`);
            }

            if (texture !== 'none')

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
            this.sceneGraph.onXMLError('Component root does not exist.');
            return 1;
        }

        // Check if root inherits materials
        for (let i = 0; i < components[root].materials.list.length; ++i) {

            if (components[root].materials.list[i].id === 'inherit') {
                this.sceneGraph.onXMLError('Component root cannot inherit a material (at \"${root}\").');
                return 1;
            }
        }

        // Check if root inherits texture
        if (components[root].texture.id === 'inherit') {
            this.sceneGraph.onXMLError('Component root cannot inherit a texture (at \"${root}\").');
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
            this.sceneGraph.onXMLError('Found a cycle in graph.');
            return 1;
        }

        return 0;
    }
}