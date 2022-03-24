Math.rad = function(x){
	return x*(Math.PI/180)
}

Math.deg = function(x){
	return x*(180/Math.PI);
}

const RawImageURL = "https://fireyauto.github.io/javascript-game/textures/";
const Images = {
    "Wall":"wall.png",
    "Player":"player.png",
    "Furnace":"furnace.png",
    "FurnaceLit":"furnace_lit.png",
    "Ore1":"ore1.png",
    "Decay1":"decay_1.png",
    "Decay2":"decay_2.png",
    "Decay3":"decay_3.png",
    "Decay4":"decay_4.png",
    "Decay5":"decay_5.png",
    "SmeltedOre1":"smelted_ore1.png",
}

const LoadedImages = {};

async function LoadImages(Table){
	let Loaded = 0;
    let Count = Object.getOwnPropertyNames(Table).length;
	for(let k in Table){
    	let v = Table[k];
        let img = new Image();
        Table[k] = img;
        img.onload=function(){
        	Loaded++;
            LoadedImages[k]=new FImage(Table[k]);
            img.onload=null;
        }
        img.src = RawImageURL+v;
    }
    return new Promise(r=>{
    	let i;
        i=setInterval(()=>{
        	if(Loaded>=Count){
            	clearInterval(i);
            	r();
            }
        },100)
    })
}

function GetElement(Id){
	return document.getElementById(Id);
}

function SetScreenSize(Screen,Ratio,Div=1){
	let {x,y}=Ratio;
    let w=x/Div,h=y/Div;
	Screen.style.width=`${w}px`;	
	Screen.style.height=`${h}px`;
    Screen.width=w;
    Screen.height=h;
}

function SetupScreen(Screen){
	SetScreenSize(Screen,{x:32*15,y:32*9},1);
    const Context = Screen.getContext("2d");
    Context.imageSmoothingEnabled = false;
    return Context;
}

function GetScreen(Id){
	let Screen = GetElement(Id);
   	return [Screen,SetupScreen(Screen)];
}

Math.lerp = (a,b,t)=>(1-t)*a+t*b;

function AngleCheck(Angle,Min=0,Max=360){
	let d = Max-Min;
    if(Angle>=Min&&Angle<=Max)return Angle;
    return (Angle%d)+Min;
}

function AngleOverflowCheck(Angle,D){
	let Diff = Math.abs(D-Angle);
    if(Diff>180){
    	if(D>Angle)Angle+=360;
        else D+=360;
    }
    return [Angle,D];
}

class FImage {
	constructor(Source,Width,Height){
        this.Source=Source;
    }
}

class Vector {
	constructor(x=0,y=0){
    	this.x=x;
        this.y=y;
    }
    toString(){
    	return `${this.x},${this.y}`;
    }
    Add(n){
    	let n1=n,n2=n;
    	if(n instanceof Vector)n1=n.x,n2=n.y;
        return new Vector(this.x+n1,this.y+n2);
    }
    Sub(n){
    	let n1=n,n2=n;
    	if(n instanceof Vector)n1=n.x,n2=n.y;
        return new Vector(this.x-n1,this.y-n2);
    }
    Mul(n){
    	let n1=n,n2=n;
    	if(n instanceof Vector)n1=n.x,n2=n.y;
        return new Vector(this.x*n1,this.y*n2);
    }
    Div(n){
    	let n1=n,n2=n;
    	if(n instanceof Vector)n1=n.x,n2=n.y;
        return new Vector(this.x/n1,this.y/n2);
    }
    Mod(n){
    	let n1=n,n2=n;
    	if(n instanceof Vector)n1=n.x,n2=n.y;
        return new Vector(this.x%n1,this.y%n2);
    }
    Pow(n){
    	let n1=n,n2=n;
    	if(n instanceof Vector)n1=n.x,n2=n.y;
        return new Vector(this.x**n1,this.y**n2);
    }
    Magnitude(){
    	return Math.sqrt((this.x**2)+(this.y**2));
    }
    Normalize(){
    	let mag = this.Magnitude();
    	return new Vector(this.x/mag,this.y/mag);
    }
    Lerp(v,t){
    	return new Vector(Math.lerp(this.x,v.x,t),Math.lerp(this.y,v.y,t));
    }
    Floor(){
    	return new Vector(Math.floor(this.x),Math.floor(this.y));
    }
    Ceil(){
    	return new Vector(Math.ceil(this.x),Math.ceil(this.y));
    }
    Round(){
    	return new Vector(Math.round(this.x),Math.round(this.y));
    }
    Eqs(v){
    	return this.x==v.x&&this.y==v.y;
    }
}

