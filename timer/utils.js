import { Hook } from './hooks.js';

export class Utils {
	addOptions() {
		sc.OPTIONS_DEFINITION.dontResetTimerOnDeath = {
			cat: sc.OPTION_CATEGORY.GENERAL,
			hasDivider: true,
			header: 'ccTimer',
			init: true,
			restart: true,
			type: 'CHECKBOX',
		};
		sc.OPTIONS_DEFINITION.printEvents = {
			cat: sc.OPTION_CATEGORY.GENERAL,
			init: false,
			restart: true,
			type: 'CHECKBOX',
		};
		sc.OPTIONS_DEFINITION.roomTimer = {
			cat: sc.OPTION_CATEGORY.GENERAL,
			init: false,
			restart: true,
			type: 'CHECKBOX',
		};
		sc.OPTIONS_DEFINITION.resetOnNewGame = {
			cat: sc.OPTION_CATEGORY.GENERAL,
			init: true,
			restart: true,
			type: 'CHECKBOX',
		};
		sc.OPTIONS_DEFINITION.resetOnPreset = {
			cat: sc.OPTION_CATEGORY.GENERAL,
			init: true,
			restart: true,
			type: 'CHECKBOX',
		};
		if (sc.options.values.dontResetTimerOnDeath == null) {
			sc.options.values.dontResetTimerOnDeath = false;
		}
		if(sc.options.values.resetOnNewGame == null) {
			sc.options.values.resetOnNewGame = true;
		}
		if(sc.options.values.resetOnPreset == null) {
			sc.options.values.resetOnPreset = true;
		}

		sc.Control.inject({
			resetSplitsPress() {
				return ig.input.pressed("reset-splits");
			}
		});

		Hook.statsSet((val, stats) => {
			if(sc.options.get('dontResetTimerOnDeath') 
				&& stats 
				&& stats.player 
				&& stats.player.playtime 
				&& val 
				&& val.player 
				&& val.player.playtime) {
				val.player.playtime = stats.player.playtime;
			}
		});
	}

	/**
	 * 
	 * @param {import('./connectionManager').ConnectionManager} connection
	 */
	updateTime(connection) {
		Hook.update(() => {
			const t = sc.stats.getMap('player', 'playtime');
			if(!t) {
				return;
			}
				
			connection.sendIgt(t);
		});
	}

	printEvents() {
		Hook.varSet((path, value) => {
			if (sc.options.get('printEvents') && value !== ig.vars.get(path)) {
				// eslint-disable-next-line no-console
				console.log('event', path, '=', value);
			}
		});

		Hook.loadMap(() => {
			if (sc.options.get('printEvents')) {
				// eslint-disable-next-line no-console
				console.log('loadmap', 'Entered map', ig.game.mapName);
			}
		});

		Hook.enemyHP((name, hp) => {
			if (sc.options.get('printEvents')) {
				// eslint-disable-next-line no-console
				console.log('damage', name, hp);
			}
		});
	}
}

Utils.log = (...args) => {
	if (window.logTimer) {
		console.log(...args);
	}
};