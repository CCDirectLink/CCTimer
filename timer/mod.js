if(!cc)
	throw "No Modloader Found!";

var timer = document.createElement("h1");
timer.style.position = "fixed";
timer.style.left = "10px";
timer.style.bottom = "10px";
timer.style.color = "white";
timer.style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
timer.style.zIndex = "2147483647";
timer.style.pointerEvents = "none";
document.body.appendChild(timer);

document.body.addEventListener('modsLoaded', function () {
	simplify.registerUpdate(function(){
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
	});
});