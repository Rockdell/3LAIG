
class MyNode {

    constructor(component) {
        this.component = component;
        this.parent = null;
        this.children = [];
    }

    setParent(parent) {
        if(this.parent == null)
            this.parent = parent;
    }

    /**
     * Adds child node to parent
     * @param {Child node} child 
     */
    addChild(child) {
        this.children.push(child);
    }
}

class MyTreeGraph {

    constructor() {
        this.root = null;
        this.nodes = new Map();
    }

    /**
     * Add node to graph
     * @param {Component to add} component 
     */
    addNode(component) {
        var node = new MyNode(component);
        this.nodes.set(component.id, node);
    }

    /**
     * Add edge between nodes
     * @param
     */
    addEdge(parent, child) {

        // Set parent->child relation
        this.nodes.get(parent).addChild(child);

        // Set child->parent relation
        this.nodes.get(child).setParent(parent);
    }
}