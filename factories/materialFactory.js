
function materialFactory(sceneGraph, element) {

    var obj = {
        id: sceneGraph.parseString(element, "id"),
        shininess: sceneGraph.parseString(element, "shininess")
    };

    if(obj.id == null || obj.shininess == null) 
        return null;
    
    // Check order of elements
    var order = ["emission", "ambient", "diffuse", "specular"];
    if(sceneGraph.checkOrder(element, order) == null)
        return null;

    // ParseData
    var properties = {emission: "rgba", ambient: "rgba", diffuse: "rgba", specular: "rgba"};
    if(sceneGraph.parseData(element, properties, obj) == null)
        return null;

    return obj;
}