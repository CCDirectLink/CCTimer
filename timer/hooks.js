export class Hook {
	static onTitlescreen(callback) {
		sc.GameModel.inject({
			enterTitle(...args) {
				callback(...args);
				return this.parent(...args);
			}
		});
	}

	static newGameButton(callback) {
		sc.CrossCode.inject({
			start(...args) {
				callback(...args);
				return this.parent(...args);
			}
		});
	}

	static startPresetButton(callback) {
		sc.SavePreset.inject({
			load(...args) {
				callback(...args);
				return this.parent(...args);
			}
		});
	}

	static loadMap(callback) {
		ig.game.addons.levelLoaded.push({
			onLevelLoaded: callback
		});
	}

	static update(callback) {
		ig.game.addons.preUpdate.push({
			onPreUpdate: callback
		});
	}

	static varSet(callback) {
		ig.Vars.inject({
			set(...args) {
				callback(...args);
				return this.parent(...args);
			}
		});
	}

	static statsSet(callback) {
		let stats = sc.stats.values;
		Object.defineProperty(sc.stats, 'values', {
			get: () => stats,
			set: val => {
				stats = callback(val, stats) || val;
			}
		});
	}

	static enemyHP(callback) {
		sc.CombatParams.inject({
			init: function(...args) {
				const result = this.parent(...args);
				sc.Model.addObserver(this, {
					modelChanged: (cp, msg) => {
						if (msg === sc.COMBAT_PARAM_MSG.HP_CHANGED) {
							callback(cp.combatant.enemyName, cp.currentHp);
						}
					}});
				return result;
			}
		});
	}
}