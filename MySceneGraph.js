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
		this.views_default		= null;
		this.views				= new Map();

		//<ambient>
		this.ambient_ambient	= null;
		this.ambient_background	= null;

		//<lights>
		this.lights				= new Map();

		//<textures>
		this.textures			= new Map();

		//<materials>
		this.materials 			= new Map();

		//<transformations>
		this.transformations 	= new Map();

		//<primitives>
		//this.primitives			= new Map();

		//<components>
		this.treeGraph			= new MyTreeGraph();

		//TODO check defaults and limits
		//TODO remove .js class files and use { example: ....}
		//TODO check -1 in indexes
		//TODO primitives and components can't share unique ID!!!
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
		this.views_default = this.getString(viewsNode, "default");

		for(var i = 0; i < viewsNode.children.length; ++i) {

			// New view
			var view = viewsNode.children[i];

			// General properties
			var id = this.getString(view, "id");
			var near = this.getFloat(view, "near");
			var far = this.getFloat(view, "far");

			// Specific properties' names
			var viewProperties = [];
			for(var j = 0; j < view.children.length; ++j)
				viewProperties.push(view.children[j].nodeName);

			if(view.nodeName == "perspective") {

				// Properties' indexes
				var from_index = viewProperties.indexOf("from");
				var to_index = viewProperties.indexOf("to");

				// Specific Properties
				var angle = this.getFloat(view, "angle");
				var from = {
					x: this.getFloat(view.children[from_index], "x"),
					y: this.getFloat(view.children[from_index], "y"),
					z: this.getFloat(view.children[from_index], "z")
				}
				var to = {
					x: this.getFloat(view.children[to_index], "x"),
					y: this.getFloat(view.children[to_index], "y"),
					z: this.getFloat(view.children[to_index], "z")
				}

				// Create perspective view and set its properties
				var perspective = new MyPerspective(id, near, far, angle);
				perspective.setFrom(from);
				perspective.setTo(to);

				// Check ID
				if(!this.views.has(id))
					this.views.set(perspective.id, perspective);
				else
					this.onXMLMinorError("ID already exists.");
			}
			else if(child.nodeName == "ortho") {

				// Specific Properties
				var left = this.getString(view, "left");
				var right = this.getString(view, "right");
				var top = this.getString(view, "top");
				var bottom = this.getString(view, "bottom");

				// Create ortho view and set its properties
				var ortho = new MyOrtho(id, near, far, left, right, top, bottom);

				// Check ID
				if(!this.views.has(id))
					this.views.set(ortho.id, ortho);
				else
					this.onXMLMinorError("ID already exists.");
			}
		}

		if(this.views.length < 1)
			this.onXMLMinorError("Need at least one view!");
		else if(!this.views.has(this.views_default))
			this.onXMLMinorError("Default view doesn't exist.");

		this.log("Parsed <views> element.");
	}
 
	/**
	 * Parses the <ambient> element.
	 * @param {XML ambient element} ambientNode
	 */
	parseAmbient(ambientNode) {

		// Specific properties' names
		var ambientProperties = [];
		for(var i = 0; i < ambientNode.children.length; ++i)
			ambientProperties.push(ambientNode.children[i].nodeName);

		// Properties' indexes
		var ambient_index = ambientProperties.indexOf("ambient");
		var background_index = ambientProperties.indexOf("background");

		var ambient_child = ambientNode.children[ambient_index];
		var background_child = ambientNode.children[background_index];

		// Properties
		this.ambient_ambient = {
			r: this.getFloat(ambient_child, "r"),
			g: this.getFloat(ambient_child, "g"), 
			b: this.getFloat(ambient_child, "b"),
			a: this.getFloat(ambient_child, "a")
		}

		this.ambient_background = {
			r: this.getFloat(background_child, "r"),
			g: this.getFloat(background_child, "g"), 
			b: this.getFloat(background_child, "b"),
			a: this.getFloat(background_child, "a")
		}

		this.log("Parsed <ambient> element.");
	}

	/**
	 * Parses the <lights> element.
	 * @param {XML lights element} lightsNode
	 */
	parseLights(lightsNode) {

		for(var i = 0; i < lightsNode.children.length; ++i) {

			// New light
			var light = lightsNode.children[i];

			// Special properties
			var lightProperties = [];
			for(var j = 0; j < light.children.length; ++j)
				lightProperties.push(light.children[j].nodeName);

			// Properties' index
			var location_index = lightProperties.indexOf("location");
			var ambient_index = lightProperties.indexOf("ambient");
			var diffuse_index = lightProperties.indexOf("diffuse");
			var specular_index = lightProperties.indexOf("specular");

			// General properties
			var id = this.getString(light, "id");
			var enabled = this.getBoolean(light, "enabled");

			var location = {
				x: this.getFloat(light.children[location_index], "x"),
				y: this.getFloat(light.children[location_index], "y"),
				z: this.getFloat(light.children[location_index], "z"),
				w: this.getFloat(light.children[location_index], "w")
			}

			var ambient = {
				r: this.getFloat(light.children[ambient_index], "r"),
				g: this.getFloat(light.children[ambient_index], "g"),
				b: this.getFloat(light.children[ambient_index], "b"),
				a: this.getFloat(light.children[ambient_index], "a")
			}

			var diffuse = {
				r: this.getFloat(light.children[diffuse_index], "r"),
				g: this.getFloat(light.children[diffuse_index], "g"),
				b: this.getFloat(light.children[diffuse_index], "b"),
				a: this.getFloat(light.children[diffuse_index], "a")
			}

			var specular = {
				r: this.getFloat(light.children[specular_index], "r"),
				g: this.getFloat(light.children[specular_index], "g"),
				b: this.getFloat(light.children[specular_index], "b"),
				a: this.getFloat(light.children[specular_index], "a")

			}
			
			if(light.nodeName == "omni") {

				// Create omni light and set its properties
				var omni = new MyOmni(id, enabled);
				omni.setLocation(location);
				omni.setAmbient(ambient);
				omni.setDiffuse(diffuse);
				omni.setSpecular(specular);

				// Check ID
				if(!this.lights.has(id))				
					this.lights.set(omni.id, omni);
				else
					this.onXMLMinorError("ID already exists.");

			}
			else if(light.nodeName == "spot") {

				var target_index = lightProperties.indexOf("target");

				var angle = this.getFloat(light, "angle");
				var exponent = this.getFloat(light, "exponent");

				var target = {
					x: this.getFloat(light.children[target_index], "x"),
					y: this.getFloat(light.children[target_index], "y"),
					z: this.getFloat(light.children[target_index], "z")
				}

				// Create spot light and set its properties
				var spot = new MySpot(id, enabled, angle, exponent);
				omni.setLocation(location);
				omni.setTarget(target);
				omni.setAmbient(ambient);
				omni.setDiffuse(diffuse);
				omni.setSpecular(specular);

				// Check ID
				if(!this.lights.has(id))				
					this.lights.set(spot.id, spot);
				else
					this.onXMLMinorError("ID already exists.");
			}
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

			var texture = texturesNode.children[i];
			
			var id = this.getString(texture, "id");
			var file = this.getString(texture, "file");

			if(!this.textures.has(id))
				this.textures.set(id, file);
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
		
			// New material
			var material = materialsNode.children[i];

			// Special properties
			var materialProperties = [];
			for(var j = 0; j < material.children.length; ++j)
				materialProperties.push(material.children[j].nodeName);
			
			// Properties' index
			var emission_index = materialProperties.indexOf("emission");
			var ambient_index = materialProperties.indexOf("ambient");
			var diffuse_index = materialProperties.indexOf("diffuse");
			var specular_index = materialProperties.indexOf("specular");
			
			//General properties
			var id = this.getString(material, "id");
			var shininess = this.getFloat(material, "shininess");
			var emission = {
				r: this.getFloat(material.children[emission_index], "r"),
				g: this.getFloat(material.children[emission_index], "g"),
				b: this.getFloat(material.children[emission_index], "b"),
				a: this.getFloat(material.children[emission_index], "a")
			}
			var ambient = {
				r: this.getFloat(material.children[ambient_index], "r"),
				g: this.getFloat(material.children[ambient_index], "g"),
				b: this.getFloat(material.children[ambient_index], "b"),
				a: this.getFloat(material.children[ambient_index], "a")
			}
			var diffuse = {
				r: this.getFloat(material.children[diffuse_index], "r"),
				b: this.getFloat(material.children[diffuse_index], "g"),
				g: this.getFloat(material.children[diffuse_index], "b"),
				a: this.getFloat(material.children[diffuse_index], "a")
			}
			var specular = {
				r: this.getFloat(material.children[specular_index], "r"),
				g: this.getFloat(material.children[specular_index], "g"),
				b: this.getFloat(material.children[specular_index], "b"),
				a: this.getFloat(material.children[specular_index], "a")
			}

			// Create new material and set its properties
			var mat = new MyMaterial(id, shininess);
			mat.setEmission(emission);
			mat.setAmbient(ambient);
			mat.setDiffuse(diffuse);
			mat.setSpecular(specular);

			// Check ID
			if(!this.materials.has(id))
				this.materials.set(mat.id, mat);
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

			// New transformation
			var transformation = transformationsNode.children[i];

			// General properties
			var id = this.getString(transformation, "id");

			var matrix = [];
			
			for(var j = 0; j < transformation.children.length; ++j) {

				var sub_transformation = transformation.children[j];

				switch(sub_transformation.nodeName) {
					case "translate":
					matrix.push({
						type: "translate",
						x: this.getFloat(sub_transformation, "x"),
						y: this.getFloat(sub_transformation, "y"),
						z: this.getFloat(sub_transformation, "z")
					})
					break;
					
					case "rotate":
					matrix.push({
						type: "rotate",
						axis: this.getChar(sub_transformation, "axis"),
						angle: this.getFloat(sub_transformation, "angle")
					})
					break;

					case "scale":
					matrix.push({
						type: "scale",
						x: this.getFloat(sub_transformation, "x"),
						y: this.getFloat(sub_transformation, "y"),
						z: this.getFloat(sub_transformation, "z")
					})
					break;
				}
			}

			// Create new transformaion and set its properties
			var transf = new MyTransformation(id, matrix);

			// Check ID
			if(!this.transformations.has(id))
				this.transformations.set(transf.id, transf);
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

			var primitive = primitivesNode.children[i];

			if(primitive.children.length > 1)
				this.onXMLMinorError("Too many primitives.");

			var primitive_type = primitive.children[0];

			// General properties
			var id = this.getString(primitive, "id");
			var properties;

			switch(primitive_type.nodeName) {
				case "rectangle":
				properties = {
					type: "rectangle",
					x1: this.getFloat(primitive_type, "x1"),
					y1: this.getFloat(primitive_type, "y1"),
					x2: this.getFloat(primitive_type, "x2"),
					y2: this.getFloat(primitive_type, "y2")
				}
				break;

				case "triangle":
				properties = {
					type: "triangle",
					x1: this.getFloat(primitive_type, "x1"),
					y1: this.getFloat(primitive_type, "y1"),
					z1: this.getFloat(primitive_type, "z1"),
					x2: this.getFloat(primitive_type, "x2"),
					y2: this.getFloat(primitive_type, "y2"),
					z2: this.getFloat(primitive_type, "z2"),
					x3: this.getFloat(primitive_type, "x3"),
					y3: this.getFloat(primitive_type, "y3"),
					z3: this.getFloat(primitive_type, "z3")
				}
				break;

				case "cylinder":
				properties = {
					type: "cylinder",
					base: this.getFloat(primitive_type, "base"),
					top: this.getFloat(primitive_type, "top"),
					height: this.getFloat(primitive_type, "height"),
					slices: this.getFloat(primitive_type, "slices"),
					stacks: this.getFloat(primitive_type, "stacks")
				}
				break;

				case "sphere":
				properties = {
					type: "sphere",
					radius: this.getFloat(primitive_type, "radius"),
					slices: this.getFloat(primitive_type, "slices"),
					stacks: this.getFloat(primitive_type, "stacks")
				}
				break;

				case "torus":
				properties = {
					type: "torus",
					inner: this.getFloat(primitive_type, "inner"),
					outer: this.getFloat(primitive_type, "outer"),
					slices: this.getFloat(primitive_type, "slices"),
					loops: this.getFloat(primitive_type, "loops")
				}
				break;
			}

			// Create new primitive and set its properties
			var prim = new MyPrimitive(id, properties);

			this.treeGraph.addNode(prim);

			/*
			if(!this.primitives.has(id))
				this.primitives.set(prim.id, prim);
			else
				this.onXMLMinorError("ID already exists.");
				*/

		}

		/*
		if(!this.primitives.length < 1)
			this.onXMLMinorError("Need at least one primitive!");
			*/

		this.log("Parsed <primitives> element.");
	}

	/**
	 * Parse <components> element.
	 * @param {XML components element} componentsNode
	 */
	parseComponents(componentsNode) {

		//this.treeGraph.setRoot(this.scene_root);

		for(var i = 0; i < componentsNode.children.length; ++i) {

			var component_child = componentsNode.children[i];

			var componentProperties = [];
			for(var j = 0; j < component_child.children.length; ++j)
				componentProperties.push(component_child.children[j].nodeName);

			var transformation_index = componentProperties.indexOf("transformation");
			var materials_index = componentProperties.indexOf("materials");
			var texture_index = componentProperties.indexOf("texture");

			// Get ID
			var id = this.getString(component_child, "id");

			// Get transformation TODO
			var transf_block = component_child.children[transformation_index];

			var transformation = {};

			// Get material
			var material = this.getString(component_child.children[materials_index].children[0], "id");

			// Get texture
			var texture = {
				id: this.getString(component_child.children[texture_index],"id"),
				length_s: this.getFloat(component_child.children[texture_index], "length_s"),
				length_t: this.getFloat(component_child.children[texture_index], "length_t")
			}

			var component = {
				id: id,
				transformation: transformation,
				material: material,
				texture: texture
			}

			this.treeGraph.addNode(component);
		}

		// TODO maybe use "children:" instead of using edges??
		for(var i = 0; i < componentsNode.children.length; ++i) {

			var component_child = componentsNode.children[i];

			var componentProperties = [];
			for(var j = 0; j < component_child.children.length; ++j)
				componentProperties.push(component_child.children[j].nodeName);

			var children_index = componentProperties.indexOf("children");

			var children_block = component_child.children[children_index];

			for(var j = 0; j < children_block.children.length; ++j) {

				var child = children_block.children[j];
				
				var parent_id = this.getString(component_child, "id");
				var child_id = this.getString(child, "id");

				this.treeGraph.addEdge(parent_id, child_id);
			}	
		}

		this.log("Parsed <components> element. TODO tranformations")
	}


	

	//TODO
	/**
	 * Parses the <INITIALS> block.
	 */
	/*
	parseScene(sceneNode) {

		var children = sceneNode.children;

		var nodeNames = [];

		for (var i = 0; i
			nodeNames.push(children[i].nodeName);

		// Frustum planes
		// (default messagevalues)
		this.near = 0.1;
		this.far = 500;
		var indexFrustum = nodeNames.indexOf("frustum");
		if (indexFrustum == -1) {
			this.onXMLMinorError("frustum planes missing; assuming 'near = 0.1' and 'far = 500'");
		}
		else {
			
			this.near = this.reader.getFloat(children[indexFrustum], 'near');
			this.far = this.reader.getFloat(children[indexFrustum], 'far');

			if (!(this.near != null && !isNaN(this.near))) {
				this.near = 0.1;
				this.onXMLMinorError("unable to parse value for near plane; assuming 'near = 0.1'");
			}
			else if (!(this.far != null && !isNaN(this.far))) {
				this.far = 500;
				this.onXMLMinorError("unable to parse value for far plane; assuming 'far = 500'");
			}

			if (this.near >= this.far)
				return "'near' must be smaller than 'far'";
		}

		// Checks if at most one translation, three rotations, and one scaling are defined.
		if (initialsNode.getElementsByTagName('translation').length > 1)
			return "no more than one initial translation may be defined";

		if (initialsNode.getElementsByTagName('rotation').length > 3)
			return "no more than three initial rotations may be defined";

		if (initialsNode.getElementsByTagName('scale').length > 1)
			return "no more than one scaling may be defined";

		// Initial transforms.
		this.initialTranslate = [];
		this.initialScaling = [];
		this.initialRotations = [];

		// Gets indices of each element.
		var translationIndex = nodeNames.indexOf("translation");
		var thirdRotationIndex = nodeNames.indexOf("rotation");
		var secondRotationIndex = nodeNames.indexOf("rotation", thirdRotationIndex + 1);
		var firstRotationIndex = nodeNames.lastIndexOf("rotation");
		var scalingIndex = nodeNames.indexOf("scale");

		// Checks if the indices are valid and in the expected order.
		// Translation.
		this.initialTransforms = mat4.create();
		mat4.identity(this.initialTransforms);

		if (translationIndex == -1)
			this.onXMLMinorError("initial translation undefined; assuming T = (0, 0, 0)");
		else {
			var tx = this.reader.getFloat(children[translationIndex], 'x');
			var ty = this.reader.getFloat(children[translationIndex], 'y');
			var tz = this.reader.getFloat(children[translationIndex], 'z');

			if (tx == null || ty == null || tz == null) {
				tx = 0;
				ty = 0;
				tz = 0;
				this.onXMLMinorError("failed to parse coordinates of initial translation; assuming zero");
			}

			//TODO: Save translation data
		}

		//TODO: Parse Rotations

		//TODO: Parse Scaling

		//TODO: Parse Reference length

		this.log("Parsed initials");

		return null;
	}


	/**
	 * Parses the <LIGHTS> node.
	 * @param {lights block element} lightsNode
	 */
	/*
	parseLights(lightsNode) {

		var children = lightsNode.children;

		this.lights = [];
		var numLights = 0;

		var grandChildren = [];
		var nodeNames = [];

		// Any number of lights.
		for (var i = 0; i < children.length; i++) {

			if (children[i].nodeName != "LIGHT") {
				this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
				continue;
			}

			// Get id of the current light.
			var lightId = this.reader.getString(children[i], 'id');
			if (lightId == null)
				return "no ID defined for light";

			// Checks for repeated IDs.
			if (this.lights[lightId] != null)
				return "ID must be unique for each light (conflict: ID = " + lightId + ")";

			grandChildren = children[i].children;
			// Specifications for the current light.

			nodeNames = [];
			for (var j = 0; j < grandChildren.length; j++) {
				nodeNames.push(grandChildren[j].nodeName);
			}

			// Gets indices of each element.
			var enableIndex = nodeNames.indexOf("enable");
			var positionIndex = nodeNames.indexOf("position");
			var ambientIndex = nodeNames.indexOf("ambient");
			var diffuseIndex = nodeNames.indexOf("diffuse");
			var specularIndex = nodeNames.indexOf("specular");

			// Light enable/disable
			var enableLight = true;
			if (enableIndex == -1) {
				this.onXMLMinorError("enable value missing for ID = " + lightId + "; assuming 'value = 1'");
			}
			else {
				var aux = this.reader.getFloat(grandChildren[enableIndex], 'value');
				if (!(aux != null && !isNaN(aux) && (aux == 0 || aux == 1)))
					this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
				else
					enableLight = aux == 0 ? false : true;
			}

			// Retrieves the light position.
			var positionLight = [];
			if (positionIndex != -1) {
				// x
				var x = this.reader.getFloat(grandChildren[positionIndex], 'x');
				if (!(x != null && !isNaN(x)))
					return "unable to parse x-coordinate of the light position for ID = " + lightId;
				else
					positionLight.push(x);

				// y
				var y = this.reader.getFloat(grandChildren[positionIndex], 'y');
				if (!(y != null && !isNaN(y)))
					return "unable to parse y-coordinate of the light position for ID = " + lightId;
				else
					positionLight.push(y);

				// z
				var z = this.reader.getFloat(grandChildren[positionIndex], 'z');
				if (!(z != null && !isNaN(z)))
					return "unable to parse z-coordinate of the light position for ID = " + lightId;
				else
					positionLight.push(z);

				// w
				var w = this.reader.getFloat(grandChildren[positionIndex], 'w');
				if (!(w != null && !isNaN(w) && w >= 0 && w <= 1))
					return "unable to parse x-coordinate of the light position for ID = " + lightId;
				else
					positionLight.push(w);
			}
			else
				return "light position undefined for ID = " + lightId;

			// Retrieves the ambient component.
			var ambientIllumination = [];
			if (ambientIndex != -1) {
				// R
				var r = this.reader.getFloat(grandChildren[ambientIndex], 'r');
				if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
					return "unable to parse R component of the ambient illumination for ID = " + lightId;
				else
					ambientIllumination.push(r);

				// G
				var g = this.reader.getFloat(grandChildren[ambientIndex], 'g');
				if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
					return "unable to parse G component of the ambient illumination for ID = " + lightId;
				else
					ambientIllumination.push(g);

				// B
				var b = this.reader.getFloat(grandChildren[ambientIndex], 'b');
				if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
					return "unable to parse B component of the ambient illumination for ID = " + lightId;
				else
					ambientIllumination.push(b);

				// A
				var a = this.reader.getFloat(grandChildren[ambientIndex], 'a');
				if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
					return "unable to parse A component of the ambient illumination for ID = " + lightId;
				else
					ambientIllumination.push(a);
			}
			else
				return "ambient component undefined for ID = " + lightId;

			// TODO: Retrieve the diffuse component

			// TODO: Retrieve the specular component

			// TODO: Store Light global information.
			//this.lights[lightId] = ...;
			numLights++;
		}

		if (numLights == 0)
			return "at least one light must be defined";
		else if (numLights > 8)
			this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

		this.log("Parsed lights");

		return null;
	}
	*/

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

	/**parseInitials(initialsNode) {

		var children = initialsNode.children;

		var nodeNames = [];

		for (var i = 0; i < children.length; i++)
			nodeNames.push(children[i].nodeName);

		// Frustum planes
		// (default values)
		this.near = 0.1;
		this.far = 500;
		var indexFrustum = nodeNames.indexOf("frustum");
		if (indexFrustum == -1) {
			this.onXMLMinorError("frustum planes missing; assuming 'near = 0.1' and 'far = 500'");
		}
		else {
			this.near = this.reader.getFloat(children[indexFrustum], 'near');
			this.far = this.reader.getFloat(children[indexFrustum], 'far');

			if (!(this.near != null && !isNaN(this.near))) {
				this.near = 0.1;
				this.onXMLMinorError("unable to parse value for near plane; assuming 'near = 0.1'");
			readString(node, attribute) {

		var string = this.reader
		

	}}
			else if (!(this.far != null && !isNaN(this.far))) {
				this.far = 500;
				this.onXMLMinorError("unable to parse value for far plane; assuming 'far = 500'");
			}

			if (this.near >= this.far)
				return "'near' must be smaller than 'far'";
		}

		// Checks if at most one translation, three rotations, and one scaling are defined.
		if (initialsNode.getElementsByTagName('translation').length > 1)
			return "no more than one initial translation may be defined";

		if (initialsNode.getElementsByTagName('rotation').length > 3)
			return "no more than three initial rotations may be defined";

		if (initialsNode.getElementsByTagName('scale').length > 1)
			return "no more than one scaling may be defined";

		// Initial transforms.
		this.initialTranslate = [];
		this.initialScaling = [];
		this.initialRotations = [];

		// Gets indices of each element.
		var translationIndex = nodeNames.indexOf("translation");
		var thirdRotationIndex = nodeNames.indexOf("rotation");
		var secondRotationIndex = nodeNames.indexOf("rotation", thirdRotationIndex + 1);
		var firstRotationIndex = nodeNames.lastIndexOf("rotation");
		var scalingIndex = nodeNames.indexOf("scale");

		// Checks if the indices are valid and in the expected order.
		// Translation.
		this.initialTransforms = mat4.create();
		mat4.identity(this.initialTransforms);

		if (translationIndex == -1)
			this.onXMLMinorError("initial translation undefined; assuming T = (0, 0, 0)");
		else {
			var tx = this.reader.getFloat(children[translationIndex], 'x');
			var ty = this.reader.getFloat(children[translationIndex], 'y');
			var tz = this.reader.getFloat(children[translationIndex], 'z');

			if (tx == null || ty == null || tz == null) {
				tx = 0;
				ty = 0;
				tz = 0;
				this.onXMLMinorError("failed to parse coordinates of initial translation; assuming zero");
			}

			//TODO: Save translation data
		}

		//TODO: Parse Rotations

		//TODO: Parse Scaling

		//TODO: Parse Reference length

		this.log("Parsed initials");

		return null;
	}

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