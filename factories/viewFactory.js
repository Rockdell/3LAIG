
function viewFactory(sceneGraph, element) {

    var obj = {
        id: sceneGraph.parseString(element, "id"),
        near: sceneGraph.parseFloat(element, "near"),
        far: sceneGraph.parseFloat(element, "far")
    };

    if(obj.id == null || obj.near == null || obj.far == null)
        return null;

    // Check if near is smaller than far
    if (obj.near >= obj.far) {
        sceneGraph.onXMLError("Near value is bigger/equal than far value.");
        return null;
    }

    // Check view type
    if (element.nodeName == "perspective") {

        // Type and angle
        obj.type = "perspective";
        obj.angle = sceneGraph.parseFloat(element, "angle");

        if(obj.angle == null)
            return null;
    }
    else if (element.nodeName == "ortho") {

        // Type, left, right, top, bottom
        obj.type = "ortho";
        obj.left = sceneGraph.parseFloat(element, "left");
        obj.right = sceneGraph.parseFloat(element, "right")
        obj.top = sceneGraph.parseFloat(element, "top")
        obj.bottom = sceneGraph.parseFloat(element, "bottom")

        if(obj.left == null || obj.right == null || obj.top == null || obj.bottom == null)
            return null;
    }
    else {
        sceneGraph.onXMLError("Unknown view type.");
        return null;
    }

    // Check order of elements
    var order = ["from", "to"];
    if (sceneGraph.checkOrder(element, order) == null)
        return null;

    // Parse sub-tags
    var properties = {from: "xyz", to: "xyz"};
    if(sceneGraph.parseData(element, properties, obj) == null)
        return null;

    return obj;
}