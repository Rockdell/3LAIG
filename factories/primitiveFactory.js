
function primitiveFactory(sceneGraph, element) {

    var obj = {
        id: sceneGraph.parseString(element, "id"),
        type: element.children[0].nodeName,
        args: {}
    };

    if(obj.id == null)
        return null;

    // Check type
    switch(obj.type) {
        case "rectangle":
        case "triangle":
        case "cylinder":
        case "sphere":
        case "torus":
            break;
        default:
            sceneGraph.onXMLError("Unknown primitive type.");
            return null;
    }

    // Check if element only has one primitive
    if (element.children.length != 1) {
        sceneGraph.onXMLError("Too many/few primitives declared.");
        return null;
    }

    // Parse attributes
    for(var i = 0; i < element.children[0].attributes.length; ++i) {

        var attribute = element.children[0].attributes[i].name;

        if((obj.args[attribute] = sceneGraph.parseFloat(element.children[0], attribute)) == null)
            return null;       
    }

    return obj;
}