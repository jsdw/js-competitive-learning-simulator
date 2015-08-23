//#################################
//### General Helper Functions: ###
//#################################

function averageArray(a1, a2)
	{
	if(a1.length != a2.length)
		{
		console.error("averageArray: two arrays are different lengths!");
		return false;
		}
	var r = [];
	for(var i = 0; i < a1.length; i++)
		{
		r.push((a1[i] + a2[i])/2);
		}
	return r;
	}

function euclidean(p1, p2)
	{
	if(p1.length != p2.length) return 0;
	var total = 0;
	for(var i = 0; i < p1.length; i++)
		{
		total = total + Math.pow(p1[i]-p2[i],2);
		}
	return Math.sqrt(total);
	}

function shallowCopy(object)
	{
	var o = {};
	for(var i in object)
		{
		o[i] = object[i];
		}
	return o;
	}

function deepCopy(object, c)
	{
	var o = c || {};
	for(var i in object)
		{
		if(typeof object[i] === "object")	
			{
			o[i] = (object[i] instanceof Array)? deepCopy(object[i], []) : deepCopy(object[i], {});
			}
		else o[i] = object[i];
		}
	return o;
	}

//takes child and parent constructor, and gives child parents prototype (nested) and uber function:
function extend(cChild, cParent)
	{
	var F = function() {};
	F.prototype = cParent.prototype;
	cChild.prototype = new F();
	cChild.prototype.constructor = cChild;
	cChild.uber = cParent.prototype;
	}

//#####################
//### Basic Shapes: ###
//#####################

//Generic Shape
function Shape() { }  
Shape.prototype.name = "Shape"; 
Shape.prototype.toString = function() {return this.name;};
Shape.prototype.area = 0;
Shape.prototype.getRandom = function() 
	{ 
	console.error("Error: " + this.name + " does not have a getRandom function.");
	return [0,0];
	};
Shape.prototype.boundingBox = function()
	{ 
	console.error("Error: " + this.name + " does not have a boundingBox function.");
	return { x1:0, y1:0, x2:0, y2:0 };
	};
Shape.prototype.moveTo = function()
	{
	console.error("Error: " + this.name + " does not have a moveTo function.");
	};

//Square
function Square(x, y, width, height) 
	{
	this.init(x,y,width,height);
	}
extend(Square, Shape);

Square.prototype.init = function(x,y,width,height)
	{
	if(width < 0) { x = x + width; width = Math.abs(width); }
	if(height < 0) { y = y + height; height = Math.abs(height); }
	this.x = x || 0.25;
	this.y = y || 0.25;
	this.width = width || 0.5;
	this.height = height || 0.5;
	this.area = this.width * this.height;
	}
Square.prototype.name = "Square";
Square.prototype.getRandom = function() 
	{
	var x_pos =	(Math.random() * this.width) + this.x;
	var y_pos = (Math.random() * this.height) + this.y;
	return [x_pos, y_pos];
	};
Square.prototype.inBounds = function(x1, y1)
	{
	var inbounds = false;
	if(x1 >= this.x && x1 <= this.x + this.width && y1 >= this.y && y1 <= this.y + this.height) inbounds = true;
	return inbounds;
	};
Square.prototype.distance = function(x1, y1)
	{
	return euclidean([x1,y1], [this.x + this.width/2, this.y + this.height/2]);
	};
Square.prototype.boundingBox = function()
	{
	return { x1: this.x, y1: this.y, x2: this.x+this.width, y2: this.y+this.height }
	};
Square.prototype.draw = function(config)
	{
	if(config.context != undefined)
		{
		var ctx = config.context;
		if(config.stroke) 
			{ ctx.strokeRect(this.x,this.y,this.width,this.height); }
		if(config.fill) 
			{ ctx.fillRect(this.x,this.y,this.width,this.height); }
		}
	};
Square.prototype.moveTo = function(x1, y1)
	{
	this.x = x1;
	this.y = y1;
	};

//Circle
function Circle(x, y, radius)
	{
	this.init(x,y,radius);
	}
extend(Circle, Shape);

//config: {context: ctx, stroke: bool, fill: bool}
Circle.prototype.draw = function(config)
	{
	if(config.context != undefined)
		{
		var ctx = config.context;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0,Math.PI*2, true);
		ctx.closePath();
		if(config.stroke) ctx.stroke();
		if(config.fill) ctx.fill();
		}
	};

Circle.prototype.init = function(x,y,radius)
	{
	this.x = x || 0.5;
	this.y = y || 0.5;
	this.radius = radius || 0.25;
	this.area = Math.PI * Math.pow(this.radius, 2);
	};
