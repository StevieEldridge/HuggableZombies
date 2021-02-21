if (localStorage.hasStorage == "false") {
	window.location.href = "./Zombie Game.html";
}

var maxPlayerHealth = parseFloat(localStorage.maxPlayerHealth);
var maxPlayerSprint = parseFloat(localStorage.maxPlayerSprint);
var playerSprintMulti = parseFloat(localStorage.playerSprintMulti);
var playerSpeed = parseFloat(localStorage.playerSpeed);
var displaySpeed = playerSpeed;
var upgradePoints = parseInt(localStorage.upgradePoints);
var upgradeLevel = JSON.parse(localStorage.upgradeLevel);
var marshmellowMode = localStorage.marshmellowMode;
var playerSight = parseFloat(localStorage.playerSight);
var playerCritChance = parseFloat(localStorage.playerCritChance);
var playerCritMulti = parseFloat(localStorage.playerCritMulti);

var pistol = new MarshmellowGun();
var rifle = new MarshmellowGun();
var shotgun = new MarshmellowGun();
var sniper = new MarshmellowGun();
Object.assign(pistol, JSON.parse(localStorage.pistol));
Object.assign(rifle, JSON.parse(localStorage.rifle));
Object.assign(shotgun, JSON.parse(localStorage.shotgun));
Object.assign(sniper, JSON.parse(localStorage.sniper));

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

var playerArmor = helmet.getDamageReductionModifier() + chestplate.getDamageReductionModifier() + 
			leggings.getDamageReductionModifier() + boots.getDamageReductionModifier();

for(var a = 0; a < upgradeLevel.length; a++) {
	for (var b = 0; b < upgradeLevel[a].length; b++) {
		upgradeLevel[a][b] = parseInt(upgradeLevel[a][b]);
	}
}

updateProgressBars();


document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";

document.querySelector("#buttonUpgradeHead").value = "Lv " + upgradeLevel[0][0];
document.querySelector("#buttonUpgradeLegs").value = "Lv " + upgradeLevel[0][1];
document.querySelector("#buttonUpgradeFeet").value = "Lv " + upgradeLevel[0][2];
document.querySelector("#buttonUpgradeSight").value = "Lv " + upgradeLevel[0][3];
document.querySelector("#buttonUpgradeMouthshot").value = "Lv " + upgradeLevel[0][4];


document.querySelector("#buttonPistolCalories").value = "Lv " + upgradeLevel[1][0];
document.querySelector("#buttonPistolFireRate").value = "Lv " + upgradeLevel[1][1];
document.querySelector("#buttonPistolSpeed").value = "Lv " + upgradeLevel[1][2];
document.querySelector("#buttonPistolMagazine").value = "Lv " + upgradeLevel[1][3];
document.querySelector("#buttonPistolReloadSpeed").value = "Lv " + upgradeLevel[1][4];

document.querySelector("#buttonRifleCalories").value = "Lv " + upgradeLevel[2][0];
document.querySelector("#buttonRifleFireRate").value = "Lv " + upgradeLevel[2][1];
document.querySelector("#buttonRifleAccuracy").value = "Lv " + upgradeLevel[2][2];
document.querySelector("#buttonRifleMagazine").value = "Lv " + upgradeLevel[2][3];
document.querySelector("#buttonRifleReloadSpeed").value = "Lv " + upgradeLevel[2][4];

document.querySelector("#buttonShotgunCalories").value = "Lv " + upgradeLevel[3][0];
document.querySelector("#buttonShotgunFireRate").value = "Lv " + upgradeLevel[3][1];
document.querySelector("#buttonShotgunAccuracy").value = "Lv " + upgradeLevel[3][2];
document.querySelector("#buttonShotgunShots").value = "Lv " + upgradeLevel[3][3];
document.querySelector("#buttonShotgunMagazine").value = "Lv " + upgradeLevel[3][4];

document.querySelector("#buttonSniperCalories").value = "Lv " + upgradeLevel[4][0];
document.querySelector("#buttonSniperFireRate").value = "Lv " + upgradeLevel[4][1];
document.querySelector("#buttonSniperSize").value = "Lv " + upgradeLevel[4][2];
document.querySelector("#buttonSniperMagazine").value = "Lv " + upgradeLevel[4][3];
document.querySelector("#buttonSniperReloadSpeed").value = "Lv " + upgradeLevel[4][4];

updatePlayerArmorAndDisplaySpeed();
updateStats(returnSelectedMarshmellowGunObject());

