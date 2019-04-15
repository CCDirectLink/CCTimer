import { Hooks } from './hooks.js';

export class EventManager {
	constructor() {
		this._hooks = new Hooks();

		this.onstart = () => {};
		this.onsplit = () => {};
	}

	/**
	 * This should only be called once
	 * @param {import('./config').Config} config 
	 */
	start(config) {
		this._config = config;

		this._hooks.hookLoadMap(() => this.onstart());
		simplify.registerUpdate(() => this._update());
	}

	_update() {
		for (const event of this._config.splits) {
			if (event.disabled) {
				continue;
			}

			const [split, once] = this._checkEvent(event);
			if (split) {
				this.onsplit();
			}

			if (once) {
				event.disabled = true;
			}
		}
	}

	/**
	 * 
	 * @param {{type: 'start' | 'loadmap' | 'eventtriggered' | 'combined', name?: string, once?: boolean, value?: any, conditions?: any[]}} event 
	 * @returns {[boolean, boolean]}
	 */
	_checkEvent(event) {
		switch(event.type) {
		case 'loadmap': {
			const map = cc.ig.getMapName();
			if(map === event.name){
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