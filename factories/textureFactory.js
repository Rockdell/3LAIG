
const textureFactory = function(sceneGraph, element) {
    
    var obj = {
        id: sceneGraph.parseString(element, "id"),
        file: sceneGraph.parseString(element, "file")
    };

    if(obj.id == null || obj.file == null)
        return null;

    return obj;
}