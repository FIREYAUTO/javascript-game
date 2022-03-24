let con=document.getElementById("container"),
  can=document.createElement("canvas");
can.style.background="#000000";
can.id="screen";
con.appendChild(can);
Settings.CanInput=false;

let xml = new XMLHttpRequest();
xml.open("get","https://fireyauto.github.io/javascript-game/bgame_main.js",false);
xml.send();
(()=>{eval(xml.response);})();
