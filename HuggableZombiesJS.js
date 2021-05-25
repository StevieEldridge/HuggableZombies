$(document).ready(function() {
	$("body").removeClass("preload");
});

var gameWidth = gameArea.width = (window.innerWidth * 0.86) - 50;
var gameHeight = gameArea.height = window.innerHeight - 20;
document.getElementById("hud").style.fontSize = (window.innerWidth / 3000 + 0.4) + "em";


var frameRate = 60.0;


if (localStorage.hasStorage) {
	var playerSight = parseFloat(localStorage.playerSight);
	var scale = Math.pow(((window.innerWidth * window.innerHeight) / 2500000), 0.5) * 1.3 / playerSight;
	var playerSpeed = parseFloat(localStorage.playerSpeed);
	var playerAcceleration = parseFloat(localStorage.playerAcceleration);
	var maxPlayerHealth = parseFloat(localStorage.maxPlayerHealth);
	var playerHealth = parseFloat(maxPlayerHealth);
	var playerSize = 0.8 * scale;
	var playerCritChance = parseFloat(localStorage.playerCritChance);
	var playerCritMulti = parseFloat(localStorage.playerCritMulti);
	var maxPlayerSprint = parseFloat(localStorage.maxPlayerSprint);
	var playerSprint = parseFloat(maxPlayerSprint);
	var playerSprintMulti = parseFloat(localStorage.playerSprintMulti);
	var exp = parseFloat(localStorage.exp);
	var level = parseInt(localStorage.level);
	var nextLevelExp = Math.pow(8 * level, 1 + 0.003 * (2 * level));
	var upgradePoints = parseInt(localStorage.upgradePoints);
	var wave = parseInt(localStorage.wave);
	var waveZombies = JSON.parse(localStorage.waveZombies);
	var waveCleared = localStorage.waveCleared;
	var upgradeLevel = JSON.parse(localStorage.upgradeLevel);
	var pistol = new MarshmellowGun();
	var rifle = new MarshmellowGun();
	var shotgun = new MarshmellowGun();
	var sniper = new MarshmellowGun();
	Object.assign(pistol, JSON.parse(localStorage.pistol));
	Object.assign(rifle, JSON.parse(localStorage.rifle));
	Object.assign(shotgun, JSON.parse(localStorage.shotgun));
	Object.assign(sniper, JSON.parse(localStorage.sniper));
	var marshmellowMode = localStorage.marshmellowMode;

	var storedArmor = Array(1000);
	var storedArmorTemp = JSON.parse(localStorage.storedArmor);
	for (var i = 0; i < storedArmorTemp.length; i++) {
		if (storedArmorTemp[i] != null) {
			storedArmor[i] = new Armor(0, "empty", "empty", "empty");
			Object.assign(storedArmor[i], storedArmorTemp[i]);
		}
	}
	var helmet = new Armor(0, "empty", "head", "empty");
	var chestplate = new Armor(0, "empty", "chest", "empty");
	var leggings = new Armor(0, "empty", "legs", "empty");
	var boots = new Armor(0, "empty", "feet", "empty");
	Object.assign(helmet, JSON.parse(localStorage.helmet));
	Object.assign(chestplate, JSON.parse(localStorage.chestplate));
	Object.assign(leggings, JSON.parse(localStorage.leggings));
	Object.assign(boots, JSON.parse(localStorage.boots));

}
else {
	var playerSight = 1.0;
	var scale = Math.pow(((window.innerWidth * window.innerHeight) / 2500000), 0.5) * 1.3 / playerSight;
	var playerSpeed = 10.0; //Set 0 or higher only
	var playerAcceleration = 5; //Set between 0 to 60 only
	var maxPlayerHealth = 100;
	var playerHealth = 100;
	var playerArmor = 0.00;
	var playerSize = 0.8 * scale;
	var maxPlayerSprint = 4.0; //Sets max sprint time in seconds
	var playerSprint = 4.0;
	var playerSprintMulti = 1.4; //Multiplies the playerSpeed when sprinting
	var playerCritChance = 0.05;  //Odds of getting a mouth shot
	var playerCritMulti = 1.25; //The damage bonus from a mouth shot
	var exp = 0;
	var level = 1;
	var nextLevelExp = Math.pow(8 * 1, 1 + 0.003 * (2 * 1));
	var upgradePoints = 0;
	var wave = 0;
	var waveCleared = "false";

	var upgradeLevel = [[0,0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]];

	var storedArmor = new Array(1000);
	var helmet = new Armor(0, "empty", "head", "empty");
	var chestplate = new Armor(0, "empty", "chest", "empty");
	var leggings = new Armor(0, "empty", "legs", "empty");
	var boots = new Armor(0, "empty", "feet", "empty");

	var pistol = new MarshmellowGun(20, 20, 2.0, 0.93, 0.37, 1, 7, 3.0);
	var rifle = new MarshmellowGun(15, 35, 3.0, 0.4, 0.25, 1, 20, 5.0);
	var shotgun = new MarshmellowGun(8, 30, 0.9, 0.3, 0.18, 8, 4, 4.0);
	var sniper = new MarshmellowGun(60, 51, 0.6, 1, 0.35, 1, 5, 7.0);
	var marshmellowMode = "pistol";

	localStorage.cameFromUpgrades = false;

	var waveZombies = new Array(2000); //Array that stores what zombies were in the previous wave
	for (var i = 0; i < 10000; i++) {
		waveZombies[i] = new Array(3); //xpos, ypos, type
	}

	saveData();
}

var playerMeleeArmor = helmet.getMeleeReductionModifier() + chestplate.getMeleeReductionModifier() +
	leggings.getMeleeReductionModifier() + boots.getMeleeReductionModifier();
var playerRangedArmor = helmet.getRangedReductionModifier() + chestplate.getRangedReductionModifier() +
	leggings.getRangedReductionModifier() + boots.getRangedReductionModifier();
var playerAreaArmor = helmet.getAreaReductionModifier() + chestplate.getAreaReductionModifier() +
	leggings.getAreaReductionModifier() + boots.getAreaReductionModifier();

var z = new Array(2000); //Array that stores zombie objects from the Zombie class
var m = new Array(10000); //Array that stores marshmellow projectiles from the Marshmellow class
var p = new Array(1000); //Array that stores zombie projectiles
var as = new Array(1000); //Array that stores AoE segments
var text = new Array(1000); //Array that stores text displayed on the canvas
var waveCurrentlyGoing = false;
var spawningZombies;

//Array that stores data about each zombie type.  Each value in the innerarray is as follows:
//Spawn chance, first wave, last wave, name, health, damage, speed, size, difficulty, color, movement type, ranged damage, preferred distance, fire rate, damage type, AoE size, AoE stay time in seconds
var zombieData = [
	[0, 1, 20, "basicZombieGreen", 100, 60.0, 10 * scale, 0.8 * scale, 1, "green", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 4, 25, "smallZombieGreen", 120, 42.0, 12 * scale, 0.6 * scale, 2, "#009e00", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 7, 35, "largeZombieGreen", 450, 72.0, 8.5 * scale, 1.1 * scale, 4, "#006300", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 11, 30, "spitZombieGreen", 160, 30.0, 6 * scale, 0.7 * scale, 7, "#34b34b", "ranged", 30.0, 12, 0.7, "ranged", 0, 0],
	[0, 15, 25, "lobberZombieGreen", 200, 30.0, 5 * scale, 0.8 * scale, 8, "#008a45", "lobber", 30.0, 0, 0.2, "area", 2.0 * scale, 15.0],
	[0, 20, 45, "basicZombieYellow", 300, 90.0, 13.0 * scale, 0.8 * scale, 14, "#c9cc00", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 25, 50, "smallZombieYellow", 250, 78.0, 17.0 * scale, 0.58 * scale, 17, "#d6d91a", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 30, 55, "spitZombieYellow", 350, 30.0, 8 * scale, 0.7 * scale, 20, "#f0f246", "ranged", 45.0, 13, 0.7, "ranged", 0, 0],
	[0, 35, 60, "largeZombieYellow", 700, 120.0, 11.5 * scale, 1.15 * scale, 23, "#a6ad15", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 40, 65, "lobberZombieYellow", 370, 30.0, 6 * scale, 0.8 * scale, 26, "#8a873f", "lobber", 45.0, 0, 0.22, "area", 2.2 * scale, 15.0],
	[0, 45, 70, "basicZombieOrange", 450, 150.0, 16.0 * scale, 0.8 * scale, 29, "#e88f00", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 50, 75, "smallZombieOrange", 350, 120.0, 20.5 * scale, 0.57 * scale, 32, "#ff9d00", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 55, 80, "spitZombieOrange", 475, 30.0, 10.0 * scale, 0.7 * scale, 35, "#f2b655", "ranged", 60.0, 14, 0.7, "ranged", 0, 0],
	[0, 60, 85, "largeZombieOrange", 1100, 300.0, 14.0 * scale, 1.2 * scale, 38, "#b57000", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 65, 90, "lobberZombieOrange", 500, 30.0, 7 * scale, 0.8 * scale, 41, "#9c763a", "lobber", 65.0, 0, 0.24, "area", 2.4 * scale, 15.0],
	[0, 70, 100, "basicZombieBlue", 600, 210.0, 20.0 * scale, 0.8 * scale, 45, "#00b6d6", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 75, 100, "smallZombieBlue", 450, 144.0, 26.0 * scale, 0.56 * scale, 49, "#00d0f5", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 80, 100, "spitZombieBlue", 700, 30.0, 11 * scale, 0.7 * scale, 53, "#6ba2c9", "ranged", 75.0, 15, 0.7, "ranged", 0, 0],
	[0, 85, 100, "largeZombieBlue", 1600, 480.0, 17.0 * scale, 1.25 * scale, 57, "#00639c", "melee", 0, 0, 0, "melee", 0, 0],
	[0, 90, 100, "lobberZombieBlue", 800, 30.0, 8 * scale, 0.8 * scale, 60, "#425a78", "lobber", 90.0, 0, 0.26, "area", 2.6 * scale, 15.0],
//	[0, 100, 200, "zombogalis", null, null, null, null, null, "#7c00db", "melee", 0, 0, 0],
];