class UIVector {
	constructor(sx=0,ox=0,sy=0,oy=0){
    	this.sx=sx,this.ox=ox,this.sy=sy,this.oy=oy;
    }
    __mathop(v,c){
    	let sx=v,ox=v,sy=v,oy=v;
        if(v instanceof UIVector)sx=v.sx,sy=v.sy,ox=v.ox,oy=v.oy;
        return new UIVector(c(this.sx,sx),c(this.ox,ox),c(this.sy,sy),c(this.oy,oy));
    }
    Add(v){
    	return this.__mathop(v,(a,b)=>a+b);
    }
    Sub(v){
    	return this.__mathop(v,(a,b)=>a-b);
    }
    Mul(v){
    	return this.__mathop(v,(a,b)=>a*b);
    }
    Div(v){
    	return this.__mathop(v,(a,b)=>a/b);
    }
   	Mod(v){
    	return this.__mathop(v,(a,b)=>a%b);
    }
    Pow(v){
    	return this.__mathop(v,(a,b)=>a**b);
    }
}

const BV = new Vector();

class Camera {
	constructor(Position){
    	this.Position = Position||new Vector(0,0);
    }
}

function IsColliding(e,p,s){
	s = s
       	p = p.Add(s.Div(2));
        let es = e.Size,
            ep = e.Position;
        if(e instanceof Renderable){
        	ep=ep.Add(s.Sub(es.Div(2)));
        }
        //ep=this.Render.GetPositionOnScreen(ep,es);
        //p=this.Render.GetPositionOnScreen(p,s);
        let l1 = p,
            r1 = p.Add(s);
        let l2 = ep,
            r2 = ep.Add(es);
        if(l1.x==r1.x||l1.y==r1.y||l2.x==r2.x||l2.y==r2.y)return false;
        if(l1.x>=r2.x||l2.x>=r1.x)return false;
        if(r1.y<=l2.y||r2.y<=l1.y)return false;
        return true;
}

