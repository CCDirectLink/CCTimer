export class Hooks {
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