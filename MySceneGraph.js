var DEGREE_TO_RAD = Math.PI / 180;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
	/**
	 * @constructor
	 */
	constructor(filename, scene) {

		this.loadedOk = true;

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

		this.log("XML loading finished");

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
		if ((index = indexes.indexOf("scene")) == -1)
			return this.onXMLError("Tag <scene> is missing.");
		else {
			if (index != SCENE_INDEX)
				this.onXMLMinorError("Tag <scene> is out of order.");

			//Parse <scene> element
			if (this.parseScene(rootElement.children[index]) == null)
				return;
		}

		// <views>
		if ((index = indexes.indexOf("views")) == -1)
			return this.onXMLError("Tag <views> is missing.");
		else {
			if (index != VIEWS_INDEX)
				this.onXMLMinorError("Tag <views> is out of order.");

			//Parse <views> element
			if (this.parseViews(rootElement.children[index]) == null)
				return;
		}

		// <ambient>
		if ((index = indexes.indexOf("ambient")) == -1)
			return this.onXMLError("Tag <ambient> is missing.");
		else {
			if (index != AMBIENT_INDEX)
				this.onXMLMinorError("Tag <ambient> is out of order.");

			//Parse <ambient> element
			if (this.parseAmbient(rootElement.children[index]) == null)
				return;
		}

		// <lights>
		if ((index = indexes.indexOf("lights")) == -1)
			return this.onXMLError("Tag <lights> is missing.");
		else {
			if (index != LIGHTS_INDEX)
				this.onXMLMinorError("Tag <lights> is out of order.");

			//Parse <lights> element
			if (this.parseLights(rootElement.children[index]) == null)
				return;
		}

		// <textures>
		if ((index = indexes.indexOf("textures")) == -1)
			return this.onXMLError("Tag <textures> is missing.");
		else {
			if (index != TEXTURES_INDEX)
				this.onXMLMinorError("tag <textures> is out of order.");

			//Parse <textures> element
			if (this.parseTextures(rootElement.children[index]) == null)
				return;
		}

		// <materials>
		if ((index = indexes.indexOf("materials")) == -1)
			return this.onXMLError("Tag <materials> is missing.");
		else {
			if (index != MATERIALS_INDEX)
				this.onXMLMinorError("Tag <materials> is out of order.");

			//Parse <materials> elements
			if (this.parseMaterials(rootElement.children[index]) == null)
				return;
		}

		// <transformations>
		if ((index = indexes.indexOf("transformations")) == -1)
			return this.onXMLError("Tag <transformations> is missing.");
		else {
			if (index != TRANSFORMATIONS_INDEX)
				this.onXMLMinorError("Tag <transformations> is out of order.");

			//Parse <transformations> element
			if (this.parseTransformations(rootElement.children[index]) == null)
				return;
		}

		// <primitives>
		if ((index = indexes.indexOf("primitives")) == -1)
			return this.onXMLError("Tag <primitives> is missing.");
		else {
			if (index != PRIMITIVES_INDEX)
				this.onXMLMinorError("Tag <primitives> is out of order.");

			//Parse <primitives> element
			if (this.parsePrimitives(rootElement.children[index]) == null)
				return;
		}

		// <components>
		if ((index = indexes.indexOf("components")) == -1)
			return this.onXMLError("Tag <components> is missing.");
		else {
			if (index != COMPONENTS_INDEX)
				this.onXMLMinorError("Tag <components> is out of order.");

			//Parse components block
			if (this.parseComponents(rootElement.children[index]) == null)
				return;
		}
	}

	/**
	 * Parses the <scene> element.
	 * @param {XML scene element} sceneElement 
	 */
	parseScene(sceneElement) {

		// Root
		if ((this.scenes.root = this.parseString(sceneElement, "root")) == null)
			return null;

		// Axis length
		if ((this.scenes.axis_length = this.parseFloat(sceneElement, "axis_length")) == null)
			return null;

		this.log("Parsed <scene> element.");

		return 1;
	}

	/**
	 * Parses the <views> element.
	 * @param {XML views element} viewsElement
	 */
	parseViews(viewsElement) {

		// Default
		if ((this.views.default = this.parseString(viewsElement, "default")) == null)
			return null;

		for (var i = 0; i < viewsElement.children.length; ++i) {

			var viewChild = viewsElement.children[i];

			// New view
			var new_view = {};

			// ID
			if((new_view.id = this.parseString(viewChild, "id")) == null)
				return null;

			// Near
			if((new_view.near = this.parseFloat(viewChild, "near")) == null)
				return null;
			
			// Far
			if((new_view.far = this.parseFloat(viewChild, "far")) == null)
				return null;

			if (new_view.near >= new_view.far) {
				this.onXMLMinorError("Near value is bigger/equal than far value.");
				return null;
			}

			// Check type
			if (viewChild.nodeName == "perspective") {

				// Order of the elements
				const FROM_INDEX = 0;
				const TO_INDEX = 1;

				// Type
				new_view.type = "perspective";

				// Angle
				if ((new_view.angle = this.parseFloat(viewChild, "angle")) == null)
					return null;

				var indexes = [];
				for (var j = 0; j < viewChild.children.length; ++j)
					indexes.push(viewChild.children[j].nodeName);

				var index;

				// From
				if ((index = indexes.indexOf("from")) == -1) {
					this.onXMLError("Tag <from> is missing.");
					return null;
				}
				else {

					if (index != FROM_INDEX)
						this.onXMLMinorError("Tag <from> is out of order.");

					if ((new_view.from = this.parseXYZ(viewChild.children[index])) == null)
						return null;
				}

				// To
				if ((index = indexes.indexOf("to")) == -1) {
					this.onXMLError("Tag <to> is missing.");
					return null;
				}
				else {

					if (index != TO_INDEX)
						this.onXMLMinorError("Tag <to> is out of order.");

					if ((new_view.to = this.parseXYZ(viewChild.children[index])) == null)
						return null;
				}
			}
			else if (viewChild.nodeName == "ortho") {

				// Type
				new_view.type = "ortho";

				// Left
				if ((new_view.left = this.parseFloat(viewChild, "left")) == null)
					return null;

				// Right
				if ((new_view.right = this.parseFloat(viewChild, "right")) == null)
					return null;

				// Top
				if ((new_view.top = this.parseFloat(viewChild, "top")) == null)
					return null;

				// Bottom
				if ((new_view.bottom = this.parseFloat(vviewChild, "bottom")) == null)
					return null;
			}

			// Check ID
			if (!this.views.hasOwnProperty(new_view.id))
				this.views[new_view.id] = new_view;
			else
				this.onXMLMinorError("ID \"" + new_view.id + "\" already exists.");
		}

		if (this.views.length < 2) {
			this.onXMLError("Need at least one view.");
			return null;
		}
		if (!this.views.hasOwnProperty(this.views.default)) {
			this.onXMLError("Default view doesn't exist.");
			return null;
		}

		this.log("Parsed <views> element.");

		return 1;
	}

	/**
	 * Parses the <ambient> element.
	 * @param {XML ambient element} ambientElement
	 */
	parseAmbient(ambientElement) {

		// Order of the elements
		const AMBIENT_INDEX = 0;
		const BACKGROUND_INDEX = 1;

		var indexes = [];
		for (var i = 0; i < ambientElement.children.length; ++i)
			indexes.push(ambientElement.children[i].nodeName);

		var index;

		// Ambient
		if ((index = indexes.indexOf("ambient")) == -1) {
			this.onXMLError("Tag <ambient> is missing.");
			return null;
		}
		else {

			if (index != AMBIENT_INDEX)
				this.onXMLMinorError("Tag <ambient> is out of order.")

			if ((this.ambient.ambient = this.parseRGBA(ambientElement.children[index])) == null)
				return null;
		}

		// Background
		if ((index = indexes.indexOf("background")) == -1) {
			this.onXMLError("Tag <background> is missing.");
			return null;
		}
		else {

			if (index != BACKGROUND_INDEX)
				this.onXMLMinorError("Tag <background> is out of order.");

			if ((this.ambient.background = this.parseRGBA(ambientElement.children[index])) == null)
				return null;
		}

		this.log("Parsed <ambient> element.");

		return 1;
	}

	/**
	 * Parses the <lights> element.
	 * @param {XML lights element} lightsElement
	 */
	parseLights(lightsElement) {

		for (var i = 0; i < lightsElement.children.length; ++i) {

			var lightChild = lightsElement.children[i];

			// New light
			var new_light = {};

			// ID
			if((new_light.id = this.parseString(lightChild, "id")) == null)
				return null;

			// Enabled
			if((new_light.enabled = this.parseBool(lightChild, "enabled")) == null)
				return null;

			// Check type
			if (lightChild.nodeName == "omni") {

				// Order of elements
				const LOCATION_INDEX = 0;
				const AMBIENT_INDEX = 1;
				const DIFFUSE_INDEX = 2;
				const SPECULAR_INDEX = 3;

				new_light.type = "omni";

				var indexes = [];
				for(var j = 0; j < lightChild.children.length; ++j)
					indexes.push(lightChild.children[j].nodeName);

				var index;

				// Location
				if((index = indexes.indexOf("location")) == -1) {
					this.onXMLError("Tag <location> is missing.");
					return;
				}
				else {

					if(index != LOCATION_INDEX)
						this.onXMLMinorError("Tag <location> is out of order.");

					if ((new_light.location = this.parseXYZ(lightChild.children[index])) == null)
						return null;
				}

				// Ambient
				if ((index = indexes.indexOf("ambient")) == -1) {
					this.onXMLError("Tag <ambient> is missing.");
					return null;
				}
				else {

					if (index != AMBIENT_INDEX)
						this.onXMLMinorError("Tag <ambient> is out of order.");

					if ((new_light.ambient = this.parseRGBA(lightChild.children[index])) == null)
						return null;
				}

				// Diffuse
				if ((index = indexes.indexOf("diffuse")) == -1) {
					this.onXMLError("Tag <diffuse> is missing.");
					return null;
				}
				else {

					if (index != DIFFUSE_INDEX)
						this.onXMLMinorError("Tag <diffuse> is out of order.");

					if ((new_light.diffuse = this.parseRGBA(lightChild.children[index])) == null)
						return null;
				}

				// Specular
				if ((index = indexes.indexOf("specular")) == -1) {
					this.onXMLError("Tag <specular> is missing.");
					return null;
				}
				else {

					if (index != SPECULAR_INDEX)
						this.onXMLMinorError("Tag <specular> is out of order.");

					if ((new_light.specular = this.parseRGBA(lightChild.children[index])) == null)
						return null;
				}
			}
			else if (lightsElement.children[i].nodeName == "spot") {

				// Orders of elements
				const LOCATION_INDEX = 0;
				const TARGET_INDEX = 1
				const AMBIENT_INDEX = 2;
				const DIFFUSE_INDEX = 3;
				const SPECULAR_INDEX = 4;

				new_light.type = "spot";

				var indexes = [];
				for(var j = 0; j < lightChild.children.length; ++j)
					indexes.push(lightChild.children[j].nodeName);

				var index;

				// Location
				if ((index = indexes.indexOf("location")) == -1) {
					this.onXMLError("Tag <location> is missing.");
					return null;
				}
				else {

					if (index != LOCATION_INDEX)
						this.onXMLMinorError("Tag <location> is out of order.");

					if ((new_light.location = this.parseXYZ(lightChild.children[index])) == null)
						return null;
				}

				// Target
				if ((index = indexes.indexOf("target")) == -1) {
					this.onXMLError("Tag <target> is missing.");
					return null;
				}
				else {

					if (index != TARGET_INDEX)
						this.onXMLMinorError("Tag <target> is out of order.");

					if ((new_light.target = this.parseXYZ(lightChild.children[index])) == null)
						return null;
				}

				// Ambient
				if ((index = indexes.indexOf("ambient")) == -1) {
					this.onXMLError("Tag <ambient> is missing.");
					return null;
				}
				else {

					if (index != AMBIENT_INDEX)
						this.onXMLMinorError("Tag <ambient> is out of order.");

					if ((new_light.ambient = this.parseRGBA(lightChild.children[index])) == null)
						return null;
				}

				// Diffuse
				if ((index = indexes.indexOf("diffuse")) == -1) {
					this.onXMLError("Tag <diffuse> is missing.");
					return null;
				}
				else {

					if (index != DIFFUSE_INDEX)
						this.onXMLMinorError("Tag <diffuse> is out of order.");

					if ((new_light.diffuse = this.parseRGBA(lightChild.children[index])) == null)
						return null;
				}

				// Specular
				if ((index = indexes.indexOf("specular")) == -1) {
					this.onXMLError("Tag <specular> is missing.");
					return null;
				}
				else {

					if (index != SPECULAR_INDEX)
						this.onXMLMinorError("Tag <specular> is out of order.");

					if ((new_light.specular = this.parseRGBA(lightChild.children[index])) == null)
						return null;
				}
			}

			// Check ID
			if (!this.lights.hasOwnProperty(new_light.id))
				this.lights[new_light.id] = new_light;
			else
				this.onXMLMinorError("ID \"" + new_light.id + "\" already exists.");
		}

		if (this.lights.length < 1)
			return this.onXMLError("Need at least one light!");

		this.log("Parsed <lights> element.");

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
			var new_texture = {};

			// ID
			if ((new_texture.id = this.parseString(textureChild, "id")) == null)
				return null;

			// File
			if ((new_texture.file = this.parseString(textureChild, "file")) == null)
				return null;

			if (!this.textures.hasOwnProperty(new_texture.id))
				this.textures[new_texture.id] = new_texture;
			else
				this.onXMLMinorError("ID \"" + new_texture.id + "\" already exists.");
		}

		if (this.textures.length < 1)
			return this.onXMLError("Need at least one texture!");

		this.log("Parsed <textures> element.");

		return 1;
	}

	/**
	 * Parses the <materials> element.
	 * @param {XML materials element} materialsElement
	 */
	parseMaterials(materialsElement) {

		for (var i = 0; i < materialsElement.children.length; ++i) {

			var materialChild = materialsElement.children[i];

			// Order of elements
			const EMISSION_INDEX = 0;
			const AMBIENT_INDEX = 1;
			const DIFFUSE_INDEX = 2;
			const SPECULAR_INDEX = 3;

			// New material
			var new_material = {};

			// ID
			if ((new_material.id = this.parseString(materialChild, "id")) == null)
				return null;

			// Shininess
			if ((new_material.shininess = this.parseString(materialChild, "shininess")) == null)
				return null;

			var indexes = [];
			for (var j = 0; j < materialChild.children.length; ++j)
				indexes.push(materialChild.children[j].nodeName);

			var index;
			
			// Emission
			if ((index = indexes.indexOf("emission")) == -1) {
				this.onXMLError("Tag <emission> is missing.");
				return null;
			}
			else {

				if (index != EMISSION_INDEX)
					this.onXMLMinorError("Tag <emission> is out of order.");

				if ((new_material.emission = this.parseRGBA(materialChild.children[index])) == null)
					return null;
			}

			// Ambient
			if ((index = indexes.indexOf("ambient")) == -1) {
				this.onXMLError("Tag <ambient> is missing.");
				return null;
			}
			else {

				if (index != AMBIENT_INDEX)
					this.onXMLMinorError("Tag <ambient> is out of order.");

				if ((new_material.ambient = this.parseRGBA(materialChild.children[index])) == null)
					return null;
			}

			// Diffuse
			if ((index = indexes.indexOf("diffuse")) == -1) {
				this.onXMLError("Tag <diffuse> is missing.");
				return null;
			}
			else {

				if (index != DIFFUSE_INDEX)
					this.onXMLMinorError("Tag <diffuse> is out of order.");

				if ((new_material.diffuse = this.parseRGBA(materialChild.children[index])) == null)
					return null;
			}

			// Specular
			if ((index = indexes.indexOf("specular")) == -1) {
				this.onXMLError("Tag <specular> is missing.");
				return null;
			}
			else {

				if (index != SPECULAR_INDEX)
					this.onXMLMinorError("Tag <specular> is out of order.");

				if ((new_material.specular = this.parseRGBA(materialChild.children[index])) == null)
					return null;
			}

			// Check ID
			if (!this.materials.hasOwnProperty(new_material.id))
				this.materials[new_material.id] = new_material;
			else
				this.onXMLMinorError("ID \"" + new_material.id + "\" already exists.");
		}

		if (this.materials.length < 1)
			return this.onXMLError("Need at least one material.");

		this.log("Parse <materials> element.")

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
			var new_transformation =  {};

			// ID
			if((new_transformation.id = this.parseString(transformationChild, "id")) == null)
            	return null;

       		// Transformations
        	new_transformation.transformations = [];

			for (var j = 0; j < transformationChild.children.length; ++j) {

				switch (transformationChild.children[j].nodeName) {
					case "translate":
					new_transformation.transformations.push({
						type: "translate",
						args: this.parseXYZ(transformationChild.children[j])
					})

					if (new_transformation.transformations[j].args == null)
						return null;
					break;

					case "rotate":
					new_transformation.transformations.push({
						type: "rotate",
						axis: this.parseChar(transformationChild.children[j], "axis"),
						angle: this.parseFloat(transformationChild.children[j], "angle")
					})

					if (new_transformation.transformations[j].axis == null)
						return null;

					if (new_transformation.transformations[j].angle == null)
						return null
					break;

					case "scale":
					new_transformation.transformations.push({
						type: "scale",
						args: this.parseXYZ(transformationChild.children[j])
					})

					if (new_transformation.transformations[j].args == null)
						return null;
					break;

					default:
					this.onXMLError("Unknown transformation.");
					return null;
				}
			}

			// Check ID
			if (!this.transformations.hasOwnProperty(new_transformation.id))
				this.transformations[new_transformation.id] = new_transformation;
			else
				this.onXMLMinorError("ID \"" + new_transformation.id + "\" already exists.");
		}

		if (this.transformations.length < 1)
			return this.onXMLError("Need at least one transformation!");

		this.log("Parsed <transformations> element.");

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
			var new_primitive = {};

			// ID
			if ((new_primitive.id = this.parseString(primitiveChild, "id")) == null)
				return null;

			if (primitiveChild.children.length != 1) {
				this.onXMLError("Too many/few primitives.");
				return null;
			}

			switch (primitiveChild.children[0].nodeName) {
				case "rectangle":

				// Type
				new_primitive.type = "rectangle";

				// x1
				if ((new_primitive.x1 = this.parseFloat(primitiveChild.children[0], "x1")) == null)
					return null;

				// y1
				if ((new_primitive.y1 = this.parseFloat(primitiveChild.children[0], "y1")) == null)
					return null;

				// x2
				if ((new_primitive.x2 = this.parseFloat(primitiveChild.children[0], "x2")) == null)
					return null;

				// y2
				if ((new_primitive.y2 = this.parseFloat(primitiveChild.children[0], "y2")) == null)
					return null;
				break;

				case "triangle":

				// Type
				new_primitive.type = "triangle";

				// x1
				if ((new_primitive.x1 = this.parseFloat(primitiveChild.children[0], "x1")) == null)
					return null;

				// y1
				if ((new_primitive.y1 = this.parseFloat(primitiveChild.children[0], "y1")) == null)
					return null;

				// z1
				if ((new_primitive.z1 = this.parseFloat(primitiveChild.children[0], "z1")) == null)
					return null;

				// x2
				if ((new_primitive.x2 = this.parseFloat(primitiveChild.children[0], "x2")) == null)
					return null;

				// y2
				if ((new_primitive.y2 = this.parseFloat(primitiveChild.children[0], "y2")) == null)
					return null;

				// z2
				if ((new_primitive.z2 = this.parseFloat(primitiveChild.children[0], "z2")) == null)
					return null;

				// x3
				if ((new_primitive.x3 = this.parseFloat(primitiveChild.children[0], "x3")) == null)
					return null;

				// y3
				if ((new_primitive.y3 = this.parseFloat(primitiveChild.children[0], "y3")) == null)
					return null;

				// z3
				if ((new_primitive.z3 = this.parseFloat(primitiveChild.children[0], "z3")) == null)
					return null;
				break;

				case "cylinder":

				// Type
				new_primitive.type = "cylinder";

				// Base
				if ((new_primitive.base = this.parseFloat(primitiveChild.children[0], "base")) == null)
					return null;

				// Top
				if ((new_primitive.top = this.parseFloat(primitiveChild.children[0], "top")) == null)
					return null;

				// Height
				if ((new_primitive.height = this.parseFloat(primitiveChild.children[0], "height")) == null)
					return null;

				// Slices
				if ((new_primitive.slices = this.parseFloat(primitiveChild.children[0], "slices")) == null)
					return null;

				// Stacks
				if ((new_primitive.stacks = this.parseFloat(primitiveChild.children[0], "stacks")) == null)
					return null;
				break;

				case "sphere":

				// Type
				new_primitive.type = "sphere";

				// Radius
				if ((new_primitive.radius = this.parseFloat(primitiveChild.children[0], "radius")) == null)
					return null;

				// Slices
				if ((new_primitive.slices = this.parseFloat(primitiveChild.children[0], "slices")) == null)
					return null;

				// Stacks
				if ((new_primitive.stacks = this.parseFloat(primitiveChild.children[0], "stacks")) == null)
					return null;
				break;

				case "torus":

				// Type
				new_primitive.type = "torus";

				// Inner
				if ((new_primitive.inner = this.parseFloat(primitiveChild.children[0], "inner")) == null)
					return;

				// Outer
				if ((new_primitive.outer = this.parseFloat(primitiveChild.children[0], "outer")) == null)
					return null;

				// Slices
				if ((new_primitive.slices = this.parseFloat(primitiveChild.children[0], "slices")) == null)
					return null;

				// Loops
				if ((new_primitive.loops = this.parseFloat(primitiveChild.children[0], "loops")) == null)
					return null;
				break;

				default:
				this.onXMLError("Unknown primitive.");
				return null;
			}

			// Check ID
			if (!this.primitives.hasOwnProperty(new_primitive.id))
				this.primitives[new_primitive.id] = new_primitive;
			else
				this.onXMLMinorError("ID \"" + new_primitive.id + "\" already exists.");
		}

		if (this.primitives.length < 1) {
			this.onXMLError("Need at least one primitive.");
			return null;
		}

		this.log("Parsed <primitives> element.");

		return 1;
	}

	/**
	 * Parse <components> element.
	 * @param {XML components element} componentsElement
	 */
	parseComponents(componentsElement) {

		for (var i = 0; i < componentsElement.children.length; ++i) {

			var componentChild = componentsElement.children[i];

			// Order of elements
			const TRANSFORMATION_INDEX = 0;
			const MATERIALS_INDEX = 1;
			const TEXTURE_INDEX = 2;
			const CHILDREN_INDEX = 3;

			// New component
			var new_component = {};

			// ID
			if ((new_component.id = this.parseString(componentChild, "id")) == null)
				return null;

			var indexes = [];
			for (var j = 0; j < componentChild.children.length; ++j)
				indexes.push(componentChild.children[j].nodeName);

			var index;

			// Transformation
			if((index = indexes.indexOf("transformation")) == -1) {
				this.onXMLError("Tag <transformation> is missing.");
				return null;
			}
			else {

				if(index != TRANSFORMATION_INDEX)
					this.onXMLMinorError("Tag <transformation> is out of order.");

				// Transformations
				new_component.transformations = [];

				var referencesCount = componentChild.children[index].getElementsByTagName("transformationref").length;
				var transformationsCount = componentChild.children[index].getElementsByTagName("translate").length + componentChild.children[index].getElementsByTagName("rotate").length + componentChild.children[index].getElementsByTagName("scale").length;

				if (referencesCount > 0 && transformationsCount > 0) {
					this.onXMLError("Component has both references and explicits transformations.");
					return null;
				}

				for (var j = 0; j < componentChild.children[index].children.length; ++j) {

					var componentGrandChild = componentChild.children[index].children[j]

					switch (componentGrandChild.nodeName) {
						case "transformationref":
						new_component.transformations.push({
								id: this.parseString(componentGrandChild, "id")
							})

							if (new_component.transformations[j].id == null)
								return null;
							break;

						case "translate":
						new_component.transformations.push({
								type: "translate",
								args: this.parseXYZ(componentGrandChild)
							})

							if (new_component.transformations[j].args == null)
								return null;
							break;

						case "rotate":
						new_component.transformations.push({
								type: "rotate",
								axis: this.parseChar(componentGrandChild, "axis"),
								angle: this.parseFloat(componentGrandChild, "angle")
							})

							if (new_component.transformations[j].axis == null)
								return null;

							if (new_component.transformations[j].angle == null)
								return null;
							break;

						case "scale":
						new_component.transformations.push({
							type: "scale",
							args: this.parseXYZ(componentGrandChild)
						})

						if (new_component.transformations[j].args == null)
							return null;
						break;

						default:
						this.onXMLError("Unknown transformation.");
						return null;
					}
				}
			}

			// Materials
			if((index = indexes.indexOf("materials")) == -1) {
				this.onXMLError("Tag <materials> is missing.");
				return null;
			}
			else {

				if(index != MATERIALS_INDEX)
					this.onXMLMinorError("Tag <materials is out of order.");
	
				new_component.materials = [];

				for (var j = 0; j < componentChild.children[index].children.length; ++j) {

					var componentGrandChild = componentChild.children[index].children[j];

					new_component.materials.push({
						id: this.parseString(componentGrandChild, "id")
					});

					if (new_component.materials[j].id == null)
						return null;
				}	
			}

			// Texture
			if((index = indexes.indexOf("texture")) == -1) {
				this.onXMLError("Tag <texture> is missing.");
				return null;
			}
			else {

				if(index != TEXTURE_INDEX)
					this.onXMLMinorError("Tag <texture> is out of order.");
				
				new_component.texture = {
					id: this.parseString(componentChild.children[index], "id")
				}

				if(!new_component.texture)
					return;
				else if(new_component.texture.id != "none" && new_component.texture.id != "inherit") {

					if ((new_component.texture.length_s = this.parseFloat(componentChild.children[index], "length_s")) == null)
						return null;

					if ((new_component.texture.length_t = this.parseFloat(componentChild.children[index], "length_t")) == null)
						return null;
				}
			}

			// Children
			if((index = indexes.indexOf("children")) == -1) {
				this.onXMLError("Tag <children> is missing.");
				return null;
			}
			else {

				if(index != CHILDREN_INDEX)
					this.onXMLMinorError("Tag <children> is out of order.");

				new_component.children = [];

				for (var j = 0; j < componentChild.children[index].children.length; ++j) {

					var componentGrandChild = componentChild.children[index].children[j];

					switch (componentGrandChild.nodeName) {
						case "componentref":
						new_component.children.push({
							type: "component",
							id: this.parseString(componentGrandChild, "id")
						})
						break;

						case "primitiveref":
						new_component.children.push({
							type: "primitive",
							id: this.parseString(componentGrandChild, "id")
						})
						break;
					}

					if (new_component.children[j].id == null)
						return null;;
				}
			}

			// Check ID
			if (!this.components.hasOwnProperty(new_component.id))
				this.components[new_component.id] = new_component;
			else
				this.onXMLMinorError("ID \"" + new_component.id + "\" already exists.");
		}

		if (!this.components.hasOwnProperty(this.scenes.root))
			return this.onXMLError("Scene root doesn't exist.");

		this.log("Parsed <components> element.")

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

	/**
	 * Displays the scene, processing each node, starting in the root node.
	 */
	displayScene() {
		// entry point for graph rendering
		//TODO: Render loop starting at root of graph
	}

	// Helper functions

	parseInt(element, attribute) {

		var integer = this.reader.getInteger(element, attribute, false);

		if (integer = null || isNaN(integer)) {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element + "\" is not an integer.");
			return null;
		}

		return integer;
	}

	parseFloat(element, attribute) {

		var float = this.reader.getFloat(element, attribute, false);

		if (float == null || isNaN(float)) {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element + "\" is not a float.");
			return null;
		}

		return float;
	}

	parseString(element, attribute) {

		var string = this.reader.getString(element, attribute, false);

		if (string == null || string === "") {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element + "\" is not a string.");
			return null;
		}

		return string;
	}

	parseChar(element, attribute) {

		var char = this.reader.getString(element, attribute, false);

		if (char == null || (char != "x" && char != "y" && char != "z")) {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element + "\" is not a character.");
			return null;
		}

		return char;
	}

	parseBool(element, attribute) {

		var bool = this.reader.getBoolean(element, attribute, false);

		if (bool == null || isNaN(bool)) {
			this.onXMLError("Attribute \"" + attribute + "\" in \"" + element + "\" is not a boolean.");
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
				this.onXMLError("Attribute \"" + args[i] + "\" in \"" + element + "\" is not a float.");
				return null;
			}
			else if (tmp < 0.0 || tmp > 1.0) {
				this.onXMLError("Attribute \"" + args[i] + "\" in \"" + element + "\" is out of bounds.");
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
				this.onXMLError("Attribute \"" + args[i] + "\" in \"" + element + "\" is not a float.");
				return null;
			}
			else
				xyz[args[i]] = tmp;
		}

		return xyz;
	}
}