class Renderer {
	constructor(Screen,Context){
    	this.Screen = Screen;
        this.Context = Context;
        this.PixelRatio = (+Screen.width)/(+Screen.height);
        this.TileSize = 32//this.PixelRatio*24;
        this.RenderLayers={};
        this.RawRenderLayers=[];
        this.TilesPerScreenWidth=Math.ceil(Screen.width/this.TileSize);
        this.TilesPerScreenHeight=Math.ceil(Screen.height/this.TileSize);
        this.ASize = new Vector(this.TilesPerScreenWidth,this.TilesPerScreenHeight);
        this.KeysDown={};
        this.Camera=new Camera();
        this.UI=[];
        const self = this;
        window.addEventListener("keydown",e=>{
        	self.KeysDown[e.key]=true;
        });
        window.addEventListener("keyup",e=>{
        	self.KeysDown[e.key]=false;
        });
    }
    NewRenderLayer(Name,Priority){
    	this.RenderLayers[Name]={Priority:Priority,Layer:[],Name:Name};
        let Values = Object.values(this.RenderLayers);
        Values.sort((a,b)=>{
        	if(a.Priority>b.Priority){
            	return 1;
            }else if(a.Priority<b.Priority){
            	return -1;
			}else{
            	return 0;
            }
        });
        this.RawRenderLayers=Values;
    }
    ToRenderLayer(Name,Renderable){
    	Renderable.Render=this;
    	this.RenderLayers[Name].Layer.push(Renderable);
    }
    RemoveFromRenderLayer(Name,Renderable){
    	let Layer = this.RenderLayers[Name];
        Layer.Layer.splice(Layer.Layer.indexOf(Renderable),1);
    }
    GetRawPositionOnScreen(P,S){
    	let PS = this.TileSize;
        let CP = this.Camera.Position//.Add(S.Div(2));
        return (new Vector(((P.x-CP.x)),((P.y-CP.y)))).Add(this.ASize.Div(2))
    }
    GetPositionOnScreen(P,S){
    	let PS = this.TileSize;
        return this.GetRawPositionOnScreen(P,S).Mul(PS);
    }
    GetPS(Size){
    	let ts = this.TileSize;
        return [(-Size.x/2)*ts,(-Size.y/2)*ts,Size.x*ts,Size.y*ts];
    }
    UIVectorToVector(UI){
    	return new Vector((this.TilesPerScreenWidth*UI.sx)+UI.ox,(this.TilesPerScreenHeight*UI.sy)+UI.oy);
    }
    ConvertUIVector(x){
    	if(x instanceof UIVector)return this.UIVectorToVector(x);
        return x;
    }
    DrawImage(PImage,Size,Position,Angle=0,Transparency=0){
    	let ts = this.TileSize;
        Size=this.ConvertUIVector(Size);
        Position=this.ConvertUIVector(Position);
        this.Context.globalAlpha = 1-Transparency;
        let P = this.GetPositionOnScreen(Position,Size);
    	this.Context.translate(P.x,P.y);
    	this.Context.rotate(Math.rad(Angle));
        this.Context.drawImage(LoadedImages[PImage].Source,...this.GetPS(Size));
        this.Context.setTransform(1,0,0,1,0,0);
    }
    DrawRect(Size,Position,Color,Angle=0){
    	let ts = this.TileSize;
        this.Context.fillStyle=Color;
        let P = this.GetPositionOnScreen(Position,Size);
    	this.Context.translate(P.x,P.y);
    	this.Context.rotate(Math.rad(Angle));
        this.Context.fillRect(...this.GetPS(Size));
        this.Context.setTransform(1,0,0,1,0,0);
    }
    StrokeRect(Size,Position,Color,LineWidth=1,Angle=0){
    	let ts = this.TileSize;
        this.Context.strokeStyle=Color;
        this.Context.lineWidth=LineWidth;
        let P = this.GetPositionOnScreen(Position,Size);
    	this.Context.translate(P.x,P.y);
    	this.Context.rotate(Math.rad(Angle));
        this.Context.strokeRect(...this.GetPS(Size));
        this.Context.setTransform(1,0,0,1,0,0);
    }
    DrawUIImage(Image,Size,Position,Transparency=0,Angle=0,WorldSpace=false,AP){
    	let TS = this.TileSize;
    	Size=this.ConvertUIVector(Size);
        Position=this.ConvertUIVector(Position);
        this.Context.globalAlpha=1-Transparency;
        let P = Position.Mul(TS);
        if(WorldSpace===true)P=this.GetPositionOnScreen(Position,Size);
        this.Context.translate(P.x,P.y);
    	this.Context.rotate(Math.rad(Angle));
        this.Context.drawImage(LoadedImages[Image].Source,(-Size.x*AP.x)*TS,(-Size.y*AP.y)*TS,Size.x*TS,Size.y*TS);
        this.Context.setTransform(1,0,0,1,0,0);
    }
    DrawUIRect(Size,Position,Color,Angle=0,WorldSpace=false,AP){
    	let TS = this.TileSize;
    	Size=this.ConvertUIVector(Size);
        Position=this.ConvertUIVector(Position);
        this.Context.fillStyle=Color;
        let P = Position.Mul(TS);
        if(WorldSpace===true)P=this.GetPositionOnScreen(Position,Size);
        this.Context.translate(P.x,P.y);
    	this.Context.rotate(Math.rad(Angle));
        this.Context.fillRect((-Size.x*AP.x)*TS,(-Size.y*AP.y)*TS,Size.x*TS,Size.y*TS);
        this.Context.setTransform(1,0,0,1,0,0);
    }
    StrokeUIRect(Size,Position,Color,Width=1,Angle=0,WorldSpace=false,AP){
    	let TS = this.TileSize;
    	Size=this.ConvertUIVector(Size);
        Position=this.ConvertUIVector(Position);
        this.Context.strokeStyle=Color;
        this.Context.lineWidth=Width;
        let P = Position.Mul(TS);
        if(WorldSpace===true)P=this.GetPositionOnScreen(Position,Size);
        this.Context.translate(P.x,P.y);
    	this.Context.rotate(Math.rad(Angle));
        this.Context.strokeRect((-Size.x*AP.x)*TS,(-Size.y*AP.y)*TS,Size.x*TS,Size.y*TS);
        this.Context.setTransform(1,0,0,1,0,0);
    }
    DrawUIText(Text,Font,Size,Position,Color,Angle,TextScaled=true,TextSize,WorldSpace=false,AP){
    	let TS = this.TileSize;
    	Size=this.ConvertUIVector(Size);
        Position=this.ConvertUIVector(Position);
        this.Context.fillStyle=Color;
        this.Context.font=`${TextScaled?Size.y*TS:TextSize}px ${Font}`;
        let P = Position.Mul(TS);
        if(WorldSpace===true)P=this.GetPositionOnScreen(Position,Size);
        this.Context.translate(P.x,P.y);
    	this.Context.rotate(Math.rad(Angle));
        this.Context.fillText(Text,(-Size.x*AP.x)*TS,((-Size.y*AP.y)*TS)+(Size.y*TS),Size.x*TS);
        this.Context.setTransform(1,0,0,1,0,0);
    }
    ClearFrame(){
    	this.Context.clearRect(0,0,this.Screen.width,this.Screen.height);
    }
    RenderFrame(){
    	this.ClearFrame();
        for(let v of this.RawRenderLayers){
        	for(let r of v.Layer){
            	if(!r.IsOnScreen())continue;
            	this.DrawImage(r.Image,r.Size,r.Position,r.Rotation,r.Transparency);
                if(r.OnRender){
                	r.OnRender();
                }
                if(this.Selected==r){
                	this.StrokeRect(r.Size,r.Position,"rgba(255,255,255,0.65)",5,r.Rotation)
                }
            }
        }
        this.UIRender();
    }
    GameLoop(){
    	for(let v of this.RawRenderLayers){
        	for(let r of v.Layer){
            	if(!r.IsOnScreen())continue;
                let SetX=true,SetY=true;
                if(r.CanMove==true){
                	let NPX = r.Position.Add(new Vector(r.Velocity.x,0));
                    let NPY = r.Position.Add(new Vector(0,r.Velocity.y));
                    let CX = r.CheckCollision(NPX);
                    let CY = r.CheckCollision(NPY);
                    if(CX&&CX.CanCollide)SetX=false;
                    if(CY&&CY.CanCollide)SetY=false;
                }
                if(SetY){
                	r.Position.y+=r.Velocity.y;
                }else{
                	r.Position.y-=r.Velocity.y;
                	r.Velocity.y=0;
                }
                if(SetX){
                	r.Position.x+=r.Velocity.x;
                }else{
                	r.Position.x-=r.Velocity.x;
                	r.Velocity.x=0;
                }
                r.Rotation+=r.RotationVelocity;
                if(r.OnGameLoop){
                	r.OnGameLoop();
                }
            }
        }
    	this.RenderFrame();
    }
    IsKeyDown(Name){
    	return !!this.KeysDown[Name];
    }
    PointInRectangle(v,l,r){
    	if(v.y<=l.y||v.y>=r.y)return false;
        if(v.x<=l.x||v.x>=r.x)return false;
        return true;
    }
    GetRenderableAtPosition(Position,Layers){
    	let Check = Layers.length>0;
    	for(let v of this.RawRenderLayers){
        	if(Check&&!Layers.includes(v.Name))continue;
        	for(let r of v.Layer){
            	if(!r.IsOnScreen())continue;
                let lp=this.GetRawPositionOnScreen(r.Position.Sub(r.Size.Div(2)),r.Size);
                let rp=lp.Add(r.Size);
              	if(this.PointInRectangle(Position,lp,rp)){
                	return r;
              	}
            }
        }
    }
    UIRender(){
    	for(let e of this.UI){
        	if(e.WorldSpace&&!e.IsOnScreen())continue;
            if(!e.Visible)continue;
        	if(e instanceof UIElement){
            	this.DrawUIRect(e.Size,e.Position,e.Color,e.Angle,e.WorldSpace,e.AnchorPoint);
                if(e.BorderSize>0){
                	this.StrokeUIRect(e.Size,e.Position,e.BorderColor,e.BorderSize,e.Angle,e.WorldSpace,e.AnchorPoint);
                }
            }
            if(e instanceof UIText){
            	this.DrawUIText(e.Text,e.Font,e.Size,e.Position,e.TextColor,e.Angle,e.TextScaled,e.TextSize,e.WorldSpace,e.AnchorPoint);
            }
            if(e instanceof UIImage){
            	this.DrawUIImage(e.Image,e.Size,e.Position,e.Transparency,e.Angle,e.WorldSpace,e.AnchorPoint);
            }
        }
    }
}

