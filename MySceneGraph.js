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

		this.reader.open('scenes/' + filename, this);

		/**
		 * XML structure of the YAS file, including, order of attributes/elements, variable types and save options
		 */
		this.structure = makeYasStructure();

		this.parsedXML = null;
	}

	/*
	 * Callback to be executed after successful reading
	 */
	onXMLReady() {

		this.log("XML loading finished with success.");

		var rootElement = this.reader.xmlDoc.documentElement;

		if(rootElement.nodeName != "yas")
			this.onXMLError("Tag <yas> is missing.");

		this.parseXMLFile(rootElement);

		if (!this.loadedOk)
			return;

		// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
		this.scene.onGraphLoaded();
	}

	/**
	 * Parses the XML file, processing each block.
	 * @param {XML root element} rootElement
	 */
	parseXMLFile(rootElement) {

		this.parsedXML = this.parseBlock(rootElement, this.structure["yas"]);

		//console.log(this.parsedXML);

		if(this.parsedXML == null)
			return;

		if(this.checkConstraints())
			return;

		this.loadedOk = true;

		this.log("Parsed and checked XML document with success");
	}

	createPrimitives() {

		this.displayPrimitives = {};

		//Cycles through all parsed primitives
		for(var primID in this.parsedXML.primitives) {
			var currPrim = this.parsedXML.primitives[primID].list[0];

			switch(currPrim.type) {
				case "rectangle":
					this.displayPrimitives[primID] = new MyRectangle(this.scene, currPrim.x1, currPrim.y1, currPrim.x2, currPrim.y2);
					break;
				case "triangle":
					this.displayPrimitives[primID] = new MyTriangle(this.scene, currPrim.x1, currPrim.y1, currPrim.z1, currPrim.x2, currPrim.y2, currPrim.z2, currPrim.x3, currPrim.y3, currPrim.z3);
					break;
				case "cylinder":
					this.displayPrimitives[primID] = new MyCylinder(this.scene, currPrim.base, currPrim.top, currPrim.height, currPrim.slices, currPrim.stacks);
					break;
				case "sphere":
					this.displayPrimitives[primID] = new MySphere(this.scene, currPrim.radius, currPrim.slices, currPrim.stacks);
					break;
				case "torus":
					this.displayPrimitives[primID] = new MyTorus(this.scene, currPrim.inner, currPrim.outer, currPrim.slices, currPrim.loops);
					break;
			}
		}

		console.log("Loaded Primitives.");
	}

	createMaterials() {

		this.displayMaterials = {};

		for (var matID in this.parsedXML.materials) {
			var currMat = this.parsedXML.materials[matID];

			var mat = new CGFappearance(this.scene);
			mat.setAmbient(currMat.ambient.r, currMat.ambient.g, currMat.ambient.b, currMat.ambient.a);
			mat.setDiffuse(currMat.diffuse.r, currMat.diffuse.g, currMat.diffuse.b, currMat.diffuse.a);
			mat.setSpecular(currMat.specular.r, currMat.specular.g, currMat.specular.b, currMat.specular.a);
			mat.setEmission(currMat.emission.r, currMat.emission.g, currMat.emission.b, currMat.emission.a);
			mat.setShininess(currMat.shininess);

			this.displayMaterials[matID] = mat;
		}

		console.log("Loaded Materials.");
	}

	createTextures() {

		this.displayTextures = {};

		for (var texID in this.parsedXML.textures) {
			var currTex = this.parsedXML.textures[texID];

			var tex = new CGFappearance(this.scene);
			tex.loadTexture("../scenes" + currTex.file.substring(1));

			this.displayTextures[texID] = tex;
		}

		console.log("Loaded Textures.");
	}

	/**
	 * Displays the scene, processing each node, starting in the root node.
	 */
	displayScene() {

		this.scene.pushMatrix();
			this.processNode(false, this.parsedXML.scene.root, this.scene.getMatrix());
		this.scene.popMatrix();

	}

	processNode(prim, id, mat, text, ls, lt) {

		if(prim) {

			//Apply Material
			this.displayMaterials[mat].apply();
			
			//Apply Texture
			if(text) {
				if(this.parsedXML.primitives[id].list[0].type == "rectangle" || this.parsedXML.primitives[id].list[0].type == "triangle")
					this.displayPrimitives[id].updateTextST(ls, lt);

				this.displayTextures[text].apply();
			}

			//Draw element
			this.displayPrimitives[id].display();
		}
		else {
			var currentComp = this.parsedXML.components[id];

			//TODO alter later to multiple materials
			//Adjust material
			var newMat = currentComp.materials.list[0].id != "inherit" ? currentComp.materials.list[0].id : mat;
			
			//Adjust Texture
			var newText = text;
			var newLs = ls;
			var newLt = lt;

			switch(currentComp.texture.id) {
				case "none":
					newText = null;
					newLs = null;
					newLt = null;
					break;
				case "inherit":
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
			
				//Adjust Transformation Matrix
				this.adjustMatrix(currentComp);
	
				for (var childID in currentComp.children) {

					var child = currentComp.children[childID];

					this.processNode(child.type == "primitiveref" ? true : false, child.id, newMat, newText, newLs, newLt);
				}

			this.scene.popMatrix();
		}	
	}

	adjustMatrix(component) {

		//Checks if it has any transformations
		if(!component.transformation.list[0])
			return;
			
		//Checks if it is a transformation reference of a new transformation
		if(component.transformation.list[0].type == "transformationref") {

			//Transformation reference
			var reference = this.parsedXML.transformations[component.transformation.list[0].id];

			for(let i = 0; i < reference.list.length; i++) {
				this.readTransformations(reference.list[i]);
			}
		}
		else {
			//New transformation
			for(let i = 0; i < component.transformation.list.length; i++) {
				this.readTransformations(component.transformation.list[i]);
			}
		}
	}

	readTransformations(ptrans) {

		switch (ptrans.type) {
			case "translate" :
				this.scene.translate(ptrans.x, ptrans.y, ptrans.z);
				break;
			case "scale" :
				this.scene.scale(ptrans.x, ptrans.y, ptrans.z);
				break;
			case "rotate" :
				switch(ptrans.axis) {
					case 'x':
						this.scene.rotate(ptrans.angle * DEGREE_TO_RAD, 1, 0, 0);
						break;
					case 'y':
						this.scene.rotate(ptrans.angle * DEGREE_TO_RAD, 0, 1, 0);
						break;
					case 'z':
						this.scene.rotate(ptrans.angle * DEGREE_TO_RAD, 0, 0, 1);
						break;
				}
			break;
		}
	}

	// --- Parser functions ---
	
	parseAttribute(element, attribute, type) {

		var value;

		switch (type) {
			case "ii":
				value = this.parseInt(element, attribute);
				break;
			case "ff":
				value = this.parseFloat(element, attribute);
				break;
			case "ss":
				value = this.parseString(element, attribute);
				break;
			case "cc":
				value = this.parseChar(element, attribute);
				break;
			case "tt":
				value = this.parseBool(element, attribute);
				break;
			default:
				this.onXMLError("Type of attribute " + attribute + " is not expected.");
				return null;
		}

		return (value == null ? null : value);
	}

	parseInt(element, attribute) {

		var integer = this.reader.getInteger(element, attribute, false);

		if (integer == null || isNaN(integer)) {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element.nodeName + "\" is not an integer.");
			return null;
		}

		return integer;
	}

	parseFloat(element, attribute) {

		var float = this.reader.getFloat(element, attribute, false);

		if (float == null || isNaN(float)) {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element.nodeName + "\" is not a float.");
			return null;
		}

		return float;
	}

	parseString(element, attribute) {

		var string = this.reader.getString(element, attribute, false);

		if (string == null || string === "") {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element.nodeName + "\" is not a string.");
			return null;
		}

		return string;
	}

	parseChar(element, attribute) {

		var char = this.reader.getString(element, attribute, false);

		if (char == null || (char != "x" && char != "y" && char != "z")) {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element.nodeName + "\" is not a character.");
			return null;
		}

		return char;
	}

	parseBool(element, attribute) {

		var bool = this.reader.getBoolean(element, attribute, false);

		if (bool == null || isNaN(bool)) {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element.nodeName + "\" is not a boolean.");
			return null;
		}

		return bool;
	}

	parseBlock(element, struct) {

		// Create new object
		var obj = {};

		// Check attribute order
		if(this.validateBlock(element, struct))
			return null;

		// Iterate through attributes
		for(var i = 0; i < struct.attributes.length; ++i) {

			var attributeName = struct.attributes[i][0];
			var attributeType = struct.attributes[i][1];

			var value = this.parseAttribute(element, attributeName, attributeType);

			if(value == null) return null;

			obj[attributeName] = value;
		}

		// Check "type" option
		if(struct.options.includes("type"))
			obj.type = element.nodeName;

		// Check "list" option
		if (struct.options.includes("list"))
			obj.list = [];

		// Iterate through children
		for(var i = 0; i < element.children.length; ++i) {

			var child = element.children[i];
			var childStructure = struct[child.nodeName];
			var childBlock = this.parseBlock(child, childStructure);

			if(childStructure == null || childBlock == null)
				return null;

			// Check "list" option
			if(struct.options.includes("list")) {
				obj.list.push(childBlock);
			}
			// Check "id" option
			else if(childStructure.options.includes("id")) {

				// Check for existing ID
				if (obj[childBlock.id]) {
					this.onXMLError("Element with ID " + childBlock.id + " already exists.");
					return null;
				}
				else
					obj[childBlock.id] = childBlock;
			}
			else
				obj[child.nodeName] = childBlock;
		}

		// Check "log" option
		if(struct.options.includes("log"))
			this.log("Parsed element <" +  element.nodeName + "> with success.");

		return obj;
	}

	validateBlock(element, struct) {

		// Check "id" option
		if(struct.options.includes("id") && !element.hasAttribute("id")) {
			this.onXMLError("Element " + element.nodeName + " has no ID to be used.");
			return 1;
		}

		// Check "order" option
		if(struct.options.includes("order") && struct.children.length == 0) {
			this.onXMLError("Element " + element.nodeName + " needs to define order of children.")
			return 1;
		}

		// Check attribute order
		if(element.attributes.length != struct.attributes.length) {
			this.onXMLError("Element " +  element.nodeName + " has wrong number of attributes.")
			return 1;
		}

		for(var i = 0; i < element.attributes.length; ++i) {

			var attributeName = element.attributes[i].name;

			if(attributeName != struct.attributes[i][0]) {

				if(!struct.attributes.includes(attributeName)) {
					this.onXMLError("Attribute " +  attributeName + " is not expected.");
					return 1;
				}
				else if(!element.hasAttribute(struct.attributes[i])) {
					this.onXMLError("Attribute " +  struct.attributes[i] + " is missing.");
					return 1;
				}
				else
					this.onXMLMinorError("Attribute " + attributeName + " is out of order.");
			}
		}

		// Check children order
		if(struct.options.includes("order")) {

			if(element.children.length != struct.children.length) {
				this.onXMLError("Element " + element.nodeName + " has wrong number of children.");
				return 1;
			}

			for(var i = 0; i < element.children.length; ++i) {

				var childName = element.children[i].nodeName;

				if(childName != struct.children[i]) {

					if(!struct.children.includes(childName)) {
						this.onXMLError("Tag <" +  childName + "> is not expected.");
						return 1;
					}
					else if(!element.hasOwnProperty(struct.children[i])) {
						this.onXMLError("Tag <" + struct.children[i] + "> is missing.");
						return 1;
					}
					else
						this.onXMLMinorError("Tag <" + childName + "> is out of order.");
				}
			}
		}

		return 0;
	}

	checkConstraints() {

		//<views>

		// Check minimum number of views
		if(Object.keys(this.parsedXML.views).length < 2) {
			this.onXMLError("Need at least one view.");
			return 1;
		}

		// Check reference to default view
		if(!this.parsedXML.views[this.parsedXML.views.default]) {
			this.onXMLError("Default view does not exist.");
			return 1;
		}

		//<lights>

		// Check minimum number of lights
		if(Object.keys(this.parsedXML.lights).length < 1) {
			this.onXMLError("Need at least one light.");
			return 1;
		}

		//<textures>

		// Check minimum number of textures
		if(Object.keys(this.parsedXML.textures).length < 1) {
			this.onXMLError("Need at least one texture.");
			return 1;
		}

		//<materials>

		// Check minimum number of materials
		if(Object.keys(this.parsedXML.materials).length < 1) {
			this.onXMLError("Need at least one material.");
			return 1;
		}

		//<transformations>

		// Check minimum number of complex transformations
		if(Object.keys(this.parsedXML.transformations).length < 1) {
			this.onXMLError("Need at least one complex transformation.");
			return 1;
		}

		// Check minimum number of simple transformations
		for (var key in this.parsedXML.transformations) {
			if (this.parsedXML.transformations[key].list.length < 1) {
				this.onXMLError("Need at least one simple transformation.");
				return 1;
			}
		}

		//<primitives>

		// Check minimum number of primitives
		if(Object.keys(this.parsedXML.primitives).length < 1) {
			this.onXMLError("Need at least one primitive.");
			return 1;
		}

		// Check unique primitive type		
		for (var key in this.parsedXML.primitives) {
			if (this.parsedXML.primitives[key].list.length != 1) {
				this.onXMLError("Can only have one primitive type.");
				return 1;
			}
		}
		
		//<components>

		// Check minimum number of components
		if(Object.keys(this.parsedXML.components).length < 1) {
			this.onXMLError("Need at least one component.");
			return 1;
		}

		// Check properties of components
		for(var componentKey in this.parsedXML.components) {

			var component = this.parsedXML.components[componentKey];

			var transfList = component.transformation.list;

			// Check component's transformation
			if(transfList.includes("transformationref")) {

				// Check if component has both reference and explicit transformations
				if(transfList.includes("translate") || transfList.includes("rotate") || transfList.includes("scale")) {
					this.onXMLError("Component cannot have both references and explicit transformations.");
					return 1;
				}

				var transf = transfList[0].id;

				// Check reference to transformation
				if(!this.parsedXML.transformations[transf]) {
					this.onXMLError("Transformation " + transf + " does not exist.");
					return 1;					
				}
			}

			// Check minimum number of materials
			if(component.materials.list.length < 1) {
				this.onXMLError("Need at least one material per component.");
				return 1;
			}

			// Check references to materials
			for(var materialKey in component.materials.list) {

				var material = component.materials.list[materialKey].id;

				if(material != "inherit" && !this.parsedXML.materials[material]) {
					this.onXMLError("Material " + material + " does not exist.");
					return 1;
				}
			}

			// Check reference to texture
			var texture = component.texture.id;

			if(texture != "none" && texture != "inherit" && !this.parsedXML.textures[texture]) {
				this.onXMLError("Texture " + texture + " does not exist.");
				return 1;
			}

			// Check minimum amount of children
			if(Object.keys(component.children).length < 1) {
				this.onXMLError("Need at least one child per component");
				return 1;
			}

			// Check references to children
			for(var childKey in component.children) {

				var child = component.children[childKey];
				
				switch(child.type) {
					case "componentref":
						if(!this.parsedXML.components[child.id]) {
							this.onXMLError("Component " + child.id + " does not exist.");
							return 1;
						}
						break;
					case "primitiveref":
						if(!this.parsedXML.primitives[child.id]) {
							this.onXMLError("Primitive " + child.id + " does not exist.");
							return 1;
						}
						break;
				}
			}			
		}

		var root = this.parsedXML.scene.root;

		// Check reference to root
		if(!this.parsedXML.components[root]) {
			this.onXMLError("Component root does not exist.");
			return 1;
		}

		// Check if root inherits materials
		for(var key in this.parsedXML.components[root].materials.list) {

			if(this.parsedXML.components[root].materials.list[key].id == "inherit") {
				this.onXMLError("Component root cannot inherit a material.");
				return 1;
			}
		}

		// Check if root inherits texture
		if(this.parsedXML.components[root].texture.id == "inherit") {
			this.onXMLError("Component root cannot inherit a texture.");
			return 1;
		}

		return 0;
	}

	/*
	 * Callback to be executed on any read error, showing an error on the console.
	 * @param {string} message
	 */
	onXMLError(message) {
		console.error("XML Error: " + message);
		this.loadedOk = false;
	}

	/**
	 * Callback to be executed on any minor error, showing a warning on the console.
	 * @param {string} message
	 */
	onXMLMinorError(message) {
		console.warn("Warning: " + message);
	}

	/**
	 * Callback to be executed on any message.
	 * @param {string} message
	 */
	log(message) {
		console.log("	" + message);
	}
}