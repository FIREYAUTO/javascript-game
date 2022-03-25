const BlankVector = new Vector(0,0),
	  HalfVector = new Vector(0.5,0.5),
	  FullVector = new Vector(1,1);

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
	GetRenderData(Size,AX=0.5,AY=0.5){
		let TileSize=this.TileSize;
		return [(-Size.x*AX)*TileSize,(-Size.y*AY)*TileSize,Size.x*TileSize,Size.y*TileSize];
	}
	GetRawRenderData(Size,AX=0.5,AY=0.5){
		return [(-Size.x*AX),(-Size.y*AY),Size.x,Size.y];
	}
	GetRawRenderData_Position(Size,AX=0.5,AY=0.5){
		return [(-Size.x*AX),(-Size.y*AY)];
	}
	//{{ Data Methods }}\\
	UVToVector(UV){
		return new Vector((this.Size.x*UV.sx)+UV.ox,(this.Size.y*UV.sy)+UV.oy);	
	}
	ConvertUV(UV){
		return UV instanceof UIVector?this.UVToVector(UV):UV;	
	}
	//{{ Drawing Components }}\\
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
	DrawImage(Image,Position,Size,Angle=0,AnchorPoint=HalfVector,Transparency=1){
		this.ContextMethod({
			Position:Position,
			Size:Size,
			Angle:Angle,
			Method:"drawImage",
			Arguments:[this.Renderer.LoadedImages[Image],...this.GetRawRenderData(Size,...AnchorPoint.ToArray())],
			Setters:{
					globalAlpha:1-Transparency,
			},
		});
	}
	FillRect(Position,Size,Angle=0,AnchorPoint=HalfVector,Color){
		this.ContextMethod({
			Position:Position,
			Size:Size,
			Angle:Angle,
			Method:"fillRect",
			Arguments:[...this.GetRawRenderData(Size,...AnchorPoint.ToArray())],
			Setters:{
				fillStyle:Color,
			},
		});
	}
	StrokeRect(Position,Size,Angle=0,AnchorPoint=HalfVector,Color,Width=1){
		this.ContextMethod({
			Position:Position,
			Size:Size,
			Angle:Angle,
			Method:"strokeRect",
			Arguments:[...this.GetRawRenderData(Size,...AnchorPoint.ToArray())],
			Setters:{
				strokeStyle:Color,
				lineWidth:Width,
			},
		});
	}
	FillText(Position,Size,Angle,AnchorPoint=HalfVector,Text,Font,Color,TextScaled,TextSize){
		this.ContextMethod({
			Position:Position,
			Size:Size,
			Angle:Angle,
			Method:"fillText",
			Arguments:[Text,...this.GetRawRenderData_Position(Size,...AnchorPoint.ToArray()),Size.x],
			Setters:{
				fillSytyle:Color,
				font:`${TextScaled?Size.y:TextSize}px ${Font}`,
			},
		});
	}
	//{{ Drawing Method }}\\
	ClearFrame(){
		this.Context.clearRect(0,0,this.Screen.width,this.Screen.height);
	}
	/*
	
	*/
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
