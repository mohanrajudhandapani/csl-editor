"use strict";

CSLEDIT = CSLEDIT || {};

CSLEDIT.SimpleTreeView = function (treeView) {
	var thisElement,
		nodeTypes = {
				"valid_children" : [ "root" ],
				"types" : {
					"text" : {
						"icon" : {
							"image" : "../external/famfamfam-icons/style.png"
						}
					},
					"macro" : {
						"icon" : {
							"image" : "../external/famfamfam-icons/brick.png"
						}
					},
					"info" : {
						"icon" : {
							"image" : "../external/famfamfam-icons/information.png"
						}
					},
					"choose" : {
						"icon" : {
							"image" : "../external/fugue-icons/question-white.png"
						}
					},
					"date" : {
						"icon" : {
							"image" : "../external/famfamfam-icons/date.png"
						}
					},
					"style" : {
						"icon" : {
							"image" : "../external/famfamfam-icons/cog.png"
						}
					},
					"citation" : {
						"icon" : {
							"image" : "../external/famfamfam-icons/page_white_edit.png"
						}
					},
					"bibliography" : {
						"icon" : {
							"image" : "../external/famfamfam-icons/text_list_numbers.png"
						}
					},
					"sort" : {
						"icon" : {
							"image" : "../external/fugue-icons/sort-alphabet.png"
						}
					},
					"number" : {
						"icon" : {
							"image" : "../external/fugue-icons/edit-number.png"
						}
					},
					"layout" : {
						"icon" : {
							"image" : "../external/famfamfam-icons/page_white_stack.png"
						}
					},
					"group" : {
						"icon" : {
							"image" : "../external/famfamfam-icons/page_white_stack.png"
						}
					}
				}
			};

	var createFromCslData = function (cslData, callbacks) {
		var eventName,
			jsTreeData,
			citationNodeId,
			citationNodeData,
			citationTree;

		treeView.html(
				'<h3>Style Info<\/h3>' +
				'<div id="simpleTreeView"><\/div>' +
				'<div id="styleSettings"><\/div>' +
				'<div id="styleInfoTree"><\/div>' +
				'<h3>Inline Citations<\/h3>' +
				'<div id="citationTree"><\/div>' +
				'<h3>Bibliography<\/h3>' +
				'<div id="bibliographyTree"><\/div>');

		thisElement = treeView.children("#simpleTreeView");
		citationTree = treeView.children("#citationTree");

		assertEqual(thisElement.length, 1);
		assertEqual(citationTree.length, 1);

		jsTreeData = jsTreeDataFromCslData(cslData);
		citationNodeId = CSLEDIT.data.getFirstCslId(cslData, "citation");
		citationNodeData = CSLEDIT.data.getNode(citationNodeId);
		console.log("citation node id = " + citationNodeId);

		thisElement.on("loaded.jstree", callbacks.loaded);
		thisElement.on("select_node.jstree", callbacks.selectNode);

		thisElement.jstree({
			"json_data" : { data : [ jsTreeData ] },
			"types" : nodeTypes,
			"plugins" : ["themes","json_data","ui", "crrm", "dnd", /*"contextmenu",*/
				"types", "hotkeys"],
			// each plugin you have included can have its own config object
			//"core" : { "initially_open" : [ "node1" ] },
			"ui" : { /*"initially_select" : [ "cslTreeNode0" ],*/ "select_limit" : 1 },
			"dnd" : {
				/*
				"drop_target" : false,
				"drag_target" : function () {alert("drag!");},
				"drop_finish" : function () {alert("drop!");},
				"drag_finish" : function () {alert("drop!");},*/
				"open_timeout" : 800,
				"move_requested" : callbacks.moveNode
			},
			"crrm" : {
				"move" : {
					// only allow re-ordering, not moving to different nodes
					"check_move" : function (move) {

						return callbacks.checkMove(parseInt(move.o.attr("cslid")), parseInt(move.r.attr("cslid")), move.p);
					}
				}
			},
			"hotkeys" : {
				"del" : callbacks.deleteNode,
				"f2" : false
			}
			
		});
		console.log("creating citation tree");
		citationTree.jstree({
			"json_data" : { data : [ jsTreeDataFromCslData(citationNodeData) ] },
			"types" : nodeTypes,
			"plugins" : ["themes","json_data","ui", "crrm", "dnd", /*"contextmenu",*/
				"types", "hotkeys"],
			// each plugin you have included can have its own config object
			//"core" : { "initially_open" : [ "node1" ] },
			"ui" : { /*"initially_select" : [ "cslTreeNode0" ],*/ "select_limit" : 1 },
			"dnd" : {
				/*
				"drop_target" : false,
				"drag_target" : function () {alert("drag!");},
				"drop_finish" : function () {alert("drop!");},
				"drag_finish" : function () {alert("drop!");},*/
				"open_timeout" : 800,
				"move_requested" : callbacks.moveNode
			},
			"crrm" : {
				"move" : {
					// only allow re-ordering, not moving to different nodes
					"check_move" : function (move) {

						return callbacks.checkMove(parseInt(move.o.attr("cslid")), parseInt(move.r.attr("cslid")), move.p);
					}
				}
			},
			"hotkeys" : {
				"del" : callbacks.deleteNode,
				"f2" : false
			}
			
		});
	};

	var addNode = function (id, position, newNode) {
		var parentNode;
		console.log("adding to node " + id);
		parentNode = thisElement.find('li[cslid="' + id + '"]');
		assertEqual(parentNode.length, 1);

		thisElement.jstree('create_node', parentNode, position,
		{
			"data" : displayNameFromMetadata(newNode),
			"attr" : { "rel" : newNode.name, "cslid" : -1 },
			"children" : []
		});

		// sort the cslids
		var allNodes;
		allNodes = thisElement.find('li[cslid]');

		assert(allNodes.length > 1);

		allNodes.each(function (index) {
			var oldId = parseInt($(this).attr('cslid'));

			if (oldId === -1) {
				$(this).attr('cslid', id + position + 1);
			} else if (oldId > id + position) {
				$(this).attr('cslid', oldId + 1);
			}

			// TODO: remove when confident that this always holds,
			//       if it doesn't, need to alter deleteNode
			assertEqual(parseInt($(this).attr('cslid')), index);
		});
	};

	var deleteNode = function (id) {
		var node = thisElement.find('li[cslid="' + id + '"]');
		assertEqual(node.length, 1);
		assert(id !== 0);

		thisElement.jstree("remove", node);

		// sort the cslids
		var allNodes;
		allNodes = thisElement.find('li[cslid]');
		assert(allNodes.length > 0);
		allNodes.each(function (index) {
			$(this).attr('cslid', index);
		});
	};

	var ammendNode = function (id, ammendedNode) {
		var node = thisElement.find('li[cslid="' + id + '"]');
		thisElement.jstree('rename_node', node, displayNameFromMetadata(ammendedNode));
	};

	var moveNode = function (fromId, toId, position) {
		var fromNode = thisElement.find('li[cslid="' + fromId + '"]'),
			toNode = thisElement.find('li[cslid="' + toId + '"]');

		assertEqual(fromNode.length, 1);
		assertEqual(toNode.length, 1);

		console.log("CslTreeView.moveNode: " + fromId + " to " + toId + ", position: " + position);
		console.log("CslTreeView.moveNode: " + thisElement.jstree("get_text", fromNode) + " to " + thisElement.jstree("get_text", toNode));
		thisElement.jstree('move_node', fromNode, toNode, position, false, false, true);
		
		// sort the cslids
		var allNodes;
		allNodes = thisElement.find('li[cslid]');
		assert(allNodes.length > 0);
		allNodes.each(function (index) {
			$(this).attr('cslid', index);
		});
	};

	var selectNode = function (id) {
		thisElement.find('li[cslid=' + id + '] > a').click();
	};

	var selectedNode = function () {
		var selected,
			cslid;
		
		selected = thisElement.jstree('get_selected'),
		cslid = parseInt(selected.attr("cslid"));
		console.log("selected cslid = " + cslid);
		return cslid;
	};

	var expandNode = function (id) {
		thisElement.jstree("open_node", 'li[cslid=' + id + ']');
	};

	var jsTreeDataFromCslData = function (cslData) {
		var jsTreeData = jsTreeDataFromCslData_inner(cslData);

		// make root node open
		jsTreeData["state"] = "open";

		return jsTreeData;
	};

	var jsTreeDataFromCslData_inner = function (cslData) {
		var index;
		var children = [];

		for (index = 0; index < cslData.children.length; index++) {
			children.push(jsTreeDataFromCslData_inner(cslData.children[index]));
		}

		var jsTreeData = {
			data : displayNameFromMetadata(cslData),
			attr : {
				rel : cslData.name,
				cslid : cslData.cslId //,
				//id : "cslTreeNode" + cslData.cslId
			},
			// TODO: remove this
			/*metadata : {
				name : cslData.name,
				attributes: cslData.attributes,
				cslId : cslData.cslId,
				textValue : cslData.textValue
			},*/
			children : children
		};

		return jsTreeData;
	};

	var getAttr = function (attribute, attributes) {
		var index;

		for (index = 0; index < attributes.length; index++) {
			if (attributes[index].enabled && attributes[index].key === attribute) {
				return attributes[index].value;
			}
		}
		return "";
	};

	var displayNameFromMetadata = function (metadata) {
		var index,
			attributesString = "",
			attributesStringList = [],
			displayName,
			macro;

		switch (metadata.name) {
			case "macro":
				displayName = "Macro: " + getAttr("name", metadata.attributes);
				break;
			case "text":
				macro = getAttr("macro", metadata.attributes);
				if (macro !== "") {
					displayName = "Text (macro): " + macro;
				} else {
					displayName = "Text";
				}
				break;
			case "citation":
				displayName = "Inline Citations";
				break;
			case "bibliography":
				displayName = "Bibliography";
				break;
			default:
				displayName = metadata.name;
		}

		return displayName;
	};

	// public:
	return {
		createFromCslData : createFromCslData,

		addNode : addNode,
		deleteNode : deleteNode,
		moveNode : moveNode,
		ammendNode : ammendNode,

		selectNode : selectNode,
		selectedNode : selectedNode,

		expandNode : expandNode
		//,jQueryElement : treeView
	}
};

