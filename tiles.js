const Render = new _Renderer("screen");
Render.NewRenderLayer("Tile",10);
Render.NewRenderLayer("Entity",5);
Render.LoadedImages = window.LoadedImages;

const TileData = {
	/*
	"Template":{
		On:{
			Place:(self)=>{},
			Break:(self)=>{},
			Render:(self)=>{},
			GameLoop:(self)=>{},
		},
		Image:"template.png",
		Strength:3,
		MinePower:1,
		Requires:"Pickaxe", //Pickaxe, Any,
		CanPlace:true,
		Drops:true,
	}
	*/
}

function GetTileData(Name){
	return TileData[Name];	
}

function SpawnTile(Name,Position){
	let Data = GetTileData(Name);
	if(!Data)return;
	if(!Data.CanPlace)return;
	let Tile = new _Renderable(Data.Image);
	Render.ToRenderLayer("Tile",Tile);
	Tile.Position = Position,
		Tile.Size = new Vector(1,1),
		Tile.Name = Name,
		Tile.Health = Data.Strength;
	if(Data.On.Render)
		Tile.OnRender = function(){
			Data.On.Render(this);
			/*
			if(t.Health<Data.Strength){
                	if(t.LastHitTime)
                    	if(time()-t.LastHitTime>4)
                        	t.Health++;
                	let v = Math.floor((1-(t.Health-1)/(Data.Strength-1))*4)+1;
                    Render.DrawImage(DecayTiles[Math.clamp(v,1,5)],t.Size,t.Position,t.Rotation,0.25);
                }
			*/
		}
	if(Data.On.GameLoop)
		Tile.OnGameLoop = function(){
			Data.On.GameLoop(this);	
		}
	return Tile;
}

function DropItem(Name,Position,Rotation){
	let Drop = new _Renderable(Name);
	Drop.SetSize(0.5,0.5);
	Drop.Position = Position;
	Drop.CanCollide = false;
	Drop.Name = Name;
	Drop.Transparency = 0;
	Drop.OnGameLoop = function(){
		this.Rotation += 1;	
	}
	Drop.OnTouch = function(Entity){
		if(Entity != Render.Player)return;
		Render.RemoveFromRenderLayer("Entity",Drop);
		Render.Player.ToInventory(Drop.Name,1);
	}
	Render.ToRenderLayer("Entity",Drop);
}

function MineTile(Tile){
	let Data = GetTileData(Tile);
	if(!Data||Render.Player.CurrentItem.Type!=Data.Requires)return;
	if(Data.MinePower>Render.Player.MinePower)return;
	Tile.Health -= Render.Player.MinePower;
	Tile.LastHitTime=GetTime();
	if(Tile.Health <= 0){
		Render.RemoveFromRenderLayer("Tile",Tile);
		if(Data.On.Mine)Data.On.Mine(Tile);
		if(Data.Drops===true)DropItem(Tile.Name,Tile.Position,Tile.Rotation);
	}
}
