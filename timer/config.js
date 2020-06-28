import { State } from './stateManager.js';

export class Config {
	constructor(mod) {
		/** @type {string} */
		this._modFolder = mod.baseDirectory.substr(7);
		/** @type {[{type: string}] | {time: 'igt' | 'state', filter?: {include?: string[], exclude?: string[]}, splits: {type: 'start' | 'loadmap' | 'eventtriggered' | 'combined', name?: string, once?: boolean, value?: any, conditions?: any[]}[]}} */
		this._config = null;

		/** @type {{type: 'start' | 'loadmap' | 'eventtriggered' | 'combined', name?: string, once?: boolean, value?: any, conditions?: any[]}[]} */
		this.splits = [];
		this._originalSplits = [];

		/** @type {(newValue: string, oldValue: string) => boolean} */
		this.filter = () => true;
		this.isIGT = true;
	}

	async load(name) {
		const req = await fetch(this._modFolder + name);
		this._config = await req.json();

		if (this._config instanceof Array) { // Legacy support
			this._originalSplits = this._config;
		} else {
			this._originalSplits = this._config.splits;
			if (this._config.time === 'state') {
				this.isIGT = false;
				this.filter = this._buildFilter(this._config.filter || {});
			}
		}

		this.reset();
	}

	reset() {
		this.splits = [];
		this._copyArray(this.splits, this._originalSplits);
	}

	/**
	 * 
	 * @param {{type: 'start' | 'loadmap' | 'eventtriggered' | 'combined', name?: string, once?: boolean, value?: any, conditions?: any[]}} source 
	 * @returns {{type: 'start' | 'loadmap' | 'eventtriggered' | 'combined', name?: string, once?: boolean, value?: any, conditions?: any[]}} 
	 */
	_copy(source) {
		const result = Object.assign({}, source);
		if (result.type === 'combined') {
			result.conditions = [];
			this._copyArray(result.conditions, source.conditions);
		}
		return result;
	}
	/**
	 * 
	 * @param {{type: 'start' | 'loadmap' | 'eventtriggered' | 'combined', name?: string, once?: boolean, value?: any, conditions?: any[]}[]} target 
	 * @param {{type: 'start' | 'loadmap' | 'eventtriggered' | 'combined', name?: string, once?: boolean, value?: any, conditions?: any[]}[]} source 
	 */
	_copyArray(target, source) {
		for (const event of source) {
			target.push(this._copy(event));
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