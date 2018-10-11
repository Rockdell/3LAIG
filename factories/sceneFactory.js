
function sceneFactory(sceneGraph, element) {

    var obj = {
        root: sceneGraph.parseString(element, "root"),
        axis_length: sceneGraph.parseFloat(element, "axis_length")
    };

    if(obj.root == null || obj.axis_length == null)
        return null;
        
    return obj;
};