class UIElement {
	constructor(Render){
    	this.Render=Render;
        Render.UI.push(this);
    	this.Position=new UIVector(0,0,0,0);
        this.Size=new UIVector(0,2,0,2);
        this.Color="rgba(255,255,255,1)";
        this.BorderSize=0;
        this.BorderColor="rgba(0,0,0,1)";
        this.Angle=0;
        this.WorldSpace=false;
        this.AnchorPoint=new Vector(0,0);
        this.Visible=true;
    }
    IsCollidingWith(e,p,s){
    	s = s||(this.Render.ConvertUIVector(this.Size))
       	p = (p||(this.Render.ConvertUIVector(this.Position))).Add(s.Div(2));
        let es = e.Size,
            ep = e.Position;
        if(e instanceof Renderable){
        	ep=ep.Add(s.Sub(es.Div(2)));
        }
        //ep=this.Render.GetPositionOnScreen(ep,es);
        //p=this.Render.GetPositionOnScreen(p,s);
        let l1 = p,
            r1 = p.Add(s);
        let l2 = ep,
            r2 = ep.Add(es);
        if(l1.x==r1.x||l1.y==r1.y||l2.x==r2.x||l2.y==r2.y)return false;
        if(l1.x>=r2.x||l2.x>=r1.x)return false;
        if(r1.y<=l2.y||r2.y<=l1.y)return false;
        return true;
    }
    IsOnScreen(){
    	let r=this.Render;
    	return this.IsCollidingWith({Position:r.Camera.Position.Sub(r.ASize.Div(2)).Sub(1),Size:r.ASize.Add(2)});
    }
    Remove(){
    	if(!this.Render)return;
        this.Render.UI.splice(this.Render.UI.indexOf(this),1);
        this.Render=undefined;
    }
    SetAnchorPoint(x=0,y=0){
    	this.AnchorPoint.x=x,this.AnchorPoint.y=y;
    }
}

class UIText extends UIElement {
	constructor(...a){
    	super(...a);
        this.Text="";
        this.Font="VT323";
        this.TextSize=14;
        this.TextColor="rgba(0,0,0,1)";
        this.TextScaled=true;
    }
}

