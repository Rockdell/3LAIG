
function transformationFactory(sceneGraph, element) {

    var obj = {
        id: sceneGraph.parseString(element, "id"),
        properties: []
    };

    if(obj.id == null)
        return null;
    
    // Iterate through the transformations
    for (var i = 0; i < element.children.length; ++i) {

        // We can't have references in this element
        if(element.children[i].nodeName == "transformationref") {
            this.onXMLError("Can't have references here.");
            return null;
        }

        // Simple transformation
        var transformation = sceneGraph.parseTransform(element.children[i]);

        if(transformation != null)
            obj.properties.push(transformation);
        else
            return null;
    }

    // Check minimum number of transformations
    if(obj.properties.length < 1) {
        sceneGraph.onXMLError("Need at least one transformation.");
        return null;
    }

    return obj;
}