Circle.prototype.name = "Circle";
Circle.prototype.getRandom = function()
	{
	function R(x, y, radius)
		{
		var x_pos =	(Math.random() * radius * 2) + x - radius;
		var y_pos = (Math.random() * radius * 2) + y - radius;
		return [x_pos, y_pos];
		}
	var o = R(this.x, this.y, this.radius);

	if(euclidean(o, [this.x,this.y]) > this.radius) return this.getRandom();
	else return o;
	};
Circle.prototype.inBounds = function(x1, y1)
	{
	var inbounds = false;
	if(euclidean([x1,y1],[this.x,this.y]) <= this.radius) inbounds = true;
	return inbounds;
	};
Circle.prototype.distance = function(x1, y1)
	{
	return euclidean([x1,y1],[this.x,this.y]);
	};
Circle.prototype.boundingBox = function()
	{
	return {x1: this.x-this.radius, y1: this.y-this.radius, x2: this.x+this.radius, y2: this.y+this.radius };
	};
Circle.prototype.moveTo = function(x1, y1)
	{
	this.x = x1;
	this.y = y1;
	};

//##############################
//### Data Generator Object: ###
//##############################

function DataGenerator()
	{
	var shapes = [];
	var bounds = { x1: false, y1: false, x2: false, y2: false };

	//take in config:
	// { context: ctx, id: number, stroke: bool, fill: bool }
	this.draw = function(config)
		{
		if(config.context == undefined)
			{ console.error("DataGenerator::draw: Cannot draw shape, no context provided."); return false; }
		if(config.id == undefined)
			{
			for(var i = 0; i < shapes.length; i++)
				{
				shapes[i].draw(config);
				}
			}
		else if(config.id >= shapes.length || config.id < 0)
			{ console.error("DataGenerator::draw: Cannot draw shape as incorrect ID given"); return false; }
		else shapes[config.id].draw(config);
		return true;
		}

	function size() { return shapes.length; }

	function add(shape)
		{
		if(shape instanceof Shape)
			{
			shapes.push(shape);
			var b = shape.boundingBox();
			if(bounds.x1 === false || b.x1 < bounds.x1) bounds.x1 = b.x1;
			if(bounds.y1 === false || b.y1 < bounds.y1) bounds.y1 = b.y1;
			if(bounds.x2 === false || b.x2 > bounds.x2) bounds.x2 = b.x2;
			if(bounds.y2 === false || b.y2 > bounds.y2) bounds.y2 = b.y2;		
			return shapes.length-1;
			}
		else return false;
		}

	function calculateBounds()
		{
		var x1 = false, x2 = false, y1 = false, y2 = false;
		for(var i = 0; i < shapes.length; i++)
			{
			var b = shapes[i].boundingBox();
			if(x1 === false || b.x1 < x1) x1 = b.x1;
			if(y1 === false || b.y1 < y1) y1 = b.y1;
			if(x2 === false || b.x2 > x2) x2 = b.x2;
			if(y2 === false || b.y2 > y2) y2 = b.y2;	
			}
		bounds = { x1: x1, x2: x2, y1: y1, y2: y2 };
		}

	function remove(x)
		{
		if(x < 0 || x > shapes.length-1) return false;
		else { var a = shapes.splice(x,1); calculateBounds(); return a;}
		}
	function get(x) { return shallowCopy(shapes[x]); }

	this.getDataInBounds = function()
		{
		return [bounds.x1+(Math.random()*(bounds.x2-bounds.x1)),
					bounds.y1+(Math.random()*(bounds.y2-bounds.y1))]
		}

	this.getClosest = function(x,y)
		{
		var best_shape = false;
		var best_distance, current_distance;
		for(var i = 0; i < shapes.length; i++)
			{
			current_distance = shapes[i].distance(x,y);
			if(best_shape === false || best_distance > current_distance)
				{
				best_shape = i;
				best_distance = current_distance;
				}
			}
		return best_shape;
		}

	this.getClosestInBounds = function(x,y)
		{
		var best_id = false;
		var best_distance = 0;
		var s = [];
		for(var i = 0; i < shapes.length; i++)
			{
			if(shapes[i].inBounds(x,y)) s.push(i);
			}
		for(var i = 0; i < s.length; i++)
			{
			var d = shapes[s[i]].distance(x, y);
			if(best_id == false || d < best_distance)
				{
				best_id = s[i];
				best_distance = d;
				}
			}
		return best_id;
		}

	function move(shape, x, y)
		{
		shapes[shape].moveTo(x,y);
		}

	this.moveTo = move;
	this.getSize = size;
	this.getShape = get;
	this.addShape = add;
	this.removeShape = remove;
	}

