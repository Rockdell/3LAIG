
function componentFactory(sceneGraph, element) {

    var obj = {
        id: sceneGraph.parseString(element, "id"),
        transformations: [],
        materials: [],
        children: []
    };

    if(obj.id == null)
        return null;

    // Iterate through the tags
    for(var i = 0; i < element.children.length; ++i) {

        var tag = element.children[i];

        switch(tag.nodeName) {
            case "transformation":
				var countRef = tag.getElementsByTagName("transformationref").length;
                var countTrans = tag.getElementsByTagName("translate").length + 
                    tag.getElementsByTagName("rotate").length + 
                    tag.getElementsByTagName("scale").length;

                // Check if there are both references and explicit transformations
				if (countRef > 0 && countTrans > 0) {
					this.onXMLError("Component has both references and explicit transformations.");
					return null;
				}

                for(var j = 0; j < tag.children.length; ++j) {

                    obj.transformations.push(sceneGraph.parseTransform(tag.children[j]));

                    if(obj.transformations[j] == null)
                        return null;
                    else if(obj.transformations[j].type == "transformationref") {

                        // Check if transformation reference exist
                        if (!sceneGraph.transformations[obj.transformations[j].args.id]) {
                            sceneGraph.onXMLError("Transformation \"" + obj.transformations[j].args.id + "\" does not exist.");
                            return null;
                        }
                        else
                            break;
                    }
                }
                break;
            case "materials":
                for(var j = 0; j < tag.children.length; ++j) {

                    obj.materials.push({
                        id: sceneGraph.parseString(tag.children[j], "id")
                    });

                    if(obj.materials[j].id == null)
                        return null;
                    else if(obj.materials[j].id != "inherit") {

                        // Check if material exist
                        if(!sceneGraph.materials[obj.materials[j].id]) {
                            sceneGraph.onXMLError("Material \"" + obj.materials[j].id + "\" does not exist.");
                            return null;
                        }
                    }
                }

                // Check minimum number of materials
                if (obj.materials.length < 1) {
                    sceneGraph.onXMLError("Need at least one material.");
                    return null;
                }
                break;
            case "texture":
                obj.texture = {
                    id: sceneGraph.parseString(tag, "id")
                };

                if(obj.texture.id == null)
                    return null;
                else if(obj.texture.id != "none" && obj.texture.id != "inherit") {

                    // Check if texture exist
                    if(!sceneGraph.textures[obj.texture.id]) {
                        sceneGraph.onXMLError("Texture \"" + obj.texture.id + "\" does not exist.");
                        return null;
                    }

                    obj.texture["length_s"] = sceneGraph.parseFloat(tag, "length_s");
                    obj.texture["length_t"] = sceneGraph.parseFloat(tag, "length_t");

                    if(obj.texture.length_s == null || obj.texture.length_t == null)
                        return null;
                }
                break;
            case "children":
                for(var j = 0; j < tag.children.length; ++j) {

                    var subtag = tag.children[j];

                    switch(subtag.nodeName) {
                        case "primitiveref":
                            obj.children.push({
                                type: "primitive",
                                id: sceneGraph.parseString(subtag, "id")
                            });

                            if(obj.children[j].id == null)
                                return null;
                            break;
                        case "componentref":
                            obj.children.push({
                                type: "component",
                                id: sceneGraph.parseString(subtag, "id")
                            });

                            if(obj.children[j].id == null)
                                return null;
                            break;
                        default:
                            sceneGraph.onXMLError("Unknown reference type.");
                            return null;
                    }
                }

                // Check minimum number of children
                if(obj.children.length < 1) {
                    sceneGraph.onXMLError("Need at least one child.");
                    return null;
                }
                break;
            default:
                sceneGraph.onXMLError("Unknown component tag.");
                return;
        }
    }

    return obj;
}