//Adds the HTML to display every piece of armor collected
document.getElementById("storedArmor").innerHTML = "<div class = \"heading\" style = \"text-align: center; font-size: 2.4em;\">Armor</div>";
for (var i = 0; i < storedArmor.length; i++) {
	if (storedArmor[i] != null) {
		document.getElementById("storedArmor").innerHTML += 
				"<div class = \"armorColumn\" id = \"armorColumn" + i + "\">" +
					"<div class = \"armorColumnLeft\" id = \"armorColumnLeft" + i + "\">" +
						"<div class = \"armorLevel\">" + storedArmor[i].getLevel() + "</div>" +
						"<div class = \"armorType\">" + storedArmor[i].getType() + "</div>" +
					"</div>" +
					"<div class = \"armorColumnMiddle\" id = \"armorColumnMiddle" + i + "\">" +
					"<div>Weight: " + storedArmor[i].getWeight() + "</div>" +
						"<div>Armor: " + (storedArmor[i].getDamageReductionModifier() * 100).toFixed(2) + "%</div>" +
					"</div>" +
					"<div class = \"armorColumnRight\">" +
						"<input type = \"button\" class = \"dropGear\" id = \"buttonDropGear" + i + "\" value = \"X\">" +
					"</div>" +
				"</div>";
	}
}

updateArmorColor();

//If the user clicks on the armorColumn it will equip or unequip that piece of armor
for (var i = 0; i < storedArmor.length; i++) {
	if (document.getElementById("armorColumn" + i) != null) {
		document.getElementById("armorColumnLeft" + i).addEventListener("click", function equipArmor() {
			//Finds the id of the armorColumn element
			var armorColumnId = this.parentNode.id;
			var armorColumnIdNumber = armorColumnId.slice(11, armorColumnId.length);

			//Determines if the armor is equipped or not and takes approperate action to either equip or unequip it
			if (storedArmor[armorColumnIdNumber].getEquipped()) {
				//Unequips the clicked armor
				if (storedArmor[armorColumnIdNumber].getType() == "head") {
					helmet = new Armor(0, "empty", "head", "empty");
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "chest") {
					chestplate = new Armor(0, "empty", "chest", "empty");
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "legs") {
					leggings = new Armor(0, "empty", "legs", "empty");
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "feet") {
					boots = new Armor(0, "empty", "feet", "empty");
				}
				else {
					console.log("ERROR: Armor has an invalid type name")
				}
				storedArmor[armorColumnIdNumber].setEquipped(false);
			}
			else {
				//Unequips any previous armor and equips the new armor
				if (storedArmor[armorColumnIdNumber].getType() == "head") {
					for (var i = 0; i < storedArmor.length; i++) {
						if (storedArmor[i] != null) {
							if (storedArmor[i].getType() == "head") {
								storedArmor[i].setEquipped(false);
							}
						}
					}
					helmet = storedArmor[armorColumnIdNumber];
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "chest") {
					for (var i = 0; i < storedArmor.length; i++) {
						if (storedArmor[i] != null) {
							if (storedArmor[i].getType() == "chest") {
								storedArmor[i].setEquipped(false);
							}
						}
					}
					chestplate = storedArmor[armorColumnIdNumber];
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "legs") {
					for (var i = 0; i < storedArmor.length; i++) {
						if (storedArmor[i] != null) {
							if (storedArmor[i].getType() == "legs") {
								storedArmor[i].setEquipped(false);
							}
						}
					}
					leggings = storedArmor[armorColumnIdNumber];
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "feet") {
					for (var i = 0; i < storedArmor.length; i++) {
						if (storedArmor[i] != null) {
							if (storedArmor[i].getType() == "feet") {
								storedArmor[i].setEquipped(false);
							}
						}
					}
					boots = storedArmor[armorColumnIdNumber];
				}
				else {
					console.log("ERROR: Armor has an invalid type name")
				}
				storedArmor[armorColumnIdNumber].setEquipped(true);
			}

			updateArmorColor();
			updatePlayerArmorAndDisplaySpeed();
			updateStats(returnSelectedMarshmellowGunObject());
		});
		document.getElementById("armorColumnMiddle" + i).addEventListener("click", function equipArmor() {
			//Finds the id of the armorColumn element
			var armorColumnId = this.parentNode.id;
			var armorColumnIdNumber = armorColumnId.slice(11, armorColumnId.length);

			//Determines if the armor is equipped or not and takes approperate action to either equip or unequip it
			if (storedArmor[armorColumnIdNumber].getEquipped()) {
				//Unequips the clicked armor
				if (storedArmor[armorColumnIdNumber].getType() == "head") {
					helmet = new Armor(0, "empty", "head", "empty");
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "chest") {
					chestplate = new Armor(0, "empty", "chest", "empty");
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "legs") {
					leggings = new Armor(0, "empty", "legs", "empty");
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "feet") {
					boots = new Armor(0, "empty", "feet", "empty");
				}
				else {
					console.log("ERROR: Armor has an invalid type name")
				}
				storedArmor[armorColumnIdNumber].setEquipped(false);
			}
			else {
				//Unequips any previous armor and equips the new armor
				if (storedArmor[armorColumnIdNumber].getType() == "head") {
					for (var i = 0; i < storedArmor.length; i++) {
						if (storedArmor[i] != null) {
							if (storedArmor[i].getType() == "head") {
								storedArmor[i].setEquipped(false);
							}
						}
					}
					helmet = storedArmor[armorColumnIdNumber];
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "chest") {
					for (var i = 0; i < storedArmor.length; i++) {
						if (storedArmor[i] != null) {
							if (storedArmor[i].getType() == "chest") {
								storedArmor[i].setEquipped(false);
							}
						}
					}
					chestplate = storedArmor[armorColumnIdNumber];
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "legs") {
					for (var i = 0; i < storedArmor.length; i++) {
						if (storedArmor[i] != null) {
							if (storedArmor[i].getType() == "legs") {
								storedArmor[i].setEquipped(false);
							}
						}
					}
					leggings = storedArmor[armorColumnIdNumber];
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "feet") {
					for (var i = 0; i < storedArmor.length; i++) {
						if (storedArmor[i] != null) {
							if (storedArmor[i].getType() == "feet") {
								storedArmor[i].setEquipped(false);
							}
						}
					}
					boots = storedArmor[armorColumnIdNumber];
				}
				else {
					console.log("ERROR: Armor has an invalid type name")
				}
				storedArmor[armorColumnIdNumber].setEquipped(true);
			}

			updateArmorColor();
			updatePlayerArmorAndDisplaySpeed();
			updateStats(returnSelectedMarshmellowGunObject());
		});
	}
}

