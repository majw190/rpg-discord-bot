module.exports.game = class game
{

constructor(){
this.playerScores = {};

this.playerStats = {};

this.world = {
    npcs: [],
    items: [

         {"itemID": null,
         "name": "Katana",
         "type": "weapon",
         "damage": 12}]
};
}

action(action, actor, acted) {
    var response = "";
    action = action.toLowerCase();

	if(action === "save")
	{
		this.saveToDB();
	}

    if(action.startsWith("mystats"))
    {
        response = this.myStats(actor);
        if(response != "")
            return response;
    }

    if(action.startsWith("attack"))
    {
        response = this.attack(actor, acted);
    	if(response != "")
    		return response;
    }

    if(action.startsWith("heal"))
    {
        response = this.heal(actor, acted);
        if(response != "")
            return response;
    }

    if(action.startsWith("reviveall"))
    {
        response = this.reviveAll(actor);
        if(response != "")
            return response;
    }

    if(action.startsWith("revive"))
    {
        response = this.revive(actor, acted);
        if(response != "")
            return response;
    }

    if(action.startsWith("inventory"))
    {
        response = this.showInventory(actor);
        if(response != "")
            return response;
    }

    if(action.startsWith("world"))
    {
        response = this.showWorld();
        if(response != "")
            return response;
    }

    if(action.startsWith("pickup"))
    {
        var text = action.split(" ")[1];
        var num = Number(text);

        console.log(num)
        if(!isNaN(num) && num != null){
            response = this.pickUpItem(actor, num);
        }
        if(response != "")
            return response;
    }

    if(action.startsWith("drop"))
    {
        var text = action.split(" ")[1];
        var num = Number(text);

        console.log(num)
        if(!isNaN(num) && num != null){
            response = this.dropItem(actor, num);
        }
        if(response != "")
            return response;
    }

    if(action.startsWith("equip"))
    {
        var text = action.split(" ")[1];
        var num = Number(text);


        console.log(num)
        if(!isNaN(num) && num != null){
            response += this.equip(actor, num);
        }
        else
            response = "Use a inventory slot number for the equip command.";

        if(response != "")
            return response;
    }

    if(action.startsWith("unequip"))
    {
        response = this.unequip(actor);
        if(response != "")
            return response;
    }



    if(action.startsWith("getallplayers"))
    {
        for(var key in this.playerStats)
            response += this.playerStats[key].username + ", " + this.playerStats[key].playerID + 
            this.playerStats[key].isNPC + "\n";
        if(response != "")
            return response;
    }




    return null;
}

createPlayerIfNotExits(username, name)
{
    if(this.playerStats[username] == null){
        this.createPlayer(null, username, name, 1, 0, 100, 100, 20, null, false);
    }
}

gainXP(player, xp)
{
	player.experience += xp
	var level = Math.floor(Math.log10(player.experience));
	if(player.level != level)
	{
		this.setLevel(player, level);
		return true;
	}
	else
	{
		return false;
	}
}

myStats(username)
{
    var response = "";
    var player;

    player = this.getPlayerStats(username);

    response +=  player.name + "\nLevel: " + player.level + "\n" +
        "Experience: " + player.experience + "\n" +
        "Health: " + player.health + "/" + player.maxHealth + "\n" + 
        "Attack: " + player.attack + "\n";

    if(player.weapon != null)
        response += "Weapon: " + player.weapon.name + ", Damage: " + player.weapon.damage + "\n";

    if(player.inventory.length > 0)
    {
        response += "Inventory\n";
        response += this.showInventory(player.username);
    }

    return response;
}

attack(attackerName, attackedName)
{
    var attacker;
    var attacked;

    var response = "";

    if(attackerName != null && attackedName != null)
    {
        attacker = this.getPlayerStats(attackerName);
        attacked = this.getPlayerStats(attackedName);

        if(attacker.health <= 0){
            response += "You can't attack when you're dead.";
        }else if(attacked.health <= 0)
        {
            response += attacked.name + " already is dead.";
        }
        else{
            var damage = this.playerStats[attacker.username].attack;
            if(attacker.weapon != null)
                damage += attacker.weapon.damage;
            this.playerStats[attacked.username].health -= damage;
            response += attacker.name + " deals " + damage + " damage to " 
                + attacked.name + ". Their health is " + attacked.health 
                + "/" + attacked.maxHealth + "\n";
            if(attacked.health <= 0)
            {
                this.playerStats[attacked.username].health = 0;
                response += attacker.name + " kills " + attacked.name + "\n";
                response += this.dropAllItems(attacked.username);
                var xp  = attacked.level * 50;
                response += "+ " + xp + " XP gained\n";
                if(this.gainXP(attacker, xp))
                    response += attacker.name + " is now level " + attacker.level;
            }
        }

        return response;
    }
}

heal(healerName, healedName) 
{
    var response = "";

    if(healerName != null && healedName != null)
    {
        var healer = this.getPlayerStats(healerName);
        var healed = this.getPlayerStats(healedName);

        response = "";
        if(healer.health <= 0){
            response += "You can't heal when you're dead.";
        }else if(healed.health <= 0)
        {
            response += healed.name + " is dead.";
        }else{
            var missingHealth = healed.maxHealth - healed.health;
            this.playerStats[healed.username].health += missingHealth;

            if(healer.username === healed.username)
                response += healer.name + " heals himself for " + missingHealth;
            else
                response += healer.name + " heals " + healed.name + " for " + missingHealth;
            response += ". Their health is " + healed.health 
                + "/" + healed.maxHealth + "\n"
        }

        if(response != "")
            return response;
    }
}

revive(reviverName, revivedName)
{
    var response = "";
    if(reviverName != null && revivedName != null)
    {
        var reviver = this.getPlayerStats(reviverName);
        var revived = this.getPlayerStats(revivedName);

        response = "";
        if(reviver.health <= 0){
            response += "You can't revive when you're dead.";
        }else if(revived.health > 0)
        {
            response += revived.name + " is not dead.";
        }else{
            this.playerStats[revived.username].health = revived.maxHealth;
            response += reviver.name + " revived " + revived.name
        }

        if(response != "")
            return response;
    }
}

reviveAll(username)
{
    var response = "";
    var blessings = "By the blessings of FCBOT, all players have been revived.\n"
    var revives = "";

    for(var key in this.playerStats)
    {
        var player = this.getPlayerStats(key);
        if(player.health <= 0)
        {
            this.playerStats[player.username].health = player.maxHealth;
            revives += player.name + " has been revived.\n";
        }

    }

    if(revives == "")
        return response;

    return blessings + revives;
}

showInventory(username)
{
    var response = "";

    var player = this.getPlayerStats(username);

    if(player != null)
    {
        response += player.inventory.length + " Items\n";
        for (var i = 0;i < player.inventory.length;i++) {
            response += (i+1) + ". Name: " + player.inventory[i].name + ", Type: " + player.inventory[i].type 
            + ", Damage: " + player.inventory[i].damage + "\n";
        }
    }

    return response;
}

showWorld()
{
    var response = "";

    var items = this.world.items;

    if(items != null)
    {
        response += "Items on the ground:\n";
        for (var i = 0;i < items.length;i++) {
            response += (i+1) + ". Name: " + items[i].name + ", Type: " + items[i].type
            + ", Damage: " + items[i].damage + "\n"; + "\n";
        }
    }

    return response;
}

giveItem(username, item)
{
    var response = "";

    var player = this.getPlayerStats(username);

    if(player != null)
    {
        player.inventory.push(item);
    }
}

pickUpItem(username, itemSlot)
{
    var response = "";

    var player = this.getPlayerStats(username);

    if(player != null)
    {
        if(player.health <= 0)
            response += "You can't pick up items when you're dead.";
        else{
            var item = this.world.items[itemSlot - 1];

            if(item != null){
                player.inventory.push(item);
                this.world.items.splice(itemSlot - 1, 1);

                response += player.name + " has picked up " + item.name;
            }else{
                response += "There is no item in that slot on the ground.";
            }
        }

    }

    return response;

}

dropItem(username, itemSlot)
{
    var response = "";

    var player = this.getPlayerStats(username);

    if(player != null)
    {
        var item = player.inventory[itemSlot - 1];

        if(item != null){
            this.world.items.push(item);
            player.inventory.splice(itemSlot - 1, 1);

            response += player.name + " has dropped " + item.name;
        }else{
            response += "There is no item in that slot in your inventory.";
        }

    }

    return response;

}

equip(username, itemSlot)
{
    var response = "";
    var player = this.getPlayerStats(username);

    if(player != null)
    {
        var weapon = player.inventory[itemSlot - 1];

        if(weapon != null && weapon.type == "weapon")
        {
            if(player.weapon != null)
                response += this.unequip(username);

            player.weapon = weapon;

            player.inventory.splice(itemSlot - 1, 1);

            response += player.name + " has equipped " + weapon.name;
        }else if(weapon != null)
        {
            response += weapon.name + " is not a weapon.\n";
        }
        else
        {
            response += "That inventory slot is empty.\n"
        }
    }

    return response;
}

unequip(username)
{
    var response = "";
    var player = this.getPlayerStats(username);

    if(player != null)
    {
        if(player.weapon != null)
        {
            player.inventory.push(player.weapon);

            response += player.name + " has unequipped " + player.weapon.name + "\n";

            player.weapon = null;
        }else{
            response += "You have no weapon equipped.";
        }
    }

    return response;
}

dropAllItems(username)
{
    var response = "";
    var player = this.getPlayerStats(username);

    if(player != null)
    {
        this.unequip(username);
        for(var i = player.inventory.length; i >= 0;i--)
        {
            this.dropItem(username, i+1);
        }

        response += player.name + " dropped all their items.\n";
    }

    return response;
}

setLevel(player, level)
{
	this.playerStats[player.username].level = level;
	this.playerStats[player.username].maxHealth = 80 + 20 * player.level;
	this.playerStats[player.username].attack = 20 + 2 * player.level;
}


getPlayerStats(username, name)
{
	return this.playerStats[username];
}

createPlayer(playerID, username, name, level, experience, health, maxHealth, attack, weapon, isNPC)
{
	this.playerStats[username] = {
		"playerID": playerID,
		"username": username,
		"name": name,
		"level": level,
		"experience": experience,
		"health": health,
		"maxHealth": maxHealth,
		"attack": attack,
		"weapon": weapon,
		"armor": null,
		"abilities": ["attack", "heal", "revive"],
		"inventory": [],
        "isNPC": isNPC
	};
}

createItem(itemID, name, type, damage)
{
    var item = {"itemID": itemID,
         "name": name,
         "type": type,
         "damage": damage}

    return item;
}

getConfig()
{
    console.log('getting config')
	//Real DB
	var config = {
        user: 'RamzedRPG',
        password: 'lv4z5X7!',
        host: '198.71.227.86', 
        database: 'RPG' 
    };
 	//Test DB
    // var config = {
    //     user: 'Ramzed_RPGTest',
    //     password: 'lv4z5X7!',
    //     host: '198.71.227.86', 
    //     database: 'Ramzed_RPG_Test' 
    // };


    return config;
}

loadFromDB()
{
	var database = require('./database.js');
    var db = new database.database(this.getConfig());
    var game = this;

	var sql = "SELECT * FROM Player LEFT JOIN Items ON Player.weaponID = Items.ItemID";
    console.log(sql);
	db.query(sql).then(result => {
		for (var i = 0; i < result[0].length; i++) {
		    var player = result[0][i];

            var weapon = null;
            if(player.weaponID != null)
                weapon = game.createItem(player.ItemID, player.Name, player.Type, player.Damage);

		    game.createPlayer(player.playerID, player.username, player.name, 
		    	player.level, player.experience, player.health, player.maxHealth, player.attack, weapon, false);
            
		}

        var sql2 = "SELECT * FROM Inventory JOIN Items ON Inventory.itemID = Items.itemID JOIN Player ON Inventory.playerID = Player.playerID";
        console.log(sql2)
        return db.query(sql2);
    }).then(result => {
        for (var i = 0; i < result[0].length; i++) {
            var item = this.createItem(result[0][i].ItemID, result[0][i].Name, result[0][i].Type, result[0][i].Damage);
            this.giveItem(result[0][i].username, item);
        }
    }
    ).then(() => {
            db.close();
    });
}



saveToDB()
{
    var database = require('./database.js');
    var db = new database.database(this.getConfig());
    var promises = [];

    var game = this;
    
    for (var key in game.playerStats){
        var k = key;
        
    	var player = game.playerStats[key];

        var weaponID = "NULL";
        if(player.weaponID != null)
            weaponID = player.weaponID;

    	if(player.playerID == null && player.playerID != 0 && player.isNPC != true)
    	{
    		var sql = "Insert INTO Player (username, name, level, experience, health, maxHealth, attack, weaponID) VALUES ('" +
					player.username + "', '" + player.name + "', " + player.level + ", " + player.experience+ ", " + 
                    player.health + ", " + player.maxHealth + ", " + player.attack + ", " + weaponID + ")";
            console.log(sql);
			promises.push( 
                db.query(sql, null, key)
                .then(function(result){
					if(result[0].insertId != null)
						game.playerStats[result[2]].playerID = result[0].insertId;

                })
            );
    	}else if(player.isNPC != true){
    		var sql = "Update Player SET username = '" + player.username + "', name = '" + player.name + "', level = " + player.level + 
    			", experience = " + player.experience + ", health = " + player.health + ", maxHealth = " + player.maxHealth + 
                ", attack = " + player.attack + ", weaponID = " + weaponID + 
    			" WHERE playerID = " + player.playerID;
            console.log(sql);
    		promises.push(

                db.query(sql, null, key)
                .then(function(result){

    			})
            );

    		
    	}
    }

    Promise.all(promises).then(function(values)
    {
        db.close();
        console.log("Items Save");
        var mysql = require('mysql');
        var con = mysql.createConnection(game.getConfig());
        con.connect(function(err) {
          if (err) throw err;
          console.log("Create Items Connected!");
        });

        var playerPromises = [];
        for (var k in game.playerStats){
            var p = game.playerStats[key];
            
            playerPromises.push(new Promise(function(pResolve, pRreject) 
            {
                var key = k;
                p = game.playerStats[key];
                var weapon = p.weapon;
                var itemPromises = [];
                if(p.inventory != null && p.inventory.length != 0)
                {
                    for (var i = 0; i < p.inventory.length; i++) {
                        var item = p.inventory[i];
                        var iNum = i;
                        itemPromises.push(new Promise(function(resolve, reject) {
                            if(item.itemID == null)
                            {
                                var sql2 = "Insert INTO Items (name, type, damage) VALUES ('" + item.name + "', '" + item.type + "', " 
                                    + item.damage + ")";
                                console.log(sql2);
                                
                                con.query(sql2,function(err, result){
                                    if(err) throw err;

                                    if(result.insertId != null){
                                        var sql3 = "Insert INTO Inventory (playerID, itemID) VALUES (" + game.playerStats[key].playerID  
                                            + ", " + result.insertId + ")"; 
                                            console.log(sql3);
                                            con.query(sql3, function(result, err){
                                                resolve(key);
                                            });
                                        game.playerStats[key].inventory[iNum].itemID = result.insertId;
                                    }else{
                                        resolve(key);
                                    }
                                });
                            }else{
                                var sql3 = "Insert INTO Inventory (playerID, itemID) VALUES (" + game.playerStats[key].playerID  
                                + ", " + item.itemID + ")"; 
                                console.log(sql3);
                                con.query(sql3, function(result, err){
                                    resolve(key);
                                });
                            }
                        }));
                    }
                    
                }

                if(weapon != null)
                {
                    itemPromises.push(new Promise(function(resolve, reject) {
                        console.log("Weapon " + weapon)
                        if(weapon.itemID == null){
                        var sql2 = "Insert INTO Items (name, type, damage) VALUES ('" + weapon.name + "', '" + weapon.type + "', " 
                                + weapon.damage + ")";
                            console.log(sql2);
                            
                            con.query(sql2,function(err, result){
                                var sql3 = "Update Player SET weaponID = " + result.insertId + " WHERE playerID = " + p.playerID;
                                console.log(sql3);
                                con.query(sql3, function(result, err){
                                    resolve(key);
                                });

                                game.playerStats[key].weapon.itemID = result.insertId;
                            });
                        }else{
                            var sql3 = "Update Player SET weaponID = " + weapon.itemID + " WHERE playerID = " + p.playerID;
                            console.log(sql3);
                            con.query(sql3, function(result, err){
                                resolve(key);
                            });
                        }
                    }));
                }else{
                    itemPromises.push(new Promise(function(resolve, reject) {
                        var sql3 = "Update Player SET weaponID = NULL WHERE playerID = " + p.playerID;
                        console.log(sql3);
                        con.query(sql3, function(result, err){
                            resolve(key);
                        });
                    }));
                }

                Promise.all(itemPromises).then(function(values)
                {
                    console.log("Items Promises " + values[0] + " Count " + values.length)
                    pResolve();
                    game.deleteItems(values[0]);
                    
                }).catch(console.log);
            }));
        }

        Promise.all(playerPromises).then(function(values){
            con.end();
        }).catch(console.log);
    });
}


deleteItems(key){
    console.log("deleting items " + key);
        var mysql = require('mysql');
        var con = mysql.createConnection(this.getConfig());
        con.connect(function(err) {
          if (err) throw err;
          console.log("Delete Items Connected!");
        });

        var player = this.playerStats[key];
        var itemIDList = [];
        for (var i = 0; i < player.inventory.length; i++) {
            itemIDList.push(player.inventory[i].itemID)
        }

        if(itemIDList != null && itemIDList.length != 0){
            var sql2 = "DELETE FROM Inventory WHERE playerID = " + player.playerID + " AND itemID NOT IN ("
                + itemIDList.join() + ")";
            console.log(sql2);
            con.query(sql2, function(err, result){
                console.log("Deleted " + result.affectedRows + " Items from " + player.name);
                con.end();
            });
        }else{
             var sql2 = "DELETE FROM Inventory WHERE playerID = " + player.playerID;
            console.log(sql2);
            con.query(sql2, function(err, result){
                console.log("Deleted " + result.affectedRows + " Items from " + player.name);
                con.end();
            });
        }
    }
}
