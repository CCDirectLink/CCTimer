if(!cc)
	throw "No Modloader Found!";

var net = require('net');

var livesplit = net.connect({port: 12346});
livesplit.on('connect', function(data){
	var started = false;
	var spl0 = false;
	
	function update() {
		if(!started && cc.ig.getMapName() === "hideout.entrance") {
			started = true;
			livesplit.write("1\n");
		}
		
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



livesplit.on('error', function(data) {
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
});