var movingUp = false;
var movingDown = false;
var movingRight = false;
var movingLeft = false;
var spacePressed = false;
var mousePressed = false;
var mouseMoveEvent;

var shotgunRounds = 0;
var shotgunLocation;

var fireDelay = 1000;
var currentFireDelay = 0;
var maxMagazineSize = 1;
var magazineSize = 1;
var magazine = 1;
var reloadSpeed = 1.0;
var currentlyReloading = false;

if (marshmellowMode == "pistol") {
	fireDelay = 1000 / pistol.getFireRate();
	magazineSize = pistol.getMagSize();
	maxMagazineSize = 27;
	magazine = magazineSize;
	reloadSpeed = pistol.getReloadSpeed();
}
else if (marshmellowMode == "rifle") {
	fireDelay = 1000 / rifle.getFireRate();
	magazineSize = rifle.getMagSize();
	maxMagazineSize = 80;
	magazine = magazineSize;
	reloadSpeed = rifle.getReloadSpeed();
}
else if (marshmellowMode == "shotgun") {
	fireDelay = 1000 / shotgun.getFireRate();
	magazineSize = shotgun.getMagSize();
	maxMagazineSize = 24;
	magazine = magazineSize;
	reloadSpeed = shotgun.getReloadSpeed();
}
else if (marshmellowMode == "sniper") {
	fireDelay = 1000 / sniper.getFireRate();
	magazineSize = sniper.getMagSize();
	maxMagazineSize = 25;
	magazine = magazineSize;
	reloadSpeed = sniper.getReloadSpeed();
}
else {
	console.log("ERROR: marshmellowMode not found");
}

var  b2Vec2 = Box2D.Common.Math.b2Vec2 ,
	b2BodyDef = Box2D.Dynamics.b2BodyDef ,
	b2Body = Box2D.Dynamics.b2Body ,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef ,
	b2Fixture = Box2D.Dynamics.b2Fixture ,
	b2World = Box2D.Dynamics.b2World ,
	b2MassData = Box2D.Collision.Shapes.b2MassData ,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape ,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape ,
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

world = new b2World(new b2Vec2(0, 0), true);

var dynBodyDef = new b2BodyDef;
dynBodyDef.type = b2Body.b2_dynamicBody;
dynBodyDef.position.x = gameWidth / 2 / 30;
dynBodyDef.position.y = gameHeight / 2 / 30;

var statBodyDef = new b2BodyDef;
statBodyDef.type = b2Body.b2_staticBody;
statBodyDef.position.x = 15;
statBodyDef.position.y = 15;

var fixDef = new b2FixtureDef;
fixDef.density = Math.PI / (Math.PI * Math.pow(playerSize, 2));
fixDef.friction = 0;
fixDef.restitution = 0;
fixDef.mass = 100;
fixDef.filter.categoryBits = 0x0002;
fixDef.filter.maskBits= 0x0002;
fixDef.filter.groupIndex = -1;
fixDef.shape = new b2CircleShape(playerSize);

var borderFixDef = new b2FixtureDef;
borderFixDef.density = 0;
borderFixDef.friction = 1;
borderFixDef.restitution = 0;
borderFixDef.shape = new b2PolygonShape;
borderFixDef.shape.SetAsBox(2, 0.2);



var player = world.CreateBody(dynBodyDef);
player.CreateFixture(fixDef);
var playerRender = new PlayRender(24 * scale, "red", gameArea);

//var border = world.CreateBody(statBodyDef);
//border.CreateFixture(borderFixDef);


/*
//Displays box2d's body rendering onto the gameArea canvas.  Leave commented out when using canvas rendering instead
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var debugDraw = new b2DebugDraw();
debugDraw.SetSprite(document.getElementById("gameArea").getContext("2d"));
debugDraw.SetDrawScale(30.0);
debugDraw.SetFillAlpha(0.3);
debugDraw.SetLineThickness(1.0);
debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
world.SetDebugDraw(debugDraw);
*/



var textWave = "Wave " + wave;
document.getElementById("textWave").innerHTML = textWave;
var experenceText = "Level " + level;
document.getElementById("experenceText").innerHTML = experenceText;
updateProgressBars();




var updateInterval = window.setInterval(update, 1000 / frameRate);
if (marshmellowMode == "shotgun") {
	window.setInterval(shotgunCheck, 4);
}

function update() {
	try {
		currentFireDelay -= 1000 / frameRate;
		autoFire();
		calculatePlayerSpeed();
		trackPlayer();
		collisionDetection();
		projectileManagement();
		world.Step(1 / frameRate, 10, 10);
		world.DrawDebugData();
		world.ClearForces();
		gameArea.getContext("2d").clearRect(0, 0, gameArea.width, gameArea.height);
		render();
		if (currentlyReloading) {
			reload();
		}
	}
	catch (e) {
		console.error(e);
		clearInterval(updateInterval);
	}
}

function updateProgressBars() {
	var healthMeter = "<progress max = \"" + maxPlayerHealth + "\" value = \"" + playerHealth + "\" class = \"health\"></progress>";
	document.getElementById("healthMeter").innerHTML = healthMeter;
	var sprintMeter = "<progress max = \"" + maxPlayerSprint + "\" value = \"" + playerSprint + "\" class = \"sprint\"></progress>";
	document.getElementById("sprintMeter").innerHTML = sprintMeter;
	var magazineMeter = "<progress max = \"" + magazineSize + "\" value = \"" + magazine + "\" class = \"magazine\"></progress>";
	document.getElementById("magazineMeter").innerHTML = magazineMeter;
	var experenceMeter = "<progress max = \"" + nextLevelExp + "\" value = \"" + exp + "\" class = \"experence\"></progress>";
	document.getElementById("experenceMeter").innerHTML = experenceMeter;

	if (maxPlayerHealth < 500) {
		document.querySelector(".health").style.width = ((maxPlayerHealth / 500 * 82) + 10) + "%";
	}
	else {
		document.querySelector(".health").style.width = "92%";
	}
	if (maxPlayerSprint < 20) {
		document.querySelector(".sprint").style.width = ((maxPlayerSprint / 20 * 83) + 9) + "%";
	}
	else {
		document.querySelector(".sprint").style.width = "92%";
	}
	if (magazineSize < maxMagazineSize) {
		document.querySelector(".magazine").style.width = ((magazineSize / maxMagazineSize * 90) + 2) + "%";
	}
	else {
		document.querySelector(".magazine").style.width = "92%";
	}
	if (level < 50) {
		document.querySelector(".experence").style.width = ((level / 50 * 66) + 26) + "%";
	}
	else {
		document.querySelector(".experence").style.width = "92%";
	}
}

