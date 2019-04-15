import { Hooks } from './hooks.js';

export class Utils {
	constructor() {
		this._hooks = new Hooks();
	}

	addOptions() {
		ig.lang.labels.sc.gui.options['dontResetTimerOnDeath'] = {name: 'Don\'t reset timer on death', description: 'Don\'t reset timer on death. \\c[1]WARNING: This will affect the actual IGT!'};
		ig.lang.labels.sc.gui.options['printEvents'] = {name: 'Print all events', description: 'Print all possible events that can be split on. Use "Log level: Default"'};
		ig.lang.labels.sc.gui.options.headers['ccTimer'] = 'CCTimer';
		simplify.options.addEntry('dontResetTimerOnDeath', 'CHECKBOX', true, 0, undefined, true, 'ccTimer');
		simplify.options.addEntry('printEvents', 'CHECKBOX', false, 0, undefined, true);

		this._hooks.hookStatsSet((val, stats) => {
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
		simplify.registerUpdate(() => {
			const t = cc.sc.stats.getStat('player', 'playtime');
			if(!t) {
				return;
			}
				
			connection.sendIgt(t);
		});
	}

	printEvents() {
		this._hooks.hookVarSet((path, value) => {
			if (sc.options.get('printEvents') && value !== ig.vars.get(path)) {
				// eslint-disable-next-line no-console
				console.log('event', path, '=', value);
			}
		});

		this._hooks.hookLoadMap(() => {
			if (sc.options.get('printEvents')) {
				// eslint-disable-next-line no-console
				console.log('loadmap', 'Entered map', cc.ig.getMapName());
			}
		});
	}
}