import { Hook } from './hooks.js';

export class EventManager {
	constructor() {
		this.onstart = () => {};
		this.onsplit = () => {};
		this.onunload = () => {};
	}

	/**
	 * This should only be called once
	 * @param {import('./config').Config} config 
	 */
	start(config) {
		this._config = config;

		Hook.newGameButton(() => this._onStart());
		Hook.startPresetButton(() => this._onStart());
		Hook.enemyHP((name, hp) => this._check({ name, hp }));
		Hook.update(() => this._update());
		window.addEventListener('unload', () => this.onunload());
	}

	_update() {
		this._check();
	}

	/**
	 * 
	 * @param {{type: 'damage', name: string, hp: number}} [action] 
	 */
	_check(action) {
		for (const event of this._config.splits) {
			if (event.disabled) {
				continue;
			}

			if (event.type === 'start' && event.on) {
				const [start] = this._checkEvent(event.on);
				if (start) {
					this.onstart();
					event.disabled = true;
				}

				continue;	
			}

			const [split, once] = this._checkEvent(event, action);
			if (split) {
				console.log('[timer] Split event: ', event);
				this.onsplit();
			}

			if (once) {
				event.disabled = true;
				console.log('[timer] Disabled event: ', event);
			}
		}
	}

	_onStart() {
		this._config.reset();

		for (const event of this._config.splits) {
			if (event.disabled || event.type !== 'start') {
				continue;
			}
			if (event.on) {
				const [start] = this._checkEvent(event.on);
				if (!start) {
					continue;
				}
			}

			this.onstart();

			if (event.once) {
				event.disabled = true;
			}
		}
	}

	_isOldMapState() {
		return sc.model.isTitle() || sc.model.isLoadGame() || sc.model.isNewGame();
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
			const map = ig.game.mapName;
			if(map === event.name && !this._isOldMapState()) {
				return [true, event.once];
			}
			break;
		}
		case 'eventtriggered': {
			if(ig.vars.get(event.name) == event.value){
				return [true, event.once];
			}
			break;
		}
		case 'damage': {
			if (action && action.name === event.name) {
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