export class Hooks {

	hookNewGameButton(callback) {
		const buttonNumber = ig.platform === 1 ? 3 : 2;
		const buttons = simplify.getInnerGui(cc.ig.GUI.menues[15].children[2])[entries.buttons];
		const newGameButton = buttons[buttonNumber];

		const original = newGameButton[entries.callbackFunction];
		newGameButton[entries.callbackFunction] = (...args) => {
			callback(...args);
			return original.apply(newGameButton, args);
		};
	}

	hookLoadMap(callback) {
		const original = cc.ig.gameMain[cc.ig.varNames.gameMainLoadMap];
		cc.ig.gameMain[cc.ig.varNames.gameMainLoadMap] = (...args) => {
			callback(...args);
			return original.apply(cc.ig.gameMain, args);
		};
	}

	hookVarSet(callback) {
		const original = ig.vars.set;
		ig.vars.set = function(...args) {
			callback(...args);
			original.apply(ig.vars, args);
		};
	}

	hookStatsSet(callback) {
		let stats = cc.sc.stats[entries.values];
		Object.defineProperty(cc.sc.stats, entries.values, {
			get: () => stats,
			set: val => {
				stats = callback(val, stats) || val;
				return true;
			}
		});
	}
}