function trackPlayer() {
	for (var i = 0; z[i] != null; i++) {
		if (z[i] != "fed") {
			if (z[i].type === "melee") {
				z[i].body.SetLinearVelocity(new b2Vec2(0, 0));
				var multiplier = 0.0; // Used to set the less needed axis velocity to a fraction of the most needed
				var offset = 0.0;  // Used to reduce x and y velocity with diaginal movement.  0 with no slope 1 with 45 degree slope

				//Calculates the speed decrease multiplyer based on how much time they have hugged the player
				if (z[i].hugSlowed) {
					var hugTimeSpeedMulti = 1 - z[i].hugSlowdown;
				}
				else {
					var hugTimeSpeedMulti = 1;
				}

				var xaxis = z[i].body.GetWorldCenter().x - player.GetWorldCenter().x;
				var yaxis = z[i].body.GetWorldCenter().y - player.GetWorldCenter().y;

				//Determines which axis needs more velocity and sets the mulitplier accordingly
				if (Math.abs(xaxis) <= Math.abs(yaxis)) {
					multiplier = z[i].speed / Math.abs(yaxis);
					offset = Math.abs(xaxis) / Math.abs(yaxis);
				}
				else {
					multiplier = z[i].speed / Math.abs(xaxis);
					offset = Math.abs(yaxis) / Math.abs(xaxis);
				}

				z[i].body.ApplyImpulse(new b2Vec2(-1 * multiplier * hugTimeSpeedMulti * xaxis * (1 - (0.29289 * offset)), -1 * multiplier * hugTimeSpeedMulti * yaxis * (1 - (0.29289 * offset))), z[i].body.GetWorldCenter());
			}
			else if (z[i].type === "ranged") {
				var distance  = Math.sqrt(Math.pow(player.GetWorldCenter().x - z[i].body.GetWorldCenter().x, 2) + Math.pow(player.GetWorldCenter().y - z[i].body.GetWorldCenter().y, 2));
				//Moves towards the player if too far away
				if (distance > z[i].preferedDistance) {
					z[i].body.SetLinearVelocity(new b2Vec2(0, 0));
					var multiplier = 0.0; // Used to set the less needed axis velocity to a fraction of the most needed
					var offset = 0.0;  // Used to reduce x and y velocity with diaginal movement.  0 with no slope 1 with 45 degree slope

					var xaxis = z[i].body.GetWorldCenter().x - player.GetWorldCenter().x;
					var yaxis = z[i].body.GetWorldCenter().y - player.GetWorldCenter().y;

					//Determines which axis needs more velocity and sets the mulitplier accordingly
					if (Math.abs(xaxis) <= Math.abs(yaxis)) {
						multiplier = z[i].speed / Math.abs(yaxis);
						offset = Math.abs(xaxis) / Math.abs(yaxis);
					}
					else {
						multiplier = z[i].speed / Math.abs(xaxis);
						offset = Math.abs(yaxis) / Math.abs(xaxis);
					}

					z[i].body.ApplyImpulse(new b2Vec2(-1 * multiplier * xaxis * (1 - (0.29289 * offset)), -1 * multiplier * yaxis * (1 - (0.29289 * offset))), z[i].body.GetWorldCenter());
				}
				//Moves away from the player if too close
				else if (distance < z[i].preferedDistance) {
					z[i].body.SetLinearVelocity(new b2Vec2(0, 0));
					var multiplier = 0.0; // Used to set the less needed axis velocity to a fraction of the most needed
					var offset = 0.0;  // Used to reduce x and y velocity with diaginal movement.  0 with no slope 1 with 45 degree slope

					var xaxis = z[i].body.GetWorldCenter().x - player.GetWorldCenter().x;
					var yaxis = z[i].body.GetWorldCenter().y - player.GetWorldCenter().y;

					//Determines which axis needs more velocity and sets the mulitplier accordingly
					if (Math.abs(xaxis) <= Math.abs(yaxis)) {
						multiplier = z[i].speed / Math.abs(yaxis);
						offset = Math.abs(xaxis) / Math.abs(yaxis);
					}
					else {
						multiplier = z[i].speed / Math.abs(xaxis);
						offset = Math.abs(yaxis) / Math.abs(xaxis);
					}

					z[i].body.ApplyImpulse(new b2Vec2(multiplier * xaxis * (1 - (0.29289 * offset)), multiplier * yaxis * (1 - (0.29289 * offset))), z[i].body.GetWorldCenter());
				}
				else {
					z[i].body.SetLinearVelocity(new b2Vec2(0, 0));
				}
			}
			else if (z[i].type === "lobber") {
				//Determines if the lobber is in position to fire
				if (z[i].body.GetWorldCenter().x - z[i].size - 1 < 0) {
					z[i].lobberReady = false;
				}
				else if (z[i].body.GetWorldCenter().x + z[i].size + 1 > gameWidth / 30) {
					z[i].lobberReady = false;
				}
				else if (z[i].body.GetWorldCenter().y - z[i].size - 1 < 0) {
					z[i].lobberReady = false;
				}
				else if (z[i].body.GetWorldCenter().y + z[i].size + 1 > gameHeight / 30) {
					z[i].lobberReady = false;
				}
				else {
					z[i].lobberReady = true;
				}

				// Moves the lobber if it is not ready to fire yet
				if (!z[i].lobberReady) {
					z[i].body.SetLinearVelocity(new b2Vec2(0, 0));
					var multiplier = 0.0; // Used to set the less needed axis velocity to a fraction of the most needed
					var offset = 0.0;  // Used to reduce x and y velocity with diagonal movement.  0 with no slope 1 with 45 degree slope

					var xaxis = z[i].body.GetWorldCenter().x - gameWidth / 30 / 2;
					var yaxis = z[i].body.GetWorldCenter().y - gameHeight / 30 / 2;

					//Determines which axis needs more velocity and sets the multiplier accordingly
					if (Math.abs(xaxis) <= Math.abs(yaxis)) {
						multiplier = z[i].speed / Math.abs(yaxis);
						offset = Math.abs(xaxis) / Math.abs(yaxis);
					} else {
						multiplier = z[i].speed / Math.abs(xaxis);
						offset = Math.abs(yaxis) / Math.abs(xaxis);
					}

					z[i].body.ApplyImpulse(new b2Vec2(-1 * multiplier * xaxis * (1 - (0.29289 * offset)), -1 * multiplier * yaxis * (1 - (0.29289 * offset))), z[i].body.GetWorldCenter());
				}
				else {
					z[i].body.SetLinearVelocity(new b2Vec2(0, 0));
				}
			}
			else {
				console.log("ERROR: Zombie type not found");
			}
		}
	}
}

function calculatePlayerSpeed() {
	var currentPlayerSpeed = (playerSpeed * (1 + helmet.getMovementSpeedModifier() + chestplate.getMovementSpeedModifier() +
		leggings.getMovementSpeedModifier() + boots.getMovementSpeedModifier())) * scale;

	//Speeds the player up when moving in that direction.
	if (playerHealth != 0 && spacePressed && playerSprint > 0) {  //Sprints if they have sprint left and if the space bar is held
		if (movingUp) {
			player.ApplyForce(new b2Vec2(0, -1 * currentPlayerSpeed * playerAcceleration * playerSprintMulti), player.GetWorldCenter());
		}
		if (movingDown) {
			player.ApplyForce(new b2Vec2(0, currentPlayerSpeed * playerAcceleration * playerSprintMulti), player.GetWorldCenter());
		}
		if (movingLeft) {
			player.ApplyForce(new b2Vec2(-1 * currentPlayerSpeed * playerAcceleration * playerSprintMulti, 0), player.GetWorldCenter());
		}
		if (movingRight) {
			player.ApplyForce(new b2Vec2(currentPlayerSpeed * playerAcceleration * playerSprintMulti, 0), player.GetWorldCenter());
		}

		//Reduces the players sprint
		playerSprint -= 1.0 / frameRate;
		updateProgressBars();

	}
	else if (playerHealth != 0){
		if (movingUp) {
			player.ApplyForce(new b2Vec2(0, -1 * currentPlayerSpeed * playerAcceleration), player.GetWorldCenter());
		}
		if (movingDown) {
			player.ApplyForce(new b2Vec2(0, currentPlayerSpeed * playerAcceleration), player.GetWorldCenter());
		}
		if (movingLeft) {
			player.ApplyForce(new b2Vec2(-1 * currentPlayerSpeed * playerAcceleration, 0), player.GetWorldCenter());
		}
		if (movingRight) {
			player.ApplyForce(new b2Vec2(currentPlayerSpeed * playerAcceleration, 0), player.GetWorldCenter());
		}
	}
	else {
	}

	//Slows the player down if not moving in that direction
	if (!movingUp && (player.GetLinearVelocity().y * Math.PI) < 0 || movingUp && movingDown && (player.GetLinearVelocity().y * Math.PI) < 0) {
		player.ApplyImpulse(new b2Vec2(0, currentPlayerSpeed * playerAcceleration / frameRate), player.GetWorldCenter());
		if (player.GetLinearVelocity().y * Math.PI > 0) {
			player.SetLinearVelocity(new b2Vec2(player.GetLinearVelocity().x * Math.PI, 0));
		}
	}
	if (!movingDown && (player.GetLinearVelocity().y * Math.PI) > 0 || movingUp && movingDown && (player.GetLinearVelocity().y * Math.PI) > 0) {
		player.ApplyImpulse(new b2Vec2(0, -1 * currentPlayerSpeed * playerAcceleration / frameRate), player.GetWorldCenter());
		if (player.GetLinearVelocity().y * Math.PI < 0) {
			player.SetLinearVelocity(new b2Vec2(player.GetLinearVelocity().x * Math.PI, 0));
		}
	}
	if (!movingLeft && (player.GetLinearVelocity().x * Math.PI) < 0 || movingLeft && movingRight && (player.GetLinearVelocity().x * Math.PI) < 0) {
		player.ApplyImpulse(new b2Vec2(currentPlayerSpeed * playerAcceleration / frameRate, 0), player.GetWorldCenter());
		if (player.GetLinearVelocity().x * Math.PI > 0) {
			player.SetLinearVelocity(new b2Vec2(0, player.GetLinearVelocity().y * Math.PI));
		}
	}
	if (!movingRight && (player.GetLinearVelocity().x * Math.PI) > 0 || movingLeft && movingRight && (player.GetLinearVelocity().x * Math.PI) > 0) {
		player.ApplyImpulse(new b2Vec2(-1 * currentPlayerSpeed * playerAcceleration / frameRate, 0), player.GetWorldCenter());
		if (player.GetLinearVelocity().x * Math.PI < 0) {
			player.SetLinearVelocity(new b2Vec2(0, player.GetLinearVelocity().y * Math.PI));
		}
	}

	//Adds a counter velocity if needed to ensure that player velocity will not exceed playerSpeed
	/*	  if (spacePressed && playerSprint > 0) { //If running, calculates using running speed
            if (Math.abs((player.GetLinearVelocity().x * Math.PI)) > playerSpeed * playerSprintMulti) {
                var minusVelocity = playerSpeed * playerSprintMulti - Math.abs((player.GetLinearVelocity().x * Math.PI));
                if ((player.GetLinearVelocity().x * Math.PI) > 0)
                    player.ApplyImpulse(new b2Vec2(minusVelocity, 0), player.GetWorldCenter());
                else
                    player.ApplyImpulse(new b2Vec2(-1 * minusVelocity, 0), player.GetWorldCenter());
            }
            if (Math.abs((player.GetLinearVelocity().y * Math.PI)) > playerSpeed * playerSprintMulti) {
                var minusVelocity = playerSpeed * playerSprintMulti - Math.abs((player.GetLinearVelocity().y * Math.PI));
                if ((player.GetLinearVelocity().y * Math.PI) > 0)
                    player.ApplyImpulse(new b2Vec2(0, minusVelocity), player.GetWorldCenter());
                else
                    player.ApplyImpulse(new b2Vec2(0, -1 * minusVelocity), player.GetWorldCenter());
            }
        }
        else { //If not running, caculates just with playerSpeed
            if (Math.abs((player.GetLinearVelocity().x * Math.PI)) > playerSpeed) {
                var minusVelocity = playerSpeed - Math.abs((player.GetLinearVelocity().x * Math.PI));
                if ((player.GetLinearVelocity().x * Math.PI) > 0)
                    player.ApplyImpulse(new b2Vec2(minusVelocity, 0), player.GetWorldCenter());
                else
                    player.ApplyImpulse(new b2Vec2(-1 * minusVelocity, 0), player.GetWorldCenter());
            }
            if (Math.abs((player.GetLinearVelocity().y * Math.PI)) > playerSpeed) {
                var minusVelocity = playerSpeed - Math.abs((player.GetLinearVelocity().y * Math.PI));
                if ((player.GetLinearVelocity().y * Math.PI) > 0)
                    player.ApplyImpulse(new b2Vec2(0, minusVelocity), player.GetWorldCenter());
                else
                    player.ApplyImpulse(new b2Vec2(0, -1 * minusVelocity), player.GetWorldCenter());
            }
        } */

	//Reduces the players speed when moving diagonally
	if (spacePressed && playerSprint > 0) {
		var totalSpeed = Math.sqrt(Math.pow((player.GetLinearVelocity().x * Math.PI), 2) + Math.pow((player.GetLinearVelocity().y * Math.PI), 2));
		if (totalSpeed > currentPlayerSpeed * playerSprintMulti) {
			var multiplier = 1 - (currentPlayerSpeed * playerSprintMulti / totalSpeed);
			var xReduce = (player.GetLinearVelocity().x * Math.PI) * multiplier * -1;
			var yReduce = (player.GetLinearVelocity().y * Math.PI) * multiplier * -1;
			player.ApplyImpulse(new b2Vec2(xReduce, yReduce), player.GetWorldCenter());
		}
	}
	else {
		var totalSpeed = Math.sqrt(Math.pow((player.GetLinearVelocity().x * Math.PI), 2) + Math.pow((player.GetLinearVelocity().y * Math.PI), 2));
		if (totalSpeed > currentPlayerSpeed) {
			var multiplier = 1 - (currentPlayerSpeed / totalSpeed);
			var xReduce = (player.GetLinearVelocity().x * Math.PI) * multiplier * -1;
			var yReduce = (player.GetLinearVelocity().y * Math.PI) * multiplier * -1;
			player.ApplyImpulse(new b2Vec2(xReduce, yReduce), player.GetWorldCenter());
		}
	}
}

