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

		/* Data from XML */
		this.scenes = {};
		this.views = {};
		this.ambient = {};
		this.lights = {};
		this.textures = {};
		this.materials = {};
		this.transformations = {};
		this.primitives = {};
		this.components = {};
	}

	/*
	 * Callback to be executed after successful reading
	 */
	onXMLReady() {

		this.log("XML loading finished with success.");

		var rootElement = this.reader.xmlDoc.documentElement;

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

		// Order of the elements in the XML document.
		const SCENE_INDEX = 0;
		const VIEWS_INDEX = 1;
		const AMBIENT_INDEX = 2;
		const LIGHTS_INDEX = 3;
		const TEXTURES_INDEX = 4;
		const MATERIALS_INDEX = 5;
		const TRANSFORMATIONS_INDEX = 6;
		const PRIMITIVES_INDEX = 7;
		const COMPONENTS_INDEX = 8;

		if (rootElement.nodeName != "yas") {
			this.onXMLError("root tag <yas> is missing.");
			return;
		}

		var indexes = [];
		for (var i = 0; i < rootElement.children.length; ++i)
			indexes.push(rootElement.children[i].nodeName);

		var index;

		// <scene>
		if ((index = indexes.indexOf("scene")) == -1) {
			this.onXMLError("Tag <scene> is missing.");
			return null;
		}
		else {
			if (index != SCENE_INDEX)
				this.onXMLMinorError("Tag <scene> is out of order.");

			//Parse <scene> element
			if (this.parseScene(rootElement.children[index]) == null)
				return;
		}

		// <views>
		if ((index = indexes.indexOf("views")) == -1) {
			this.onXMLError("Tag <views> is missing.");
			return null;
		}
		else {
			if (index != VIEWS_INDEX)
				this.onXMLMinorError("Tag <views> is out of order.");

			//Parse <views> element
			if (this.parseViews(rootElement.children[index]) == null)
				return;
		}

		// <ambient>
		if ((index = indexes.indexOf("ambient")) == -1) {
			this.onXMLError("Tag <ambient> is missing.");
			return null;
		}
		else {
			if (index != AMBIENT_INDEX)
				this.onXMLMinorError("Tag <ambient> is out of order.");

			//Parse <ambient> element
			if (this.parseAmbient(rootElement.children[index]) == null)
				return;
		}

		// <lights>
		if ((index = indexes.indexOf("lights")) == -1) {
			this.onXMLError("Tag <lights> is missing.");
			return null;
		}
		else {
			if (index != LIGHTS_INDEX)
				this.onXMLMinorError("Tag <lights> is out of order.");

			//Parse <lights> element
			if (this.parseLights(rootElement.children[index]) == null)
				return;
		}

		// <textures>
		if ((index = indexes.indexOf("textures")) == -1) {
			this.onXMLError("Tag <textures> is missing.");
			return;
		}
		else {
			if (index != TEXTURES_INDEX)
				this.onXMLMinorError("tag <textures> is out of order.");

			//Parse <textures> element
			if (this.parseTextures(rootElement.children[index]) == null)
				return;
		}

		// <materials>
		if ((index = indexes.indexOf("materials")) == -1) {
			this.onXMLError("Tag <materials> is missing.");
			return;
		}
		else {
			if (index != MATERIALS_INDEX)
				this.onXMLMinorError("Tag <materials> is out of order.");

			//Parse <materials> elements
			if (this.parseMaterials(rootElement.children[index]) == null)
				return;
		}

		// <transformations>
		if ((index = indexes.indexOf("transformations")) == -1) {
			this.onXMLError("Tag <transformations> is missing.");
			return null;
		}
		else {
			if (index != TRANSFORMATIONS_INDEX)
				this.onXMLMinorError("Tag <transformations> is out of order.");

			//Parse <transformations> element
			if (this.parseTransformations(rootElement.children[index]) == null)
				return;
		}

		// <primitives>
		if ((index = indexes.indexOf("primitives")) == -1) {
			this.onXMLError("Tag <primitives> is missing.");
			return null;
		}
		else {
			if (index != PRIMITIVES_INDEX)
				this.onXMLMinorError("Tag <primitives> is out of order.");

			//Parse <primitives> element
			if (this.parsePrimitives(rootElement.children[index]) == null)
				return;
		}

		// <components>
		if ((index = indexes.indexOf("components")) == -1) {
			this.onXMLError("Tag <components> is missing.");
			return null;
		}
		else {
			if (index != COMPONENTS_INDEX)
				this.onXMLMinorError("Tag <components> is out of order.");

			//Parse components block
			if (this.parseComponents(rootElement.children[index]) == null)
				return;
		}

		this.loadedOk = true;
	}

	/**
	 * Parses the <scene> element.
	 * @param {XML scene element} sceneElement 
	 */
	parseScene(sceneElement) {

		// New scene
		if((this.scenes = sceneFactory(this, sceneElement)) == null)
			return null;

		this.log("Parsed <scene> element with success.");

		return 1;
	}

	/**
	 * Parses the <views> element.
	 * @param {XML views element} viewsElement
	 */
	parseViews(viewsElement) {

		// Default view
		if ((this.views.default = this.parseString(viewsElement, "default")) == null)
			return null;

		// Iterate through declared views
		for (var i = 0; i < viewsElement.children.length; ++i) {

			// Current view child
			var viewChild = viewsElement.children[i];

			// New view
			var new_view = viewFactory(this, viewChild);
			if(new_view == null)
				return null;

			// Check ID
			if (!this.views[new_view.id])
				this.views[new_view.id] = new_view;
			else
				this.onXMLError("View with ID \"" + new_view.id + "\" already exists.");
		}

		// Check minimum number of views
		if (this.views.length < 2) {
			this.onXMLError("Need at least one view.");
			return null;
		}

		// Check if default view exists
		if (!this.views[this.views.default]) {
			this.onXMLError("Default view doesn't exist.");
			return null;
		}

		this.log("Parsed <views> element with success.");

		return 1;
	}

	/**
	 * Parses the <ambient> element.
	 * @param {XML ambient element} ambientElement
	 */
	parseAmbient(ambientElement) {

		// New ambient
		if((this.ambient = ambientFactory(this, ambientElement)) == null)
			return null;

		this.log("Parsed <ambient> element with success.");

		return 1;
	}

	/**
	 * Parses the <lights> element.
	 * @param {XML lights element} lightsElement
	 */
	parseLights(lightsElement) {

		// Iterate through declared lights
		for (var i = 0; i < lightsElement.children.length; ++i) {

			var lightChild = lightsElement.children[i];

			// New light
			var new_light = lightFactory(this, lightChild);
			if(new_light == null)
				return null;

			// Check ID
			if (!this.lights[new_light.id])
				this.lights[new_light.id] = new_light;
			else
				this.onXMLError("Light with ID \"" + new_light.id + "\" already exists.");
		}

		// Check minimum number of lights
		if (this.lights.length < 1) {
			this.onXMLError("Need at least one light!");
			return null;
		}

		this.log("Parsed <lights> element with success.");

		return 1;
	}

	/**
	 * Parses the <textures> element.
	 * @param {XML textures element} texturesElement
	 */
	parseTextures(texturesElement) {

		for (var i = 0; i < texturesElement.children.length; ++i) {

			var textureChild = texturesElement.children[i];

			// New texture
			var new_texture = textureFactory(this, textureChild);
			if(new_texture == null)
				return null;

			if (!this.textures[new_texture.id])
				this.textures[new_texture.id] = new_texture;
			else
				this.onXMLError("Texture with ID \"" + new_texture.id + "\" already exists.");
		}

		// Check minimum number of textures
		if (this.textures.length < 1) {
			this.onXMLError("Need at least one texture!");
			return null;
		}

		this.log("Parsed <textures> element with success.");

		return 1;
	}

	/**
	 * Parses the <materials> element.
	 * @param {XML materials element} materialsElement
	 */
	parseMaterials(materialsElement) {

		for (var i = 0; i < materialsElement.children.length; ++i) {

			var materialChild = materialsElement.children[i];

			// New material
			var new_material = materialFactory(this, materialChild);
			if(new_material == null)
				return null;

			// Check ID
			if (!this.materials[new_material.id])
				this.materials[new_material.id] = new_material;
			else
				this.onXMLError("Material with ID \"" + new_material.id + "\" already exists.");
		}

		// Check minimum amount of materials
		if (this.materials.length < 1) {
			this.onXMLError("Need at least one material.");
			return null;
		}

		this.log("Parsed <materials> element with success.")

		return 1;
	}

	/**
	 * Parse the <transformations> element.
	 * @param {XML transformations element} transformationsElement
	 */
	parseTransformations(transformationsElement) {

		for (var i = 0; i < transformationsElement.children.length; ++i) {

			var transformationChild = transformationsElement.children[i];

			// New transformation
			var new_transformation = transformationFactory(this, transformationChild);
			if(new_transformation == null)
				return null;

			// Check ID
			if (!this.transformations[new_transformation.id])
				this.transformations[new_transformation.id] = new_transformation;
			else
				this.onXMLError("Transformation with ID \"" + new_transformation.id + "\" already exists.");
		}

		// Check minimum number of transformations
		if (this.transformations.length < 1) {
			this.onXMLError("Need at least one transformation.");
			return null;
		}

		this.log("Parsed <transformations> element with success.");

		return 1;
	}

	/**
	 * Parse the <primitives> element.
	 * @param {XML primitives element} primitivesElement
	 */
	parsePrimitives(primitivesElement) {

		for (var i = 0; i < primitivesElement.children.length; ++i) {

			var primitiveChild = primitivesElement.children[i];

			// New primitive
			var new_primitive = primitiveFactory(this, primitiveChild);
			if(new_primitive == null)
				return null;

			// Check ID
			if (!this.primitives[new_primitive.id])
				this.primitives[new_primitive.id] = new_primitive;
			else
				this.onXMLError("Primitive with ID \"" + new_primitive.id + "\" already exists.");
		}

		// Check minimum number of primitives
		if (this.primitives.length < 1) {
			this.onXMLError("Need at least one primitive.");
			return null;
		}

		this.log("Parsed <primitives> element with success");

		return 1;
	}

	/**
	 * Parse <components> element.
	 * @param {XML components element} componentsElement
	 */
	parseComponents(componentsElement) {

		// Iterate through declared components
		for (var i = 0; i < componentsElement.children.length; ++i) {

			var componentChild = componentsElement.children[i];

			// Check order of components
			var order = ["transformation", "materials", "texture", "children"];
			if (this.checkOrder(componentChild, order) == null)
				return null;

			// New component
			var new_component = componentFactory(this, componentChild);
			if(new_component == null)
				return null

			// Check ID
			if (!this.components[new_component.id])
				this.components[new_component.id] = new_component;
			else
				this.onXMLError("Component with ID \"" + new_component.id + "\" already exists.");
		}

		// Check root
		if (!this.components[this.scenes.root]) {
			this.onXMLError("Scene root doesn't exist.");
			return null;
		}
		else {

			// Check materials for "inherit"
			for(var i = 0; i < this.components[this.scenes.root].materials.length; ++i) {

				if(this.components[this.scenes.root].materials[i].id == "inherit") {
					this.onXMLError("Scene root can't inherit materials.");
					return null;
				}
			}
		}

		// Check children
		for(var key in this.components) {

			for(var i = 0; i < this.components[key].children.length; ++i) {

				var child = this.components[key].children[i];

				if(child.type == "primitive" && !this.primitives[child.id]) {
					this.onXMLError("Primitive \"" + child.id + "\" does not exist.")
					return null;
				}
				else if(child.type == "component" && !this.components[child.id]) {
					this.onXMLError("Component \"" + child.id + "\" does not exist.")
					return null;
				}
			}
		}

		this.log("Parsed <components> element with success.")

		return 1;
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

	createPrims() {

		this.displayPrimitives = new Map();

		//Cycles through all parsed primitives
		for(var primID in this.primitives) {
			var currPrim = this.primitives[primID];

			switch(currPrim.type) {
				case 'rectangle' :
					this.displayPrimitives.set(currPrim.id, new MyRectangle(this.scene, currPrim.args.x1, currPrim.args.y1, currPrim.args.x2, currPrim.args.y2));
				break;

				case 'triangle' :
					this.displayPrimitives.set(currPrim.id, new MyTriangle(this.scene, currPrim.args.x1, currPrim.args.y1, currPrim.args.z1, currPrim.args.x2, currPrim.args.y2, currPrim.args.z2, currPrim.args.x3, currPrim.args.y3, currPrim.args.z3));
				break;

				case 'cylinder' :
					this.displayPrimitives.set(currPrim.id, new MyCylinder(this.scene, currPrim.args.base, currPrim.args.top, currPrim.args.height, currPrim.args.slices, currPrim.args.stacks));
				break;

				case 'sphere' :
					this.displayPrimitives.set(currPrim.id, new MySphere(this.scene, currPrim.args.radius, currPrim.args.slices, currPrim.args.stacks));
				break;

				case 'torus' :
					this.displayPrimitives.set(currPrim.id, new MyTorus(this.scene, currPrim.args.inner, currPrim.args.outer, currPrim.args.slices, currPrim.args.loops));
				break;
			}

			//console.log("Primitive: " + currPrim.id);
		}
	}

	/**
	 * Displays the scene, processing each node, starting in the root node.
	 */
	displayScene() {

		// entry point for graph rendering
		//TODO: Render loop starting at root of graph
		this.scene.pushMatrix();

			//this.scene.loadIdentity();
			this.processNode(false, this.scenes.root, this.scene.getMatrix());

		this.scene.popMatrix();

	}

	processNode(prim, id, mat, text, ls, lt) {

		//console.log(id);
		
		if(prim) {
			//Draw element
			//console.log("Displaying: " + id);
			this.displayPrimitives.get(id).display();
			//this.scene.test.display();
		}
		else {
			var currentComp = this.components[id];

			//TODO alter later to multiple materials
			//Adjust material
			var newMat = currentComp.materials[0].id != "inherit" ? currentComp.materials[0].id : mat;
			
			//Adjust Texture
			var newText = null;
			var newLs = null;
			var newLt = null;
			switch(currentComp.texture.id) {
				case "none":
					newText = null;
				break;

				case "inherit":
					//Nothing happens
				break;

				default:
					newText = currentComp.texture.id;
					newLs = currentComp.texture.lenght_s;
					newLt = currentComp.texture.length_t;
				break;
			}

			this.scene.pushMatrix();
			
				//Adjust Transformation Matrix
				this.adjustMatrix(currentComp);
	
				for (var childID in currentComp.children) {

					var child = currentComp.children[childID];

					this.processNode(child.type == "primitive" ? true : false, child.id, newMat, newText, newLs, newLt);
				}

			this.scene.popMatrix();
		}	
	}

	adjustMatrix(component) {

		//Checks if it has any transformations
		if(!component.transformations[0]) {
			//console.log("no trans found");
			return;
		}
			
		//Checks if it is a transformation reference of a new transformation
		if(component.transformations[0].args.hasOwnProperty("id")) {
		
			//console.log("its a reference trans");

			//Transformation reference
			var tf = this.transformations[component.transformations[0].args.id];

			//TODO alter to "properties" later
			for(let i = 0; i < tf.properties.length; i++) {
				this.readTransformations(tf.properties[i]);
			}
		}
		else {
			//New transformation
			for(let i = 0; i < component.transformations.length; i++) {
				this.readTransformations(component.transformations[i]);
			}
		}

	}

	readTransformations(ptrans) {

		switch (ptrans.type) {
			case "translate" :
			//	console.log("translate: " + ptrans.args.x + " - " + ptrans.args.y + " - " + ptrans.args.z);
				this.scene.translate(ptrans.args.x, ptrans.args.y, ptrans.args.z);
			break;

			case "scale" :
				//console.log("scale");
				this.scene.scale(ptrans.args.x, ptrans.args.y, ptrans.args.z);

			break;

			case "rotate" :
				//console.log("rotate: " + ptrans.axis + " - " + ptrans.angle);
				
				switch(ptrans.args.axis) {
					case 'x':
						this.scene.rotate(ptrans.args.angle * DEGREE_TO_RAD, 1, 0, 0);
					break;
					case 'y':
						this.scene.rotate(ptrans.args.angle * DEGREE_TO_RAD, 0, 1, 0);
					break;
					case 'z':
						this.scene.rotate(ptrans.args.angle * DEGREE_TO_RAD, 0, 0, 1);
					break;
				}
			break;
		}

	}

	// Helper functions

	parseInt(element, attribute) {

		var integer = this.reader.getInteger(element, attribute, false);

		if (integer = null || isNaN(integer)) {
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

	parseRGBA(element) {

		var args = ["r", "g", "b", "a"];

		var rgba = {};

		for (var i = 0; i < args.length; ++i) {

			var tmp = this.reader.getFloat(element, args[i], false);

			if (tmp == null || isNaN(tmp)) {
				this.onXMLError("Attribute \"" + args[i] + "\" in \"" + element.nodeName + "\" is not a float.");
				return null;
			}
			else if (tmp < 0.0 || tmp > 1.0) {
				this.onXMLError("Attribute \"" + args[i] + "\" in \"" + element.nodeName + "\" is out of bounds.");
				return null;
			}
			else
				rgba[args[i]] = tmp;
		}

		return rgba;
	}

	parseXYZ(element) {

		var args;
		if (this.reader.hasAttribute(element, "w"))
			args = ["x", "y", "z", "w"];
		else
			args = ["x", "y", "z"];

		var xyz = {};

		for (var i = 0; i < args.length; ++i) {

			var tmp = this.reader.getFloat(element, args[i], false);

			if (tmp == null || isNaN(tmp)) {
				this.onXMLError("Attribute \"" + args[i] + "\" in \"" + element.nodeName + "\" is not a float.");
				return null;
			}
			else
				xyz[args[i]] = tmp;
		}

		return xyz;
	}

	parseTransform(element) {

		var transformation = {
			type: element.nodeName
		};

		switch(element.nodeName) {
			case "transformationref":
				transformation.args = {};
			   if((transformation.args.id = this.parseString(element, "id")) == null)
					return null;
				break;
	
			case "translate":
				if((transformation.args = this.parseXYZ(element)) == null)
					return null;
				break;
	
			case "rotate":
				transformation.args = {
					axis: this.parseChar(element, "axis"),
					angle: this.parseFloat(element, "angle")
				}
	
				if (transformation.args.axis == null || transformation.args.angle == null)
					return null;
				break;

			case "scale":
				if((transformation.args = this.parseXYZ(element)) == null)
					return null;
				break;
			
			default:
				this.onXMLError("Unknown transformation.");
				return null;
		}
	
		return transformation;
	}

	parseData(element, properties, obj) {

		for (var i = 0; i < element.children.length; ++i) {

			var tag = element.children[i];

			switch (properties[tag.nodeName]) {
				case "rgba":
					if ((obj[tag.nodeName] = this.parseRGBA(tag)) == null)
						return null;
					break;
				case "xyz":
					if ((obj[tag.nodeName] = this.parseXYZ(tag)) == null)
						return null;
					break;
				default:
					this.onXMLError("Data/type not defined.");
					return null;
			}
		}

		return 1;
	}

	checkOrder(element, order) {

		for(var i = 0; i < element.children.length; ++i) {
	
			var tag = element.children[i];
			var count = element.getElementsByTagName(order[i]);

			// Check property count
			if (count == 0) {
				this.onXMLError("Tag <" + order[i] + "> is missing.");
				return null;
			}
			else if (count > 1) {
				this.onXMLError("Tag <" + order[i] + "> appears multiple times.");
				return null;
			}
	
			// Check property index
			if(tag.nodeName != order[i])
				this.onXMLMinorError("Tag <" + order[i] + "> is out of order.");
		}
		
		return 1;
	}
}