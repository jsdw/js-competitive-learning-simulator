	var d = new DataGenerator();
	var getData = function(){return d.getData.call(d)};
	var config = {update_constant: 0.05, min_neighbourhood_range: 0.1, size: [0,0], algorithm: "SelfOrganizingMap", position_generator: getData};
	var l = new LearnerCore(config);

	var n_c, i_c, s_c, p, i_c_ctx, s_c_ctx;

	var input_interval = false;
	var play_interval = false;
	var speed = 1;

	//called every time canvas size is changed (and on window load). re-sets everything canvas related:
	function resetCanvas()
		{
		n_c = $("#node-canvas").get(0);
		i_c = $("#input-canvas").get(0);
		s_c = $("#shape-canvas").get(0);
		p = $("#node-canvas").position();

		i_c_ctx = i_c.getContext("2d");
		s_c_ctx = s_c.getContext("2d");

		i_c_ctx.lineWidth = 3;
		s_c_ctx.fillStyle = "#ffffff";
		s_c_ctx.globalAlpha = 0.75;

		d.draw({context: s_c_ctx, fill: true});
		if(l) l.draw(n_c);
		}

	function clearCanvas(canvas)
		{
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0,0,canvas.width,canvas.height);
		}

	function outputStats()
		{
		$("#stats #cycles .value").html(l.getCycles());
		$("#stats #nodes .value").html(l.getNodeCount());
		$("#stats #links .value").html(l.getLinkCount());
		}

	function playButton()
		{			
		$(".button.left").removeClass("selected");
		$("#play-button").addClass("selected");

		if(!play_interval)
			{
			function play()
				{
				for(var j = 0; j < speed; j++) 
					{ l.input(d.getData()); }
				//draw nodes:
				clearCanvas(n_c);
				l.draw(n_c);
				//output stats:
				outputStats();
				}
			if(d.getSize() > 0) play_interval = setInterval(play, 40);
			else setTimeout(function() {$("#play-button").removeClass("selected"); $("#pause-button").addClass("selected");}, 250);
			}
		}

	function pauseButton()
		{
		$(".button.left").removeClass("selected");
		$("#pause-button").addClass("selected");

		clearInterval(play_interval);
		play_interval = false;
		}

	function restartButton()
		{
		$(".button.left").removeClass("selected");
		$("#restart-button").addClass("selected");
		setTimeout(function() {$("#restart-button").removeClass("selected");}, 250);
		clearInterval(play_interval);
		play_interval = false;
		clearCanvas(n_c);
		l.reset();
		outputStats();
		}

	function shapeDrag()
		{
		clearCanvas(i_c);
		$("body").css("cursor", "default")
		$(".button.right").removeClass("selected");
		$("#shape-drag").addClass("selected");	
		$("#input-canvas").off(".button");

		var c = false;
		//on mousemove over canvas, find closest shape and draw around it in red.
		function closest(e)
			{
			c = d.getClosestInBounds(e.pageX - p.left, e.pageY - p.top); //make func return false if point not within any shape.
			clearCanvas(i_c);
			if(c !== false)
				{
				$("body").css("cursor", "move");
				i_c_ctx.strokeStyle = "#4444ff";
				d.draw({context: i_c_ctx, id: c, stroke: true, fill: false} );
				}
			else $("body").css("cursor", "default");
			}
		if(d.getSize() > 0) 
			{
			$("#input-canvas").on("mousemove.button", function(e) 
				{
				closest(e);
				});
			$("#input-canvas").one("mousedown.button", function(e) 
				{
				//turn off opject selecting mousemove:
				$("#input-canvas").off("mousemove.button");

				if(c !== false)
					{
					//find out mouse location relative to shape:
					var cs = d.getShape(c);
					var offset_x = e.pageX - cs.x, offset_y = e.pageY - cs.y;

					function drag(e)
						{
						e.preventDefault();
						clearCanvas(i_c);
						d.moveTo(c, e.pageX - offset_x, e.pageY - offset_y);
						clearCanvas(s_c);
						d.draw({context: i_c_ctx, id: c, stroke: true, fill: false} );
						d.draw({context: s_c_ctx, fill: true});
						}
					$("#input-canvas").on("mousemove.button", function(e) {drag(e)});
					}
				});

			$("#input-canvas").one("mouseup.button", function() 
				{
				//call function again, and reset cursor incase it somehow wasn't:
				$("body").css("cursor", "default");
				shapeDrag();
				});
			}

		}

	function shapeSquare()
		{
		$("body").css("cursor", "default");
		clearCanvas(i_c);
		$(".button.right").removeClass("selected");
		$("#shape-square").addClass("selected");	

		//first remove any other events:
		$("#input-canvas").off(".button");

		var left;
		var top;
		var width;
		var height;
		$("#input-canvas").one("mousedown.button", function(e) 
			{
			if(e.which == 1)
				{
				//start setInterval which draws shape outline to input-canvas based on mouse coords from this and current ones.
				//get mouse coords.
				left = e.pageX - p.left;
				top = e.pageY - p.top;
		
				function drawing(e)
					{
					$("body").css("cursor", "crosshair");
					clearCanvas(i_c);		
					i_c_ctx.strokeStyle = "#99ff99";
					width = e.pageX-p.left-left;
					height = e.pageY-p.top-top;
					if((width > 5 || width < -5) && (height > 5 || height < -5))
						{
						i_c_ctx.beginPath();
						i_c_ctx.strokeRect(left,top,width,height);
						i_c_ctx.stroke();
						}
					}
				$("#input-canvas").on("mousemove.button", function(e) {drawing(e)});
				}
			else shapeSquare();
			});
		$("#input-canvas").one("mouseup.button", function() 
			{
			$("body").css("cursor", "default");
			clearCanvas(i_c);
			if((width > 5 || width < -5) && (height > 5 || height < -5))
				{
				d.addShape(new Square(left,top,width,height));
				d.draw({id: d.getSize()-1, context: s_c_ctx, fill: true});
				}
			//draw shape in data thing.
			//stop setinterval.
			$("#input-canvas").off("mousemove");
			shapeSquare();
			});
		}

	function shapeCircle()
		{
		$("body").css("cursor", "default");
		clearCanvas(i_c);
		$(".button.right").removeClass("selected");
		$("#shape-circle").addClass("selected");	

		//first remove any other events:
		$("#input-canvas").off(".button");

		var radius;
		var left;
		var top;
		$("#input-canvas").one("mousedown.button", function(e) 
			{
			if(e.which == 1)
				{
				//start setInterval which draws shape outline to input-canvas based on mouse coords from this and current ones.
				//get mouse coords.
				left = e.pageX - p.left;
				top = e.pageY - p.top;
		
				function drawing(e)
					{
					$("body").css("cursor", "crosshair");
					clearCanvas(i_c);		
					i_c_ctx.strokeStyle = "#99ff99";
					i_c_ctx.beginPath();
					radius = euclidean([left, top], [e.pageX-p.left,e.pageY-p.top]);
					if(radius > 5)
						{
						i_c_ctx.arc(left, top, radius, 0,Math.PI*2, true);
						i_c_ctx.closePath();
						i_c_ctx.stroke();
						}
					}
				$("#input-canvas").on("mousemove.button", function(e) {drawing(e)});
				}
			else shapeCircle();
			});
		$("#input-canvas").one("mouseup.button", function() 
			{
			$("body").css("cursor", "default");
			clearCanvas(i_c);
			if(radius > 5)
				{
				d.addShape(new Circle(left,top,radius));
				d.draw({id: d.getSize()-1, context: s_c_ctx, fill: true});
				}
			//draw shape in data thing.
			//stop setinterval.
			$("#input-canvas").off(".button");
			shapeCircle();
			});
		}

	function removeShape()
		{
		$("body").css("cursor", "default");
		clearCanvas(i_c);
		$(".button.right").removeClass("selected");
		$("#shape-remove").addClass("selected");	

		//first remove any other events:
		$("#input-canvas").off(".button");

		var c;
		//on mousemove over canvas, find closest shape and draw around it in red.
		function closest(e)
			{
			c = d.getClosest(e.pageX - p.left, e.pageY - p.top);
			clearCanvas(i_c);
			i_c_ctx.strokeStyle = "#ff4444";
			d.draw({context: i_c_ctx, id: c, stroke: true, fill: false} );
			}
		if(d.getSize() > 0) 
			{
			$("#input-canvas").on("mousemove.button", function(e) 
				{
				closest(e);
				});
			$("#input-canvas").one("mousedown.button", function() 
				{
				clearCanvas(s_c);
				clearCanvas(i_c);
				d.removeShape(c);
				if(d.getSize() == 0) pauseButton();
				d.draw({context: s_c_ctx, fill: true});
				$("#input-canvas").off(".button");
				removeShape();
				});
			}
		}

	//called whenever the window resizes (or is loaded)..
	function canvasResize()
		{
		var w = $(window).width();
		var h = $(window).height();

		if(w < 800) w = 800;
		if(h < 500) h = 500;

		$("#shape-canvas").attr("width", w);
		$("#input-canvas").attr("width", w);
		$("#node-canvas").attr("width", w);
	
		$("#shape-canvas").attr("height", h);
		$("#input-canvas").attr("height", h);
		$("#node-canvas").attr("height", h);

		resetCanvas();
		}

	function setSpeed(value)
		{
		//set speed to value.
		speed = value;
		}

	//###options setup: ###
	var algorithms = 
		{
		"K-Means":{a:"KMeans", as: "km",
			description:"Nodes are kept in the average position of all of the prior inputs that they have been closest too."
			},
		"Self Organizing Map":{a:"SelfOrganizingMap", as:"som", selected:true,
			description:"A grid of nodes is created, of size Nodes (x) by Nodes (y). Each time an input is seen, the closest node and all those within the neighbourhood range in terms of this grid are moved towards it (each node is 1 unit away from those adjacent to it in the grid). The neighbourhood range decreases from Neighbour Start to Neighbour End after the number of cycles specified in Decrease Cycles has elapsed, causing less and less nodes to be updated over time."
			},
		"Neural Gas with CHL":{a:"NeuralGas", as:"ng",
			description:"Each time an input is seen, nodes are ranked in order from closest to furthest away, and moved toward the input in proportion to this rank. As a result, nodes closer to the input are moved towards it more, whereas nodes further away are moved towards it less. Links are created between nodes as part of the CHL (Competitive Hebbian Learning) rule, but they do not influence anything."
			},
		"Growing Neural Gas":{a:"GrowingNeuralGas", as:"gng",
		description:"This algorithm uses the same CHL algorithm as Neural Gas to create links between nodes. Each time an input is seen, the closest node and the closest of the nodes linked to this node are moved towards it. Links enimating from the closest node age, and those that grow older than Max Link Age are deleted. Any nodes without any links are also deleted. New nodes are added every New Node After number of cycles based on positions of the input space that are under represented (which is tracked by the cumulative error of nodes)."	
		},
		"Grow When Required":{a:"GrowWhenRequired", as:"gwr",
		description:"This algorithm adds new nodes each time an input is seen too far away from any existing nodes, given that the closest existing node has won more times than Firing Threshold."
		}
		};

	var sliders = 
		[
			{
			name:"Speed",
			algorithm:"ignore",
			description:"Sets the running speed of the simulation",
			min:1,
			max:100,
			start:10,
			func:"setSpeed"
			},
			{
			name:"Distance Threshold",
			algorithm:"gwr",
			description:"The distance threshold controls how far away an input can be from a node before it triggers the creation of a new node",
			min:0,
			max:1000,
			start:50,
			func:"l.setDistanceThreshold"
			},
			{
			name:"Update Constant",
			algorithm:"som ng gng gwr",
			description:"The update constant influences how quickly the winning node is moved towards the input position",
			min:0,
			max:1,
			start:0.05,
			step:0.01,
			func:"l.setUpdateConstant"
			},
			{
			name:"End Update Constant",
			algorithm:"som ng",
			description:"Sets the final update constant (as it decreases slowly over the number of cycles selected in 'Decrease Cycles'",
			min:0,
			max:1,
			start:0.005,
			step:0.001,
			func:"l.setMinUpdateConstant"
			},
			{
			name:"Linked Multiple",
			algorithm:"gwr gng",
			description:"Updates nodes linked to the winner by this multiple of the update constant",
			min:0,
			max:1,
			start:0.005,
			step:0.01,
			func:"l.setLinkedUpdateMultiple"
			},
			{
			name:"Nodes",
			algorithm:"km ng gng gwr",
			description:"Sets the maximum number of nodes that the algorithm is allowed to use",
			min:1,
			max:1000,
			start:100,
			func:"l.setMaxNodes"
			},
			{
			name:"Nodes (x)",
			algorithm:"som",
			description:"Sets the number of nodes in the x dimension of the grid",
			min:1,
			max:100,
			start:10,
			func:"l.setNodeX"
			},
			{
			name:"Nodes (y)",
			algorithm:"som",
			description:"Sets the number of nodes in the y dimension of the grid",
			min:1,
			max:50,
			start:10,
			func:"l.setNodeY"
			},
			{
			name:"New Node After",
			algorithm:"gng",
			description:"Sets the number of cycles that elapse before a new node is added",
			min:1,
			max:5000,
			start:500,
			func:"l.setAddNodeAfter"
			},
			{
			name:"Decrease Cycles",
			algorithm:"som gng",
			description:"Sets the number of cycles taken to decrease the update constant and neighbourhood range",
			min:0,
			max:100000,
			start:5000,
			step:100,
			func:"l.setDecreaseCycles"
			},
			{
			name:"Neighbour Start",
			algorithm:"som ng",
			description:"Sets the starting neighbourhood range",
			min:0,
			max:500,
			start:20,
			func:"l.setNeighbourhoodRange"
			},
			{
			name:"Neighbour End",
			algorithm:"som ng",
			description:"Sets the final neighbourhood range",
			min:0,
			max:500,
			start:0,
			step:0.5,
			func:"l.setMinNeighbourhoodRange"
			},
			{
			name:"Start Link Age",
			algorithm:"ng",
			description:"Sets the maximum age of links to begin with",
			min:0,
			max:200,
			start:5,
			func:"l.setStartLinkAge"
			},
			{
			name:"End Link Age",
			algorithm:"ng",
			description:"Sets the maximum age of links to after the number of cycles specified in 'Decrease Cycles' has elapsed",
			min:0,
			max:200,
			start:50,
			func:"l.setEndLinkAge"
			},
			{
			name:"Max Link Age",
			algorithm:"gng gwr",
			description:"Sets the maximum age of links",
			min:1,
			max:200,
			start:50,
			func:"l.setMaxLinkAge"
			},
			{
			name:"Cumulative Decrease",
			algorithm:"gng",
			description:"Sets the speed at which the cumulative error of each node decreases over time",
			min:0,
			max:1,
			start:0.01,
			step:0.005,
			func:"l.setCumulativeErrorDecrease"
			},
			{
			name:"Firing Threshold",
			algorithm:"gwr",
			description:"The firing threshold determines how many times a node can win before it is deemed to have adapted enough to be well positioned.",
			min:0,
			max:100,
			start:50,
			func:"l.setFiringThreshold"
			},
			{
			name:"Winner Habituation",
			algorithm:"gwr",
			description:"A constant which determines how the win count influences winner node updating",
			min:1,
			max:100,
			start:3.3,
			step:0.1,
			func:"l.setWinHabitConstant"
			},
			{
			name:"Linked Habituation",
			algorithm:"gwr",
			description:"A constant which determines how the win count influences linked nodes updating",
			min:1,
			max:100,
			start:14.3,
			step:0.1,
			func:"l.setLinkHabitConstant"
			}
		];

	function getSliderHTML(id)
		{
		var d = "<div class='option " + sliders[id].algorithm + "' id='" + id + "'><div class='option-title' title='"+ sliders[id].description +"'><h4>"+sliders[id].name+"</h4></div><div class='slider'></div><div class='value'></div></div>";
		return d;
		}
	function getSelectionHTML()
		{
		var d = "<div class='option ignore' id='algorithm'><div class='option-title' title='Select the learning algorithm that you wish to see in action'><h4>Algorithm</h4></div><select>";
		for (var i in algorithms)
			{
			var t = "";
			if(typeof algorithms[i].description !== "undefined") t = algorithms[i].description;
			if(typeof algorithms[i].selected !== "undefined" && algorithms[i].selected == true)
				{d = d + "<option selected='selected' title='"+t+"'>";}
			else d = d + "<option title='"+t+"'>";
			d = d + i + "</option>";
			}
		d = d + "</delect></div>";
		return d;
		}

	function addOptionHTML()
		{
		var d = $("#option-container");
		d.append(getSliderHTML(0));
		d.append(getSelectionHTML());
		for (var i = 1; i < sliders.length; i++)
			{
			d.append(getSliderHTML(i));
			}
		}

	function addSlider(slider_id)
		{
		var id = parseInt(slider_id);
		if(id >= sliders.length)
			{
			console.warn("addSlider called with slider id " + id + ", which doesnt exist.");
			return false;
			}

		var options = {};
		options.range = "min";
		options.min = sliders[id].min;
		options.max = sliders[id].max;
		options.value = sliders[id].start;
		options.step = (typeof sliders[id].step === "undefined")? 1 : sliders[id].step;
		var func = eval(sliders[id].func);
		if(typeof func === "undefined")
			{
			console.error("addSlider called on slider: " + id + ", but function " + sliders[id].func + " is not valid.");
			return false;
			}

		var f = function(event,ui) 
			{ $("#" + id + " .value").html(ui.value); func(ui.value); }
		options.slide = f;
		options.change = f;
		$("#" + id + " .slider").slider(options);
		$("#" + id + " .value").html(options.value);
		func(options.value);
		}

	function removeSlider(optionbox)
		{
		$(optionbox).find(" .slider").slider("destroy");
		}

	function changeAlgorithm()
		{
		var text = $("#algorithm select option:selected").text();
		var a = algorithms[text].a;
		var as = algorithms[text].as;

		restartButton();
		l.setAlgorithm(a);

		//fade out div's and remove sliders not required:
		$(".option:not(." + as + ", .all, .ignore)").slideUp(250).each(function() 
			{
			var $slider = $(this).children(".slider");
			if($slider.data().uiSlider) $slider.slider("destroy");
			});

		//switch statement to fade in div for required controls and add sliders if necessary:
		$(".option." + as + ", .option.all").each(function() 
			{
			var s = $(this).attr("id");
			addSlider(s);
			});
		$(".option." + as).slideDown(250);

		}



	//###################################################################
	$(document).ready(function() {

	//prevent dragging from selecting stuff:
	document.onselectstart = function () { return false; };

	addOptionHTML(); // adds the options in.
	addSlider(0);
	canvasResize();

	//hide everything initially before we changeAlgorithm() to decide which sliders to show:
	$(".option:not(.all, .ignore)").css("display", "none");

	changeAlgorithm(); //because in firefox, selected option in drop down box seems to persist after refresh.

	//### permanent action bindings: ###
	$("#options-box").draggable({ handle: "#options-top", cursor: "move" });
	$("#play-button").on("click", playButton);
	$("#pause-button").on("click", pauseButton);
	$("#restart-button").on("click", restartButton);
	$("#shape-drag").on("click", shapeDrag);
	$("#shape-circle").on("click", shapeCircle);
	$("#shape-square").on("click", shapeSquare);
	$("#shape-remove").on("click", removeShape);
	$(window).resize(canvasResize);
	
	$("#algorithm select").on("change", function() {changeAlgorithm()});
	
	$("#minimise-button").on("click", function()
		{
		var $this = $(this);
		if($this.hasClass("up"))
			{
			$this.removeClass("up");
			$("#option-container").slideDown(400);
			}
		else
			{
			$this.addClass("up");
			$("#option-container").slideUp(400);
			}
		});
	

	});