class UIImage extends UIElement {
	constructor(...a){
    	super(...a);
        this.Image="";
        this.Transparency=0;
    }
}

class Renderable {
	constructor(ImageName,Size,Position,Rotation=0){
    	this.Image = ImageName;
        this.Transparency = 0;
        this.Size = Size||new Vector(1,1);
        this.Position = Position||new Vector(0,0);
        this.Rotation = Rotation;
        this.Velocity = new Vector(0,0);
        this.FallVelocity = new Vector(0,0.1);
        this.MaxFallVelocity = 2;
        this.HasGravity = false;
        this.RotationVelocity = 0;
        this.Render=undefined;
        this.CanCollide=true;
        this.CanTouch=true;
    }
    SetSize(x,y){
    	this.Size.x=x,this.Size.y=y;
    }
    SetPosition(x,y){
    	this.Position.x=x,this.Position.y=y;
    }
    SetVelocity(x,y){
    	this.Velocity.x=x,this.Velocity.y=y;
    }
    IsCollidingWith(e,p,s){
    	s = s||this.Size
       	p = (p||this.Position).Add(s.Div(2));
        let es = e.Size,
            ep = e.Position;
        if(e instanceof Renderable){
        	ep=ep.Add(s.Sub(es.Div(2)));
        }
        //ep=this.Render.GetPositionOnScreen(ep,es);
        //p=this.Render.GetPositionOnScreen(p,s);
        let l1 = p,
            r1 = p.Add(s);
        let l2 = ep,
            r2 = ep.Add(es);
        if(l1.x==r1.x||l1.y==r1.y||l2.x==r2.x||l2.y==r2.y)return false;
        if(l1.x>=r2.x||l2.x>=r1.x)return false;
        if(r1.y<=l2.y||r2.y<=l1.y)return false;
        return true;
    }
    IsOnScreen(){
    	let r=this.Render;
    	return this.IsCollidingWith({Position:r.Camera.Position.Sub(r.ASize.Div(2)).Sub(1),Size:r.ASize.Add(2)});
    }
    CheckCollision(p,s){
    	let cs=[];
    	for(let v of this.Render.RawRenderLayers){
        	for(let r of v.Layer){
            	if(r==this)continue;
                if(!r.IsOnScreen())continue;
                if(!r.CanTouch)continue;
                if (this.IsCollidingWith(r,p,s)){
                	return r;
                }
            }
        }
    }
    GetCollisions(p,s){
    	let cs=[];
    	for(let v of this.Render.RawRenderLayers){
        	for(let r of v.Layer){
            	if(r==this)continue;
                if(!r.IsOnScreen())continue;
                if(!r.CanTouch)continue;
                if (this.IsCollidingWith(r,p,s)){
                	cs.push(r);
                }
            }
        }
        return cs;
    }
    get LookVector(){
    	let A=Math.rad(this.Rotation);
        return new Vector(-Math.cos(A),-Math.sin(A))
    }
    get RightVector(){
    	let A=Math.rad(this.Rotation+90);
        return new Vector(-Math.cos(A),-Math.sin(A))
    }
}

class Tile extends Renderable {
	constructor(TileName,Size,Position){
    	super(TileName,Size,Position,0);
    }
}

class Entity extends Renderable {
	constructor(TileName,Size,Position,Rotation,MaxHealth){
    	super(TileName,Size,Position,Rotation);
        this.MaxHealth = MaxHealth;
        this.Health = this.MaxHealth;
    }
    SetMaxHealth(New){
    	if(this.Health==this.MaxHealth){
        	this.Health = New;
        }
        this.MaxHealth = New;
    }
    Damage(Amount){
    	this.Health -= Amount;
    }
}

class Projectile extends Renderable {
	constructor(TileName,Size,Position,Rotation,Callback){
    	super(TileName,Size,Position,Rotation);
        this.Callback = Callback;
    }
    Start(){
    	this.Callback();
    }
    End(){
    	this.Render.RemoveFromRenderLayer("Projectile",this);
    }
}

class Input {
	constructor(Type,Extra={}){
    	this.Type=Type;
        for(let k in Extra){
        	this[k]=Extra[k];
        }
    }
}

class Listener {
	constructor(VC=[]){
    	this._VC={};
        for(let v of VC){
        	this._VC[v]=[];
        }
    }
    on(Name,Call){
    	this._VC[Name].push(Call);
    }
    fire(Name,...a){
    	for(let v of this._VC[Name]){
        	v(...a);
        }
    }
}

function GetMousePosition(Element,Event){
	let Rect = Element.getBoundingClientRect();
    return {
    	x:Event.clientX-Rect.left,
        y:Event.clientY-Rect.top,
    }
}

