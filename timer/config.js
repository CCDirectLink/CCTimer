import { State } from './stateManager.js';

export class Config {
	constructor() {
		/** @type {string} */
		this._modFolder = simplify.getMod('timer').baseDirectory;
		/** @type {[{type: string}] | {time: 'igt' | 'state', filter?: {include?: string[], exclude?: string[]}, splits: {type: 'start' | 'loadmap' | 'eventtriggered' | 'combined', name?: string, once?: boolean, value?: any, conditions?: any[]}[]}} */
		this._config = null;

		/** @type {{type: 'start' | 'loadmap' | 'eventtriggered' | 'combined', name?: string, once?: boolean, value?: any, conditions?: any[]}[]} */
		this.splits = [];

		/** @type {(newValue: string, oldValue: string) => boolean} */
		this.filter = () => true;
		this.isIGT = true;
	}

	async load(name) {
		this._config = await simplify.resources.loadJSON(this._modFolder + name);

		if (this._config instanceof Array) { // Legacy support
			this.splits = this._config;
		} else {
			this.splits = this._config.splits;
			if (this._config.time === 'state') {
				this.isIGT = false;
				this.filter = this._buildFilter(this._config.filter || {});
			}
		}
	}

	/**
	 * 
	 * @param {{include?: string[], exclude?: string[]}} options
	 * @returns {(newValue: string, oldValue: string) => boolean}
	 */
	_buildFilter(options) {
		const params = [];

		const incl = options.include || Object.keys(State);
		for (const state of incl) {
			params.push(State[state]);
		}

		const excl = options.exclude || [];
		for (const state of excl) {
			const index = params.indexOf(State[state]);
			if (index >= 0) {
				params.splice(index, 1);
			}
		}

		return val => params.includes(val);
	}
}