function collisionDetection() {
	var pxpos = player.GetWorldCenter().x;
	var pypos = player.GetWorldCenter().y;
	var distance = 0;

	//Detects if a zombie touches the player
	for(var i = 0; z[i] != null; i++) {
		if (z[i] != "fed") {
			distance  = Math.sqrt(Math.pow(pxpos - z[i].body.GetWorldCenter().x, 2) + Math.pow(pypos - z[i].body.GetWorldCenter().y, 2));

			//Determines if the zombie is touching the player
			if (distance < playerSize + z[i].size) {
				damagePlayer(z[i].damage / frameRate, z[i].damageType);
				z[i].hugTime += 1.0 / frameRate; //Adds to the zombies hug time
				// Slows the zombie if the max hugtime has been exceeded
				if (z[i].hugTime >= z[i].maxHugTime) {
					z[i].hugSlowed = true;
				}
			}
			else {
				// The zombie's hugtime decays if it is not touching the player
				if (z[i].hugTime >= (1.0 / frameRate) * z[i].hugDecaySpeed) {
					z[i].hugTime -= (1.0 / frameRate) * z[i].hugDecaySpeed;
				}
				else {
					z[i].hugSlowed = false;
					z[i].hugTime = 0;
				}
			}
		}
	}

	//Reduces the timeBeforeSniperEat of all zombies
	for (var a = 0; z[a] != null; a++) {
		if (z[a] != "fed") {
			if (z[a].timeBeforeSniperEat >= z[a].timeBeforeSniperEat - 1000 / frameRate) {
				z[a].timeBeforeSniperEat -= 1000 / frameRate;
			}
			else {
				z[a].timeBeforeSniperEat = 0;
			}
		}
	}

	//Detects if a marshmellow touches a zombie
	for (var a = 0; z[a] != null; a++) {
		if (z[a] != "fed") {
			for (var b = 0; m[b] != null; b++) {
				if (m[b] != "fed" && z[a] != "fed") {
					distance = Math.sqrt(Math.pow(m[b].body.GetWorldCenter().x - z[a].body.GetWorldCenter().x, 2) + Math.pow(m[b].body.GetWorldCenter().y - z[a].body.GetWorldCenter().y, 2));
					//If a marshmellow touches a zombie, delete the marshmellow and feed the zombie (deal damage)
					if (distance <= z[a].size + m[b].size) {
						if (z[a].hasEaten != b || z[a].timeBeforeSniperEat <= 0 && marshmellowMode == "sniper") { //Removes every frame damage from sniper shots
							//If the crit chance is higher than a random number then deal a mouthshot of calories to the zombie
							if (playerCritChance > Math.random()) {
								addCanvasText(z[a], "MouthShot"); //Runs the function responsible for adding displayed canvas text
								z[a].health -= (m[b].damage * playerCritMulti); //Mouthshot damage
							}
							else {
								z[a].health -= m[b].damage; //Normal damage
							}
							z[a].hasEaten = b;
							z[a].timeBeforeSniperEat = 300; //Adds 300ms before another sniper marshmellow can feed the zombie

						}
						else if (marshmellowMode != "sniper") {
							//If the crit chance is higher than a random number then deal a mouthshot of calories to the zombie
							if (playerCritChance > Math.random()) {
								addCanvasText(z[a], "MouthShot"); //Runs the function responsible for adding displayed canvas text
								z[a].health -= (m[b].damage * playerCritMulti); //Mouthshot damage
							}
							else {
								z[a].health -= m[b].damage; //Normal damage
							}
						}


						//Destroys the marshmellow if it is not a sniper shot
						if (marshmellowMode != "sniper") {
							world.DestroyBody(m[b].body);
							m[b] = "fed";
						}

						//Destroys the zombie body and overrides its object with fed if the zombies health is less than or equal to 0
						if (z[a].health <= 0) {
							//The zombie has a chance of dropping an armor peice
							if (Math.random() <= 0.04) {
								addCanvasText(z[a], "Dropped Armor"); //Runs the function responsible for adding displayed canvas text
								generateArmor(wave);
							}

							gainExperence(z[a].experence);
							world.DestroyBody(z[a].body);
							z[a] = "fed";

							//Checks if all of the zombies are fed
							waveCleared = "true";
							for (var i = 0; z[i] != null; i++) {
								if (z[i] != "fed") {
									if (z[i].health > 0) {
										waveCleared = "false";
										break;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	//Despawns a marshmellow if it goes out of the game area
	for (var b = 0; m[b] != null; b++) {
		if (m[b] != "fed") {
			if (m[b].body.GetWorldCenter().x + m[b].size < 0 || m[b].body.GetWorldCenter().x - m[b].size > (gameWidth / 30) || m[b].body.GetWorldCenter().y + m[b].size < 0 || m[b].body.GetWorldCenter().y - m[b].size > (gameHeight / 30)) {
				world.DestroyBody(m[b].body);
				m[b] = "fed";
			}
		}
	}

	//Detects if a projectile touches the player or lobber touches goal spot
	for (var b = 0; p[b] != null; b++) {
		if (p[b] != "fed") {
			// Calculates if a projectile touches the player
			if (p[b].type === "ranged") {
				distance = Math.sqrt(Math.pow(p[b].body.GetWorldCenter().x - player.GetWorldCenter().x, 2) + Math.pow(p[b].body.GetWorldCenter().y - player.GetWorldCenter().y, 2));
				if (distance <= playerSize + p[b].size) {
					damagePlayer(p[b].damage, "ranged");
					updateProgressBars();

					//Destroys the projectile
					world.DestroyBody(p[b].body);
					p[b] = "fed";
				}
			}
			// Calculates if a lobber projectile touches the goal spot
			else if (p[b].type === "lobber") {
				distance = Math.sqrt(Math.pow(p[b].body.GetWorldCenter().x - p[b].finalX, 2) + Math.pow(p[b].body.GetWorldCenter().y - p[b].finalY, 2));
				if (distance < 0.2) {
					//Spawns the AoE zone
					createAoESegment(p[b].damage, p[b].aoeSize, p[b].aoeTime, p[b].finalX, p[b].finalY);

					//Destroys the projectile
					world.DestroyBody(p[b].body);
					p[b] = "fed";
				}
			}
		}
	}

	//Detects if the player is in an AoE and updates the AoE time
	var maxAoEDamage = 0; // Only damages the player by the max AoE segment damage
	for (var b = 0; as[b] != null; b++) {
		if (as[b] !== "fed") {
			distance = Math.sqrt(Math.pow(as[b].body.GetWorldCenter().x - player.GetWorldCenter().x, 2) + Math.pow(as[b].body.GetWorldCenter().y - player.GetWorldCenter().y, 2));
			//Determines if the player is in the AoE effect
			if (distance <= playerSize + as[b].size) {
				//Only updates the maxAoE damage if it is higher than the current segment
				if (as[b].damage > maxAoEDamage) {
					maxAoEDamage = as[b].damage;
				}
			}

			//Reduces the AoE segment's remaining time
			if (as[b].aoeTime - (1000 / frameRate / 1000.0) > 0) {
				as[b].aoeTime -= (1000 / frameRate / 1000.0);
			}
			// Destroys the AoE segment if the remaining time is 0
			else {
				world.DestroyBody(as[b].body);
				as[b] = "fed";
			}
		}
	}
	// Only applies AoE damage to the player if there is some AoE damage to be applied
	if (maxAoEDamage > 0) {
		damagePlayer(maxAoEDamage / frameRate, "area");
		updateProgressBars();
	}

	//Damages the player if they leave the game area
	if (player.GetWorldCenter().x - playerSize < 0) {
		var amountOutside = (player.GetWorldCenter().x - playerSize) * -1;
		damagePlayer(amountOutside * 80 / 60, "melee");

	}
	else if (player.GetWorldCenter().x + playerSize > gameWidth / 30) {
		var amountOutside = (player.GetWorldCenter().x + playerSize) - gameWidth / 30;
		damagePlayer(amountOutside * 80 / 60, "melee");
	}
	else if (player.GetWorldCenter().y - playerSize < 0) {
		var amountOutside = (player.GetWorldCenter().y - playerSize) * -1;
		damagePlayer(amountOutside * 80 / 60, "melee");
	}
	else if (player.GetWorldCenter().y + playerSize > gameHeight / 30) {
		var amountOutside = (player.GetWorldCenter().y + playerSize) - gameHeight / 30;
		damagePlayer(amountOutside * 80 / 60, "melee");
	}
	else {

	}

	if (playerHealth <= 0) {
		window.clearInterval(spawningZombies);
		waveCurrentlyGoing = false;
	}
}

function generateArmor(waveNum) {
	var sa = 0;
	var typeChoice = Math.random();
	//Finds the next avalible spot in the storedArmor array
	while (storedArmor[sa] != null) {
		sa++;

		if (sa > storedArmor.length) {
			console.log("ERROR: Exceeded storedArmor size");
			sa = storedArmor.length - 1;
			break;
		}
	}

	//Generates the type of armor
	if (typeChoice >= 0.75) {
		//Generates heavy or light armor
		if (Math.random() >= 0.5)
			storedArmor[sa] = new Armor(waveNum, "common", "head", "Heavy");
		else
			storedArmor[sa] = new Armor(waveNum, "common", "head", "Light");
	}
	else if (typeChoice >= 0.5) {
		//Generates heavy or light armor
		if (Math.random() >= 0.5)
			storedArmor[sa] = new Armor(waveNum, "common", "chest", "Heavy");
		else
			storedArmor[sa] = new Armor(waveNum, "common", "chest", "Light");
	}
	else if (typeChoice >= 0.25) {
		//Generates heavy or light armor
		if (Math.random() >= 0.5)
			storedArmor[sa] = new Armor(waveNum, "common", "legs", "Heavy");
		else
			storedArmor[sa] = new Armor(waveNum, "common", "legs", "Light");
	}
	else {
		//Generates heavy or light armor
		if (Math.random() >= 0.5)
			storedArmor[sa] = new Armor(waveNum, "common", "feet", "Heavy");
		else
			storedArmor[sa] = new Armor(waveNum, "common", "feet", "Light");
	}

	//Generates the modifiers for this piece of armor
	storedArmor[sa].generateModifiers();
}

function render() {
	//Renders the AoE segments
	for (var i = 0; as[i] != null; i++) {
		if (as[i] != "fed") {
			as[i].newPos(as[i].body.GetWorldCenter().x, as[i].body.GetWorldCenter().y, "#b4b6bf");
		}
	}

	playerRender.newPos(player.GetWorldCenter().x, player.GetWorldCenter().y);

	//Renders the zombies
	var healthPercentage;
	for (var i = 0; z[i] != null; i++) {
		if (z[i] != "fed") {
			//Ensures that the health displayed can't be 0
			if (Math.round(z[i].health / z[i].maxHealth * 100) > 0) {
				healthPercentage = Math.round(z[i].health / z[i].maxHealth * 100);
			}
			else {
				healthPercentage = 1;
			}
			z[i].newPos(z[i].body.GetWorldCenter().x, z[i].body.GetWorldCenter().y, healthPercentage, scale);
		}
	}

	//Renders the marshmellows
	for (var i = 0; m[i] != null; i++) {
		if (m[i] != "fed") {
			m[i].newPos(m[i].body.GetWorldCenter().x, m[i].body.GetWorldCenter().y, "#FFFFFF");
		}
	}

	//Renders the projectiles
	for (var i = 0; p[i] != null; i++) {
		if (p[i] != "fed") {
			if (p[i].type === "ranged") {
				p[i].newPos(p[i].body.GetWorldCenter().x, p[i].body.GetWorldCenter().y, "#aa58e8");
			}
			else if (p[i].type === "lobber") {
				p[i].newPos(p[i].body.GetWorldCenter().x, p[i].body.GetWorldCenter().y, "#797a80");
			}
			else {
				console.log("ERROR: Projectile type not found");
			}
		}
	}

	//Renders the canvas text
	for (var i = 0; i < text.length; i++) {
		if (text[i] != null) {
			text[i].displayTime -= 1.0 / frameRate;

			//Removes the text if it has reached its starting display time
			if (text[i].displayTime <= 0) {
				text[i] = null;
			}
			else {
				text[i].newPos(gameHeight);
			}
		}
	}
}

function gainExperence(amount) {
	exp += amount;

	if (exp >= nextLevelExp) {
		level++;
		var experenceText = "Level " + level;
		document.getElementById("experenceText").innerHTML = experenceText;
		exp -= nextLevelExp;
		nextLevelExp = Math.pow(30 * level, 1 + 0.003 * (1 * level));
		upgradePoints += 4;
	}

	updateProgressBars();
}

function damagePlayer(damage, damageType) {
	if (damageType === "melee") {
		if (playerHealth - (damage * (1 - playerMeleeArmor)) > 0) {
			playerHealth -= (damage * (1 - playerMeleeArmor));
		}
		else {
			playerHealth = 0;
		}
	}
	else if (damageType === "ranged") {
		if (playerHealth - (damage * (1 - playerRangedArmor)) > 0) {
			playerHealth -= (damage * (1 - playerRangedArmor));
		}
		else {
			playerHealth = 0;
		}
	}
	else if (damageType === "area") {
		if (playerHealth - (damage * (1 - playerAreaArmor) > 0)) {
			playerHealth -= (damage * (1 - playerAreaArmor));
		}
		else {
			playerHealth = 0;
		}
	}
	else {
		console.log("ERROR: incorrect damage type");
	}


	updateProgressBars();
}

function addCanvasText(zombieObject, displayText) {

	for (var i = 0; i < text.length; i++) {
		if (text[i] == null) {
			text[i] = new CanvasText(displayText, zombieObject.body.GetWorldCenter().x * 30, zombieObject.body.GetWorldCenter().y * 30, gameHeight * 0.1, gameArea);
			break;
		}
	}
}

document.getElementById("buttonWave").addEventListener("click", nextWave, false);
function nextWave() {
	var xSpawn = 0;
	var ySpawn = 0;
	var d = 0; //Used to loop through zombie arrays

	//Runs if the player has not previously came from the upgrade screen
	if (localStorage.cameFromUpgrades == "false" || waveCleared == "true" || wave == "0") {
		waveCleared = "false";

		//Checks if all of the zombies are fed
		var allZombiesFed = true;
		for (var i = 0; z[i] != null; i++) {
			if (z[i] != "fed") {
				if (z[i].health > 0) {
					allZombiesFed = false;
					break;
				}
			}
		}

		//Checks if the player is dead
		var playerDead = false;
		if (playerHealth <= 0) {
			playerDead = true;
		}

		//Continues only if all zombies are fed and if the player is alive
		if (allZombiesFed && !playerDead && !waveCurrentlyGoing) {

			//Resets player health and sprint
			playerHealth = maxPlayerHealth;
			playerSprint = maxPlayerSprint;
			magazine = magazineSize;
			updateProgressBars();

			//Clears the data on all zombies from the previous wave
			for (var i = 0; z[i] != null; i++) {
				if (z[i] != "fed") {
					world.DestroyBody(z[i].body);
					z[i] = null;
				}
				else {
					z[i] = null;
				}
			}

			//Clears the data on all marshmellows from the previous wave
			for (var i = 0; i < m.length; i++) {
				m[i] = null;
			}

			//Updates the wave and calculates the current wave difficulty
			wave++;
			var difficulty = Math.pow(4 * wave, 1 + 0.003 * wave);
			var textWave = "Wave " + wave;
			document.getElementById("textWave").innerHTML = textWave;

			//Clears the previous array
			d = 0;
			while (d < waveZombies.length) {
				waveZombies[d][0] = null;
				waveZombies[d][1] = null;
				waveZombies[d][2] = null;
				d++;
			}

			//Calculates the weighted odd chance that each zombie could have
			var wm = 0; //WaveMiddle -- Used to store the average of the min and max wave
			for (var i = 0; i < zombieData.length; i++) {
				if (wave < zombieData[i][1] || wave >= zombieData[i][2]) {
					zombieData[i][0] = 0.0;
				}
				else {
					wm = (zombieData[i][2] - zombieData[i][1]) / 2;
					zombieData[i][0] = (16 * (((-1 * Math.abs(wm - (wave - zombieData[i][1]))) + wm) / wm)) + 4;
				}
			}

			//Adds the weighted odds of all zombies
			var weightedTotal = 0.0;
			for (var i = 0; i < zombieData.length; i++) {
				weightedTotal += zombieData[i][0];
			}

			//Stores the zombie information for the wave in the waveZombies array
			while (difficulty >= 1) {
				//Decides where on the edge the zombie should spawn at
				var side = Math.random() * 4;
				if (side < 1) { //Upper side
					xSpawn = gameWidth * Math.random() / 30;
					ySpawn = -2;
				}
				else if (side < 2) { //Bottom side
					xSpawn = gameWidth * Math.random() / 30;
					ySpawn = (gameHeight / 30) + 2;
				}
				else if (side < 3) { //Left Side
					xSpawn = -2;
					ySpawn = gameHeight * Math.random() / 30;
				}
				else { //Right Side
					xSpawn = (gameWidth / 30) + 2;
					ySpawn = gameHeight * Math.random() / 30;
				}


				//Decides which zombie to spawn based on the weighted odds
				var zomChoice = Math.random() * weightedTotal;
				var baseAdd = 0.0;
				for (var i = 0; zombieData.length; i++) {
					if (zombieData[i][0] + baseAdd > zomChoice) {
						addToWaveZombies(xSpawn, ySpawn, i);
						difficulty -= zombieData[i][8];
						break;
					}
					else {
						baseAdd += zombieData[i][0];
					}
				}

			}

			//Starts spawning zombies
			d = 0;
			waveCurrentlyGoing = true;
			spawningZombies = window.setInterval(zombieDelay, 3000 * (Math.pow(0.987, wave)));
		}
		else if (playerDead) { //Resets the wave if the player dies

			//Resets player health and sprint
			playerHealth = maxPlayerHealth;
			playerSprint = maxPlayerSprint;
			magazine = magazineSize;
			updateProgressBars();

			waveCurrentlyGoing = false;
			window.clearInterval(spawningZombies);

			//Puts the player back in the center
			world.DestroyBody(player);
			dynBodyDef.position.x = gameWidth / 2 / 30;
			dynBodyDef.position.y = gameHeight / 2 / 30;
			player = world.CreateBody(dynBodyDef);
			player.CreateFixture(fixDef);


			//Clears the data on all zombies from the previous wave
			for (var i = 0; z[i] != null; i++) {
				if (z[i] != "fed") {
					world.DestroyBody(z[i].body);
					z[i] = null;
				}
				else {
					z[i] = null;
				}
			}

			//Clears the data on all marshmellows from the previous wave
			for (var i = 0; i < m.length; i++) {
				m[i] = null;
			}

			//Starts spawning zombies
			d = 0;
			waveCurrentlyGoing = true;
			spawningZombies = window.setInterval(zombieDelay, 3000 * (Math.pow(0.987, wave)));
		}
	}
	//Runs if the player just came from the upgrade screen
	else {
		localStorage.cameFromUpgrades = "false";

		//Resets player health and sprint
		playerHealth = maxPlayerHealth;
		playerSprint = maxPlayerSprint;
		magazine = magazineSize;
		updateProgressBars();

		//Starts spawning zombies
		d = 0;
		waveCurrentlyGoing = true;
		spawningZombies = window.setInterval(zombieDelay, 3000 * (Math.pow(0.987, wave)));

	}

	function zombieDelay() {
		if (waveZombies[d][0] != null && waveCurrentlyGoing) {
			createZombie(waveZombies[d][0], waveZombies[d][1], waveZombies[d][2]);
			d++;
		}
		else {
			window.clearInterval(spawningZombies);
			waveCurrentlyGoing = false;
		}
	}

	function createZombie(xpos, ypos, type) {
		//Finds the next empty spot to add a zombie object
		var i = 0;
		while (z[i] != null && z[i] != "fed") {
			if (i < z.length) {
				i++;
			}
			else {
				i += 999999;
				console.log("ERROR: Zombie array is full");
			}
		}

		//Creates a zombie object and adds it to the world
		if (i < z.length) {
			z[i] = new Zombie(zombieData[type][10], zombieData[type][4], zombieData[type][5], zombieData[type][6], zombieData[type][7], zombieData[type][8], zombieData[type][12], zombieData[type][13], zombieData[type][11], zombieData[type][14], xpos, ypos, zombieData[type][9], zombieData[type][15], zombieData[type][16], gameArea);
			createZombieBody(xpos, ypos, z[i]);
		}
	}

	//Used to a zombie object a box2d body and spawn it into the world
	function createZombieBody(xpos, ypos, zombieObject) {
		var def = new b2BodyDef;
		def.type = b2Body.b2_dynamicBody;
		def.position.x = xpos;
		def.position.y = ypos;

		var fix = new b2FixtureDef;
		fix.density = Math.PI / (Math.PI * Math.pow(zombieObject.size, 2));
		fix.friction = 0;
		fix.restitution = 0;
		fix.shape = new b2CircleShape(zombieObject.size);
		fix.filter.categoryBits = 0x0002;
		fix.filter.maskBits= 0x0002;
		zombieObject.body = world.CreateBody(def);
		zombieObject.body.CreateFixture(fix);
	}

	//Adds a value into the previous array.  Remembers the previous wave of zombies
	function addToWaveZombies(xpos, ypos, type) {
		var c = 0;
		while (waveZombies[c][0] != null && c < 10000) {
			c++;
		}

		waveZombies[c][0] = xpos;
		waveZombies[c][1] = ypos;
		waveZombies[c][2] = type;
	}
}

function projectileManagement() {
	var i = 0;
	while (z[i] != null) {
		if (z[i] != "fed") {
			//Only runs for the ranged zombies that are not fed
			if (z[i].type == "ranged") {
				z[i].delay += 1000 / frameRate;
				//Fires if the delay is greater than the fire rate calculation
				if (z[i].delay >= 1000 / z[i].fireRate) {
					shootProjectile(z[i], player.GetWorldCenter().x, player.GetWorldCenter().y, "ranged");
					z[i].delay = 0;
				}
			}
			//Only runs for the lobber zombies that are not fed and are in position
			if (z[i].type == "lobber") {
				if (z[i].lobberReady) {
					z[i].delay += 1000 / frameRate;
					//Fires if the delay is greater than the fire rate calculation
					if (z[i].delay >= 1000 / z[i].fireRate) {
						shootProjectile(z[i], Math.random() * ((gameWidth / 30) - z[i].aoeSize), Math.random() * ((gameHeight / 30) - z[i].aoeSize), "lobber");
						z[i].delay = 0;
					}
				}
			}
		}
		i++;
	}
}

function createAoESegment(damage, size, time, clickX, clickY) {
	var canvas = document.getElementById("gameArea").getBoundingClientRect();
	var accuracyMulti = 1.0;

	//Finds the next available spot in the areaSegment array to create a new projectile object
	var i = 0;
	while (i < as.length) {
		if (as[i] == null || as[i] == "fed") {
			break;
		}
		else {
			i++;
		}
	}

	//Only continues if there is a spot available in the projectiles array and if the player has health
	if (i < as.length && playerHealth > 0) {

		//Creates a projectile object in the projectile array
		as[i] = new AoESegment(damage, size * scale, time, gameArea);

		var def = new b2BodyDef;
		def.type = b2Body.b2_dynamicBody;
		def.position.x = clickX;
		def.position.y = clickY;

		var fix = new b2FixtureDef;
		fix.density = Math.PI / (Math.PI * Math.pow(p[i].size, 2));
		fix.friction = 0;
		fix.restitution = 0;
		fix.shape = new b2CircleShape(p[i].size);
		fix.filter.groupIndex = -1;

		as[i].body = world.CreateBody(def);
		as[i].body.CreateFixture(fix);

	}

	else if (playerHealth > 0) {
		console.log("ERROR: AreaSegment array limit reached");
	}
}

function shootProjectile(zombieObject, clickX, clickY, type) {
	var canvas = document.getElementById("gameArea").getBoundingClientRect();
	var distance  = Math.sqrt(Math.pow(zombieObject.body.GetWorldCenter().x - clickX, 2) + Math.pow(zombieObject.body.GetWorldCenter().y - clickY, 2));
	var accuracyMulti = 1.0;

	//Finds the next available spot in the projectiles array to create a new projectile object
	var i = 0;
	while (i < p.length) {
		if (p[i] == null || p[i] == "fed") {
			break;
		}
		else {
			i++;
		}
	}

	//Only continues if there is a spot available in the projectiles array and if the player has health
	if (i < p.length && playerHealth > 0) {

		if (type === "ranged") {
			//Creates a projectile object in the projectile array
			p[i] = new Marshmellow(zombieObject.rangedDamage, 25 * scale, 0.35 * scale, gameArea);
			accuracyMulti = (1 - 0.6);
		}
		else if (type === "lobber") {
			//Creates a projectile object in the projectile array
			p[i] = new LobberMarshmellow(zombieObject.rangedDamage, 50 * scale, 0.35 * scale, gameArea, clickX, clickY, zombieObject.aoeSize, zombieObject.aoeTime, zombieObject);
			accuracyMulti = (1 - 1.0);
		}
		else {
			console.log("ERROR: Projectile type not found");
		}



		//Calculates the coordinates at distance 16 from the world center accorcding to where the clicked point is
		var outerCircleX = (16 / distance) * (clickX - zombieObject.body.GetWorldCenter().x);
		var outerCircleY = (16 / distance) * (clickY - zombieObject.body.GetWorldCenter().y);

		//Calculates the coordinates to spawn the marshmellow according to where the player and clicked point is
		var spawnX = zombieObject.body.GetWorldCenter().x + ((zombieObject.size + p[i].size) / distance) * (clickX - zombieObject.body.GetWorldCenter().x);
		var spawnY = zombieObject.body.GetWorldCenter().y + ((zombieObject.size + p[i].size) / distance) * (clickY - zombieObject.body.GetWorldCenter().y);

		var def = new b2BodyDef;
		def.type = b2Body.b2_dynamicBody;
		def.position.x = spawnX;
		def.position.y = spawnY;

		var fix = new b2FixtureDef;
		fix.density = Math.PI / (Math.PI * Math.pow(p[i].size, 2));
		fix.friction = 0;
		fix.restitution = 0;
		if (type === "lobber") {
			fix.filter.categoryBits= 0x0004;
		}
		fix.shape = new b2CircleShape(p[i].size);
		fix.filter.groupIndex = -1;


		p[i].body = world.CreateBody(def);
		p[i].body.CreateFixture(fix);


		//Following code determiens the velocity to give the marshmellow
		var multiplier = 0.0; // Used to set the less needed axis velocity to a fraction of the most needed
		var offset = 0.0;  // Used to reduce x and y velocity with diaginal movement.  0 with no slope 1 with 45 degree slope

		var xaxis = -1 * (outerCircleX - (19 * (Math.random() - 0.5) * accuracyMulti));
		var yaxis = -1 * (outerCircleY - (19 * (Math.random() - 0.5) * accuracyMulti));

		//Determines which axis needs more velocity and sets the mulitplier accordingly
		if (Math.abs(xaxis) <= Math.abs(yaxis)) {
			multiplier = p[i].speed / Math.abs(yaxis);
			offset = Math.abs(xaxis) / Math.abs(yaxis);
		}
		else {
			multiplier = p[i].speed / Math.abs(xaxis);
			offset = Math.abs(yaxis) / Math.abs(xaxis);
		}

		p[i].body.ApplyImpulse(new b2Vec2(-1 * multiplier * xaxis * (1 - (0.29289 * offset)), -1 * multiplier * yaxis * (1 - (0.29289 * offset))), p[i].body.GetWorldCenter());
	}
	else if (playerHealth > 0) {
		console.log("ERROR: Marshmellow array limit reached");
	}
}

function autoFire() {
	if (marshmellowMode == "rifle" && mousePressed) {
		shootMarshmellow(mouseMoveEvent);
	}
	else if (marshmellowMode == "shotgun" && mousePressed && currentFireDelay <= 0 && magazine > 0 && !currentlyReloading) {
		shotgunRounds = shotgun.getShots();
		shotgunLocation = mouseMoveEvent;
		magazine--;
		currentFireDelay = fireDelay;
	}
}

function shotgunCheck() {
	if (shotgunRounds > 1) {
		shootMarshmellow(shotgunLocation);
		shotgunRounds--;
	}
	//If the shotgun has a 0.5 in the shot count then it has a 50% chance to fire that extra shot
	else if (shotgunRounds > 0.1) {
		if (Math.random() >= 0.5) {
			shootMarshmellow(shotgunLocation);
		}
		shotgunRounds--;
	}
}

if (marshmellowMode != "shotgun") {
	document.getElementById("gameArea").addEventListener("mousedown", shootMarshmellow, false);
}
function shootMarshmellow(event) {
	if ((currentFireDelay <= 0 && magazine > 0 && !currentlyReloading) || marshmellowMode == "shotgun") {
		if (marshmellowMode != "shotgun") {
			currentFireDelay = fireDelay;
			magazine--;
		}

		var canvas = document.getElementById("gameArea").getBoundingClientRect();
		var clickX = (event.clientX - canvas.left) / 30;
		var clickY = (event.clientY - canvas.top) / 30;
		var distance  = Math.sqrt(Math.pow(player.GetWorldCenter().x - clickX, 2) + Math.pow(player.GetWorldCenter().y - clickY, 2));
		var accuracyMulti = 1.0;

		//Finds the next avalible spot in the marshmellow array to create a new marshmellow object
		var i = 0;
		while (i < m.length) {
			if (m[i] == null || m[i] == "fed") {
				break;
			}
			else {
				i++;
			}
		}

		//Only continues if there is a spot availble in the marshmellow array, if the player has health, and if the click is not inside the player
		if (i < m.length && playerHealth > 0 && distance >= playerSize) {

			//Determines which marshmellow to spawn
			if (marshmellowMode == "pistol") {
				m[i] = new Marshmellow(pistol.getCalories(), pistol.getSpeed() * scale, pistol.getSize() * scale, gameArea);
				accuracyMulti = (1 - pistol.getAccuracy());
			}
			else if (marshmellowMode == "rifle") {
				m[i] = new Marshmellow(rifle.getCalories(), rifle.getSpeed() * scale, rifle.getSize() * scale, gameArea);
				accuracyMulti = (1 - rifle.getAccuracy());
			}
			else if (marshmellowMode == "shotgun") {
				m[i] = new Marshmellow(shotgun.getCalories(), shotgun.getSpeed() * scale, shotgun.getSize() * scale, gameArea);
				accuracyMulti = (1 - shotgun.getAccuracy());
			}
			else if (marshmellowMode == "sniper") {
				m[i] = new Marshmellow(sniper.getCalories(), sniper.getSpeed() * scale, sniper.getSize() * scale, gameArea);
				accuracyMulti = (1 - sniper.getAccuracy());
			}
			else {
				console.log("ERROR: marshmellowMode not found");
			}

			//Calculates the coordinates at distance 16 from the world center accorcding to where theclicked point is
			var outerCircleX = (16 / distance) * (clickX - player.GetWorldCenter().x);
			var outerCircleY = (16 / distance) * (clickY - player.GetWorldCenter().y);

			//Calculates the coordinates to spawn the marshmellow according to where the player and clicked point is
			var spawnX = player.GetWorldCenter().x + ((playerSize + m[i].size) / distance) * (clickX - player.GetWorldCenter().x);
			var spawnY = player.GetWorldCenter().y + ((playerSize + m[i].size) / distance) * (clickY - player.GetWorldCenter().y);

			var def = new b2BodyDef;
			def.type = b2Body.b2_dynamicBody;
			def.position.x = spawnX;
			def.position.y = spawnY;

			var fix = new b2FixtureDef;
			fix.density = Math.PI / (Math.PI * Math.pow(m[i].size, 2));
			fix.friction = 0;
			fix.restitution = 0;
			fix.shape = new b2CircleShape(m[i].size);
			if (marshmellowMode == "sniper") {
				fix.filter.categoryBits= 0x0004;
			}
			else {
				fix.filter.categoryBits= 0x0002;
			}
			fix.filter.groupIndex = -1;
			m[i].body = world.CreateBody(def);
			m[i].body.CreateFixture(fix);

			//Following code determiens the velocity to give the marshmellow
			var multiplier = 0.0; // Used to set the less needed axis velocity to a fraction of the most needed
			var offset = 0.0;  // Used to reduce x and y velocity with diaginal movement.  0 with no slope 1 with 45 degree slope

			var xaxis = -1 * (outerCircleX - (19 * (Math.random() - 0.5) * accuracyMulti));
			var yaxis = -1 * (outerCircleY - (19 * (Math.random() - 0.5) * accuracyMulti));

			//Determines which axis needs more velocity and sets the mulitplier accordingly
			if (Math.abs(xaxis) <= Math.abs(yaxis)) {
				multiplier = m[i].speed / Math.abs(yaxis);
				offset = Math.abs(xaxis) / Math.abs(yaxis);
			}
			else {
				multiplier = m[i].speed / Math.abs(xaxis);
				offset = Math.abs(yaxis) / Math.abs(xaxis);
			}

			m[i].body.ApplyImpulse(new b2Vec2(-1 * multiplier * xaxis * (1 - (0.29289 * offset)), -1 * multiplier * yaxis * (1 - (0.29289 * offset))), m[i].body.GetWorldCenter());
			updateProgressBars();
		}
		else {
			console.log("ERROR: Marshmellow array limit reached");
		}
	}
}

function reload() {
	magazine += magazineSize / reloadSpeed / frameRate;
	if (magazine >= magazineSize) {
		magazine = magazineSize;
		currentlyReloading = false;
	}
	updateProgressBars();
}

window.addEventListener("keydown", keydown, false);
function keydown(event) {
	var key = event.keyCode;
	switch(key) {
		case 87: //w
			if (!movingUp) {
				movingUp = true;
			}
			break;
		case 83: //s
			if (!movingDown) {
				movingDown = true;
			}
			break;
		case 65: //a
			if (!movingLeft) {
				movingLeft = true;
			}
			break;
		case 68: //d
			if (!movingRight) {
				movingRight = true;
			}
			break;
		case 16: //Shift
			if (!spacePressed) {
				spacePressed = true;
			}
			break;
		case 82: //r
			if (!currentlyReloading) {
				magazine = 0;
				currentlyReloading = true;
				updateProgressBars();
			}
			break;
		default: break;
	}
}

window.addEventListener("keyup", keyup, false);
function keyup(event) {
	var key = event.keyCode;
	switch(key) {
		case 87: //w
			if (movingUp) {
				movingUp = false;
			}
			break;
		case 83: //s
			if (movingDown) {
				movingDown = false;
			}
			break;
		case 65: //a
			if (movingLeft) {
				movingLeft = false;
			}
			break;
		case 68: //d
			if (movingRight) {
				movingRight = false;
			}
			break;
		case 16: //Shift
			if (spacePressed) {
				spacePressed = false;
			}
			break;
		default: break;
	}
}
document.getElementById("gameArea").addEventListener("mousedown", mousedown, false);
function mousedown() {
	if (!mousePressed) {
		mousePressed = true;
	}
}

document.getElementById("gameArea").addEventListener("mouseup", mouseup, false);
function mouseup() {
	if (mousePressed) {
		mousePressed = false;
	}
}


window.addEventListener("mousemove", getMouseXY, false);
function getMouseXY(event) {
	mouseMoveEvent = event;
}

document.getElementById("buttonUpgrades").addEventListener("click", goToUpgrades, false);
function goToUpgrades() {
	saveData();
	window.location.href = "./Upgrades.html";

}

function saveData() {
	localStorage.hasStorage = true;
	localStorage.playerSpeed = playerSpeed;
	localStorage.playerSight = playerSight;
	localStorage.playerAcceleration = playerAcceleration;
	localStorage.maxPlayerHealth = maxPlayerHealth;
	localStorage.maxPlayerSprint = maxPlayerSprint;
	localStorage.playerSprintMulti = playerSprintMulti;
	localStorage.playerCritChance = playerCritChance;
	localStorage.playerCritMulti = playerCritMulti;
	localStorage.level = level;
	localStorage.exp = exp;
	localStorage.upgradePoints = upgradePoints;
	localStorage.wave = wave;
	localStorage.waveZombies = JSON.stringify(waveZombies);
	localStorage.waveCleared = waveCleared;
	localStorage.cameFromUpgrades = "true";
	localStorage.marshmellowMode = marshmellowMode;
	localStorage.pistol = JSON.stringify(pistol);
	localStorage.rifle = JSON.stringify(rifle);
	localStorage.shotgun = JSON.stringify(shotgun);
	localStorage.sniper = JSON.stringify(sniper);
	localStorage.upgradeLevel = JSON.stringify(upgradeLevel);
	localStorage.storedArmor = JSON.stringify(storedArmor);
	localStorage.helmet = JSON.stringify(helmet);
	localStorage.chestplate = JSON.stringify(chestplate);
	localStorage.leggings = JSON.stringify(leggings);
	localStorage.boots = JSON.stringify(boots);
}

function clearStorage() {
	localStorage.removeItem("hasStorage");
	localStorage.removeItem("playerSpeed");
	localStorage.removeItem("playerSight")
	localStorage.removeItem("playerAcceleration");
	localStorage.removeItem("maxPlayerHealth");
	localStorage.removeItem("maxPlayerSprint");
	localStorage.removeItem("playerSprintMulti");
	localStorage.removeItem("playerCritChance");
	localStorage.removeItem("playerCritMulit");
	localStorage.removeItem("level");
	localStorage.removeItem("exp");
	localStorage.removeItem("upgradePoints");
	localStorage.removeItem("wave");
	localStorage.removeItem("waveZombies");
	localStorage.removeItem("waveCleared");
	localStorage.removeItem("cameFromUpgrades");
	localStorage.removeItem("marshmellowMode");
	localStorage.removeItem("pistol");
	localStorage.removeItem("rifle");
	localStorage.removeItem("shotgun");
	localStorage.removeItem("sniper");
	localStorage.removeItem("upgradeLevel");
	localStorage.removeItem("storedArmor");
	localStorage.removeItem("helmet");
	localStorage.removeItem("chestplate");
	localStorage.removeItem("leggings");
	localStorage.removeItem("boots");

}






/*
var gameArea = document.getElementById("gameArea");
var frameRate = 60;

var movingUp = false;
var movingDown = false;
var movingLeft = false;
var movingRight = false;

gameArea.width = window.innerWidth - 20;
gameArea.height = window.innerHeight - 20;

var player = new entity(20, window.innerWidth / 2 - 10, window.innerHeight / 2 - 10, 100, "blue");


setInterval(updateGameArea, 1000 / frameRate);

function updateGameArea() {
	gameArea.getContext("2d").clearRect(0, 0, gameArea.width, gameArea.height);
	player.newPos(gameArea, frameRate);

}

window.addEventListener("keydown", keydown, false);
window.addEventListener("keyup", keyup, false);

function keydown(event) {
	var key = event.keyCode;
	console.log(key);
	switch(key) {
		case 87: //w
			if (!movingUp) {
				player.moveUp(); 
				movingUp = true;
				break;
			}
		case 65: //s
			if (!movingDown) {
				player.moveDown(); 
				movingDown = true;
				break;
			}
		case 83: //a
			if (!movingLeft) {
				player.moveLeft(); 
				movingLeft = true;
				break;
			}
		case 68: //d
			if (!movingRight) {
				player.moveRight(); 
				movingRight = true;
				break;
			}
		default: break;
	}
}

function keyup(event) {
	var key = event.keyCode;
	switch(key) {
		case 87: //w
			if (movingUp) {
				player.moveDown(); 
				movingUp = true;
				break;
			}
		case 65: //s
			if (movingDown) {
				player.moveUp(); 
				movingDown = true;
				break;
			}
		case 83: //a
			if (movingLeft) {
				player.moveRight(); 
				movingLeft = true;
				break;
			}
		case 68: //d
			if (movingRight) {
				player.moveLeft(); 
				movingRight = true;
				break;
			}
		default: break;
	}
}


if (i < m.length) {
		m[i] = new Marshmellow(10, 30, 0.5, gameArea);

		var distanceSeg1 = playerSize + m[i].size;
		var distanceSeg2 = distance - playerSize - m[i].size;



		//Calculates the coordinates to spawn the marshmellow according to where the player and clicked point is
		var spawnX = (distanceSeg2 * spawnX + distanceSeg1 * player.GetWorldCenter().x) / distance;
		var spawnY = (distanceSeg2 * spawnY + distanceSeg1 * player.GetWorldCenter().y) / distance;

		console.log("seg2 = " + distanceSeg2);
		console.log("spawnX = " + spawnX);
		console.log("spawnY = " + spawnY);

		var def = new b2BodyDef;
		def.type = b2Body.b2_dynamicBody;
		def.position.x = spawnX;
		def.position.y = spawnY;

		var fix = new b2FixtureDef;
		fix.density = Math.PI / (Math.PI * Math.pow(m[i].size, 2));
		fix.friction = 0;
		fix.restitution = 0;
		fix.shape = new b2CircleShape(m[i].size);
		m[i].body = world.CreateBody(def);
		m[i].body.CreateFixture(fix);

		m[i].newPos(spawnX, spawnY);
		


	}
*/