class BaseMouse extends Listener {
	constructor(Render){
    	super(["down","move","up","rightclick","keydown","keyup"]);
        let self=this;
        this.Render=Render;
        window.addEventListener("mousedown",e=>{
        	let m = GetMousePosition(self.Render.Screen,e);
            let i=new Input(1,{
            	Position:(new Vector(m.x,m.y)).Div(self.Render.TileSize),
            });
            let t = undefined;
            if(e.button==0)t="down";
       		else if(e.button==2)t="rightclick";
            if(!t)return;
        	self.fire(t,i);
        });
        window.addEventListener("contextmenu",e=>{
        	e.preventDefault();
        });
        window.addEventListener("mouseup",e=>{
        	let m = GetMousePosition(self.Render.Screen,e);
            let i=new Input(1,{
            	Position:(new Vector(m.x,m.y)).Div(self.Render.TileSize),
            });
            if(e.button!=0)return;
        	self.fire("up",i);
        });
        window.addEventListener("mousemove",e=>{
        	let m = GetMousePosition(self.Render.Screen,e);
            let i=new Input(1,{
            	Position:(new Vector(m.x,m.y)).Div(self.Render.TileSize),
            });
        	self.fire("move",i);
        });
        window.addEventListener("keydown",e=>{
        	if(e.repeat)return;
        	let i=new Input(2,{
            	Key:e.key||e.which
            });
            self.fire("keydown",i);
        });
        window.addEventListener("keyup",e=>{
        	let i=new Input(2,{
            	Key:e.key||e.which
            });
            self.fire("keyup",i);
        });
    }
}

async function wait(t){
	return await new Promise(r=>setTimeout(r,t*1000));
}

function time(){
	return Date.now()/1000;
}

Math.clamp=(x,m,M)=>Math.min(Math.max(x,m),M);

