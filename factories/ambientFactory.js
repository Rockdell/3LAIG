
function ambientFactory(sceneGraph, element) {

    var obj = {};

    // Check order of elements
    var order = ["ambient", "background"];
    if (sceneGraph.checkOrder(element, order) == null)
        return null;

    var properties = {ambient: "rgba", background: "rgba"};
    if(sceneGraph.parseData(element, properties, obj) == null)
        return null;

    return obj
}