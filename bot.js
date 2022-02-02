var http = require('http');
const Discord = require("discord.js");

var Game = require("./game.js");

const client = new Discord.Client();

var game = null;

var playerScores = {};

setInterval(() => game.saveToDB(), 1800000);



 http.createServer(function (request, response) {
 	response.write("Status Online");
 	response.end();
 }).listen(process.env.PORT || 8080);

//FCBOT
client.login('NTAzMDg2Mjk0Njc1NjE5ODQy.Dq08hw.yGryKB_k7WbF1bJSpK7gZZccNtQ');
//TESTBOT
// client.login('NTAzMzMxNzI1OTU5NDk1Njgy.Dq07xA.aIQFXNzE_nVl46mGu48ScrtOg7k');

client.on('ready', () => {
	console.log('Logged in as ' + client.user.tag);
	
	game = new Game.game();
	game.loadFromDB();

    messageAdmin("Server Started");

    setInterval(function(){ 
        reviveAll();
    }, 86400000);
});

function messageAdmin(message)
{
    let user = client.fetchUser('172167300764532736')
    .then(user => {
        user.send(message); 
    });
}

function reviveAll()
{
    var response = game.reviveAll();
    if(response != ""){
        client.guilds.forEach(guild => {
            var id = guild.channels.find(channel => 
                channel.name === "general" || channel.name === "home").send(response).catch(console.error);
            console.log(id);
        });
    }
}

client.on('message', (message) => {
	if(message.content.toLowerCase() === "save")
	{
		
	}

    if(message.content.toLowerCase().indexOf("max") > -1 && message.author.username != "FCBOT") {
        if(playerScores[message.author.username] == null)
        	playerScores[message.author.username] = 1;
        else
        	playerScores[message.author.username] = playerScores[message.author.username] + 1;
    }

    var action = message.content.toLowerCase();
    var actorName = message.author.username + "#" + message.author.discriminator;

    game.createPlayerIfNotExits(actorName, message.author.username);

    var acted = message.mentions.users.first();
    var actedName = null;

    if(acted != null)
    {
        actedName = acted.username + "#" + acted.discriminator;
        game.createPlayerIfNotExits(actedName, acted.username);
    }

    console.log(actorName)
    console.log(actedName);

    var response = game.action(action, actorName, actedName);


    if(response != null && response != ""){
        response = response.substring(0, 1999);
    	message.channel.send(response).catch(console.log);
    }
});

process.on('exit', function()
{
    console.log("Server Exited");
})

process.on('SIGINT', function()
{
    messageAdmin("Server Interrupted");
    setTimeout(() => process.exit(2), 3000);
})

process.on('SIGTERM', function()
{
    messageAdmin("Server Terminated");
    setTimeout(() => process.exit(2), 3000);
})

process.on('uncaughtException', function(e) {
    messageAdmin(e.stack);
    setTimeout(() => process.exit(99), 3000);
  });

function error(e) {
	console.log(e.stack);
	process.exit(0);
}
