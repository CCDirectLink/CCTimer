export const State = {
	RUNNING: 0,
	TELEPORT: 1,
	LOADING: 2,
	NEWGAME: 3,
	RESET: 4,
	LOADGAME: 5,
	MENU: 6,
	PAUSE: 7,
	LEVELUP: 8,
	QUICK: 9,
	ONMAPMENU: 10,
	QUESTSOLVED: 11
};

export class StateManager {
	constructor() {
		/**
		 * @type {(included: boolean, oldValue: string, newValue: string) => void}
		 */
		this._onStateChanged = () => {};
		/**
		 * @type {(oldValue: string, newValue: string) => boolean}
		 */
		this._stateFilter = () => true;
		this._included = false;


		this._setupHooks();
	}


	/**
	 * 
	 * @param {(oldValue: string, newValue: string) => void} callback 
	 */
	onStateChanged(callback) {
		this._onStateChanged = callback;
	}
	/**
	 * 
	 * @param {(oldValue: string, newValue: string) => boolean} premise 
	 */
	filterStates(premise) {
		this._stateFilter = premise;
	}


	_setupHooks() {
		let value = sc.model.currentSubState;
		Object.defineProperty(sc.model, 'currentSubState', {
			get: () => value,
			set: val => {
				if (val !== value) {
					const included = this._stateFilter(val, value);

					if (included !== this._included) {
						this._included = included;
						this._onStateChanged(included, val, value);
					}
				}
				value = val;
			}, 
		});
	}
}