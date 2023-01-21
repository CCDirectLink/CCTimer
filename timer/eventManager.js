import { Hook } from './hooks.js';

const activeConfigKey = "CCTimer_activeConfig";

export class EventManager {
	constructor() {
		this.onstart = () => {};
		this.onsplit = () => {};
		this.onunload = () => {};
	}

	/**
	 * This should only be called once
	 * @param {import('./config').Config[]} configs 
	 */
	start(configs) {
		this._configs = configs;
		this._activeConfig = JSON.parse(localStorage.getItem(activeConfigKey));
		this._awaitingStart = false;

		Hook.newGameButton(() => this._onNewGameButton());
		Hook.startPresetButton((preset, slotIndex) => this._onStartPresetButton(preset, slotIndex));
		Hook.update(() => this._update());
		Hook.enemyHP((name, hp) => { this._check({ type: 'damage', name, hp }) });
		Hook.teleport((mapName) => { this._check({ type: 'teleport', mapName }) });
		Hook.varChanged(() => { this._check({ type: 'vars' }) });
		window.addEventListener('unload', () => this.onunload());
	}

	_update() {
		if(sc.control.resetSplitsPress()) {
			this._resetAndAwaitStart();
		}
	}

	_onNewGameButton() {
		if(sc.options && sc.options.get('resetOnNewGame')) {
			this._resetAndAwaitStart();
		}

		this._check({ type: 'newGame' });
	}

	_onStartPresetButton(preset, slotIndex) {
		if(sc.options && sc.options.get('resetOnPreset')) {
			this._resetAndAwaitStart();
		}

		this._check({ type:'preset', presetName: preset.slots[slotIndex].title.value } );
	}

	/**
	 * Called either automatically (by new game / preset if enabled) or manually via a hotkey.
	 * Resets all configs and tells the timer mod to await a start condition.
	 */
	_resetAndAwaitStart() {
		this._resetConfigs();
		this._activeConfig = null;
		this._awaitingStart = true;
		console.log(`[timer] Resetting Splits and now Awaiting a Start Condition`);
	}

	_resetConfigs() {
		for (const config of this._configs) {
			config.reset();
		}
	}

	/**
	 * While no config is selected, all events will go through _checkStart() to see if
	 * they match the start condition for one of the splitters.
	 * 
	 * If one is found that matches, that splitter will be set as the _activeConfig, and
	 * splits will now go through _check() for that splitter alone.
	 */
	_checkStart(action) {
		if(this._activeConfig || !this._awaitingStart) return;

		for(const config of this._configs) {
			for(const event of config.splits) {
				if (event.disabled || event.type !== 'start') {
					continue;
				}
				if(!event.on && action.type != 'newGame') continue; //empty start condition must be new game

				if (event.on) {
					const [start] = this._checkEvent(event.on, action);
					if (!start) {
						continue;
					}
				}
	
				this.onstart();
	
				if (event.once) {
					event.disabled = true;
				}

				this._activeConfig = config;
				this._awaitingStart = false;
				localStorage.setItem(activeConfigKey, JSON.stringify(this._activeConfig));
				console.log(`[timer] Start Condition Met for Config: ${config.fileName}`);
				return;
			}
		}
	}

	/**
	 * Once an _activeConfig has been assigned, all split events are handled here.
	 * 
	 * @param {{type: 'damage', name: string, hp: number} | {type: 'teleport', mapName: string}} [action] 
	 */
	_check(action) {
		if(!this._activeConfig) {
			this._checkStart(action);
			return;
		}

		for (const event of this._activeConfig.splits) {
			if (event.disabled) {
				continue;
			}

			if (event.type === 'start' && event.on) {
				const [start] = this._checkEvent(event.on);
				if (start) {
					this.onstart();
					event.disabled = true;
					localStorage.setItem(activeConfigKey, JSON.stringify(this._activeConfig));
				}

				continue;	
			}

			const [split, once] = this._checkEvent(event, action);
			if (split) {
				console.log('[timer] Split event: ', event);
				this.onsplit();

				if (once) {
					event.disabled = true;
					console.log('[timer] Disabled event: ', event);
				}
				
				localStorage.setItem(activeConfigKey, JSON.stringify(this._activeConfig));
			}
		}
	}

	/**
	 * 
	 * @param {{type: 'start' | 'loadmap' | 'eventtriggered' | 'combined' | 'damage', name?: string, once?: boolean, value?: any, conditions?: any[], below?: number, above?: number}} event 
	 * @param {{type: 'damage', name: string, hp: number} | undefined} action
	 * @returns {[boolean, boolean]}
	 */
	_checkEvent(event, action) {
		switch(event.type) {
		case 'loadmap': {
			if (action && action.type === 'teleport') {
				const map = action.mapName;
				if(map === event.name || !event.name) {
					return [true, event.once];
				}
			}
			break;
		}
		case 'eventtriggered': {
			if(action && action.type === 'vars' && ig.vars.get(event.name) == event.value){
				return [true, event.once];
			}
			break;
		}
		case 'damage': {
			if (action && action.type === 'damage' && action.name === event.name) {
				if (typeof event.below === 'number' && action.hp > event.below) {
					break;
				}
				if (typeof event.above === 'number' && action.hp < event.above) {
					break;
				}
				return [true, event.once];
			}
			break;
		}
		case 'preset': {
			if(action && action.type === 'preset' && action.presetName === event.name) {
				return [true, event.once];
			}
			break;
		}
		case 'combined': {
			const conds = event.conditions;
			if (conds.length === 0) {
				return [true, true];
			}
				
			for (let i = 0; i < conds.length; i++) {
				const [split, once] = this._checkEvent(conds[i], action);
				if (!split) {
					return [false, false];
				}

				if (once) {
					conds.splice(i, 1);
					i--;
				}
			}

			if (conds.length === 0) {
				return [true, true];
			}
			return [true, event.once];
		}
		}
		return [false, false];
	}
}