async function Main(){
	try{
	const Render = new Renderer(...GetScreen("screen"));
    const Camera = Render.Camera;
    const Mouse = new BaseMouse(Render);
    Render.NewRenderLayer("Tile",0);
    Render.NewRenderLayer("Projectile",5);
    Render.NewRenderLayer("Entity",10);
	await LoadImages(Images);
    
    //{{ UI }}\\
    
    const SelectedImage = new UIImage(Render);
    SelectedImage.Image="";
    SelectedImage.Size=new UIVector(0,1,0,1);
    SelectedImage.Position=new UIVector(0,0.25,0.5,0);
    SelectedImage.SetAnchorPoint(0,0.5);
    SelectedImage.Color="rgba(255,255,255,0.25)";
    SelectedImage.BorderSize=4;
    SelectedImage.BorderColor="rgba(255,255,255,1)";
    SelectedImage.Visible=false;
    
    const SelectedText = new UIText(Render);
    SelectedText.Text="0";
    SelectedText.Size=new UIVector(0,3,0,1);
    SelectedText.Position=new UIVector(0,1.5,0.5,0);
    SelectedText.SetAnchorPoint(0,0.5);
    SelectedText.TextColor="rgba(255,255,255,1)";
    SelectedText.Color="rgba(0,0,0,0)";
    SelectedText.Visible=false;
    
    //{{ Player }}\\
    
    let Selected = new Tile("Player");
    Selected.SetSize(0.35,0.35);
    Selected.CanCollide=false;
    Selected.CanTouch=false;
    Selected.Transparency=1;
    Render.ToRenderLayer("Projectile",Selected);
    
    let Player = new Entity("Player");
    Player.SetSize(0.5,0.5);
    Player.SetPosition(0,0);
    Player.MoveSpeed=0.01;
    Player.MaxMoveSpeed=0.1;
    Player.Friction=0.8;
    Player.CanMove=true;
    Player.MinePower=1;
    Player.Inventory=[];
    Player.SelectedItem=-1;
    Player.Selected = Selected;
    Player.ToInventory=function(Name,Amount=1){
    	if(!this.Inventory[Name])this.Inventory[Name]=0;
        this.Inventory[Name]+=Amount;
    }
    Player.RemoveFromInventory=function(Name,Amount=1){
    	if(!this.Inventory[Name])this.Inventory[Name]=0;
        this.Inventory[Name]-=Amount;
        if(this.Inventory[Name]<=0){
        	delete this.Inventory[Name];
        	Player.ChangeSelectedItem(1);
        }
    }
    Player.HasInventoryAmount=function(Name,Amount=1){
    	if(!this.Inventory[Name])this.Inventory[Name]=0;
        return this.Inventory[Name]===Amount;
    }
    Player.ChangeSelectedItem=function(Amount=1){
    	let Keys = Object.keys(this.Inventory);
        if(Keys.length===0){
        	this.SelectedItem=-1;
            SelectedImage.Visible=false;
            SelectedText.Visible=false;
        	return this.Selected.Transparency=1;
         }
        this.SelectedItem+=Amount;
        this.SelectedItem=this.SelectedItem%Keys.length;
        this.Selected.Image = Keys[this.SelectedItem];
        SelectedImage.Visible=true;
        SelectedImage.Image=this.Selected.Image;
        SelectedText.Visible=true;
        SelectedText.Text=this.Inventory[Keys[this.SelectedItem]];
        this.Selected.Transparency = 0;
    }
    
    //{{ Tile Data }}\\
    
    function DropItem(Name,Position,Rotation=0){
    	let Drop = new Entity(Name);
    	Drop.SetSize(0.5,0.5);
    	Drop.Position=Position;
        Drop.Rotation=Rotation;
        Drop.Name = Name;
        Drop.CanCollide=false;
        Drop.Transparency=0;
        Drop.OnGameLoop=function(){
        	Drop.Rotation+=1;
        }
        Drop.OnTouch=function(e){
        	if(e!=Player)return;
        	Render.RemoveFromRenderLayer("Entity",Drop);
            Player.ToInventory(Drop.Name,1);
        }
        Render.ToRenderLayer("Entity",Drop);
    }
    
    const TileData = {
    	"Wall":{
        	Strength:3,
            MinePower:1,
            Drops:true,
            OnMine:function(self){
            	
            },
            Properties:{
            
            },
        },
        "Ore1":{
        	Strength:6,
            MinePower:1,
            Drops:true,
            OnMine:function(self){
            	
            },
            Properties:{
            
            },
        },
        "Furnace":{
        	Strength:3,
            MinePower:1,
            Drops:true,
            OnMine:function(self){
            	if(self.CItem){
                	DropItem(self.FurnaceItems[self.CItem],self.Position.Sub(self.LookVector.Mul(0.25)),self.Rotation+45);
                    self.CItem=undefined;
                }
            },
            Properties:{
            	States:{
                	"Off":"Furnace",
                    "On":"FurnaceLit",
                },
                FurnaceItems:{
                	"Ore1":"SmeltedOre1",
                },
            	OnRightClick:function(){
                	let self=this;
                	if(!self.Lit){
                    	if(self.CItem){
                        	Player.ToInventory(self.FurnaceItems[self.CItem],1);
                        	self.CItem=undefined;
                            if(self.CImage){
                            	self.CImage.Remove();
                                self.CImage=undefined;
                            }
                        	return;
                        }
                    	let Item = Object.keys(Player.Inventory)[Player.SelectedItem];
                        if(!Item)return;
                        if(!self.FurnaceItems.hasOwnProperty(Item))return;
                        if(Player.HasInventoryAmount(Item,0))return;
                        Player.RemoveFromInventory(Item,1);
                    	self.Lit=true;
                        self.CItem = Item;
                        setTimeout(()=>{
                        	self.Lit=false;
                            let img = new UIImage(Render);
                            img.Image=self.FurnaceItems[Item];
                            img.WorldSpace=true;
                            img.Position=self.Position;
                            img.Color="rgba(0,0,0,0.5)";
                            img.BorderSize=2;
                            img.BorderColor="rgba(255,255,255,1)";
                            img.Size=new UIVector(0,0.5,0,0.5);
                            img.SetAnchorPoint(0.5,0.5);
                            self.CImage=img;
                        },4000);
                    }
                },
                OnGameLoop:function(){
                	let self=this;
                    self.Image=self.States[self.Lit?"On":"Off"];
                },
            },
        },
    };
    
    function GetTileData(Tile){
    	if(!Tile.Name)return;
        return TileData[Tile.Name];
    }
    
    function SpawnTile(Name,Position){
    	const t = new Tile(Name);
        t.SetSize(1,1);
        t.Name=Name;
        let Data=GetTileData(t);
        if(Data){
        	t.Health=Data.Strength;
            t.OnRender=function(){
            	if(t.Health<Data.Strength){
                	if(t.LastHitTime){
                    	if(time()-t.LastHitTime>4){
                        	t.Health++;
                        }
                    }
                	let v = Math.floor((1-(t.Health-1)/(Data.Strength-1))*4)+1;
                    Render.DrawImage(DecayTiles[v],t.Size,t.Position,t.Rotation,0.25);
                }
            }
            for(let k in Data.Properties)
            	t[k]=Data.Properties[k];
        }
        t.Position=Position;
        Render.ToRenderLayer("Tile",t);
    }
    
    //{{ Tile Loading }}\\
    
    const DecayTiles = {
    	1:"Decay1",
        2:"Decay2",
        3:"Decay3",
        4:"Decay4",
        5:"Decay5",
    }
    
    const TileIds={
    	1:"Wall",
        2:"Ore1",
        3:"Furnace",
        4:"FurnaceLit",
    };
    const Tiles = [
    	[0,1,0,2,0,3,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ]
    for(let ny in Tiles){
    	let y=Tiles[ny];
        ny=+ny;
        for(let nx in y){
        	let x=y[nx];
            nx=+nx;
            if(x==0)continue;
            SpawnTile(TileIds[x],new Vector(nx,ny));
        }
    }
    
    //{{ Mouse Inputs }}\\
    
    let MousePosition = new Vector();
    Mouse.on("move",i=>{
    	MousePosition=i.Position;
    });
    Mouse.on("up",i=>{
    	let Tile = Render.GetRenderableAtPosition(i.Position,["Tile"]);
    	if(Tile&&Tile.OnMouseUp){
        	Tile.OnMouseUp(i);
        }
    });
    Mouse.on("rightclick",i=>{
    	let Tile = Render.GetRenderableAtPosition(i.Position,["Tile"]);
        if(!Tile){
        	let Item = Object.keys(Player.Inventory)[Player.SelectedItem];
            if(!Item)return;
            if(!TileData[Item])return;
        	let Pos = i.Position.Add(Render.Camera.Position.Sub(Render.ASize.Div(2))).Round();
            let PPos = Player.Position;
            let c = new Renderable("");
            c.SetSize(1,1);
            c.Position=Pos;
    		for(let v of Render.RawRenderLayers){
        		for(let r of v.Layer){
            		if(r==this)continue;
                	if(!r.IsOnScreen())continue;
                	if(!r.CanTouch)continue;
                	if (r.IsCollidingWith(c)){
                		return;
                	}
            	}	
        	}
        	if(PPos.Sub(Pos).Magnitude()>2)return;
            if(!Player.HasInventoryAmount(Item,0)){
            	Player.RemoveFromInventory(Item,1);
            	SpawnTile(Item,Pos);
            }
        	return;
        }
        if(Tile.OnRightClick){
        	Tile.OnRightClick(i);
        }
    });
    Mouse.on("down",i=>{
    	let Tile = Render.GetRenderableAtPosition(i.Position,["Tile"]);
        if(!Tile){
        	
        	return;
        }
        if(Tile.OnMouseDown){
        	Tile.OnMouseDown(i);
        }
        let Data=GetTileData(Tile);
        if(!Data)return;
        if(Tile.Position.Sub(Player.Position).Magnitude()>2)return;
        if(Tile.MinePower>Player.MinePower)return;
        Tile.Health-=Player.MinePower;
        Tile.LastHitTime=time();
        if(Tile.Health<=0){
        	Render.RemoveFromRenderLayer("Tile",Tile);
            Data.OnMine(Tile);
            if(Data.Drops===true){
            	DropItem(Tile.Name,Tile.Position,Tile.Rotation);
            }
        }
    });
    
    Mouse.on("keydown",i=>{
    	if(i.Key==="e"){
        	Player.ChangeSelectedItem(1);
        }else if(i.Key==="q"){
        	Player.ChangeSelectedItem(-1);
        }
    });
    
    //{{ Settings }}\\
    
    let SSize = Render.ASize.Div(2);
  	
    //{{ Player Loop }}\\
    
    Player.OnGameLoop=function(){
        let MoveX=0,MoveY=0,XD=false,YD=false;
    	if(Render.IsKeyDown("d")){
        	MoveX=Player.MoveSpeed;
            XD=true;
        }else if(Render.IsKeyDown("a")){
        	MoveX=-Player.MoveSpeed;
            XD=true;
        }
        if(Render.IsKeyDown("w")){
        	MoveY=-Player.MoveSpeed;
            YD=true;
        }else if(Render.IsKeyDown("s")){
        	MoveY=Player.MoveSpeed;
            YD=true;
        }
        Player.Velocity.x=Math.clamp((Player.Velocity.x*(XD?1:Player.Friction))+MoveX,-Player.MaxMoveSpeed,Player.MaxMoveSpeed);
        Player.Velocity.y=Math.clamp((Player.Velocity.y*(YD?1:Player.Friction))+MoveY,-Player.MaxMoveSpeed,Player.MaxMoveSpeed);
        Camera.Position=Camera.Position.Lerp(Player.Position.Add(Player.Size.Div(2)),0.1);
        let Rot = Player.Rotation,
        	Dir = Math.deg(Math.atan2(SSize.y-MousePosition.y,SSize.x-MousePosition.x));
        Player.Rotation=AngleCheck(Math.lerp(...AngleOverflowCheck(Rot,Dir),0.4),0,360);
        Player.Selected.Position=Player.Position.Add(Player.LookVector.Mul(0.5).Add(Player.RightVector.Mul(0.25)));
        Player.Selected.Rotation=Player.Rotation-75;
        let C = Player.GetCollisions();
        for(let v of C){
        	if(v.OnTouch){
            	v.OnTouch(Player);
            }
        }
    }
    Player.OnRender=function(){
    	let Tile = Render.GetRenderableAtPosition(MousePosition,["Tile"]);
    	if(Tile&&Tile.Position.Sub(Player.Position).Magnitude()<=2){
        	Render.Selected=Tile;
        }else{
        	Render.Selected=undefined;
        }
    }
    Render.ToRenderLayer("Entity",Player);
    while(true){
    	Render.GameLoop();
        await wait(1/30);
    }
    }catch(e){
    	document.write(e.stack);
    }
}

Main();
