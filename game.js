const Player = new _Renderable("Player");
Render.ToRenderPlayer("Entity",Player);
Player.Inventory = {
	Index:0,
	ItemNames:[],
	Items:{},
};
Player.ToInventory=function(Name,Amount=1){
	let Inventory = this.Inventory;
	if(!Inventory.ItemNames.includes(Name)){
		Inventory.ItemNames.push(Name);
		Inventory.Items[Name] = 0;
	}
	Inventory.Items[Name]+=Amount;
	this.ChangeSelectedItem(0);
}
Player.RemoveFromInventory=function(Name,Amount=1){
	let Inventory = this.Inventory;
	if(!Inventory.ItemNames.includes(Name))return;
	Inventory.Items[Name]-=Amount;
	if(Inventory.Items[Name]<=0){
		delete Inventory.Items[Name];
		Inventory.ItemNames.splice(Inventory.ItemNames.indexOf(Name),1);
		this.ChangeSelectedItem(1);
	}
}
Player.ChangeSelectedItem = function(Amount=1){
	let Inventory = this.Inventory;
	if(Inventory.ItemNames.length===0)return;
	Inventory.Index+=Amount;
	Inventory.Index%=Inventory.ItemNames.length;
	this.CurrentItem = Inventory.ItemNames[Inventory.Index];
}
