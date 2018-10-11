
function lightFactory(sceneGraph, element) {
    
    var obj = {
        id: sceneGraph.parseString(element, "id"),
        enabled: sceneGraph.parseBool(element, "enabled")
    };

    if(obj.id == null || obj.enabled == null)
        return null;

    var order;
    var properties;

    // Check type
    if (element.nodeName == "omni") {

        obj.type = "omni";

        order = ["location", "ambient", "diffuse", "specular"];
        properties = {location: "xyz", ambient: "rgba", ambient: "rgba", diffuse: "rgba", specular: "rgba"};   
    }
    else if(element.nodeName == "spot") {

        obj.type = "spot";
    
        order = ["location", "target", "ambient", "diffuse", "specular"];
        properties = {location: "xyz", target: "xyz", ambient: "rgba", ambient: "rgba", diffuse: "rgba", specular: "rgba"};
    }
    else {
        sceneGraph.onXMLError("Unknown light type.");
        return null;
    }

    // Check order of elements
    if(sceneGraph.checkOrder(element, order) == null)
        return null;

    // Parse data
    if(sceneGraph.parseData(element, properties, obj) == null)
        return null;

    return obj;
}