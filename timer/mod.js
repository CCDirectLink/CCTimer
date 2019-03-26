if(!cc)
	throw "No Modloader Found!";
document.body.addEventListener('simplifyInitialized', function () {
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

			function checkCondition(setting) {
				switch(setting.type){
					case "loadmap":
						const map = cc.ig.getMapName();
						if(map === setting.name){
							return [true, setting.one];
						}
						break;
					case "eventtriggered":
						if(ig.vars.get(setting.name) == setting.value){
							return [true, setting.one];
						}
						break;
					case "combined":
						const conds = setting.conditions;
						if (conds.length === 0) {
							return [true, true]
						}
						
						for (let i = 0; i < conds.length; i++) {
							const [split, once] = checkCondition(conds[i]);
							if (!split) {
								return [false, false];
							}

							if (once) {
								conds.splice(i, 1);
								i--;
							}
						}


						if (conds.length === 0) {
							return [true, true];
						}
						return [true, setting.once]
				}
				return [false, false];
			}
			
			function checkSplits() {
				var result = false;
				
				for(var i = 0; i < settings.length; i++){
					const [split, once] = checkCondition(settings[i]);
					if (split) {
						sendSplit();
					}
					if (once) {
						settings.splice(i, 1);
						i--;
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


	ig.lang.labels.sc.gui.options['dontResetTimerOnDeath'] = {name: 'Don\'t reset timer on death', description: 'Don\'t reset timer on death. \\c[1]WARNING: This will affect the actual IGT!'};
	ig.lang.labels.sc.gui.options['printEvents'] = {name: 'Print all events', description: 'Print all possible events that can be split on. Use "Log level: Default"'};
	ig.lang.labels.sc.gui.options.headers['ccTimer'] = 'CCTimer';
	simplify.options.addEntry('dontResetTimerOnDeath', 'CHECKBOX', true, 0, undefined, true, 'ccTimer');
	simplify.options.addEntry('printEvents', 'CHECKBOX', false, 0, undefined, true);
	
	const originalSet = ig.vars.set;
	ig.vars.set = function(path, value) {
		if (sc.options.get('printEvents') && value !== ig.vars.get(path))
			console.log('event', path, '=', value);
		originalSet.call(this, path, value);
	}

	const originalLoad = cc.ig.gameMain[entries.gameMainLoadMap];
	cc.ig.gameMain[entries.gameMainLoadMap] = function(data){
		const result = originalLoad.apply(cc.ig.gameMain, arguments);
		
		if (sc.options.get('printEvents'))
			console.log('loadmap', 'Entered map', cc.ig.getMapName());

		return result;
	};

	let stats = cc.sc.stats[entries.values];
	Object.defineProperty(cc.sc.stats, entries.values, {
		get: () => stats,
		set: val => {
			if(sc.options.get('dontResetTimerOnDeath') && stats && stats.player && stats.player.playtime && val && val.player && val.player.playtime) 
				val.player.playtime = stats.player.playtime;
			stats = val;
	}});

	if(window.require)
		connect();
	else
		fallback();
});