import { IngameDisplay } from './ingameDisplay.js';
import { ConnectionManager } from './connectionManager.js';
import { Config } from './config.js';
import { EventManager } from './eventManager.js';
import { Utils } from './utils.js';
import { StateManager } from './stateManager.js';

document.body.addEventListener('simplifyInitialized', () => {
	const utils = new Utils();
	utils.addOptions();
	utils.printEvents();

	const ingameDisplay = new IngameDisplay();
	ingameDisplay.initialize();
	if (!window.require) {
		ingameDisplay.run();
		return;
	}

	const connection = new ConnectionManager();
	connection.connect(() => setupLivesplit(), () => ingameDisplay.run());


	async function setupLivesplit() {
		const config = new Config();
		await config.load('settings.json');

		if (config.isIGT) {
			utils.updateTime(connection);
		} else {
			const stateManager = new StateManager();
			stateManager.filterStates(config.filter);
			stateManager.onStateChanged(running => connection.sendPaused(!running));
		}

		const events = new EventManager();
		events.onstart = () => connection.sendStart();
		events.onsplit = () => connection.sendSplit();
		events.onunload = () => connection.sendPaused(false);
		events.start(config);
	}
});