let cont = document.getElementById("container");
let can=document.createElement("canvas");
can.style.background="#000000";
can.id="screen";
cont.appendChild(can);
Settings.CanInput=false;

const s = document.createElement("script");
s.src="https://fireyauto.github.io/javascript-game/bgame_main.js";
document.body.appendChild(s);
