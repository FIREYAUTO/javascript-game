//{{ Object Globals }}\\

function Assign(Source,Target){
	for(let Key in Target){
		Source[Key] = Target[Key];	
	}
}

//{{ Math Globals }}\\

Assign(Math,{
	rad:x=>x*(Math.PI/180),
	deg:x=>x*(180/Math.PI),
	clamp:(x,m,M)=>Math.max(Math.min(x,M),m),
	lerp:(a,b,t)=>(1-t)*a+t*b,
	angleCheck:(a,m,M)=>a>=m&&a<=M?a:(a%(M-m))+m,
	angleOverflowCheck:(a,d)=>((Math.abs(d-a)>180&&(d>a?a+=360:d+=360)),[a,d]),
});

//{{ Functions }}\\

async function Wait(t=1){
	return await new Promise(r=>setTimeout(r,t*1000));	
}

function GetTime(){
	return Date.now()/1000;
}

function GetMousePosition(Event){
	let Rect = Event.target.getBoundingClientRect();
    return {
    	x:Event.clientX-Rect.left,
        y:Event.clientY-Rect.top,
    };
}

function GetElement(Id){
	return document.getElementById(Id);
}

//{{ Noise Library (Not Mine, https://github.com/joeiddon/perlin/blob/master/perlin.js) }}\\

let perlin = {
    rand_vect: function(){
        let theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    },
    dot_prod_grid: function(x, y, vx, vy){
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect();
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    },
    smootherstep: function(x){
        return 6*x**5 - 15*x**4 + 10*x**3;
    },
    interp: function(x, a, b){
        return a + this.smootherstep(x) * (b-a);
    },
    seed: function(){
        this.gradients = {};
        this.memory = {};
    },
    get: function(x, y) {
        if (this.memory.hasOwnProperty([x,y]))
            return this.memory[[x,y]];
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid(x, y, xf,   yf);
        let tr = this.dot_prod_grid(x, y, xf+1, yf);
        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        let v = this.interp(y-yf, xt, xb);
        this.memory[[x,y]] = v;
        return v;
    }
}
perlin.seed();

Math.noise = function(...Arguments){
	return perlin.get(...Arguments);
}

//{{ Listener Class }}\\

class Listener {
	constructor(VC=[]){
		let _VC={};
		this._VC=_VC;
		for(let v of VC)
				_VC[v]=[];
	}
	on(Name,Call){
		this._VC[Name].push(Call);	
	}
	fire(Name,...a){
		for(let v of this._VC[Name])
				v(...a);
	}
}

//{{ Vector Classes }}\\

class BaseVector {
	constructor(MathProperties=[]){let self=this;self._MathProperties=MathProperties;for(let Name of MathProperties)Object.defineProperty(self,Name.toUpperCase(),{get:()=>self[Name],set:v=>self[Name]=v})}
	_mathOp(v,cl,a=[]){let mp=this._MathProperties,p=[],c=this.constructor,is=v instanceof c;for(let n of mp)p.push(cl(this[n],is?v[n]:v,...a));return new c(...p)}
	Add(v){return this._mathOp(v,(a,b)=>a+b)}
	Sub(v){return this._mathOp(v,(a,b)=>a-b)}
	Mul(v){return this._mathOp(v,(a,b)=>a*b)}
	Div(v){return this._mathOp(v,(a,b)=>a/b)}
	Mod(v){return this._mathOp(v,(a,b)=>a%b)}
	Pow(v){return this._mathOp(v,(a,b)=>a**b)}
	Lerp(v,t){return this._mathOp(v,(a,b,t)=>Math.lerp(a,b,t),t)}
	Eqs(v){let mp=this._MathProperties,c=this.constructor;if(!(v instanceof c))return false;for(let n of mp)if(this[n]!=v[n])return false;return true}
	Floor(){return this._mathOp(this,(a,b)=>Math.floor(a))}
	Ceil(){return this._mathOp(this,(a,b)=>Math.ceil(a))}
	Round(){return this._mathOp(this,(a,b)=>Math.round(a))}
	toString(){return this._MathProperties.map(x=>this[x]).join(",")}
}

class Vector extends BaseVector {
	constructor(x=0,y=0){super(["x","y"]);Assign(this,{x,y})}
	get Magnitude(){return Math.sqrt((this.x**2)+(this.y**2))}
	Normalize(){return this.Div(this.Magnitude)}
}

class UIVector extends BaseVector {
	constructor(sx=0,ox=0,sy=0,oy=0){super(["sx","ox","sy","oy"]);Assign(this,{sx,ox,sy,oy})}
}