//Codes the X button for the armorColumn elements and allows the user to drop them
for (var i = 0; i < storedArmor.length; i++) {
	if (document.getElementById("buttonDropGear" + i) != null) {
		document.getElementById("buttonDropGear" + i).addEventListener("click", function removeArmor() {
			//Finds the id of the armorColumn element
			var armorColumnId = this.parentNode.parentNode.id;
			var armorColumnLeftId = this.parentNode.parentNode.childNodes[0].id;
			var armorColumnMiddleId  = this.parentNode.parentNode.childNodes[1].id;
			var armorColumnIdNumber = armorColumnId.slice(11, armorColumnId.length);


			//Unequips the armor if the player currently has it equipped
			if (storedArmor[armorColumnIdNumber].getEquipped()) {
				if (storedArmor[armorColumnIdNumber].getType() == "head") {
					helmet = new Armor(0, "empty", "head", "empty");
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "chest") {
					chestplate = new Armor(0, "empty", "chest", "empty");
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "legs") {
					leggings = new Armor(0, "empty", "legs", "empty");
				}
				else if (storedArmor[armorColumnIdNumber].getType() == "feet") {
					boots = new Armor(0, "empty", "feet", "empty");
				}
				else {
					console.log("ERROR: Armor has an invalid type name")
				}
			}

			//Removes the event listener for that armorColumn's armorColumnLeft and armorColumnMiddle
			document.getElementById(armorColumnLeftId).removeEventListener("click", function equipArmor(){});
			document.getElementById(armorColumnMiddleId).removeEventListener("click", function equipArmor(){});

			//Removes the armor from the storedArmor array and removes the armorColumn element
			storedArmor[armorColumnIdNumber] = null;
			this.parentNode.parentNode.remove();
			updatePlayerArmorAndDisplaySpeed();
			updateStats(returnSelectedMarshmellowGunObject());
		});
	}
}

//Changes the background and font color of equipped armor
function updateArmorColor() {
	for (var i = 0; i < storedArmor.length; i++) {
		if (storedArmor[i] != null) {
			if (storedArmor[i].getEquipped()) {
				document.getElementById("armorColumn" + i).style.background = "#ebd698";
				//document.getElementById("armorColumn" + i).style.color = "#edb818";
			}
			else {
				document.getElementById("armorColumn" + i).style.background = "#dedede";
				//document.getElementById("armorColumn" + i).style.color = "#000000";
			}
		}
	}
}

function updatePlayerArmorAndDisplaySpeed() {
	playerArmor = helmet.getDamageReductionModifier() + chestplate.getDamageReductionModifier() + 
			leggings.getDamageReductionModifier() + boots.getDamageReductionModifier();

	displaySpeed = playerSpeed * (1 + helmet.getMovementSpeedModifier() + chestplate.getMovementSpeedModifier() + 
			leggings.getMovementSpeedModifier() + boots.getMovementSpeedModifier());

}

