var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX             = 0;
var VIEWS_INDEX             = 1;
var AMBIENT_INDEX           = 2;
var LIGHTS_INDEX            = 3;
var TEXTURES_INDEX          = 4;
var MATERIALS_INDEX         = 5;
var TRANSFORMATIONS_INDEX   = 6;
var PRIMITIVES_INDEX        = 7;
var COMPONENTS_INDEX        = 8;

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

		this.nodes = [];

		this.idRoot = null;                    // The id of the root element.

		this.axisCoords = [];
		this.axisCoords['x'] = [1, 0, 0];
		this.axisCoords['y'] = [0, 1, 0];
		this.axisCoords['z'] = [0, 0, 1];

		// File reading 
		this.reader = new CGFXMLreader();

		/*
		 * Read the contents of the xml file, and refer to this class for loading and error handlers.
		 * After the file is read, the reader calls onXMLReady on this object.
		 * If any error occurs, the reader calls onXMLError on this object, with an error message
		 */

		this.reader.open('scenes/' + filename, this);
		
		/* Data from XML */

		//<scene>
		this.scene_root 		= null;
		this.axis_length 		= null;

		//<views>
		this.default_view		= null;
		this.views				= new Map();

		//<ambient>
		this.ambient			= null;
		this.background			= null;

		//<lights>
		this.lights				= new Map();

		//<textures>
		this.textures			= new Map();

		//<materials>
		this.materials 			= new Map();

		//<transformations>
		this.transformations 	= new Map();

		//<primitives>
		this.primitives			= new Map();

		//<components>
		this.treeGraph			= new MyTreeGraph();

		//TODO check defaults and limits
		//TODO remove .js class files and use { example: ....}
		//TODO check -1 in indexes
	}

	/*
	 * Callback to be executed after successful reading
	 */
	onXMLReady() {

		this.log("XML Loading finished.");

		var rootElement = this.reader.xmlDoc.documentElement;

		// Here should go the calls for different functions to parse the various blocks
		var error = this.parseXMLFile(rootElement);

		if (error != null) {
			this.onXMLError(error);
			return;
		}

		this.loadedOk = true;

		// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
		this.scene.onGraphLoaded();
	}

	/**
	 * Parses the XML file, processing each block.
	 * @param {XML root element} rootElement
	 */
	parseXMLFile(rootElement) {

		//TODO simplify later!

		if (rootElement.nodeName != "yas")
			return "root tag <yas> missing";

		var nodes = rootElement.children;

		// Reads the names of the nodes to an auxiliary buffer.
		var nodeNames = [];

		for (var i = 0; i < nodes.length; i++) {
			nodeNames.push(nodes[i].nodeName);
		}

		var error;

		// Processes each node, verifying errors.
		var index;

		// <scene>
		if ((index = nodeNames.indexOf("scene")) == -1)
			return "tag <scene> missing";
		else {
			if (index != SCENE_INDEX)
				this.onXMLMinorError("tag <scene> out of order");

			//Parse views block
			if ((error = this.parseScene(nodes[index])) != null)
				return error;
		}   
		
		// <views>
		if ((index = nodeNames.indexOf("views")) == -1)
			return "tag <views> missing";
		else {
			if (index != VIEWS_INDEX)
				this.onXMLMinorError("tag <views> out of order");

			//Parse views block
			if ((error = this.parseViews(nodes[index])) != null)
				return error;
		}

		// <ambient>
		if ((index = nodeNames.indexOf("ambient")) == -1)
			return "tag <ambient> missing";
		else {
			if (index != AMBIENT_INDEX)
				this.onXMLMinorError("tag <ambient> out of order");

			//Parse ambient block
			if ((error = this.parseAmbient(nodes[index])) != null)
				return error;
		}

		// <lights>
		if ((index = nodeNames.indexOf("lights")) == -1)
			return "tag <lights> missing";
		else {
			if (index != LIGHTS_INDEX)
				this.onXMLMinorError("tag <lights> out of order");

			//Parse LIGHTS block
			if ((error = this.parseLights(nodes[index])) != null)
				return error;
		}

		// <textures>
		if ((index = nodeNames.indexOf("textures")) == -1)
			return "tag <textures> missing";
		else {
			if (index != TEXTURES_INDEX)
				this.onXMLMinorError("tag <textures> out of order");

			//Parse textures block
			if ((error = this.parseTextures(nodes[index])) != null)
				return error;
		}

		// <materials>
		if ((index = nodeNames.indexOf("materials")) == -1)
			return "tag <materials> missing";
		else {
			if (index != MATERIALS_INDEX)
				this.onXMLMinorError("tag <materials> out of order");

			//Parse materials block
			if ((error = this.parseMaterials(nodes[index])) != null)
				return error;
		}

		// <transformations>
		if ((index = nodeNames.indexOf("transformations")) == -1)
			return "tag <transformations> missing";
		else {
			if (index != TRANSFORMATIONS_INDEX)
				this.onXMLMinorError("tag <transformations> out of order");

			//Parse transformations block
			if ((error = this.parseTransformations(nodes[index])) != null)
				return error;
		}

		// <primitives>
		if ((index = nodeNames.indexOf("primitives")) == -1)
			return "tag <primitives> missing";
		else {
			if (index != PRIMITIVES_INDEX)
				this.onXMLMinorError("tag <primitives> out of order");
	
			//Parse primitives block
			if ((error = this.parsePrimitives(nodes[index])) != null)
				return error;
		}

		// <components>
		if ((index = nodeNames.indexOf("components")) == -1)
			return "tag <components> missing";
		else {
			if (index != COMPONENTS_INDEX)
				this.onXMLMinorError("tag <components> out of order");

			//Parse components block
			if ((error = this.parseComponents(nodes[index])) != null)
				return error;
		}
	}

	/**
	 * Parses the <scene> element.
	 * @param {XML scene element} sceneNode 
	 */
	parseScene(sceneNode) {

		// Scene root
		this.scene_root = this.getString(sceneNode, "root");

		// Axis length
		this.axis_length = this.getFloat(sceneNode, "axis_length");

		this.log("Parsed <scene> element.");
	}

	/**
	 * Parses the <views> element.
	 * @param {XML views element} viewsNode 
	 */
	parseViews(viewsNode) {
	
		// Default view
		this.default_view = this.getString(viewsNode, "default");

		for(var i = 0; i < viewsNode.children.length; ++i) {

			var viewChild = viewsNode.children[i];

			// New view
			var view = {
				id: this.getString(viewChild, "id"),
				near: this.getFloat(viewChild, "near"),
				far: this.getFloat(viewChild, "far")
			}

			if(viewChild.nodeName == "perspective") {

				view.type = "perspective";

				var viewIndexes = [];
				for(var j = 0; j < viewChild.children.length; ++j)
					viewIndexes.push(viewChild.children[j].nodeName);

				// Indexes
				var from_index = viewIndexes.indexOf("from");
				var to_index = viewIndexes.indexOf("to");

				view.angle = this.getFloat(viewChild, "angle");

				var from = {
					x: this.getFloat(viewChild.children[from_index], "x"),
					y: this.getFloat(viewChild.children[from_index], "y"),
					z: this.getFloat(viewChild.children[from_index], "z")
				}

				var to = {
					x: this.getFloat(viewChild.children[to_index], "x"),
					y: this.getFloat(viewChild.children[to_index], "y"),
					z: this.getFloat(viewChild.children[to_index], "z")
				}

				view.from = from;
				view.to = to;
			}
			else if(viewChild.nodeName == "ortho") {

				view.type = "ortho";

				view.left = this.getString(viewChild, "left");
				view.right = this.getString(viewChild, "right");
				view.top = this.getString(viewChild, "top");
				view.bottom = this.getString(viewChild, "bottom");
			}

			// Check ID
			if(!this.views.has(view.id))
				this.views.set(view.id, view);
			else
				this.onXMLMinorError("ID already exists.");
		}

		if(this.views.length < 1)
			this.onXMLMinorError("Need at least one view!");
		else if(!this.views.has(this.default_view))
			this.onXMLMinorError("Default view doesn't exist.");

		this.log("Parsed <views> element.");
	}
 
	/**
	 * Parses the <ambient> element.
	 * @param {XML ambient element} ambientNode
	 */
	parseAmbient(ambientNode) {

		var ambientIndexes = [];
		for(var i = 0; i < ambientNode.children.length; ++i)
			ambientIndexes.push(ambientNode.children[i].nodeName);

		// Indexes
		var ambient_index = ambientIndexes.indexOf("ambient");
		var background_index = ambientIndexes.indexOf("background");

		// Properties
		this.ambient = {
			r: this.getFloat(ambientNode.children[ambient_index], "r"),
			g: this.getFloat(ambientNode.children[ambient_index], "g"), 
			b: this.getFloat(ambientNode.children[ambient_index], "b"),
			a: this.getFloat(ambientNode.children[ambient_index], "a")
		}

		this.background = {
			r: this.getFloat(ambientNode.children[background_index], "r"),
			g: this.getFloat(ambientNode.children[background_index], "g"), 
			b: this.getFloat(ambientNode.children[background_index], "b"),
			a: this.getFloat(ambientNode.children[background_index], "a")
		}

		this.log("Parsed <ambient> element.");
	}

	/**
	 * Parses the <lights> element.
	 * @param {XML lights element} lightsNode
	 */
	parseLights(lightsNode) {

		for(var i = 0; i < lightsNode.children.length; ++i) {

			var lightChild = lightsNode.children[i];

			var lightIndexes = [];
			for(var j = 0; j < lightChild.children.length; ++j)
				lightIndexes.push(lightChild.children[j].nodeName);

			// Indexes
			var location_index = lightIndexes.indexOf("location");
			var ambient_index = lightIndexes.indexOf("ambient");
			var diffuse_index = lightIndexes.indexOf("diffuse");
			var specular_index = lightIndexes.indexOf("specular");

			// New light
			var light = {
				id: this.getString(lightChild, "id"),
				enabled: this.getBoolean(lightChild, "enabled")
			}

			light.location = {
				x: this.getFloat(lightChild.children[location_index], "x"),
				y: this.getFloat(lightChild.children[location_index], "y"),
				z: this.getFloat(lightChild.children[location_index], "z"),
				w: this.getFloat(lightChild.children[location_index], "w")
			}

			light.ambient = {
				r: this.getFloat(lightChild.children[ambient_index], "r"),
				g: this.getFloat(lightChild.children[ambient_index], "g"),
				b: this.getFloat(lightChild.children[ambient_index], "b"),
				a: this.getFloat(lightChild.children[ambient_index], "a")
			}

			light.diffuse = {
				r: this.getFloat(lightChild.children[diffuse_index], "r"),
				g: this.getFloat(lightChild.children[diffuse_index], "g"),
				b: this.getFloat(lightChild.children[diffuse_index], "b"),
				a: this.getFloat(lightChild.children[diffuse_index], "a")
			}

			light.specular = {
				r: this.getFloat(lightChild.children[specular_index], "r"),
				g: this.getFloat(lightChild.children[specular_index], "g"),
				b: this.getFloat(lightChild.children[specular_index], "b"),
				a: this.getFloat(lightChild.children[specular_index], "a")

			}
			
			if(lightChild.nodeName == "omni") {
				light.type = "omni";
			}
			else if(lightChild.nodeName == "spot") {

				light.type = "spot";

				// Index
				var target_index = lightProperties.indexOf("target");

				light.angle = this.getFloat(llightChildght, "angle");
				light.exponent = this.getFloat(lightChild, "exponent");

				var target = {
					x: this.getFloat(lightChild.children[target_index], "x"),
					y: this.getFloat(lightChild.children[target_index], "y"),
					z: this.getFloat(liglightChildht.children[target_index], "z")
				}

				light.target = target;
			}

			// Check ID
			if(!this.lights.has(light.id))				
				this.lights.set(light.id, light);
			else
				this.onXMLMinorError("ID already exists.");
		}

		if(this.lights.length < 1)
			this.onXMLMinorError("Need at least one light!");

		this.log("Parsed <lights> element.");
	}

	/**
	 * Parses the <textures> element.
	 * @param {XML textures element} texturesNode
	 */
	parseTextures(texturesNode) {

		for(var i = 0; i < texturesNode.children.length; ++i) {

			var textureChild = texturesNode.children[i];

			// New texture
			var texture = {
				id: this.getString(textureChild, "id"),
				file: this.getString(textureChild, "file")
			}

			this.log(texture.id);

			if(!this.textures.has(texture.id))
				this.textures.set(texture.id, texture);
			else
				this.onXMLMinorError("ID already exists.");
		}

		if(this.textures.length < 1)
			this.onXMLMinorError("Need at least one texture!");
		
		this.log("Parsed <textures> element.");
	}

	/**
	 * Parses the <materials> element.
	 * @param {XML materials element} materialsNode
	 */
	parseMaterials(materialsNode) {

		for(var i = 0; i < materialsNode.children.length; ++i) {
		
			var materialChild = materialsNode.children[i];

			var materialIndexes = [];
			for(var j = 0; j < materialChild.children.length; ++j)
				materialIndexes.push(materialChild.children[j].nodeName);
			
			// Indexes
			var emission_index = materialIndexes.indexOf("emission");
			var ambient_index = materialIndexes.indexOf("ambient");
			var diffuse_index = materialIndexes.indexOf("diffuse");
			var specular_index = materialIndexes.indexOf("specular");

			// New material
			var material  = {
				id: this.getString(materialChild, "id"),
				shininess: this.getFloat(materialChild, "shininess"),
			}
			
			material.emission = {
				r: this.getFloat(materialChild.children[emission_index], "r"),
				g: this.getFloat(materialChild.children[emission_index], "g"),
				b: this.getFloat(materialChild.children[emission_index], "b"),
				a: this.getFloat(materialChild.children[emission_index], "a")
			}
			material.ambient = {
				r: this.getFloat(materialChild.children[ambient_index], "r"),
				g: this.getFloat(materialChild.children[ambient_index], "g"),
				b: this.getFloat(materialChild.children[ambient_index], "b"),
				a: this.getFloat(materialChild.children[ambient_index], "a")
			}
			material.diffuse = {
				r: this.getFloat(materialChild.children[diffuse_index], "r"),
				b: this.getFloat(materialChild.children[diffuse_index], "g"),
				g: this.getFloat(materialChild.children[diffuse_index], "b"),
				a: this.getFloat(materialChild.children[diffuse_index], "a")
			}
			material.specular = {
				r: this.getFloat(materialChild.children[specular_index], "r"),
				g: this.getFloat(materialChild.children[specular_index], "g"),
				b: this.getFloat(materialChild.children[specular_index], "b"),
				a: this.getFloat(materialChild.children[specular_index], "a")
			}

			// Check ID
			if(!this.materials.has(material.id))
				this.materials.set(material.id, material);
			else
				this.onXMLMinorError("ID already exists.");
		}

		if(this.materials.length < 1)
			this.onXMLMinorError("Need at least one material!");

		this.log("Parse <materials> element.")
	}

	/**
	 * Parse the <transformations> element.
	 * @param {XML transformations element} transformationsNode
	 */
	parseTransformations(transformationsNode) {

		for(var i = 0; i < transformationsNode.children.length; ++i) {

			var transformationChild = transformationsNode.children[i];

			// New transformation
			var transformation = {
				id: this.getString(transformationChild, "id")
			}
			
			for(var j = 0; j < transformationChild.children.length; ++j) {

				var subTransformationChild = transformationChild.children[j];

				transformation.matrix = [];

				switch(subTransformationChild.nodeName) {
					case "translate":
					transformation.matrix.push({
						type: "translate",
						x: this.getFloat(subTransformationChild, "x"),
						y: this.getFloat(subTransformationChild, "y"),
						z: this.getFloat(subTransformationChild, "z")
					})
					break;
					
					case "rotate":
					transformation.matrix.push({
						type: "rotate",
						axis: this.getChar(subTransformationChild, "axis"),
						angle: this.getFloat(subTransformationChild, "angle")
					})
					break;

					case "scale":
					transformation.matrix.push({
						type: "scale",
						x: this.getFloat(subTransformationChild, "x"),
						y: this.getFloat(subTransformationChild, "y"),
						z: this.getFloat(subTransformationChild, "z")
					})
					break;
				}
			}

			// Check ID
			if(!this.transformations.has(transformation.id))
				this.transformations.set(transformation.id, transformation);
			else
				this.onXMLMinorError("ID already exists.");
		}

		if(this.transformations.length < 1)
			this.onXMLMinorError("Need at least one transformation!");

		this.log("Parsed <transformations> element.");
	}

	/**
	 * Parse the <primitives> element.
	 * @param {XML primitives element} primitivesNode
	 */
	parsePrimitives(primitivesNode) {

		for(var i = 0; i < primitivesNode.children.length; ++i) {

			var primitiveChild = primitivesNode.children[i];

			if(primitiveChild.children.length != 1)
				this.onXMLMinorError("Too many/less primitives.");

			var primitiveInfo = primitiveChild.children[0];

			// New primitive
			var primitive = {
				id: this.getString(primitiveChild, "id")
			}

			switch(primitiveInfo.nodeName) {
				case "rectangle":
				primitive.type = "rectangle";
				primitive.properties = {
					x1: this.getFloat(primitiveInfo, "x1"),
					y1: this.getFloat(primitiveInfo, "y1"),
					x2: this.getFloat(primitiveInfo, "x2"),
					y2: this.getFloat(primitiveInfo, "y2")
				}
				break;

				case "triangle":
				primitive.type = "triangle";
				primitive.properties = {
					x1: this.getFloat(primitiveInfo, "x1"),
					y1: this.getFloat(primitiveInfo, "y1"),
					z1: this.getFloat(primitiveInfo, "z1"),
					x2: this.getFloat(primitiveInfo, "x2"),
					y2: this.getFloat(primitiveInfo, "y2"),
					z2: this.getFloat(primitiveInfo, "z2"),
					x3: this.getFloat(primitiveInfo, "x3"),
					y3: this.getFloat(primitiveInfo, "y3"),
					z3: this.getFloat(primitiveInfo, "z3")
				}
				break;

				case "cylinder":
				primitive.type = "cylinder";
				primitive.properties = {
					base: this.getFloat(primitiveInfo, "base"),
					top: this.getFloat(primitiveInfo, "top"),
					height: this.getFloat(primitiveInfo, "height"),
					slices: this.getFloat(primitiveInfo, "slices"),
					stacks: this.getFloat(primitiveInfo, "stacks")
				}
				break;

				case "sphere":
				primitive.type = "sphere";
				primitive.properties = {
					radius: this.getFloat(primitiveInfo, "radius"),
					slices: this.getFloat(primitiveInfo, "slices"),
					stacks: this.getFloat(primitiveInfo, "stacks")
				}
				break;

				case "torus":
				primitive.type = "torus";
				primitive.properties = {
					inner: this.getFloat(primitiveInfo, "inner"),
					outer: this.getFloat(primitiveInfo, "outer"),
					slices: this.getFloat(primitiveInfo, "slices"),
					loops: this.getFloat(primitiveInfo, "loops")
				}
				break;

				default:
				this.onXMLMinorError("Primitive \"" + primitiveInfo.nodeName + "\" does not exist." );
				break;
			}

			// Check ID
			if(!this.primitives.has(primitive.id))
				this.primitives.set(primitive.id, primitive);
			else
				this.onXMLMinorError("ID already exists.");
		}

		if(this.primitives.length < 1)
			this.onXMLMinorError("Need at least one primitive!");

		this.log("Parsed <primitives> element.");
	}

	/**
	 * Parse <components> element.
	 * @param {XML components element} componentsNode
	 */
	parseComponents(componentsNode) {

		//this.treeGraph.setRoot(this.scene_root);

		for(var i = 0; i < componentsNode.children.length; ++i) {

			var componentChild = componentsNode.children[i];

			var componentIndexes = [];
			for(var j = 0; j < componentChild.children.length; ++j)
				componentIndexes.push(componentChild.children[j].nodeName);

			// Indexes
			var transformation_index = componentIndexes.indexOf("transformation");
			var materials_index = componentIndexes.indexOf("materials");
			var texture_index = componentIndexes.indexOf("texture");
			var children_index = componentIndexes.indexOf("children");

			// New component
			var component = {
				id: this.getString(componentChild, "id"),
				material: this.getString(componentChild.children[materials_index].children[0], "id"),
			}

			// Get transformation TODO
			//var transf_block = component_child.children[transformation_index];
			//var transformation = {};

			component.texture = {
				id: this.getString(componentChild.children[texture_index],"id"),
				length_s: this.getFloat(componentChild.children[texture_index], "length_s"),
				length_t: this.getFloat(componentChild.children[texture_index], "length_t")
			}

			component.children = [];

			for(var j = 0; j < componentChild.children[children_index].length; ++j) {

				var child =  componentChild.children[j];
				
				component.children.push({
					type: child.nodeName,
					id: this.getString(child, "id")
				});
			}

			//TODO Check if already exists

			// COMPLETE TREE STRUCTURE (CHANGE TO ONLY HAVE COMPONENTS, NO PRIMITIVES)
			//this.treeGraph.addNode(component);
		}

		this.log("Parsed <components> element. TODO tranformations")
	}

	/*
	 * Callback to be executed on any read error, showing an error on the console.
	 * @param {string} message
	 */
	onXMLError(message) {
		console.error("XML Loading Error: " + message);
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
		console.log("   " + message);
	}

	/**
	 * Displays the scene, processing each node, starting in the root node.
	 */
	displayScene() {
		// entry point for graph rendering
		//TODO: Render loop starting at root of graph
	}

	getAttribute(node, attribute) {

		if(!node.hasAttribute(attribute)) {
			this.onXMLError(" Attribute \"" + attribute + "\" not found in \"" + node.nodeName + "\".");
			return null;
		}

		return node.getAttribute(attribute);
	}

	getString(node, attribute) {
	
		/* Get string */
		var string =  this.getAttribute(node, attribute)

		if(string == null) return;

		//var str = this.reader.getString(node, attribute);

		/* Check for empty */
		if(string === "")
			this.onXMLError("Attribute \"" + attribute + "\" is empty.");

		return string;
	}

	getFloat(node, attribute) {

		/* Get float */
		var float = parseFloat(this.getAttribute(node, attribute));

		if(float == null) return;
		
		//var fl = this.reader.getFloat(node, attribute);

		/* Check for valid number */
		if(isNaN(float))
			this.onXMLError("Attribute is not a valid float number.");
		 
		return float;
	}

	getInteger(node, attribute) {

		/* Get int */
		var integer = parseFloat(this.getAttribute(node, attribute));

		if(integer == null) return;

		//var integer = this.reader.getFloat(node, attribute);

		/* Check if it's an integer */
		if(isNaN(integer) || !(integer % 1 === 0))
			this.onXMLError("Attribute is not a valid integer number.");

		return integer;
	}

	getChar(node, attribute) {

		/* Get char */
		var char = this.getAttribute(node, attribute);

		if(char == null) return;
		
		//var char = this.reader.getString(node, attribute);

		/* Validate char */
		if(char != "x" || char != "y" || char != "z")
			this.onXMLError("Attribute is not x, y or z");

		return char;
	}

	getBoolean(node, attribute) {

		/* Get bool */
		var boolean = this.getAttribute(node, attribute);

		if(boolean == null) return;
		
		//var bool = this.reader.getFloat(node, attribute);

		/* Validate bool */
		if(boolean != 0 && boolean != 1)
			this.onXMLError("Attribute is not a boolean value.");
		
		return !!boolean;
	}
}