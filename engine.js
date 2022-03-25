const BlankVector = new Vector(0,0);

//{{ Screen }}\\

class _Screen {
	constructor(Id,TileSize,Width,Height,Renderer){
		this.Screen=GetElement(Id);
		this.Screen.width=Width,this.Screen.height=Height,this.Screen.style.width=`${Width}px`,this.Screen.style.height=`${Height}px`;
		Assign(this,{
			Context:this.Screen.getContext("2d"),
			TileSize:TileSize,
			Size:new Vector(Math.ceil(this.Screen.width/Width),Math.ceil(this.Screen.height/Height)),
			AbsoluteSize:new Vector(this.Screen.width,this.Screen.height),
			Renderer:Renderer,
		});
		this.Context.imageSmoothingEnabled=false;
	}
	//{{ Computational Methods }}\\
	GetRawRenderPosition(Position,Size){
		let Renderer=this.Renderer,
			Offset=Renderer.Camera?Renderer.Camera.Position:BlankVector;
		return (new Vector(Position.X-Offset.x,Position.y-Offset.y)).Add(this.AbsoluteSize.Div(2));
	}
	GetRenderPosition(Position,Size){
		return this.GetRawRenderPosition(Position,Size).Mul(this.TileSize);
	}
	GetRenderData(Size){
		let TileSize=this.TileSize;
		return [(-Size.x/2)*TileSize,(-Size.y/2)*TileSize,Size.x*TileSize,Size.y*TileSize];
	}
	GetRawRenderData(Size){
		return [(-Size.x/2),(-Size.y/2),Size.x,Size.y];
	}
	//{{ Data Methods }}\\
	UVToVector(UV){
		return new Vector((this.Size.x*UV.sx)+UV.ox,(this.Size.y*UV.sy)+UV.oy);	
	}
	ConvertUV(UV){
		return UV instanceof UIVector?this.UVToVector(UV):UV;	
	}
	//{{ Drawing Methods }}\\
	Translate(Position){
		this.Context.translate(Position.x,Position.y);	
	}
	Rotate(Angle){
		this.Context.rotate(Math.rad(Angle));	
	}
	ClearTransform(){
		this.Context.setTransform(1,0,0,1,0,0);	
	}
	ContextMethod(Properties){
		let {Position,Size,Angle,Method,Arguments,Setters}=Properties,
			Context = this.Context;
		this.Translate(Position);
		this.Rotate(Angle);
		for(let Name in Setters)Context[Name]=Setters[Name];
		Context[Method](...Arguments);
		this.ClearTransform();
	}
	DrawImage(Image,Position,Size,Angle=0,Transparency=1){
		this.ContextMethod({
			Position:Position,
			Size:Size,
			Angle:Angle,
			Method:"drawImage",
			Arguments:[this.Renderer.LoadedImages[Image],...this.GetRawRenderData(Size)],
			Setters:{
					globalAlpha:1-Transparency
			},
		});
	}
	FillRect(Position,Size,Color,Angle=0,Transparency=1){
		this.ContextMethod({
			Position:Position,
			Size:Size,
			Angle:Angle,
			Method:"drawImage",
			Arguments:[this.Renderer.LoadedImages[Image],...this.GetRawRenderData(Size)],
			Setters:{
					globalAlpha:1-Transparency
			},
		});
	}
}

//{{ Renderer }}\\

class _Renderer extends Listener {
	constructor(Id,TileSize=32,Width=15,Height=9){
		super(["keydown","keyup"]);
		const self=this;
		Assign(self,{
			RenderLayers:{},
			RawRenderLayers:[],
			UI:[],
			KeysDown:{},
			Camera:undefined,
			Screen:new _Screen(Id,TileSize,Width,Height,this),
		});
		window.addEventListener("keydown",Event=>{
			let Key = Event.key||Event.which;
			if(!Event.metaKey)Key=Key.toLowerCase();
			self.KeysDown[Key]=true;
			self.fire("keydown",Key);
		});
		window.addEventListener("keyup",Event=>{
			let Key = Event.key||Event.which;
			if(!Event.metaKey)Key=Key.toLowerCase();
			self.KeysDown[Key]=false;
			self.fire("keyup",Key);
		});
	}
	NewRenderLayer(Name,Priority){
		this.RenderLayers[Name]={Priority:Priority,Layer:[],Name:Name};
		let Values=Object.values(this.RenderLayers);
		Values.sort((a,b)=>a.Priority>b.Priority?1:a.Priority<b.Priority?-1:0);
		this.RawRenderLayers=Values;
	}
	ToRenderLayer(Name,Renderable){
		if(!(Renderable instanceof _Renderable))return;
		Renderable.Render = this;
		this.RenderLayers[Name].Layer.push(Renderable);
	}
	RemoveFromRenderLayer(Name,Renderable){
		if(!(Renderable instanceof _Renderable))return;
		let Layer = this.RenderLayers[Name];
		Layer.Layer.splice(Layer.Layer.inddexOf(Renderable),1);
	}
}