DataGenerator.prototype.getData = function()
	{
	if(this.getSize() == 0) return false;

	var sum_area = [];
	for(var i = 0; i < this.getSize(); i++)
		{
		if(i == 0) sum_area.push(this.getShape(i).area);
		else sum_area.push(this.getShape(i).area + sum_area[i-1]);
		}
	var r = Math.random() * sum_area[sum_area.length-1];

	for(var i = 0; i < this.getSize(); i++)
		{
		if(sum_area[i] > r) return this.getShape(i).getRandom();
		}
	console.debug("something went wrong! sum_area total: " + sum_area[sum_area.length-1] + ", random no: " + r);
	return false;
	}



//###########################
//### Link between Nodes: ###
//###########################

function Link(node1_id, node2_id)
	{
	this.init(node1_id, node2_id);
	}
Link.prototype.init = function(node1_id,node2_id)
	{
	this.one = node1_id;
	this.two = node2_id;
	}
Link.prototype.isLink = function(node1_id, node2_id)
	{
	if((node1_id == this.one && node2_id == this.two) || (node2_id == this.one && node1_id == this.two)) return true;
	else return false;
	}


//#############
//### Node: ###
//#############

function Node(position)
	{
	this.init(position);
	}

Node.prototype.init = function(position)
	{
	this.position = position || [];
	this.links = [];
	}
Node.prototype.removeLink = function(id)
	{
	for(var i = 0; i < this.links.length; i++)
		{
		if(this.links[i] == id) this.links.splice(i,1);
		}
	}

//############################
//### Learning Algorithms: ###
//############################


//general config in the form of:
// { algorithm: name, nodes: number, size: [number,number...], update_constant: number, position_generator: function }
//drawing config:
//	{ node_colour: colour, node_outline_colour: colour, link_colour: colour }

