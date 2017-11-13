if(!cc)
	throw "No Modloader Found!";
document.body.addEventListener('modsLoaded', function () {
	var net;
	var usingFallback = false;

	if(window.require)
		net = require('net');

	function connect(){
		var livesplit = net.connect({port: 12346});
		livesplit.on('connect', function(data){
			console.log("[timer] connected to livesplit")
			usingFallback = false;
			
			var started = false;
			
			var maps = [];
			var settings = [];
			
			require("fs").readFile("assets/mods/timer/settings.json", 'utf8', function(err, data){
				if(err)
					console.error(err);
				
				settings = JSON.parse(data);
				console.log("[timer] Settings loaded");
			});
			
			
			cc.ig.gameMain.original_loadMap_timer = cc.ig.gameMain[cc.ig.varNames.gameMainLoadMap];
			cc.ig.gameMain[cc.ig.varNames.gameMainLoadMap] = function(data){ 
				if(!usingFallback){
					started = true;
					livesplit.write("1\n");
				}
					
				cc.ig.gameMain.original_loadMap_timer.apply(cc.ig.gameMain, arguments);
			};
			
			function update() {
				if(started)
					checkSplits();
				
				var t = cc.sc.stats.getStat("player", "playtime");
				if(!t)
					return;
				livesplit.write("3");
				livesplit.write(t.toString());
				livesplit.write("\n");
			}
			
			function sendSplit() {
				livesplit.write("2\n");
			}
			
			function checkSplits() {
				var result = false;
				
				for(var i = 0; i < settings.length; i++){
					if(settings[i].type === "loadmap"){
						var map = cc.ig.getMapName();
						if(map === settings[i].name){
							if(!settings[i].once || maps.indexOf(map) < 0){
								sendSplit();
								maps.push(map);
							}
						}
					}
				}
				
				//if(!spl0 && cc.ig.getMapName() === "hideout.path-1")
				//	result = spl0 = true;
				
				if(result)
					sendSplit();
			}
			
			if(window.simplify !== undefined)
				simplify.registerUpdate(update);
			else
				document.body.addEventListener('modsLoaded', function () {
					simplify.registerUpdate(update);
				});
			
		});
		livesplit.on('disconnect', function(){
			connect();
		});


		livesplit.on('error', fallback);
	}

	function fallback(data) {
		
		setTimeout(function(){
			connect();
		}, 1000);
		
		if(usingFallback)
			return;
		
		console.log("[timer] using fallback")
		usingFallback = true;
		
		var timer = document.createElement("h1");
		timer.style.position = "fixed";
		timer.style.left = "10px";
		timer.style.bottom = "10px";
		timer.style.color = "white";
		timer.style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
		timer.style.zIndex = "2147483647";
		timer.style.pointerEvents = "none";
		document.body.appendChild(timer);

		function update(){
			var t = cc.sc.stats.getStat("player", "playtime");
			if(!t)
				return timer.innerHTML  = "";
			var hour =  parseInt(t / 60 / 60);
			var min = parseInt(t / 60) - hour * 60;
			var sec = Math.floor((t - (min + hour * 60) * 60 ) * 1000) / 1000;
			if(hour <= 0)
				timer.innerHTML = min + ((sec < 10) ? ":0": ":") + sec;
			else
				timer.innerHTML = hour + ((min < 9) ? ":0": ":") + min + ((sec < 10) ? ":0": ":") + sec;
		}
		if(window.simplify !== undefined)
			simplify.registerUpdate(update);
		else
			document.body.addEventListener('modsLoaded', function () {
				simplify.registerUpdate(update);
			});
	}

	if(window.require)
		connect();
	else
		fallback();
});