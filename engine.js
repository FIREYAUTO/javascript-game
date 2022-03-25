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
	//{{ Collision Detection }}\\
	IsColliding(R1,R2,P,S){
		S=S||R1.Size,
		P=(P||R1.Position).Add(S.Div(2));
		let ES=R2.Size,EP=R2.Position;
		if(R2 instanceof _Renderable)EP=EP.Add(S.Sub(ES.Div(2)));
		let l1=P,r1=P.Add(S),l2=EP,r2=EP.Add(ES);
		if(l1.x==r1.x||l1.y==r1.y||l2.x==r2.x||l2.y==r2.y)return false;
		if(l1.x>=r2.x||l2.x>=r1.x)return false;
		if(r1.y<=l2.y||r2.y<=l1.y)return false;
		return true;
	}
	IsOnScreen(R){
		let Renderer = this.Renderer;
		return this.IsColliding(R,{Position:Renderer.Camera.Position.Sub(this.Size.Div(2)).Sub(1),Size:this.Size.Add(2)});
	}
	//{{ Drawing Method }}\\
	ClearFrame(){
		this.Context.clearRect(0,0,this.Screen.width,this.Screen.height);
	}
	DrawRenderable(R){
		this.DrawImage(R.Image,this.GetRenderPosition(R.Position,R.Size),R.Size.Mul(this.TileSize),R.Rotation,R.PivotPoint,R.Transparency);	
	}
	Render(){
		this.ClearFrame();
		let Renderer = this.Renderer;
		for(let RenderLayer of Renderer.RawRenderLayers){
			for(let R of RenderLayer.Layer){
				if(!this.IsOnScreen(R))continue;
				this.DrawRenderable(R);
				if(R.OnRender)R.OnRender();
				if(Renderer.Selected===R)this.StrokeRect(R.Position.Mul(this.TileSize),R.Size.Mul(this.TileSize),R.Rotation,"rgba(255,255,255,0.5)",5);
			}
		}
		this.UIRender();
	}
	DrawUIElement(Element){
		let Position = Element.Position.ToVector().Mul(this.TileSize),
		    Size = Element.Size.ToVector().Mul(this.TileSize);
		if(Element.WorldSpace){
			Position=this.GetRenderPosition(Position,Size);	
		}
		if(Element instanceof _UIElement){
			this.FillRect(Position,Size,Element.Rotation,Element.AnchorPoint,Element.Color);
			if(Element.BorderSize>0){
				this.StrokeRect(Position,Size,Element.Rotation,Element.AnchorPoint,Element.BorderColor,Element.BorderSize);
			}
		}
		if(Element instanceof _UIText){
			this.FillText(Position,Size,Element.Rotation,Element.AnchorPoint,Element.Text,Element.Font,Element.TextColor,Element.TextScaled,Element.TextSize);
		}
		if(Element instanceof _UIImage){
			this.DrawImage(Element.Image,Position,Size,Element.Rotation,Element.AnchorPoint,Element.ImageTransparency);	
		}
	}
	UIRender(){
		let Renderer = this.Renderer;
		for(let Element of Renderer.UI){
			if((Element.WorldSpace&&!this.IsOnScreen(Element))||!Element.Visible)continue;
			this.DrawUIElement(Element);
		}
	}
	/*
            if(e instanceof UIText){
            	this.DrawUIText(e.Text,e.Font,e.Size,e.Position,e.TextColor,e.Angle,e.TextScaled,e.TextSize,e.WorldSpace,e.AnchorPoint);
            }
            if(e instanceof UIImage){
            	this.DrawUIImage(e.Image,e.Size,e.Position,e.Transparency,e.Angle,e.WorldSpace,e.AnchorPoint);
            }
        }
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

//{{ Renderable }}\\

class _Renderable {
	constructor(Render){
		Assign(this,{
			Render:Render,
			Position:new Vector(0,0),
			PivotPoint:new Vector(0.5,0.5),
			Size:new Vector(1,1),
			Image:"",
			Transparency:0,
			Rotation:0,
		});
	}
	SetPosition(x=0,y=0){
		Assign(this.Position,{x,y});
	}
	SetSize(x=0,y=0){
		Assign(this.Size,{x,y});
	}
	SetPivotPoint(x=0,y=0){
		Assign(this.PivotPoint,{x,y});
	}
}

//{{ UI Element }}\\

class _UIElement {
	constructor(Parent,Render){
		Assign(this,{
			Render:Render,
			Color:"rgba(255,255,255,0)",
			BorderSize:0,
			BorderColor:"rgba(255,255,255,1)",
			Position:new Vector(0,0),
			Size:new Vector(0,0),
			AnchorPoint:new Vector(0,0),
			Rotation:0,
			Children:[],
		});
		Render.UI.push(this);
		if(Parent){
			this.Parent=Parent;
			Parent.Children.push(this);
		}
	}
	RemoveParent(){
		if(this.Parent){
			this.Parent.Children.splice(this.Parent.Children.indexOf(this),1);
			this.Parent=undefined;
		}	
	}
	Remove(){
		if(!this.Render)return;
		this.Render.UI.splice(this.Render.indexOf(this),1);
		this.Render=undefined;
		this.RemoveParent();
	}
	SetParent(Parent){
		this.RemoveParent();
		this.Parent=Parent;
		if(Parent)Parent.Children.push(Parent);
	}
}

class _UIText {
	constructor(...a){
		super(...a);
		Assign(this,{
			Text:"",
			TextSize:14,
			TextScaled:true,
			Font:"VT323",
			TextColor:"rgba(0,0,0,0)",
		});
	}
}

class _UIImage {
	constructor(...a){
		super(...a);
		Assign(this,{
			Image:"",
			ImageTransparency:0,
		});
	}
}