function updateProgressBars() {
	var progressHealth = "<span class = \"progressForeground\" style = \"width: " + (maxPlayerHealth / 500 * 100) + "%\">" + "Maximum Health: " + maxPlayerHealth.toFixed(0) +"</span>";
	document.getElementById("progressHealth").innerHTML = progressHealth;
	var progressSprint = "<span class = \"progressForeground\" style = \"width: " + (maxPlayerSprint / 20 * 100) + "%\">" + "Sprint Time: " + maxPlayerSprint.toFixed(1) +"s</span>";
	document.getElementById("progressSprint").innerHTML = progressSprint;
	var progressSpeed = "<span class = \"progressForeground\" style = \"width: " + (playerSpeed / 18 * 100) + "%\">" + "Movement Speed: " + playerSpeed.toFixed(2) +"</span>";
	document.getElementById("progressSpeed").innerHTML = progressSpeed;
	var progressRange = "<span class = \"progressForeground\" style = \"width: " + (playerSight / 1.2 * 100) + "%\">" + "Sight Range: " + (playerSight * 100).toFixed(1) +"%</span>";
	document.getElementById("progressRange").innerHTML = progressRange;
	var progressMouthshot = "<span class = \"progressForeground\" style = \"width: " + ((playerCritChance * playerCritMulti) / 0.75 * 100) + "%\">Critical Mouthshot</span>";
	document.getElementById("progressMouthshot").innerHTML = progressMouthshot;

	var progressPistolCalories = "<span class = \"progressForeground\" style = \"width: " + (pistol.getCalories() / 300 * 100) + "%\">" + "Calories: " + pistol.getCalories().toFixed(1) +"</span>";
	document.getElementById("progressPistolCalories").innerHTML = progressPistolCalories;
	var progressPistolFireRate = "<span class = \"progressForeground\" style = \"width: " + (pistol.getFireRate() / 11 * 100) + "%\">" + "Fire Rate: " + pistol.getFireRate().toFixed(2) +"</span>";
	document.getElementById("progressPistolFireRate").innerHTML = progressPistolFireRate;
	var progressPistolAccuracy = "<span class = \"progressForeground\" style = \"width: " + (pistol.getAccuracy() * 100) + "%\">" + "Accuracy: " + (pistol.getAccuracy() * 100).toFixed(1) +"%</span>";
	document.getElementById("progressPistolAccuracy").innerHTML = progressPistolAccuracy;
	var progressPistolMagazine = "<span class = \"progressForeground\" style = \"width: " + (pistol.getMagSize() / 80 * 100) + "%\">" + "Magazine Size: " + pistol.getMagSize().toFixed(0) +"</span>";
	document.getElementById("progressPistolMagazine").innerHTML = progressPistolMagazine;
	var progressPistolReloadSpeed = "<span class = \"progressForeground\" style = \"width: " + (Math.abs(8.0 - pistol.getReloadSpeed()) / 7.2 * 100) + "%\">" + "Reload Speed: " + pistol.getReloadSpeed().toFixed(2) +"s</span>";
	document.getElementById("progressPistolReloadSpeed").innerHTML = progressPistolReloadSpeed;
	var progressPistolSpeed = "<span class = \"progressForeground\" style = \"width: " + (pistol.getSpeed() / 60 * 100) + "%\">" + "Marshmellow Speed: " + pistol.getSpeed().toFixed(1) +"</span>";
	document.getElementById("progressPistolSpeed").innerHTML = progressPistolSpeed;
	var progressPistolSize = "<span class = \"progressForeground\" style = \"width: " + (pistol.getSize() / 0.85 * 100) + "%\">" + "Marshmellow Size: " + (pistol.getSize() * 10).toFixed(2) +"</span>";
	document.getElementById("progressPistolSize").innerHTML = progressPistolSize;

	var progressRifleCalories = "<span class = \"progressForeground\" style = \"width: " + (rifle.getCalories() / 300 * 100) + "%\">" + "Calories: " + rifle.getCalories().toFixed(1) +"</span>";
	document.getElementById("progressRifleCalories").innerHTML = progressRifleCalories;
	var progressRifleFireRate = "<span class = \"progressForeground\" style = \"width: " + (rifle.getFireRate() / 11 * 100) + "%\">" + "Fire Rate: " + rifle.getFireRate().toFixed(2) +"</span>";
	document.getElementById("progressRifleFireRate").innerHTML = progressRifleFireRate;
	var progressRifleAccuracy = "<span class = \"progressForeground\" style = \"width: " + (rifle.getAccuracy() * 100) + "%\">" + "Accuracy: " + (rifle.getAccuracy() * 100).toFixed(1) +"%</span>";
	document.getElementById("progressRifleAccuracy").innerHTML = progressRifleAccuracy;
	var progressRifleMagazine = "<span class = \"progressForeground\" style = \"width: " + (rifle.getMagSize() / 80 * 100) + "%\">" + "Magazine Size: " + rifle.getMagSize().toFixed(0) +"</span>";
	document.getElementById("progressRifleMagazine").innerHTML = progressRifleMagazine;
	var progressRifleReloadSpeed = "<span class = \"progressForeground\" style = \"width: " + (Math.abs(8.0 - rifle.getReloadSpeed()) / 7.2 * 100) + "%\">" + "Reload Speed: " + rifle.getReloadSpeed().toFixed(2) +"s</span>";
	document.getElementById("progressRifleReloadSpeed").innerHTML = progressRifleReloadSpeed;
	var progressRifleSpeed = "<span class = \"progressForeground\" style = \"width: " + (rifle.getSpeed() / 60 * 100) + "%\">" + "Marshmellow Speed: " + rifle.getSpeed().toFixed(1) +"</span>";
	document.getElementById("progressRifleSpeed").innerHTML = progressRifleSpeed;
	var progressRifleSize = "<span class = \"progressForeground\" style = \"width: " + (rifle.getSize() / 0.85 * 100) + "%\">" + "Marshmellow Size: " + (rifle.getSize() * 10).toFixed(2) +"</span>";
	document.getElementById("progressRifleSize").innerHTML = progressRifleSize;

	var progressShotgunCalories = "<span class = \"progressForeground\" style = \"width: " + (shotgun.getCalories() / 300 * 100) + "%\">" + "Calories: " + shotgun.getCalories().toFixed(1) +"</span>";
	document.getElementById("progressShotgunCalories").innerHTML = progressShotgunCalories;
	var progressShotgunFireRate = "<span class = \"progressForeground\" style = \"width: " + (shotgun.getFireRate() / 11 * 100) + "%\">" + "Fire Rate: " + shotgun.getFireRate().toFixed(2) +"</span>";
	document.getElementById("progressShotgunFireRate").innerHTML = progressShotgunFireRate;
	var progressShotgunAccuracy = "<span class = \"progressForeground\" style = \"width: " + (shotgun.getAccuracy() * 100) + "%\">" + "Accuracy: " + (shotgun.getAccuracy() * 100).toFixed(1) +"%</span>";
	document.getElementById("progressShotgunAccuracy").innerHTML = progressShotgunAccuracy;
	var progressShotgunMagazine = "<span class = \"progressForeground\" style = \"width: " + (shotgun.getMagSize() / 80 * 100) + "%\">" + "Magazine Size: " + shotgun.getMagSize().toFixed(0) +"</span>";
	document.getElementById("progressShotgunMagazine").innerHTML = progressShotgunMagazine;
	var progressShotgunReloadSpeed = "<span class = \"progressForeground\" style = \"width: " + (Math.abs(8.0 - shotgun.getReloadSpeed()) / 7.2 * 100) + "%\">" + "Reload Speed: " + shotgun.getReloadSpeed().toFixed(2) +"s</span>";
	document.getElementById("progressShotgunReloadSpeed").innerHTML = progressShotgunReloadSpeed;
	var progressShotgunSpeed = "<span class = \"progressForeground\" style = \"width: " + (shotgun.getSpeed() / 60 * 100) + "%\">" + "Marshmellow Speed: " + shotgun.getSpeed().toFixed(1) +"</span>";
	document.getElementById("progressShotgunSpeed").innerHTML = progressShotgunSpeed;
	var progressShotgunShots = "<span class = \"progressForeground\" style = \"width: " + (shotgun.getShots() / 18 * 100) + "%\">" + "Marshmellows: " + shotgun.getShots().toFixed(1) +"</span>";
	document.getElementById("progressShotgunShots").innerHTML = progressShotgunShots;

	var progressSniperCalories = "<span class = \"progressForeground\" style = \"width: " + (sniper.getCalories() / 300 * 100) + "%\">" + "Calories: " + sniper.getCalories().toFixed(1) +"</span>";
	document.getElementById("progressSniperCalories").innerHTML = progressSniperCalories;
	var progressSniperFireRate = "<span class = \"progressForeground\" style = \"width: " + (sniper.getFireRate() / 11 * 100) + "%\">" + "Fire Rate: " + sniper.getFireRate().toFixed(2) +"</span>";
	document.getElementById("progressSniperFireRate").innerHTML = progressSniperFireRate;
	var progressSniperAccuracy = "<span class = \"progressForeground\" style = \"width: " + (sniper.getAccuracy() * 100) + "%\">" + "Accuracy: " + (sniper.getAccuracy() * 100).toFixed(1) +"%</span>";
	document.getElementById("progressSniperAccuracy").innerHTML = progressSniperAccuracy;
	var progressSniperMagazine = "<span class = \"progressForeground\" style = \"width: " + (sniper.getMagSize() / 80 * 100) + "%\">" + "Magazine Size: " + sniper.getMagSize().toFixed(0) +"</span>";
	document.getElementById("progressSniperMagazine").innerHTML = progressSniperMagazine;
	var progressSniperReloadSpeed = "<span class = \"progressForeground\" style = \"width: " + (Math.abs(8.0 - sniper.getReloadSpeed()) / 7.2 * 100) + "%\">" + "Reload Speed: " + sniper.getReloadSpeed().toFixed(2) +"s</span>";
	document.getElementById("progressSniperReloadSpeed").innerHTML = progressSniperReloadSpeed;
	var progressSniperSpeed = "<span class = \"progressForeground\" style = \"width: " + (sniper.getSpeed() / 60 * 100) + "%\">" + "Marshmellow Speed: " + sniper.getSpeed().toFixed(1) +"</span>";
	document.getElementById("progressSniperSpeed").innerHTML = progressSniperSpeed;
	var progressSniperSize = "<span class = \"progressForeground\" style = \"width: " + (sniper.getSize() / 0.85 * 100) + "%\">" + "Marshmellow Size: " + (sniper.getSize() * 10).toFixed(2) +"</span>";
	document.getElementById("progressSniperSize").innerHTML = progressSniperSize;
}

