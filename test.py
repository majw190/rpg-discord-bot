var mocha = require('mocha');
var assert = require('assert');
var game = require("./game.js");

describe("mystats", function(){
	it("should work", function(){
		var g = new game.game();
		g.createPlayerIfNotExits("Petrov#1932", "Petrov");
		g.createPlayerIfNotExits("TESTBOT#0804", "TESTBOT");
		
		assert.deepEqual(g.action("mystats", "Petrov#1932", "TESTBOT#0804"), 
			"Petrov"
			+ "\nLevel: 1" 
			+ "\nExperience: 0" 
			+ "\nHealth: 100/100"
			+ "\nAttack: 20")
	})
})

describe("Attack", function(){
	it("should work", function(){
		var g = new game.game();
		g.createPlayerIfNotExits("Petrov#1932", "Petrov");
		g.createPlayerIfNotExits("TESTBOT#0804", "TESTBOT");
		g.action("Attack", "Petrov#1932", "TESTBOT#0804");
		assert.deepEqual(g.action("Attack", "Petrov#1932", "TESTBOT#0804"), 
			"Petrov deals 20 damage to TESTBOT. Their health is 60/100\n");
	})

	it("should kill", function(){
		var g = new game.game();
		g.createPlayerIfNotExits("Petrov#1932", "Petrov");
		g.createPlayerIfNotExits("TESTBOT#0804", "TESTBOT");
		g.action("Attack", "Petrov#1932", "TESTBOT#0804");
		g.action("Attack", "Petrov#1932", "TESTBOT#0804");
		g.action("Attack", "Petrov#1932", "TESTBOT#0804");
		g.action("Attack", "Petrov#1932", "TESTBOT#0804");
		assert.deepEqual(g.action("Attack", "Petrov#1932", "TESTBOT#0804"), 
			"Petrov deals 20 damage to TESTBOT. Their health is 0/100\n"
			+ "Petrov kills TESTBOT\n"
			+ "+ 50 XP gained\n");
	})
})


describe("Heal", function(){
	it("should work", function(){
		var g = new game.game();
		g.createPlayerIfNotExits("Petrov#1932", "Petrov");
		g.createPlayerIfNotExits("TESTBOT#0804", "TESTBOT");
		g.action("Attack", "Petrov#1932", "TESTBOT#0804");
		g.action("Attack", "Petrov#1932", "TESTBOT#0804");
		g.action("attack", "Petrov#1932", "TESTBOT#0804");
		assert.deepEqual(g.action("heal", "Petrov#1932", "TESTBOT#0804"), 
			"Petrov heals TESTBOT for 20. Their health is 60/100\n");
	})
})

describe("Revive", function(){
	it("should work", function(){
		var g = new game.game();
		g.createPlayerIfNotExits("Petrov#1932", "Petrov");
		g.createPlayerIfNotExits("TESTBOT#0804", "TESTBOT");
		g.action("Attack", "Petrov#1932", "TESTBOT#0804");
		g.action("Attack", "Petrov#1932", "TESTBOT#0804");
		g.action("attack", "Petrov#1932", "TESTBOT#0804");
		g.action("attack", "Petrov#1932", "TESTBOT#0804");
		g.action("attack", "Petrov#1932", "TESTBOT#0804");
		assert.deepEqual(g.action("revive", "Petrov#1932", "TESTBOT#0804"), 
			"Petrov revived TESTBOT");
	})
})
