/**
 * Schema's tag.
 * @param name Name of the tag.
 * @param required True if tag is required, false otherwise.
 */
function t(name, required = true) {
    return { 
        name: name, 
        required: required 
    };
}

/**
 * Schema's attribute.
 * @param name Name of the attribute.
 * @param type Type of the attribute.
 * @param required True if attribute is required, false otherwise.
 */
function a(name, type, required = true) {
    return { 
        name: name, 
        type: type, 
        required: required 
    };
}

/**
 * Schema's options.
 */
const opt = {
    SAVE_ID:    "id",
    SAVE_TYPE:  "type",
    SAVE_LIST:  "list",
    ORDER_TAG:  "order",
    LOG_TAG:    "log",
}

/**
 * Factory function that creates the Yas schema to be used by the parser.
 */
function makeYasSchema() {

    return {
        yas: {
            attributes: [],
            tags: [
                t("scene"), t("views"), t("ambient"), t("lights"), t("textures"), t("materials"), 
                t("transformations"), t("animations"), t("primitives"), t("components")
            ],
            options: [opt.ORDER_TAG],

            scene: {
                attributes: [a("root", "ss"), a("axis_length", "ff")],
                tags: [],
                options: [opt.LOG_TAG]
            },
            
            views: {
                attributes: [a("default", "ss")],
                tags: [t("perspective", false), t("ortho", false)],
                options: [opt.LOG_TAG],

                perspective: {
                    attributes: [a("id", "ss"), a("near", "ff"), a("far", "ff"), a("angle", "ff")],
                    tags: [t("from"), t("to")],
                    options: [opt.SAVE_ID, opt.SAVE_TYPE, opt.ORDER_TAG],
                
                    from: {
                        attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff")],
                        tags: [],
                        options: []
                    },

                    to: {
                        attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff")],
                        tags: [],
                        options: []
                    }
                },

                ortho: {
                    attributes: [
                        a("id", "ss"), a("near", "ff"), a("far", "ff"), a("left", "ff"), 
                        a("right", "ff"), a("top", "ff"), a("bottom", "ff")
                    ],
                    tags: [t("from"), t("to")],
                    options: [opt.SAVE_ID, opt.SAVE_TYPE, opt.ORDER_TAG],

                    from: {
                        attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff")],
                        tags: [],
                        options: []
                    },

                    to: {
                        attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff")],
                        tags: [],
                        options: []
                    }
                }
            },

            ambient: {
                attributes: [],
                tags: [t("ambient"), t("background")],
                options: [opt.LOG_TAG, opt.ORDER_TAG],

                ambient: {
                    attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                    tags: [],
                    options: []
                },

                background: {
                    attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                    tags: [],
                    options: []
                }
            },

            lights: {
                attributes: [],
                tags: [t("omni", false), t("spot", false)],
                options: [opt.LOG_TAG],

                omni: {
                    attributes: [a("id", "ss"), a("enabled", "tt")],
                    tags: [t("location"), t("ambient"), t("diffuse"), t("specular")],
                    options: [opt.SAVE_ID, opt.SAVE_TYPE, opt.ORDER_TAG],

                    location: {
                        attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff"), a("w", "ff")],
                        tags: [],
                        options: []
                    },

                    ambient: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    },

                    diffuse: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    },

                    specular: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    }
                },

                spot: {
                    attributes: [a("id", "ss"), a("enabled", "tt"), a("angle", "ff"), a("exponent", "ff")],
                    tags: [t("location"), t("target"), t("ambient"), t("diffuse"), t("specular")],
                    options: [opt.SAVE_ID, opt.SAVE_TYPE, opt.ORDER_TAG],

                    location: {
                        attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff"), a("w", "ff")],
                        tags: [],
                        options: []
                    },

                    target: {
                        attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff")],
                        tags: [],
                        options: []
                    },

                    ambient: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    },

                    diffuse: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    },

                    specular: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    }
                }
            },
            
            textures: {
                attributes: [],
                tags: [t("texture", false)],
                options: [opt.LOG_TAG],

                texture: {
                    attributes: [a("id", "ss"), a("file", "ss")],
                    tags: [],
                    options: [opt.SAVE_ID]
                }
            },

            materials: {
                attributes: [],
                tags: [t("material", false)],
                options: [opt.LOG_TAG],

                material: {
                    attributes: [a("id", "ss"), a("shininess", "ff")],
                    tags: [t("emission"), t("ambient"), t("diffuse"), t("specular")],
                    options: [opt.SAVE_ID, opt.ORDER_TAG],

                    emission: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    },

                    ambient: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    },

                    diffuse: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    },

                    specular: {
                        attributes: [a("r", "ff"), a("g", "ff"), a("b", "ff"), a("a", "ff")],
                        tags: [],
                        options: []
                    }
                }
            },

            transformations: {
                attributes: [],
                tags: [t("transformation", false)],
                options: [opt.LOG_TAG],

                transformation: {
                    attributes: [a("id", "ss")],
                    tags: [t("translate", false), t("rotate", false), t("scale", false)],
                    options: [opt.SAVE_ID, opt.SAVE_LIST],

                    translate: {
                        attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff")],
                        tags: [],
                        options: [opt.SAVE_TYPE]
                    },

                    rotate: {
                        attributes: [a("axis", "cc"), a("angle", "ff")],
                        tags: [],
                        options: [opt.SAVE_TYPE]
                    },

                    scale: {
                        attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff")],
                        tags: [],
                        options: [opt.SAVE_TYPE]
                    }
                }
            },

            animations: {
                attributes: [],
                tags: [t("linear", false), t("circular", false), t("arch", false)],
                options: [opt.LOG_TAG],

                linear: {
                    attributes: [a("id", "ss"), a("span", "ff")],
                    tags: [t("controlpoint", false)],
                    options: [opt.SAVE_ID, opt.SAVE_TYPE, opt.SAVE_LIST],

                    controlpoint: {
                        attributes: [a("xx", "ff"), a("yy", "ff"), a("zz", "ff")],
                        tags: [],
						options: []
                    }
                },

                circular: {
                    attributes: [
                        a("id", "ss"), a("span", "ff"), a("center", "ff ff ff"), a("radius", "ff"), 
                        a("startang", "ff"), a("rotang", "ff")
                    ],
                    tags: [],
                    options: [opt.SAVE_ID, opt.SAVE_TYPE]
                },

                arch: {
                    attributes: [
                        a("id", "ss"), a("span", "ff"), a("height", "ff"), a("xi", "ff"),
                        a("yi", "ff"), a("xf", "ff"), a("yf", "ff")
                    ],
                    tags: [],
                    options: [opt.SAVE_ID, opt.SAVE_TYPE]
                }
            },

            primitives: {
                attributes: [],
                tags: [t("primitive", false)],
                options: [opt.LOG_TAG],

                primitive: {
                    attributes: [a("id", "ss")],
                    tags: [
                        t("rectangle", false), t("triangle", false), t("cylinder", false), t("sphere", false),
                        t("torus", false), t("plane", false), t("patch", false), t("vehicle", false), t("cylinder2", false),
                        t("terrain", false), t("water", false)
                    ],
                    options: [opt.SAVE_ID, opt.SAVE_LIST],

                    rectangle: {
                        attributes: [a("x1", "ff"), a("y1", "ff"), a("x2", "ff"), a("y2", "ff")],
                        tags: [],
                        options: [opt.SAVE_TYPE]
                    },

                    triangle: {
                        attributes: [
                            a("x1", "ff"), a("y1", "ff"), a("z1", "ff"), a("x2", "ff"), a("y2", "ff"), a("z2", "ff"),
                            a("x3", "ff"), a("y3", "ff"), a("z3", "ff")
                        ],
                        tags: [],
                        options: [opt.SAVE_TYPE]
                    },

                    cylinder: {
                        attributes: [a("base", "ff"), a("top", "ff"), a("height", "ff"), a("slices", "ii"), a("stacks", "ii")],
                        tags: [],
                        options: [opt.SAVE_TYPE]
                    },

                    sphere: {
                        attributes: [a("radius", "ff"), a("slices", "ii"), a("stacks", "ii")],
                        tags: [],
                        options: [opt.SAVE_TYPE]
                    },

                    torus: {
                        attributes: [a("inner", "ff"), a("outer", "ff"), a("slices", "ii"), a("loops", "ii")],
                        tags: [],
                        options: [opt.SAVE_TYPE]
                    },
                    
					plane: {
                        attributes: [a("npartsU", "ii"), a("npartsV", "ii")],
                        tags: [],
						options: [opt.SAVE_TYPE]
                    },
                    
					patch: {
                        attributes: [a("npointsU", "ii"), a("npointsV", "ii"), a("npartsU", "ii"), a("npartsV", "ii")],
                        tags: [t("controlpoint", false)],
                        options: [opt.SAVE_TYPE, opt.SAVE_LIST],
                        
						controlpoint: {
                            attributes: [a("xx", "ff"), a("yy", "ff"), a("zz", "ff")],
                            tags: [],
							options: []
						}
                    },
                    
					vehicle: {
                        attributes: [],
                        tags: [],
						options: [opt.SAVE_TYPE]
                    },
                    
					cylinder2: {
                        attributes: [a("base", "ff"), a("top", "ff"), a("height", "ff"), a("slices", "ii"), a("stacks", "ii")],
                        tags: [],
						options: [opt.SAVE_TYPE]
                    },
                    
					terrain: {
                        attributes: [a("idtexture", "ss"), a("idheightmap", "ss"), a("parts", "ii"), a("heightscale", "ff")],
                        tags: [],
						options: [opt.SAVE_TYPE]
                    },
                    
					water: {
						attributes: [
                            a("idtexture", "ss"), a("idwavemap", "ss"), a("parts", "ii"),
                            a("heightscale", "ff"), a("texscale", "ff")
                        ],
                        tags: [],
						options: [opt.SAVE_TYPE]
                    }
                }
            },

            components: {
                attributes: [],
                tags: [t("component", false)],
                options: [opt.LOG_TAG],

                component: {
                    attributes: [a("id", "ss")],
                    tags: [t("transformation"), t("animations", false), t("materials"), t("texture"), t("children")],
                    options: [opt.SAVE_ID],

                    transformation: {
                        attributes: [],
                        tags: [t("transformationref", false), t("translate", false), t("rotate", false), t("scale", false)],
                        options: [opt.SAVE_LIST],

                        transformationref: {
                            attributes: [a("id", "ss")],
                            tags: [],
                            options: [opt.SAVE_TYPE]
                        },

                        translate: {
                            attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff")],
                            tags: [],
                            options: [opt.SAVE_TYPE]
                        },

                        rotate: {
                            attributes: [a("axis", "cc"), a("angle", "ff")],
                            tags: [],
                            options: [opt.SAVE_TYPE]
                        },

                        scale: {
                            attributes: [a("x", "ff"), a("y", "ff"), a("z", "ff")],
                            tags: [],
                            options: [opt.SAVE_TYPE]
                        }
                    },
                    
					animations: {
                        attributes: [],
                        tags: [t("animationref", false)],
                        options: [opt.SAVE_LIST],
                        
						animationref: {
                            attributes: [a("id", "ss")],
                            tags: [],
							options: []
						}
                    },
                    
                    materials: {
                        attributes: [],
                        tags: [t("material", false)],
                        options: [opt.SAVE_LIST],

                        material: {
                            attributes: [a("id", "ss")],
                            tags: [],
                            options: []
                        }
                    },

                    texture: {
                        attributes: [a("id", "ss"), a("length_s", "ff", false), a("length_t", "ff", false)],
                        tags: [],
                        options: []
                    },

                    children: {
                        attributes: [],
                        tags: [t("componentref", false), t("primitiveref", false)],
                        options: [],

                        componentref: {
                            attributes: [a("id", "ss")],
                            tags: [],
                            options: [opt.SAVE_ID, opt.SAVE_TYPE]
                        },

                        primitiveref: {
                            attributes: [a("id", "ss")],
                            tags: [],
                            options: [opt.SAVE_ID, opt.SAVE_TYPE]
                        }
                    }
                }
            }
        }
    }
}