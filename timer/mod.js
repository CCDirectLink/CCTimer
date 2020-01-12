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
		Utils.log('[timer] Connected to livesplit');
		Utils.log('[timer] Loading config..');

		const config = new Config();
		await config.load('settings.json');

		Utils.log('[timer] Loaded config: ', config);

		if (config.isIGT) {
			Utils.log('[timer] Using original ingame time');
			utils.updateTime(connection);
		} else {
			Utils.log('[timer] Using custom time filter');
			const stateManager = new StateManager();
			stateManager.filterStates(config.filter);
			stateManager.onStateChanged(running => connection.sendPaused(!running));
		}

		Utils.log('[timer] Hooking events for splits..');
		const events = new EventManager();
		events.onstart = () => connection.sendStart();
		events.onsplit = () => connection.sendSplit();
		events.onunload = () => connection.sendPaused(false);
		events.start(config);
		Utils.log('[timer] Hooked events');
	}
});