function LearnerCore(configuration)
	{
	var cycles = 0;
	var config = configuration || {};
	var algorithm;

	//config variables go in here, so that specific algorithms can add to them:
	var c = {}

	function init()
		{
		c.node_count = config.nodes || 100;
		c.size = (config.size && config.size.length >= 2) ? config.size : [0,0];
		c.update_constant = (config.update_constant == undefined)? 0.05 : config.update_constant;
		c.position_generator = config.position_generator || false;

		c.node_colour = config.node_colour || "#ff4444";
		c.node_outline_colour = config.node_outline_colour || "#888888";
		c.link_colour = config.link_colour || "#888888";

		algorithm = (config.algorithm) ? eval(config.algorithm) : SelfOrganizingMap;
		algorithm.call(this);
		}
	init.call(this);

	var nodes = [];
	var links = [];
	//keep track of empty spaces in arrays so we can repopulate:
	var empty_node_spaces = [];
	var empty_link_spaces = [];

	//handy private funcs to save some effort across the algorithms:
	function size()
		{
		return nodes.length - empty_node_spaces.length;
		}

	function reset()
		{
		cycles = 0;
		nodes = [];
		links = [];
		empty_node_spaces = [];
		empty_link_spaces = [];
		}

	function randomInput()
		{
		//return input generated by position_generator if given (and valid), else just random valid input:
		var a = false;
		if(c.position_generator) 
			{
			a = c.position_generator();
			if(a.length != c.size.length) a = false;
			else
				{
				for(var i = 0; i < a.length; i++)
					{
					if(c.size[i] > 0 && a[i] > c.size[i]) { a = false; break; }
					}
				}
			}
		if(!a)
			{
			a = [];
			for(var i = 0; i < c.size.length; i++)
				{
				a.push(Math.random()*c.size[i]);
				}
			}
		return a;
		}

	function update(node,input,uc)
		{
		if(node.position.length != input.length)
			{
			console.error("Error: cannot update, as node position and input position length don't match.");
			return false;
			}
		for(var i = 0; i < node.position.length; i++)
			{
			node.position[i] = node.position[i] + uc * (input[i] - node.position[i]);
			}
		return true;
		}

	function addNode(node)
		{
		if(!node.position || !node.links || node.position.length != c.size.length) 
			{
			console.error("Node dimensionality greater than LearnerCore dimensionality. " + node.position + " " + node.links);
			return false;
			}
		var pos;
		if(empty_node_spaces.length > 0) 
			{
			var end = empty_node_spaces.length-1;
			pos = empty_node_spaces[end];
			empty_node_spaces.pop();
			}
		else 
			{
			pos = nodes.length;
			}
		node.id = pos;
		nodes[pos] = node;
		return pos;
		}

	function getLink(n1_id, n2_id)
		{
		//returns link ID if link exists, or false if it does not:
		var l1 = nodes[n1_id].links;
		var l2 = nodes[n2_id].links;
		for(var i = 0; i < l1.length; i++)
			{
			for(var j = 0; j < l2.length; j++)
				{
				if(l1[i] == l2[j]) return l1[i];
				}
			}
		return false;
		}

	function addLink(link)
		{
		if(link instanceof Link && nodes[link.one] instanceof Node && nodes[link.two] instanceof Node)
			{
			//if link already exists, return existing link id:
			var l = getLink(link.one, link.two)
			if(l !== false) return l;			

			//if it doenst, make and return a new one:
			var pos;
			if(empty_link_spaces.length > 0)
				{
				var end = empty_link_spaces.length-1;
				pos = empty_link_spaces[end];
				empty_link_spaces.pop();
				}
			else
				{
				pos = links.length;
				}
			link.id = pos;
			nodes[link.one].links.push(pos);
			nodes[link.two].links.push(pos);
			links[pos] = link;
			return pos;
			}
		else return false;
		}

	function removeNode(node_pos)
		{
		//remove any links from node, add pos to empty_node_spaces, and delete.
		var node = nodes[node_pos];
		if(typeof node === "undefined") return false;
		//remove links:
		for(var i = 0; i < node.links.length; i++)
			{
			removeLink(node.links[i]);
			}
		//remove node:
		nodes[node_pos] = undefined;
		empty_node_spaces.push(node_pos);
		return true;
		}

	function removeLink(link_pos)
		{
		var link = links[link_pos];
		if(link === undefined) return false;
		//remove from nodes:
		nodes[link.one].removeLink(link_pos);
		nodes[link.two].removeLink(link_pos);
		//dereference in links array:
		links[link_pos] = undefined;
		empty_link_spaces.push(link_pos);
		return true;
		}


	//draw the nodes and links onto the canvas element provided:
	this.draw = function(canvas)
		{
		var ctx = canvas.getContext("2d");

		//first, draw links:
		var l1,l2;
		ctx.strokeStyle = c.link_colour;
		for(var i = 0; i < links.length; i++)
			{
			if(links[i] == undefined) continue;

			ctx.beginPath();

			l1 = nodes[links[i].one].position;
			l2 = nodes[links[i].two].position;

			ctx.moveTo(l1[0],l1[1]);
			ctx.lineTo(l2[0],l2[1]);

			ctx.closePath();		
			ctx.stroke();
			}
		
		//then, draw nodes:
		var n;
		ctx.strokeStyle = c.node_outline_colour;
		ctx.fillStyle = c.node_colour;
		for(var i = 0; i < nodes.length; i++)
			{
			if(nodes[i] == undefined) continue;

			ctx.beginPath();

			n = nodes[i].position;
			ctx.arc(n[0],n[1],5,0,Math.PI*2,true);
	
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			}

		return true;
		}

	//initialise and then run K-Means:
	function KMeans()
		{
		function preInit() { return false; }
		
		function init()
			{
			//generate nodes:
			for(var i = 0; i < c.node_count; i++)
				{
				var n = new Node(randomInput());
				n.wins = 0;
				addNode(n);
				}
			}

		function a(input)
			{
			//find closest node:
			var closest_node = (function(){
				var best_distance;
				var best_index;
				var current_distance;
				for(var i = 0; i < nodes.length; i++)
					{
					current_distance = euclidean(nodes[i].position, input)
					if(!best_distance || best_distance > current_distance)
						{
						best_index = i;
						best_distance = current_distance;
						}
					}
				return best_index;
				})();
			//update it:
			var n = nodes[closest_node];
			n.wins++;
			update(n, input, 1/n.wins);
			}

		preInit.call(this);
		algorithm = function(input) { if(cycles === 0) init(); return a(input); }
		return false;
		}

	//initialise and then run Neural Gas:
	function NeuralGas()
		{
		function preInit()
			{
			//set NG specific variables from config:
			c.neighbourhood_range = 20;
			c.min_neighbourhood_range = 0;
			c.decrease_cycles = 5000;
			c.start_link_age = 5;
			c.end_link_age = 50;
			c.min_update_constant = 0;

			//get/set functions to adjust new parameters:
			this.setNeighbourhoodRange = function(input) 
				{
				if(!isNaN(input) && input >= 0) { c.neighbourhood_range = input; }
				return c.neighbourhood_range;
				}
			this.setMinNeighbourhoodRange = function(input) 
				{
				if(!isNaN(input) && input >= 0) { c.min_neighbourhood_range = input; }
				return c.min_neighbourhood_range;
				}
			this.setDecreaseCycles = function(input) 
				{
				if(!isNaN(input) && Math.floor(input) >= 0) { c.decrease_cycles = Math.floor(input); }
				return c.decrease_cycles;
				}
			this.setStartLinkAge = function(input)
				{
				if(!isNaN(input) && Math.floor(input) >= 0) { c.start_link_age = Math.floor(input); }
				}
			this.setEndLinkAge = function(input)
				{
				if(!isNaN(input) && Math.floor(input) >= 0) { c.end_link_age = Math.floor(input); }
				}
			this.setMinUpdateConstant = function(input)
				{
				if(!isNaN(input) && input >= 0 && input <= 1) { c.min_update_constant = input; }
				return c.min_update_constant;
				}
			}

		function init()
			{
			//generate nodes:
			for(var i = 0; i < c.node_count; i++)
				{
				var n = new Node(randomInput());
				addNode(n);
				}
			}

		//the algorithm:
		function a(input)
			{
			function sortNodes(a, b)
				{
				var a_distance = euclidean(a.position, input);
				var b_distance = euclidean(b.position, input);
				return a_distance - b_distance;
				}

			//create array of nodes ordered by distance from input:
			var order = nodes.slice().sort(sortNodes);

			//link them together if 2 or more, and set age to 0:
			if(order.length >= 2) 
				{				
				links[addLink(new Link(order[0].id,order[1].id))].age = 0;
				var current_max_age = (cycles <= c.decrease_cycles) ?
					c.start_link_age-((c.start_link_age-c.end_link_age)*cycles/c.decrease_cycles)
					: c.end_link_age;

				//remove any links from winner that exceed current max link age:
				for(var i = 0; i < order[0].links.length; i++)
					{
					var l = links[order[0].links[i]];
					l.age++;
					if(l.age > current_max_age) { removeLink(l.id); }
					}
				}

			//calculate current neighbourhood range to use:
			var nr = (cycles <= c.decrease_cycles) ? 
				c.neighbourhood_range-((c.neighbourhood_range-c.min_neighbourhood_range)*cycles/c.decrease_cycles)
				: c.min_neighbourhood_range;

			//calculate current update constant to use:
			var uc = (cycles <= c.decrease_cycles) ?
				c.update_constant-((c.update_constant-c.min_update_constant)*cycles/c.decrease_cycles)
				: c.min_update_constant;			

			//adapt all nodes based on their order, and this neighbourhood range:
			for(var i = 0; i < order.length; i++)
				{
				var update_proportion = (nr == 0 && i == 0)? 1 * uc : Math.exp(-i/nr) * uc;
				update(order[i], input, update_proportion);
				}
			}

		preInit.call(this);
		algorithm = function(input) { if(cycles === 0) init(); return a(input); }
		return false;
		}


	//initialise and then gun GNG algorithm:
	function GrowingNeuralGas()
		{
		function preInit()
			{
			//set specific GNG variables from config:
			c.ce_decrease = 0.01;
			c.add_node_after = 400;
			c.max_link_age = 50;
			c.linked_update_multiple = 0.05

			//get/set functions for additional variables:
			this.setCumulativeErrorDecrease = function(input)
				{
				if(!isNaN(input) && input >= 0 && input <= 1) c.ce_decrease = input;
				return c.ce_decrease;
				}
			this.setAddNodeAfter = function(input)
				{
				if(!isNaN(input) && Math.floor(input) >= 0) c.add_node_after = Math.floor(input);
				return c.add_node_after;
				}
			this.setMaxLinkAge = function(input)
				{
				if(!isNaN(input) && Math.floor(input) > 0) c.max_link_age = Math.floor(input);
				return c.max_link_age;
				}
			this.setLinkedUpdateMultiple = function(input)
				{
				if(!isNaN(input) && input >= 0) c.linked_update_multiple = input;
				return c.linked_update_multiple;
				}
			}

		//initialisation:
		function init()
			{
			//add 2 nodes at random locations, and make a link between them:
			var n;
			for(var i = 0; i < 2; i++)
				{
				n = new Node(randomInput());
				n.ce = 0;
				addNode(n);
				}
			
			var l = addLink(new Link(0,1));
			links[l].age = 0;
			}

		//algorithm:
		function a(input)
			{

			var linked_update = c.update_constant * c.linked_update_multiple;

			//get two best nodes:
			var bestnodes = (function()
				{
				var best_id;
				var best_distance;
				var secondbest_id;
				var secondbest_distance;
				var current_distance;
				for(var i = 0; i < nodes.length; i++)
					{
					if(nodes[i] == undefined) continue;

					current_distance = euclidean(nodes[i].position, input);

					if(best_id == undefined || current_distance < best_distance)
						{
						secondbest_id = best_id;
						secondbest_distance = best_distance;
						best_id = i;
						best_distance = current_distance;
						}
					else if(secondbest_id == undefined || current_distance < secondbest_distance)
						{
						secondbest_id = i;
						secondbest_distance = current_distance;
						}
					}
				return [{id: best_id, distance: best_distance},{id: secondbest_id, distance: secondbest_distance}]; 
				})();
			var b1 = bestnodes[0].id, b1_d = bestnodes[0].distance, b2 = bestnodes[1].id;

			//link them together (or get existing link) and set age to 0:
			links[addLink(new Link(b1,b2))].age = 0;


			//add to cumulative error of winner:
			nodes[b1].ce += Math.pow(b1_d,2);
			//update winner pos:
			update(nodes[b1],input,c.update_constant);

			//update linked pos and link ages, removing any links that get too old:
			for(var i = 0; i < nodes[b1].links.length; i++)
				{
				var l = links[nodes[b1].links[i]];
				var n = (l.one == nodes[b1].id)? nodes[l.two] : nodes[l.one];
				update(n,input,linked_update);
				l.age = l.age + 1;
				if(l.age > c.max_link_age) 
					{
					var node1 = nodes[l.one], node2 = nodes[l.two];
					removeLink(l.id);

					if(node1.links.length == 0) removeNode(node1.id);
					if(node2.links.length == 0) removeNode(node2.id);
					}
				}

			//add new node if we've reached add_node_after cycles:
			if(cycles != 0 && cycles % c.add_node_after == 0 && size() < c.node_count)
				{
				//get node and node linked to it with highest ce:
				var b = (function()
					{
					var best_id, best_ce, current_ce;

					for(var i = 0; i < nodes.length; i++)
						{
						if(nodes[i] == undefined) continue;
						current_ce = nodes[i].ce;
						if(current_ce > best_ce || typeof best_ce == "undefined")
							{
							best_id = i;
							best_ce = current_ce;
							}
						}


					var l = nodes[best_id].links;
					var best_linked_id, best_linked_ce, n;
					for(var i = 0; i < l.length; i++)
						{
						//get linked node:
						n = (best_id == links[l[i]].one)? nodes[links[l[i]].two] : nodes[links[l[i]].one];
						if(best_linked_ce == undefined || n.ce > best_linked_ce)
							{
							best_linked_ce = n.ce;
							best_linked_id = n.id;
							}
						}
					return [best_id, best_linked_id];
					})();

				//add new node:
				var n_id = (function()
					{
					var n1 = nodes[b[0]];
					var n2 = nodes[b[1]];
					n1.ce = n1.ce / 2;
					n2.ce = n2.ce / 2;
					removeLink(getLink(b[0], b[1]));
					var n = new Node(averageArray(n1.position, n2.position));			
					n.ce = (n1.ce + n2.ce)/2;
					var new_node_id = addNode(n);
					var l = new Link(b[0], new_node_id);
					l.age = 0;
					addLink(l);
					l = new Link(b[1], new_node_id);
					l.age = 0;
					addLink(l);
					return new_node_id;
					})();
				}

			//decrease cumulative error of each node by amount:
			for(var i = 0; i < nodes.length; i++)
				{
				if(nodes[i] == undefined) continue;
				nodes[i].ce = nodes[i].ce * (1-c.ce_decrease);
				}
			//return distance best node was from input:
			return b1_d;
			}

		preInit.call(this);
		algorithm = function(input) { if(cycles === 0) init(); return a(input); }
		return false;
		}


	//initialise and then run grow when required algorithm:
	function GrowWhenRequired()
		{
		function preInit()
			{
			c.max_link_age = 50;
			c.linked_update_multiple = 0.05;
			c.distance_threshold = 40;
			c.firing_threshold = 5;
			c.win_habit_constant = 3.33;
			c.link_habit_constant = 14.3;

			this.setMaxLinkAge = function(input)
				{
				if(!isNaN(input) && Math.floor(input) >= 0) c.max_link_age = Math.floor(input);
				return c.max_link_age;
				}
			this.setLinkedUpdateMultiple = function(input)
				{
				if(!isNaN(input) && input >= 0) c.linked_update_multiple = input;
				return c.linked_update_multiple;
				}
			this.setDistanceThreshold = function(input)
				{
				if(!isNaN(input) && input >= 0) c.distance_threshold = input;
				return c.distance_threshold;
				}
			this.setFiringThreshold = function(input)
				{
				if(!isNaN(input) && input >= 0) c.firing_threshold = input;
				return c.firing_threshold;
				}
			this.setWinHabitConstant = function(input)
				{
				if(!isNaN(input) && input >= 0) c.win_habit_constant = input;
				return c.win_habit_constant;
				}
			this.setLinkHabitConstant = function(input)
				{
				if(!isNaN(input) && input >= 0) c.link_habit_constant = input;
				return c.link_habit_constant;
				}
			}

		function init()
			{
			for(var i = 0; i < 2; i++)
				{
				n = new Node(randomInput());
				n.win_count = 0;
				addNode(n);
				}
			}

		//algorithm (based on GNG):
		function a(input)
			{
			var linked_update = c.update_constant * c.linked_update_multiple;

			//get two best nodes:
			var bestnodes = (function()
				{
				var best_id;
				var best_distance;
				var secondbest_id;
				var secondbest_distance;
				var current_distance;
				for(var i = 0; i < nodes.length; i++)
					{
					if(nodes[i] == undefined) continue;

					current_distance = euclidean(nodes[i].position, input);

					if(best_id == undefined || current_distance < best_distance)
						{
						secondbest_id = best_id;
						secondbest_distance = best_distance;
						best_id = i;
						best_distance = current_distance;
						}
					else if(secondbest_id == undefined || current_distance < secondbest_distance)
						{
						secondbest_id = i;
						secondbest_distance = current_distance;
						}
					}
				return [{id: best_id, distance: best_distance},{id: secondbest_id, distance: secondbest_distance}]; 
				})();
			var b1 = bestnodes[0].id, b1_d = bestnodes[0].distance, b2 = bestnodes[1].id;

			//link them together and set age to 0:
			links[addLink(new Link(b1,b2))].age = 0;

			//if winning node not close enough and fired too often, make a new node:
			if(b1_d > c.distance_threshold && nodes[b1].win_count >= c.firing_threshold && size() < c.node_count)
				{
				//add new node:
				(function()
					{
					removeLink(getLink(b1, b2));
					var n = new Node(averageArray(nodes[b1].position, input));
					n.win_count = 0;			
					var new_node_id = addNode(n);

					var l = new Link(b1, new_node_id);
					l.age = 0;
					addLink(l);
					l = new Link(b2, new_node_id);
					l.age = 0;
					addLink(l);
					})();
				}
			else
				{
				//train winner and links:
				function habit(wincount, constant) { return 1 - 1/1.05 * (1 - Math.exp(-1.05*wincount/constant)); }

				update(nodes[b1], input, c.update_constant * habit(nodes[b1].win_count, c.win_habit_constant));
				nodes[b1].win_count++;
				for(var i = 0; i < nodes[b1].links.length; i++)
					{
					var l = links[nodes[b1].links[i]];
					var n = (l.one == nodes[b1].id)? nodes[l.two] : nodes[l.one];
					update(n, input, linked_update * habit(n.win_count, c.link_habit_constant));
					//n.win_count = n.win_count + 1 * c.linked_update_multiple;	
					}
				}

			//add to ages of links from winner and delete nodes with no links from them:
			for(var i = 0; i < nodes[b1].links.length; i++)
				{
				var l = links[nodes[b1].links[i]];
				var n = (l.one == nodes[b1].id)? nodes[l.two] : nodes[l.one];
				l.age = l.age + 1;
				if(l.age > c.max_link_age) 
					{
					var node1 = nodes[l.one], node2 = nodes[l.two];
					removeLink(l.id);

					if(node1.links.length == 0) removeNode(node1.id);
					if(node2.links.length == 0) removeNode(node2.id);
					}
				}
			}

		preInit.call(this);
		algorithm = function(input) { if(cycles === 0) init(); return a(input); }
		return false;
		}



	//initialise and then run SOM algorithm:
	function SelfOrganizingMap()
		{
		//add variables and functions required by algorithm:
		function preInit()
			{
			//set SOM specific variables from config:
			c.neighbourhood_range = 20;
			c.decrease_cycles = 5000;
			c.min_neighbourhood_range = 0;
			c.min_update_constant = 0;
			c.node_x = 10;
			c.node_y = 10;

			//get/set functions for additional variables:
			this.setNeighbourhoodRange = function(input) 
				{
				if(!isNaN(input) && input >= 0) { c.neighbourhood_range = input; }
				return c.neighbourhood_range;
				}
			this.setMinNeighbourhoodRange = function(input) 
				{
				if(!isNaN(input) && input >= 0) { c.min_neighbourhood_range = input; }
				return c.min_neighbourhood_range;
				}
			this.setMinUpdateConstant = function(input)
				{
				if(!isNaN(input) && input >= 0 && input <= 1) { c.min_update_constant = input; }
				return c.min_update_constant;
				}
			this.setDecreaseCycles = function(input) 
				{
				if(!isNaN(input) && Math.floor(input) >= 0) { c.decrease_cycles = Math.floor(input); }
				return c.decrease_cycles;
				}
			this.setNodeX = function(input)
				{
				if(!isNaN(input) && Math.floor(input) >= 0) { c.node_x = Math.floor(input); }
				}
			this.setNodeY = function(input)
				{
				if(!isNaN(input) && Math.floor(input) >= 0) { c.node_y = Math.floor(input); }
				}
			return false;
			}

		//initialisation:
		function init()
			{
			function getFactors(number)
				{
				var halfway = Math.floor(number/2);
				var a = []
				for(var i = 1; i <= halfway; i++)
					{ if(number % i == 0) a.push(i); }
				return a;
				}
			function closestSquareFactor(number)
				{
				var a = getFactors(number);
				if(a.length > 0)
					{
					var target = Math.sqrt(number);
					var best_distance;
					var best_index;
					for(var i = 0; i < a.length; i++)
						{
						var distance = Math.abs(a[i] - target);
						if(best_distance === undefined || best_distance > distance)
							{
							best_index = i;
							best_distance = distance;
							}
						}
					var b = number/a[best_index];
					var c = a[best_index];
					if(b > c) return [b,c];
					else return [c,b];
					}
				else return [10,10];
				}

			//decide on size of node grid based on node_count:
			var size = [c.node_x, c.node_y];//closestSquareFactor(c.node_count);

			//populate grid with nodes:
			var n;
			for(var i = 0; i < size[1]; i++)
				{
				for(var j = 0; j < size[0]; j++)
					{
					//create array of random numbers with length = dimensionality of system:
					n = new Node(randomInput());
					n.gridpos = [j, i];
					addNode(n);
					}
				}

			//link all nodes together:
			for(var i = 0; i < size[1]; i++)
				{
				for(var j = 0; j < size[0]; j++)
					{
					//link to node to the right:
					if(j != size[0]-1) addLink(new Link(size[0]*i+j, size[0]*i+j+1));
					//link to node below:
					if(i != size[1]-1) addLink(new Link(size[0]*i+j, size[0]*(i+1)+j));
					//all invalid link attempts just ignored.
					}
				}
			}

		//### algorithm: ###
		function a(input)
			{
			//find closest node:
			var closest_node = (function(){
				var best_distance;
				var best_index;
				var current_distance;
				for(var i = 0; i < nodes.length; i++)
					{
					current_distance = euclidean(nodes[i].position, input)
					if(!best_distance || best_distance > current_distance)
						{
						best_index = i;
						best_distance = current_distance;
						}
					}
				return best_index;
				})();

			//calculate current neighbourhood range:
			var nr = (cycles <= c.decrease_cycles) ? 
				c.neighbourhood_range-((c.neighbourhood_range-c.min_neighbourhood_range)*cycles/c.decrease_cycles)
				: c.min_neighbourhood_range;
			//calculate current update constant:
			var uc = (cycles <= c.decrease_cycles) ?
				c.update_constant-((c.update_constant-c.min_update_constant)*cycles/c.decrease_cycles)
				: c.min_update_constant;

			//go and update each node
			if(uc != 0)
				{
				var grid_distance;
				var update_amount;
				for(var i = 0; i < nodes.length; i++)
					{
					grid_distance = euclidean(nodes[i].gridpos, nodes[closest_node].gridpos);

					if(grid_distance < nr)
						{
						//update_amount = uc * Math.pow(Math.E, -Math.pow(grid_distance,2)/nr);
						update_amount = (1 - Math.pow(grid_distance/nr,2)) * uc;
						update(nodes[i],input, update_amount);
						}
					}				
				}

			return true;
			}
		
		preInit.call(this);
		algorithm = function(input) { if(cycles === 0) init(); return a(input); }
		return false;
		}



	//we can provide any algorithm we like as needed (needs to take array of values in dimensions):
	this.input = function(input)
		{
		//validate input then pass control over to our algorithm of choice.
		if(input.length != c.size.length)
			{ 
			console.error("input has wrong number of dimensions! (" + input.length + ")");
			return false;
			}
		for(var i = 0; i < input.length; i++)
			{
			if(c.size[i] != 0 && (input[i] < 0 || input[i] > c.size[i]))
				{ console.error("input is out of bounds!"); return false; }
			}

		//call algorithm, making sure this refers to this object, and return the result (if there is one..):
		var r = algorithm(input);
		cycles++;
		return r;
		}


	//modify parameters of network after creation (take effect immediately if running):
	this.setMaxNodes = function(value)
		{
		if(!isNaN(value)) c.node_count = Math.floor(value);
		return c.node_count;
		}
	this.setUpdateConstant = function(value)
		{
		if(!isNaN(value)) c.update_constant = value;
		return c.update_constant;
		}
	this.setAlgorithm = function(value)
		{
		reset();
		algorithm = eval(value);
		algorithm.call(this);
		}

	this.getNodeCount = size;
	this.getCycles = function() { return cycles; }
	this.getLinkCount = function() { return links.length - empty_link_spaces.length; }

	this.reset = reset;
	}

















