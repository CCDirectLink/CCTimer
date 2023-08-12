import { Hook } from './hooks.js';

export class Utils {
    addOptionsPrestart() {
		if(versions.hasOwnProperty('input-api')) {
			sc.OPTIONS_DEFINITION["keys-reset-splits"] = {
				cat: sc.OPTION_CATEGORY.CONTROLS,
				hasDivider: true,
				header: 'ccTimer',
				init: {
					key1: ig.KEY.SEMICOLON,
					key2: void 0
				},
				type: 'CONTROLS',
			};
		}
        sc.TIMER_MODE = {
            Off: 0,
            InGame: 1,
            LiveSplit: 2,
            LiveSplitOne: 3,
        }
		sc.OPTIONS_DEFINITION.timerMode = {
			cat: sc.OPTION_CATEGORY.GENERAL,
			header: 'ccTimer',
			hasDivider: true,
            data: sc.TIMER_MODE,
			init: sc.TIMER_MODE.InGame,
			restart: true,
			type: 'BUTTON_GROUP',
		};
		sc.OPTIONS_DEFINITION.dontResetTimerOnDeath = {
			cat: sc.OPTION_CATEGORY.GENERAL,
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

        /*
		if (sc.options.values.dontResetTimerOnDeath == null) {
			sc.options.values.dontResetTimerOnDeath = false;
		}
		if(sc.options.values.resetOnNewGame == null) {
			sc.options.values.resetOnNewGame = true;
		}
		if(sc.options.values.resetOnPreset == null) {
			sc.options.values.resetOnPreset = true;
		}
        */
    }

	addOptions() {
		ig.lang.labels.sc.gui.options['timerMode'] = {
            name: 'Timer mode', description: 'Set the timer mode. \\c[1]Restart Required',
            group: [ 'Off', 'In-Game', 'LiveSplit', 'LiveSplit One' ],
        };
		ig.lang.labels.sc.gui.options['dontResetTimerOnDeath'] = {name: 'Don\'t reset timer on death', description: 'Don\'t reset timer on death. \\c[1]WARNING: This will affect the actual IGT!'};
		ig.lang.labels.sc.gui.options['printEvents'] = {name: 'Print all events', description: 'Print all possible events that can be split on. Use "Log level: Default"'};
		ig.lang.labels.sc.gui.options['roomTimer'] = {name: 'Display room timer', description: 'Displays a room timer'};
		ig.lang.labels.sc.gui.options['resetOnNewGame'] = {name: 'Reset splits on new game', description: 'Will check for split start conditions upon starting a new file.'};
		ig.lang.labels.sc.gui.options['resetOnPreset'] = {name: 'Reset splits on preset', description: 'Will check for split start conditions upon starting a preset.'};
		ig.lang.labels.sc.gui.options.controls.keys['reset-splits'] = 'Reset Splits';
		ig.lang.labels.sc.gui.options.headers['ccTimer'] = 'CCTimer';

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
