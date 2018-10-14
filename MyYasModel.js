
function makeYasStructure() {

    let structure = {
        yas: {
            attributes: [],
            children: ["scene", "views", "ambient", "lights", "textures", "materials", "transformations", "primitives", "components"],
            options: ["order"],
            scene: {
                attributes: [["root", "ss"], ["axis_length", "ff"]],
                children: [],
                options: ["log"]
            },
            views: {
                attributes: [["default", "ss"]],
                children: [],
                options: ["log"],
                perspective: {
                    attributes: [["id", "ss"], ["near", "ff"], ["far", "ff"], ["angle", "ff"]],
                    children: ["from", "to"],
                    options: ["id", "order", "type"],
                    from: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        children: [],
                        options: []
                    },
                    to: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        children: [],
                        options: []
                    }
                },
                ortho: {
                    attributes: [["id", "ss"], ["near", "ff"], ["far", "ff"], ["left", "ff"], ["right", "ff"], ["top", "ff"], ["bottom", "ff"]],
                    children: ["from", "to"],
                    options: ["id", "order", "type"],
                    from: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        children: [],
                        options: []
                    },
                    to: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        children: [],
                        options: []
                    }
                }
            },
            ambient: {
                attributes: [],
                children: ["ambient", "background"],
                options: ["order", "log"],
                ambient: {
                    attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                    children: [],
                    options: []
                },
                background: {
                    attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                    children: [],
                    options: []
                }
            },
            lights: {
                attributes: [],
                children: [],
                options: ["log"],
                omni: {
                    attributes: [["id", "ss"], ["enabled", "tt"]],
                    children: ["location", "ambient", "diffuse", "specular"],
                    options: ["id", "order", "type"],
                    location: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"], ["w", "ff"]],
                        children: [],
                        options: []
                    },
                    ambient: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    },
                    diffuse: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    },
                    specular: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    }
                },
                spot: {
                    attributes: [["id", "ss"], ["enabled", "tt"], ["angle", "ff"], ["exponent", "ff"]],
                    children: ["location", "target", "ambient", "diffuse", "specular"],
                    options: ["id", "order", "type"],
                    location: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"], ["w", "ff"]],
                        children: [],
                        options: []
                    },
                    target: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        children: [],
                        options: []
                    },
                    ambient: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    },
                    diffuse: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    },
                    specular: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    }
                }
            },
            textures: {
                attributes: [],
                children: [],
                options: ["log"],
                texture: {
                    attributes: [["id", "ss"], ["file", "ss"]],
                    children: [],
                    options: ["id"]
                }
            },
            materials: {
                attributes: [],
                children: [],
                options: ["log"],
                material: {
                    attributes: [["id", "ss"], ["shininess", "ff"]],
                    children: ["emission", "ambient", "diffuse", "specular"],
                    options: ["id", "order"],
                    emission: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    },
                    ambient: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    },
                    diffuse: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    },
                    specular: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        children: [],
                        options: []
                    }
                }
            },
            transformations: {
                attributes: [],
                children: [],
                options: ["log"],
                transformation: {
                    attributes: [["id", "ss"]],
                    children: [],
                    options: ["id", "list"],
                    translate: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        children: [],
                        options: ["type"]
                    },
                    rotate: {
                        attributes: [["axis", "cc"], ["angle", "ff"]],
                        children: [],
                        options: ["type"]
                    },
                    scale: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        children: [],
                        options: ["type"]
                    }
                }
            },
            primitives: {
                attributes: [],
                children: [],
                options: ["log"],
                primitive: {
                    attributes: [["id", "ss"]],
                    children: [],
                    options: ["id", "list"],
                    rectangle: {
                        attributes: [["x1", "ff"], ["y1", "ff"], ["x2", "ff"], ["y2", "ff"]],
                        children: [],
                        options: ["type"]
                    },
                    triangle: {
                        attributes: [["x1", "ff"], ["y1", "ff"], ["z1", "ff"], ["x2", "ff"], ["y2", "ff"], ["z2", "ff"], ["x3", "ff"], ["y3", "ff"], ["z3", "ff"]],
                        children: [],
                        options: ["type"]
                    },
                    cylinder: {
                        attributes: [["base", "ff"], ["top", "ff"], ["height", "ff"], ["slices", "ii"], ["stacks", "ii"]],
                        children: [],
                        options: ["type"]
                    },
                    sphere: {
                        attributes: [["radius", "ff"], ["slices", "ii"], ["stacks", "ii"]],
                        children: [],
                        options: ["type"]
                    },
                    torus: {
                        attributes: [["inner", "ff"], ["outer", "ff"], ["slices", "ii"], ["loops", "ii"]],
                        children: [],
                        options: ["type"]
                    }
                }
            },
            components: {
                attributes: [],
                children: [],
                options: ["log"],
                component: {
                    attributes: [["id", "ss"]],
                    children: [],
                    options: ["id"],
                    transformation: {
                        attributes: [],
                        children: [],
                        options: ["list"],
                        transformationref: {
                            attributes: [["id", "ss"]],
                            children: [],
                            options: ["type"]
                        },
                        translate: {
                            attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                            children: [],
                            options: ["type"]
                        },
                        rotate: {
                            attributes: [["axis", "cc"], ["angle", "ff"]],
                            children: [],
                            options: ["type"]
                        },
                        scale: {
                            attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                            children: [],
                            options: ["type"]
                        }
                    },
                    materials: {
                        attributes: [],
                        children: [],
                        options: ["list"],
                        material: {
                            attributes: [["id", "ss"]],
                            children: [],
                            options: ["id"]
                        }
                    },
                    texture: {
                        attributes: [["id", "ss"], ["length_s", "ff"], ["length_t", "ff"]],
                        children: [],
                        options: []
                    },
                    children: {
                        attributes: [],
                        children: [],
                        options: [],
                        componentref: {
                            attributes: [["id", "ss"]],
                            children: [],
                            options: ["id", "type"]
                        },
                        primitiveref: {
                            attributes: [["id", "ss"]],
                            children: [],
                            options: ["id", "type"]
                        }
                    }
                }
            }
        }
    }

    return structure;
}