document.getElementById("buttonUpgradeHead").addEventListener("click", upgradeHead, false);
function upgradeHead() {
	if (removePoint()) {
		maxPlayerHealth += 20;

		upgradeLevel[0][0]++;
		document.querySelector("#buttonUpgradeHead").value = "Lv " + upgradeLevel[0][0];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonUpgradeLegs").addEventListener("click", upgradeLegs, false);
function upgradeLegs() {
	if (removePoint()) {
		maxPlayerSprint += 0.8;
		playerSprintMulti += 0.00;

		upgradeLevel[0][1]++;
		document.querySelector("#buttonUpgradeLegs").value = "Lv " + upgradeLevel[0][1];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonUpgradeFeet").addEventListener("click", upgradeFeet, false);
function upgradeFeet() {
	if (removePoint()) {
		playerSpeed += 0.4;

		upgradeLevel[0][2]++;
		document.querySelector("#buttonUpgradeFeet").value = "Lv " + upgradeLevel[0][2];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updatePlayerArmorAndDisplaySpeed();
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonUpgradeSight").addEventListener("click", upgradeSight, false);
function upgradeSight() {
	if (removePoint()) {
		playerSight += 0.01;

		upgradeLevel[0][3]++;
		document.querySelector("#buttonUpgradeSight").value = "Lv " + upgradeLevel[0][3];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonUpgradeMouthshot").addEventListener("click", upgradeMouthshot, false);
function upgradeMouthshot() {
	if (removePoint()) {
		playerCritChance += 0.01;
		playerCritMulti += 0.0875;

		upgradeLevel[0][4]++;
		document.querySelector("#buttonUpgradeMouthshot").value = "Lv " + upgradeLevel[0][4];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}



document.getElementById("buttonPistolCalories").addEventListener("click", pistolCalories, false);
function pistolCalories() {
	if (removePoint()) {
		pistol.setCalories(pistol.getCalories() + 4);

		upgradeLevel[1][0]++;
		document.querySelector("#buttonPistolCalories").value = "Lv " + upgradeLevel[1][0];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonPistolFireRate").addEventListener("click", pistolFireRate, false);
function pistolFireRate() {
	if (removePoint()) {
		pistol.setFireRate(pistol.getFireRate() + 0.3);

		upgradeLevel[1][1]++;
		document.querySelector("#buttonPistolFireRate").value = "Lv " + upgradeLevel[1][1];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonPistolSpeed").addEventListener("click", pistolSpeed, false);
function pistolSpeed() {
	if (removePoint()) {
		pistol.setSpeed(pistol.getSpeed() + 1.5);

		upgradeLevel[1][2]++;
		document.querySelector("#buttonPistolSpeed").value = "Lv " + upgradeLevel[1][2];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonPistolMagazine").addEventListener("click", pistolMagazine, false);
function pistolMagazine() {
	if (removePoint()) {
		pistol.setMagSize(pistol.getMagSize() + 1);

		upgradeLevel[1][3]++;
		document.querySelector("#buttonPistolMagazine").value = "Lv " + upgradeLevel[1][3];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonPistolReloadSpeed").addEventListener("click", pistolReloadSpeed, false);
function pistolReloadSpeed() {
	if (removePoint()) {
		pistol.setReloadSpeed(pistol.getReloadSpeed() - 0.11);

		upgradeLevel[1][4]++;
		document.querySelector("#buttonPistolReloadSpeed").value = "Lv " + upgradeLevel[1][4];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}



document.getElementById("buttonRifleCalories").addEventListener("click", rifleCalories, false);
function rifleCalories() {
	if (removePoint()) {
		rifle.setCalories(rifle.getCalories() + 3);

		upgradeLevel[2][0]++;
		document.querySelector("#buttonRifleCalories").value = "Lv " + upgradeLevel[2][0];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonRifleFireRate").addEventListener("click", rifleFireRate, false);
function rifleFireRate() {
	if (removePoint()) {
		rifle.setFireRate(rifle.getFireRate() + 0.4);
		rifle.setSpeed(rifle.getSpeed() + 0.35);

		upgradeLevel[2][1]++;
		document.querySelector("#buttonRifleFireRate").value = "Lv " + upgradeLevel[2][1];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonRifleAccuracy").addEventListener("click", rifleAccuracy, false);
function rifleAccuracy() {
	if (removePoint()) {
		rifle.setAccuracy(rifle.getAccuracy() + 0.021);

		upgradeLevel[2][2]++;
		document.querySelector("#buttonRifleAccuracy").value = "Lv " + upgradeLevel[2][2];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonRifleMagazine").addEventListener("click", rifleMagazine, false);
function rifleMagazine() {
	if (removePoint()) {
		rifle.setMagSize(rifle.getMagSize() + 3);

		upgradeLevel[2][3]++;
		document.querySelector("#buttonRifleMagazine").value = "Lv " + upgradeLevel[2][3];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonRifleReloadSpeed").addEventListener("click", rifleReloadSpeed, false);
function rifleReloadSpeed() {
	if (removePoint()) {
		rifle.setReloadSpeed(rifle.getReloadSpeed() - 0.14);

		upgradeLevel[2][4]++;
		document.querySelector("#buttonRifleReloadSpeed").value = "Lv " + upgradeLevel[2][4];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}



document.getElementById("buttonShotgunCalories").addEventListener("click", shotgunCalories, false);
function shotgunCalories() {
	if (removePoint()) {
		shotgun.setCalories(shotgun.getCalories() + 0.8);

		upgradeLevel[3][0]++;
		document.querySelector("#buttonShotgunCalories").value = "Lv " + upgradeLevel[3][0];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonShotgunFireRate").addEventListener("click", shotgunFireRate, false);
function shotgunFireRate() {
	if (removePoint()) {
		shotgun.setFireRate(shotgun.getFireRate() + 0.08);
		shotgun.setSpeed(shotgun.getSpeed() + 0.3);

		upgradeLevel[3][1]++;
		document.querySelector("#buttonShotgunFireRate").value = "Lv " + upgradeLevel[3][1];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonShotgunAccuracy").addEventListener("click", shotgunAccuracy, false);
function shotgunAccuracy() {
	if (removePoint()) {
		shotgun.setAccuracy(shotgun.getAccuracy() + 0.02);

		upgradeLevel[3][2]++;
		document.querySelector("#buttonShotgunAccuracy").value = "Lv " + upgradeLevel[3][2];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonShotgunShots").addEventListener("click", shotgunShots, false);
function shotgunShots() {
	if (removePoint()) {
		shotgun.setShots(shotgun.getShots() + 0.5);

		upgradeLevel[3][3]++;
		document.querySelector("#buttonShotgunShots").value = "Lv " + upgradeLevel[3][3];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonShotgunMagazine").addEventListener("click", shotgunMagazine, false);
function shotgunMagazine() {
	if (removePoint()) {
		shotgun.setMagSize(shotgun.getMagSize() + 2);
		shotgun.setReloadSpeed(shotgun.getReloadSpeed() + 0.1);

		upgradeLevel[3][4]++;
		document.querySelector("#buttonShotgunMagazine").value = "Lv " + upgradeLevel[3][4];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}



document.getElementById("buttonSniperCalories").addEventListener("click", sniperCalories, false);
function sniperCalories() {
	if (removePoint()) {
		sniper.setCalories(sniper.getCalories() + 8);

		upgradeLevel[4][0]++;
		document.querySelector("#buttonSniperCalories").value = "Lv " + upgradeLevel[4][0];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonSniperFireRate").addEventListener("click", sniperFireRate, false);
function sniperFireRate() {
	if (removePoint()) {
		sniper.setFireRate(sniper.getFireRate() + 0.05);
		sniper.setSpeed(sniper.getSpeed() + 0.45);

		upgradeLevel[4][1]++;
		document.querySelector("#buttonSniperFireRate").value = "Lv " + upgradeLevel[4][1];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonSniperSize").addEventListener("click", sniperSize, false);
function sniperSize() {
	if (removePoint()) {
		sniper.setSize(sniper.getSize() + 0.025);

		upgradeLevel[4][2]++;
		document.querySelector("#buttonSniperSize").value = "Lv " + upgradeLevel[4][2];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonSniperMagazine").addEventListener("click", sniperMagazine, false);
function sniperMagazine() {
	if (removePoint()) {
		sniper.setMagSize(sniper.getMagSize() + 1);

		upgradeLevel[4][3]++;
		document.querySelector("#buttonSniperMagazine").value = "Lv " + upgradeLevel[4][3];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonSniperReloadSpeed").addEventListener("click", sniperReloadSpeed, false);
function sniperReloadSpeed() {
	if (removePoint()) {
		sniper.setReloadSpeed(sniper.getReloadSpeed() - 0.15);

		upgradeLevel[4][4]++;
		document.querySelector("#buttonSniperReloadSpeed").value = "Lv " + upgradeLevel[4][4];
		document.getElementById("upgradePoints").innerHTML = upgradePoints + " Upgrade Points";
		updateStats(returnSelectedMarshmellowGunObject());
		updateProgressBars();
	}
}

document.getElementById("buttonSelectPistol").addEventListener("click", selectPistol, false);
function selectPistol() {
	marshmellowMode = "pistol";
	updateStats(returnSelectedMarshmellowGunObject());
}

document.getElementById("buttonSelectRifle").addEventListener("click", selectRifle, false);
function selectRifle() {
	marshmellowMode = "rifle";
	updateStats(returnSelectedMarshmellowGunObject());
}

document.getElementById("buttonSelectShotgun").addEventListener("click", selectShotgun, false);
function selectShotgun() {
	marshmellowMode = "shotgun";
	updateStats(returnSelectedMarshmellowGunObject());
}

document.getElementById("buttonSelectSniper").addEventListener("click", selectSniper, false);
function selectSniper() {
	marshmellowMode = "sniper";
	updateStats(returnSelectedMarshmellowGunObject());
}







document.getElementById("buttonGoBack").addEventListener("click", goBack, false);
function goBack() {
	saveData();
	window.location.href = "./HuggableZombies.html";
}

function saveData() {
	localStorage.maxPlayerHealth = maxPlayerHealth;
	localStorage.maxPlayerSprint = maxPlayerSprint;
	localStorage.playerSprintMulti = playerSprintMulti;
	localStorage.playerSpeed = playerSpeed;
	localStorage.playerSight = playerSight;
	localStorage.playerCritChance = playerCritChance;
	localStorage.playerCritMulti = playerCritMulti;
	localStorage.upgradeLevel = JSON.stringify(upgradeLevel);
	localStorage.upgradePoints = upgradePoints;
	localStorage.pistol = JSON.stringify(pistol);
	localStorage.rifle = JSON.stringify(rifle);
	localStorage.shotgun = JSON.stringify(shotgun);
	localStorage.sniper = JSON.stringify(sniper);
	localStorage.marshmellowMode = marshmellowMode;
	localStorage.storedArmor = JSON.stringify(storedArmor);
	localStorage.helmet = JSON.stringify(helmet);
	localStorage.chestplate = JSON.stringify(chestplate);
	localStorage.leggings = JSON.stringify(leggings);
	localStorage.boots = JSON.stringify(boots);
}

function returnSelectedMarshmellowGunObject() {
	if (marshmellowMode == "pistol") {
		return pistol;
	}
	else if (marshmellowMode == "rifle") {
		return rifle;
	}
	else if (marshmellowMode == "shotgun") {
		return shotgun;
	}
	else if (marshmellowMode == "sniper") {
		return sniper;
	}
	else {
		console.log("ERROR: MarshmellowMode not vaild");
	}
}

function updateStats(marshmellowGunObject) {
	document.getElementById("MaximumHealthStat").innerHTML = "Maximum Health: " + maxPlayerHealth.toFixed(0);
	document.getElementById("DamageReductionStat").innerHTML = "Damage Reduction: " + (playerArmor * 100).toFixed(2) + "%";
	document.getElementById("MovementSpeedStat").innerHTML = "Movement Speed: " + displaySpeed.toFixed(2);
	document.getElementById("SprintTimeStat").innerHTML = "Sprint Time: " + maxPlayerSprint.toFixed(1) + "s";
	document.getElementById("SprintSpeedMultiplyerStat").innerHTML = "Sprint Speed Multiplyer: x" + playerSprintMulti.toFixed(2);
	document.getElementById("SightRangeStat").innerHTML = "Sight Range: " + (playerSight * 100).toFixed(1) + "%";
	document.getElementById("MouthshotChanceStat").innerHTML = "Mouthshot Chance: " + (playerCritChance * 100).toFixed(1) + "%";
	document.getElementById("MouthshotDamageMultiplyerStat").innerHTML = "Mouthshot Multiplyer: x" + playerCritMulti.toFixed(3);

	document.getElementById("MarshmellowGunStats").innerHTML = marshmellowMode + " Stats";
	document.getElementById("CaloriesStat").innerHTML = "Calories: " + marshmellowGunObject.getCalories().toFixed(1);
	//Adds multiplyer on the end of the calories to indicate how many shots the shotgun will fire
	if (marshmellowMode == "shotgun") {
		document.getElementById("CaloriesStat").innerHTML += " x" + Math.floor(shotgun.getShots());
		var shotCount = shotgun.getShots();
		while (shotCount > 0.99) {
			shotCount--;
		}
		//If the shotgun's shot count ends in 0.5 then it displays both shot counts it could produce
		if (shotCount > 0.4 && shotCount < 0.6) {
			document.getElementById("CaloriesStat").innerHTML += "-" + (Math.floor(shotgun.getShots()) + 1);
		}
	}
	document.getElementById("FireRateStat").innerHTML = "Fire Rate: " + marshmellowGunObject.getFireRate().toFixed(2);
	document.getElementById("AccuracyStat").innerHTML = "Accuracy: " + (marshmellowGunObject.getAccuracy() * 100).toFixed(1) + "%";
	document.getElementById("MagazineSizeStat").innerHTML = "Magazine Size: " + marshmellowGunObject.getMagSize().toFixed(0);
	document.getElementById("ReloadSpeedStat").innerHTML = "Reload Speed: " + marshmellowGunObject.getReloadSpeed().toFixed(2) + "s";
	document.getElementById("MarshmellowSpeedStat").innerHTML = "Marshmellow Speed: " + marshmellowGunObject.getSpeed().toFixed(1);
	document.getElementById("MarshmellowSizeStat").innerHTML = "Marshmellow Size: " + (marshmellowGunObject.getSize() * 10).toFixed(2);
}

function removePoint() {
	if (upgradePoints > 0) {
		upgradePoints--;
		return true;
	}
	else {
		return false;
	}
}











