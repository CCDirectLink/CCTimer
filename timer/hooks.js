export class Hooks {

	hookNewGameButton(callback) {
		sc.CrossCode.inject({
			start(...args) {
				callback(...args);
				return this.parent(...args);
			}
		});
	}

	hookLoadMap(callback) {
		sc.CrossCode.inject({
			loadLevel(...args) {
				callback(...args);
				return this.parent(...args);
			}
		});
	}

	hookVarSet(callback) {
		ig.Vars.inject({
			set(...args) {
				callback(...args);
				return this.parent(...args);
			}
		});
	}

	hookStatsSet(callback) {
		let stats = sc.stats.values;
		Object.defineProperty(cc.sc.stats, 'values', {
			get: () => stats,
			set: val => {
				stats = callback(val, stats) || val;
			}
		});
	}

	hookEnemyHP(callback) {
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