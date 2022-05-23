//{{ Symbols }}\\

const Symbols = {
	render:Symbol("render"),
};

//{{ Color }}\\

class Color {
	constructor(r=0,g=0,b=0){
		this.r=r,this.g=g,this.b=b;	
	}
	toString(){
		return `rgb(${this.r},${this.g},${this.b},${1-(this.a||0)})`;	
	}
	static from(c){
		let r=0,g=0,b=0;
		if(c.match(/#[A-F0-9a-f]+/)){
			r=parseInt(c.match(/(?<=#)[A-F0-9a-f]{2}/),16),
				g=parseInt(c.match(/(?<=#[A-F0-9a-f]{2})[A-F0-9a-f]{2}/),16),
				b=parseInt(c.match(/(?<=#[A-F0-9a-f]{4})[A-F0-9a-f]{2}/),16);
		}else if(c.match(/rgb\(/)){
			r=parseInt(c.match(/(?<=rgb\()\d+(?=,)/)),
				g=parseInt(c.match(/(?<=rgb\(\d+,)\d+(?=,)/)),
				b=parseInt(c.match(/(?<=,)\d+(?=\))/));
		}
		return new Color(r,g,b);
	}
}

//{{ Collection }}\\

class Collection {
	constructor(){
		this.Data = [];
	}
	//{{ Collection Methods }}\\
	get length(){
		return this.Data.length;	
	}
	insert(x,at){
		return this.Data.splice(at,0,x);	
	}
	has(x){
		return this.Data.includes(x);	
	}
	pop(){
		return this.Data.pop();	
	}
	push(x){
		return this.Data.push(x);	
	}
	remove(x){
		return	this.Data.splice(this.Data.indexOf(x),1);
	}
	removeAt(x){
		return this.Data.splice(x,1);	
	}
	each(x){
		let self=this;
		return this.Data.forEach((v,k)=>x(v,k,self));	
	}
	//{{ Collection Iterator }}\\
	*Iterable(){
		yield* this.Data;
	}
	[Symbol.iterator](){
		return this.Iterable();	
	}
}

//{{ Layer Manager }}\\

const LayerManager = {
	Layers:{},
	LayerCache:[],
	new(Name,Priority){
		this.Layers[Name]={Priority,Collection:new Collection()};	
	},
	getRaw(Name){
		return this.Layers[Name];
	},
	get(Name){
		return this.getRaw(Name).Collection;	
	},
	generateCache(){
		this.LayerCache=Object.values(this.Layers).sort((a,b)=>
a.Priority>b.Priority?1:a.Priority<b.Priority?-1:0).map(x=>x.Collection);
	},
	each(x){
		let self=this;
		return this.LayerCache.forEach((v,k)=>x(v,k,self));
	},
};

//{{ Screen }}\\

const Screen = {
	canvas:undefined,
	context:undefined,
	setCanvas(x){
		if(x instanceof Element)this.canvas=x;
		else this.canvas=document.querySelector(x);
		this.context=this.canvas.getContext("2d");
		this.width=this.height=100;
		this.handleSize();
	},
	handleSize(){
		this.canvas.style.width=`${this.canvas.width=this.width}px`;
		this.canvas.style.height=`${this.canvas.height=this.height}px`;
	},
	setSize(width,height){
		this.width=width,this.height=height;
		this.handleSize();
	},
	clear(){
		this.context.clearRect(0,0,this.width,this.height);
	},
	set fillColor(color){
		this.context.fillStyle=color.toString();
	},
	set strokeColor(color){
		this.context.strokeStyle=color.toString();	
	},
	get fillColor(){
		return Color.from(this.context.fillStyle);	
	},
	get strokeColor(){
		return Color.from(this.context.strokeStyle);	
	},
	fillRect(x,y,sx,sy){
		this.context.fillRect(x,y,sx,sy);	
	},
};

//{{ Input }}\\

const Input = {
	KeysDown:{},
	AddKey:function(Key){
		this.KeysDown[Key.toLowerCase()]=true;	
	},
	RemoveKey:function(Key){
		this.KeysDown[Key.toLowerCase()]=false;
	},
	IsKeyDown:function(Key){
		return this.KeysDown[Key.toLowerCase()]===true;
	},
};

window.addEventListener("keydown",e=>{
	Input.AddKey(e.key);
});

window.addEventListener("keyup",e=>{
	Input.RemoveKey(e.key);
});

//{{ Renderable }}\\

class Renderable {
	constructor(){
		this.x=this.y=this.direction=0;
		this.sizex=1,this.sizey=1;
		this.transparency=0;
		this.color=new Color();
	}
	//{{ Methods }}\\
	setSize(x,y){
		this.sizex=x,this.sizey=y;		
	}
	moveTo(x,y){
		this.x=x,this.y=y;	
	}
	//{{ Symbols }}\\
	[Symbols.render](){
		this.color.a=this.transparency;
		Game.Screen.fillColor = this.Color;
		Game.Screen.fillRect(this.x,this.y,this.sizex,this.sizey);
	}
}

//{{ Game }}\\

const Game = {
	Layers:LayerManager,
	RenderableClasses:{},
	Screen,
	Input,
	NewRenderableType(Name,Priority,Class){
		this.RenderableClasses[Name]=Class;
		this.Layers.new(Name,Priority);
	},
	new(Name,Properties={}){
		let New = new (this.RenderableClasses[Name])();
		for(let k in Properties)New[k]=Properties[k];
		this.Layers.get(Name).push(New);
		return New;
	},
	render(){
		this.Screen.clear();
		let self = this;
		this.Layers.each(Layer=>Layer.each(Reference=>{
			Reference[Symbols.render].call(Reference,self);
		}));
	},
};

//{{ Setup }}\\

Game.NewRenderableType("Tile",0,Renderable),
Game.NewRenderableType("Particle",1,Renderable),
Game.NewRenderableType("Entity",2,Renderable);

Game.Layers.generateCache();
