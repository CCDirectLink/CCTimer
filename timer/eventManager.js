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

		Hook.onTitlescreen(() => this._cancelAwaitStart());
		Hook.newGameButton(() => this._onStart('newGame'));
		Hook.startPresetButton((preset, slotIndex) => this._onStart('preset', preset.slots[slotIndex].title.value));
		Hook.enemyHP((name, hp) => { this._awaitingStart ? this._checkStart('damage', { type: 'damage', name, hp }) : this._check({ type: 'damage', name, hp }) });
		Hook.teleport((mapName) => { this._awaitingStart ? this._checkStart('teleport', { type: 'teleport', mapName }) : this._check({ type: 'teleport', mapName }) });
		Hook.varChanged(() => {this._awaitingStart ? this._checkStart('vars', { type: 'vars' }) : this._check({ type: 'vars' }) });
		window.addEventListener('unload', () => this.onunload());
	}

	_cancelAwaitStart() {
		if(this._awaitingStart) {
			this._awaitingStart = false;
			console.log('[timer] Cancelled Awaiting Start Condition');
		}
	}

	_resetConfigs() {
		for (const config of this._configs) {
			config.reset();
		}
	}

	_checkStart(startType, action) {
		for(const config of this._configs) {
			for(const event of config.splits) {
				if (event.disabled || event.type !== 'start') {
					continue;
				}
				if(!event.on && startType != 'newGame') continue; //empty start condition must be new game

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
	 * 
	 * @param {{type: 'damage', name: string, hp: number} | {type: 'teleport', mapName: string}} [action] 
	 */
	_check(action) {
		if(!this._activeConfig) {
			//console.log(`[timer] Error: Called _check() without active config`);
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

	_onStart(type, presetName) {
		console.log(`[timer] Awaiting start condition for type: ${type}` + (presetName ? `, preset: ${presetName}` : ''));
		this._resetConfigs();
		this._activeConfig = null;
		this._awaitingStart = true;
		this._checkStart(type, { type: 'preset', presetName});
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
				const [split, once] = this._checkEvent(conds[i]);
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