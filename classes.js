class Zombie {
	constructor(type, health, damage, speed, size, experence, preferedDistance, fireRate, rangedDamage, damageType, xpos, ypos, color, aoeSize, aoeTime, canvasName) {
		this.type = type;
		this.health = health;
		this.maxHealth = health;
		this.damage = damage;
		this.speed = speed;
		this.hugTime = 0.0; //Stores the amount of time the zombie has hugged the player.  Decays when not hugging.
		this.maxHugTime = 1.0; //The amount of hugtime that will trigger slowdown if it has been met
		this.hugSlowdown = 0.8; //The slowdown occurs from exceeding maxHugTime in percent.
		this.hugDecaySpeed = 1.0; //Determines how fast the hugTime decays when not hugging the player.
		this.hugSlowed = false;
		this.size = size;
		this.experence = experence;
		this.preferedDistance = preferedDistance;
		this.xpos = xpos;
		this.ypos = ypos;
		this.color = color;
		this.canvasName = canvasName;
		this.hasEaten = -1;
		this.timeBeforeSniperEat = 0;
		this.fireRate = fireRate;
		this.rangedDamage = rangedDamage;
		this.damageType = damageType;
		this.delay = 0.0;
		this.aoeSize = aoeSize;
		this.aoeTime = aoeTime;
		this.lobberReady = false;
		this.body; //Used to store the body object from box2d
		this.html = "<div></div>";  //Used to store the html for health bars
	}

	newPos(posX, posY, text, scale) {
		var ctx = this.canvasName.getContext("2d");
		ctx.beginPath();
		ctx.arc(posX * 30, posY * 30, this.size * 30, 0, 2 * Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();

		ctx.font = (0.9 * scale * this.size) + "em Bungee";
		ctx.fillStyle = "#DFDFDF";
		ctx.fillText(text, posX * 30 - (ctx.measureText(text).width / 2), posY * 30 + (this.size * 30 * 0.25));
	}
}

class CanvasText {
	constructor(text, startingPosX, startingPosY, verticalMovement, canvasName) {
		this.text = text;
		this.startingPosX = startingPosX;
		this.startingPosY = startingPosY;
		this.displayTime = 2.0; //The time it has left to be displayed on the screen
		this.startingTime = this.displayTime;
		this.verticalMovement = verticalMovement;
		this.canvasName = canvasName;
	}

	newPos(canvasHeight) {
		var ctx = this.canvasName.getContext("2d");
		ctx.font = scale + "em Bungee";
		ctx.fillStyle = "red";
		ctx.fillText(this.text, this.startingPosX - (ctx.measureText(this.text).width / 2), this.startingPosY + (canvasHeight * 0.06) - this.verticalMovement * (this.startingTime - this.displayTime / this.startingTime));
	}
}

class AoESegment {
	constructor(damage, size, aoeTime, canvasName) {
		this.damage = damage;
		this.size = size;
		this.aoeTime = aoeTime;
		this.canvasName = canvasName;
		this.body; //Used to store the body object from box2d
	}

	newPos(posX, posY, color) {
		var ctx = this.canvasName.getContext("2d");
		ctx.beginPath();
		ctx.arc(posX * 30, posY * 30, this.size * 30, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
	}
}

class Marshmellow {
	constructor(damage, speed, size, canvasName) {
		this.damage = damage;
		this.speed = speed;
		this.type = "ranged";
		this.size = size;
		this.canvasName = canvasName;
		this.body; //Used to store the body object from box2d
	}

	newPos(posX, posY, color) {
		var ctx = this.canvasName.getContext("2d");
		ctx.beginPath();
		ctx.arc(posX * 30, posY * 30, this.size * 30, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
	}
}

class LobberMarshmellow extends Marshmellow {
	constructor(damage, speed, size, canvasName, finalX, finalY, aoeSize, aoeTime) {
		super(damage, speed, size, canvasName);
		this.finalX = finalX;
		this.finalY = finalY;
		this.aoeSize = aoeSize
		this.aoeTime = aoeTime;
		this.type = "lobber";
	}
}

class GunVariant {
	constructor(level, rarity, gunMode) {
		this.level = level;
		this.rarity = rarity;
		this.gunMode = gunMode;
		this.caloriesModifier = 0.0;
		this.speedModifier = 0.0;
		this.fireRateModifier = 0.0;
		this.accuracyModifier = 0.0;
		this.sizeModifier = 0.0;
		this.shotsModifier = 0.0;
		this.magSizeModifier = 0.0;
		this.reloadSpeedModifier = 0.0;
	}

	getLevel() {
		return this.level;
	}

	getRarity() {
		return this.rarity;
	}

	getGunMode() {
		return this.gunMode;
	}

	getCaloriesModifier() {
		return this.caloriesModifier;
	}

	getSpeedModifier() {
		return this.speedModifier;
	}

	getFireRateModifier() {
		return this.fireRateModifier;
	}

	getAccuracyModifier() {
		return this.accuracyModifier;
	}

	getSizeModifier() {
		return this.sizeModifier;
	}

	getShotsModifier() {
		return this.shotsModifier;
	}

	getMagSizeModifier() {
		return this.magSizeModifier;
	}

	getReloadSpeedModifier() {
		return this.reloadSpeedModifier;
	}

	setCaloriesModifier(caloriesModifier) {
		this.caloriesModifier = caloriesModifier;
	}

	setspeedModifier(speedModifier) {
		this.speedModifier = speedModifier;
	}

	setFireRateModifier(fireRateModifier) {
		this.fireRateModifier = fireRateModifier;
	}

	setAccuracyModifier(accuracyModifier) {
		this.accuracyModifier = accuracyModifier;
	}

	setSizeModifier(sizeModifier) {
		this.sizeModifier = sizeModifier;
	}

	setShotsModifier(shotsModifier) {
		this.shotsModifier = shotsModifier;
	}

	setMagSizeModifier(magSizeModifier) {
		this.magSizeModifier = magSizeModifier;
	}

	setReloadSpeedModifier(reloadSpeedModifier) {
		this.reloadSpeedModifier = reloadSpeedModifier;
	}

	generateModifiers() {
		//TODO after base game is finished
	}
}

class Armor {
	constructor(level, rarity, type, weight) {
		this.level = level;
		this.rarity = rarity;
		this.type = type;
		this.weight = weight;
		this.equipped = false;
		this.healthModifier = 0.0;
		this.meleeReductionModifier = 0.0;
		this.rangedReductionModifier = 0.0;
		this.areaReductionModifier = 0.0;
		this.movementSpeedModifier = 0.0;
		this.sprintTimeModifier = 0.0;
		this.sprintMultiModifier = 0.0;
		this.mouthshotChanceModifier = 0.0;
		this.mouthshotMultiModifier = 0.0;
		this.sightRangeModifier = 0.0;
	}

	getLevel() {
		return this.level;
	}

	getRarity() {
		return this.rarity;
	}

	getType() {
		return this.type;
	}

	getWeight() {
		return this.weight;
	}

	getEquipped() {
		return this.equipped;
	}

	getHealthModifier() {
		return this.healthModifier;
	}

	getMeleeReductionModifier() {
		return this.meleeReductionModifier;
	}

	getRangedReductionModifier() {
		return this.rangedReductionModifier;
	}

	getAreaReductionModifier() {
		return this.areaReductionModifier;
	}

	getMovementSpeedModifier() {
		return this.movementSpeedModifier;
	}

	getSprintTimeModifier() {
		return this.movementSpeedModifier;
	}

	getSprintMultiModifier() {
		return this.sprintMultiModifier;
	}

	getMouthshotChanceModifier() {
		return this.mouthshotChanceModifier;
	}

	getMouthshotMultiModifier() {
		return this.mouthshotMultiModifier;
	}

	getSightRangeModifier() {
		return this.sightRangeModifier;
	}

	setEquipped(equippedStatus) {
		this.equipped = equippedStatus
	}

	setHealthModifier(healthModifier) {
		this.healthModifier = healthModifier;
	}

	setDamageReductionModifier(damageReductionModifier) {
		this.damageReductionModifier = damageReductionModifier;
	}

	setMovementSpeedModifier(movementSpeedModifier) {
		this.movementSpeedModifier = movementSpeedModifier;
	}

	setSprintTimeModifier(sprintTimeModifier) {
		this.sprintTimeModifier = sprintTimeModifier;
	}

	setSprintMultiModifier(sprintMultiModifier) {
		this.sprintMultiModifier = sprintMultiModifier;
	}

	setMouthshotChanceModifier(mouthshotChanceModifier) {
		this.mouthshotChanceModifier = mouthshotChanceModifier;
	}

	setMouthshotMultiModifier(mouthshotMultiModifier) {
		this.mouthshotMultiModifier = mouthshotMultiModifier;
	}

	setSightRangeModifier(sightRangeModifier) {
		this.sightRangeModifier = sightRangeModifier;
	}

	generateModifiers() {
		//TODO create section for new game plus

		if (this.weight === "Heavy") {
			this.movementSpeedModifier = -0.075;
			this.meleeReductionModifier = 0.08 + (0.001194444 * Math.min(this.level, 90));
			this.rangedReductionModifier = 0.15 + (0.000694444 * Math.min(this.level, 90));
			this.areaReductionModifier = 0.05 + (0.000416667 * Math.min(this.level, 90));
		}
		else if (this.weight === "Light") {
			this.movementSpeedModifier = -0.0375;
			this.meleeReductionModifier = 0.0375 + (0.000972223 * Math.min(this.level, 90));
			this.rangedReductionModifier = 0.04 + (0.000388889 * Math.min(this.level, 90));
			this.areaReductionModifier = 0.12 + (0.000611111 * Math.min(this.level, 90));
		}
		else if (this.weight === "empty") {
			//Does not add any modifiers as there should be none
		}
		else {
			console.log("Error: Armor weight not valid");
		}
	}
}

class PlayRender {
	constructor(size, color, canvasName) {
		this.size = size;
		this.color = color;
		this.canvasName = canvasName;
	}

	newPos(posX, posY) {
		var ctx = this.canvasName.getContext("2d");
		ctx.beginPath();
		ctx.arc(posX * 30, posY * 30, this.size, 0, 2 * Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}

//Stores stats for a specific type of marshmellow gun
class MarshmellowGun {
	constructor(calories, speed, fireRate, accuracy, size, shots, magSize, reloadSpeed) {
		this.calories = calories;
		this.speed = speed;
		this.fireRate = fireRate;
		this.accuracy = accuracy;
		this.size = size;
		this.shots = shots;
		this.magSize = magSize;
		this.reloadSpeed = reloadSpeed;
	}

	getCalories() {
		return this.calories;
	}

	getSpeed() {
		return this.speed;
	}

	getFireRate() {
		return this.fireRate;
	}

	getAccuracy() {
		return this.accuracy;
	}

	getSize() {
		return this.size;
	}

	getShots() {
		return this.shots;
	}

	getMagSize() {
		return this.magSize;
	}

	getReloadSpeed() {
		return this.reloadSpeed;
	}

	setCalories(calories) {
		this.calories = calories;
	}

	setSpeed(speed) {
		this.speed = speed;
	}

	setFireRate(fireRate) {
		this.fireRate = fireRate;
	}

	setAccuracy(accuracy) {
		this.accuracy = accuracy;
	}

	setSize(size) {
		this.size = size;
	}

	setShots(shots) {
		this.shots = shots;
	}

	setMagSize(magSize) {
		this.magSize = magSize;
	}

	setReloadSpeed(reloadSpeed) {
		this.reloadSpeed = reloadSpeed;
	}

}