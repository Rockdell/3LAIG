
/**
 * Factory function that creates the Yas structure to be used by the parser.
 */
function makeYasStructure() {

    return {
        yas: {
            attributes: [],
            tags: ["scene", "views", "ambient", "lights", "textures", "materials", "transformations", "animations", "primitives", "components"],
            options: ["order"],
            scene: {
                attributes: [["root", "ss"], ["axis_length", "ff"]],
                options: ["log"]
            },
            views: {
                attributes: [["default", "ss"]],
                options: ["log"],
                perspective: {
                    attributes: [["id", "ss"], ["near", "ff"], ["far", "ff"], ["angle", "ff"]],
                    tags: ["from", "to"],
                    options: ["id", "order", "type"],
                    from: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        options: []
                    },
                    to: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        options: []
                    }
                },
                ortho: {
                    attributes: [["id", "ss"], ["near", "ff"], ["far", "ff"], ["left", "ff"], ["right", "ff"], ["top", "ff"], ["bottom", "ff"]],
                    tags: ["from", "to"],
                    options: ["id", "order", "type"],
                    from: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        options: []
                    },
                    to: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        options: []
                    }
                }
            },
            ambient: {
                attributes: [],
                tags: ["ambient", "background"],
                options: ["order", "log"],
                ambient: {
                    attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                    options: []
                },
                background: {
                    attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                    options: []
                }
            },
            lights: {
                attributes: [],
                options: ["log"],
                omni: {
                    attributes: [["id", "ss"], ["enabled", "tt"]],
                    tags: ["location", "ambient", "diffuse", "specular"],
                    options: ["id", "order", "type"],
                    location: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"], ["w", "ff"]],
                        options: []
                    },
                    ambient: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    },
                    diffuse: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    },
                    specular: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    }
                },
                spot: {
                    attributes: [["id", "ss"], ["enabled", "tt"], ["angle", "ff"], ["exponent", "ff"]],
                    tags: ["location", "target", "ambient", "diffuse", "specular"],
                    options: ["id", "order", "type"],
                    location: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"], ["w", "ff"]],
                        options: []
                    },
                    target: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        options: []
                    },
                    ambient: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    },
                    diffuse: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    },
                    specular: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    }
                }
            },
            textures: {
                attributes: [],
                options: ["log"],
                texture: {
                    attributes: [["id", "ss"], ["file", "ss"]],
                    options: ["id"]
                }
            },
            materials: {
                attributes: [],
                options: ["log"],
                material: {
                    attributes: [["id", "ss"], ["shininess", "ff"]],
                    tags: ["emission", "ambient", "diffuse", "specular"],
                    options: ["id", "order"],
                    emission: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    },
                    ambient: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    },
                    diffuse: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    },
                    specular: {
                        attributes: [["r", "ff"], ["g", "ff"], ["b", "ff"], ["a", "ff"]],
                        options: []
                    }
                }
            },
            transformations: {
                attributes: [],
                options: ["log"],
                transformation: {
                    attributes: [["id", "ss"]],
                    options: ["id", "list"],
                    translate: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        options: ["type"]
                    },
                    rotate: {
                        attributes: [["axis", "cc"], ["angle", "ff"]],
                        options: ["type"]
                    },
                    scale: {
                        attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                        options: ["type"]
                    }
                }
            },
            animations: {
                attributes: [],
                options: ["log"],
                linear: {
                    attributes: [["id", "ss"], ["span", "ff"]],
                    options: ["id", "type", "list"],
                    controlpoint: {
						attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
						options: []
                    }
                },
                circular: {
					// TODO change xyz
                    attributes: [["id", "ss"], ["span", "ff"], ["x", "ff"], ["y", "ff"], ["z", "ff"], ["radius", "ff"], ["startang", "ff"], ["rotang", "ff"]],
                    options: ["id", "type"]
                }
            },
            primitives: {
                attributes: [],
                options: ["log"],
                primitive: {	
                    attributes: [["id", "ss"]],
                    options: ["id", "list"],
                    rectangle: {
                        attributes: [["x1", "ff"], ["y1", "ff"], ["x2", "ff"], ["y2", "ff"]],
                        options: ["type"]
                    },
                    triangle: {
                        attributes: [["x1", "ff"], ["y1", "ff"], ["z1", "ff"], ["x2", "ff"], ["y2", "ff"], ["z2", "ff"], ["x3", "ff"], ["y3", "ff"], ["z3", "ff"]],
                        options: ["type"]
                    },
                    cylinder: {
                        attributes: [["base", "ff"], ["top", "ff"], ["height", "ff"], ["slices", "ii"], ["stacks", "ii"]],
                        options: ["type"]
                    },
                    sphere: {
                        attributes: [["radius", "ff"], ["slices", "ii"], ["stacks", "ii"]],
                        options: ["type"]
                    },
                    torus: {
                        attributes: [["inner", "ff"], ["outer", "ff"], ["slices", "ii"], ["loops", "ii"]],
                        options: ["type"]
					},
					plane: {
						attributes: [["npartsU", "ii"], ["npartsV", "ii"]],
						options: ["type"]
					},
					patch: {
						attributes: [["npointsU", "ii"], ["npointsV", "ii"], ["npartsU", "ii"], ["npartsV", "ii"]],
						options: ["type", "list"],
						controlpoint: {
							attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
							options: []
						}
					},
					vehicle: {
						attributes: [],
						options: ["type"]
					},
					cylinder2: {
						attributes: [["base", "ff"], ["top", "ff"], ["height", "ff"], ["slices", "ii"], ["stacks", "ii"]],
						options: ["type"]
					},
					terrain: {
						attributes: [["idtexture", "ss"], ["idheightmap", "ss"], ["parts", "ii"], ["heightscale", "ff"]],
						options: ["type"]
					},
					water: {
						attributes: [["idtexture", "ss"], ["idwavemap", "ss"], ["parts", "ii"], ["heightscale", "ff"], ["texscale", "ff"]],
						options: ["type"]
					}
                }
            },
            components: {
                attributes: [],
                options: ["log"],
                component: {
                    attributes: [["id", "ss"]],
                    tags: ["transformation", "animations", "materials", "texture", "components"],
                    options: ["id"],
                    transformation: {
                        attributes: [],
                        options: ["list"],
                        transformationref: {
                            attributes: [["id", "ss"]],
                            options: ["type"]
                        },
                        translate: {
                            attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                            options: ["type"]
                        },
                        rotate: {
                            attributes: [["axis", "cc"], ["angle", "ff"]],
                            options: ["type"]
                        },
                        scale: {
                            attributes: [["x", "ff"], ["y", "ff"], ["z", "ff"]],
                            options: ["type"]
                        }
					},
					animations: {
						attributes: [],
						options: ["list"],
						animationref: {
							attributes: [["id", "ss"]],
							options: []
						}
					},
                    materials: {
                        attributes: [],
                        options: ["list"],
                        material: {
                            attributes: [["id", "ss"]],
                            options: []
                        }
                    },
                    texture: {
                        attributes: [["id", "ss"], ["length_s", "ff", "#"], ["length_t", "ff", "#"]],
                        options: []
                    },
                    children: {
                        attributes: [],
                        options: [],
                        componentref: {
                            attributes: [["id", "ss"]],
                            options: ["id", "type"]
                        },
                        primitiveref: {
                            attributes: [["id", "ss"]],
                            options: ["id", "type"]
                        }
                    }
                }
            }
        }
    }
}