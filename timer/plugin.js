import { IngameDisplay } from './ingameDisplay.js';
import { ConnectionManager } from './connectionManager.js';
import { Config } from './config.js';
import { EventManager } from './eventManager.js';
import { Utils } from './utils.js';
import { StateManager } from './stateManager.js';
import { RoomtimeDisplay } from './roomtimeDisplay.js';
import { Hook } from './hooks.js';

export default class CCTimer extends Plugin {
	constructor(mod) {
		super();
		this.mod = mod;
		this.splitsDir = 'autosplitters/'; 
	}

	main() {
		const utils = this.utils = new Utils();
		utils.addOptions();
		utils.printEvents();

		const ingameDisplay = this.ingameDisplay = new IngameDisplay(() => sc.stats.getMap('player', 'playtime'));
		ingameDisplay.initialize();
		if (!window.require) {
			ingameDisplay.run();
			return;
		}

		this.roomDisplay = new RoomtimeDisplay();
		this.roomDisplay.initialize();
		Hook.loadMap(() => this.roomDisplay.start());
		Hook.update(() => this.roomDisplay.update());

		const connection = this.connection = new ConnectionManager();
		connection.connect(() => this.setupLivesplit(), () => ingameDisplay.run());
	}

	async setupLivesplit() {
		Utils.log('[timer] Connected to livesplit');
		Utils.log('[timer] Loading config..');

		const configs = [];

		//Global Split Settings
		const mainConfig = new Config(this.mod);
		await mainConfig.load('settings.json');
		Utils.log('[timer] Loaded main config: ', mainConfig);
		configs.push(mainConfig);

		//Optional Additional Autosplitters (ex. for segments)
		const fs = require('fs');

		if (fs.existsSync(this.mod.baseDirectory + this.splitsDir)) {
			const configFiles = fs.readdirSync(this.mod.baseDirectory + this.splitsDir);

			for (const file of configFiles) {
				if (file.endsWith('.json')) {
					const newConfig = new Config(this.mod);
					await newConfig.load(this.splitsDir + file);
					configs.push(newConfig);
				}
			}
		}

		Utils.log(`[timer] Loaded ${configs.length} splits files.`);

		if (mainConfig.isIGT) {
			Utils.log('[timer] Using original ingame time');
			this.utils.updateTime(this.connection);
		} else {
			Utils.log('[timer] Using custom time filter');
			const stateManager = new StateManager();
			stateManager.filterStates(mainConfig.filter);
			stateManager.onStateChanged(running => this.connection.sendPaused(!running));
		}

		Utils.log('[timer] Hooking events for splits..');
		const events = new EventManager();
		events.onstart = () => this.connection.sendStart();
		events.onsplit = () => this.connection.sendSplit();
		events.onunload = () => this.connection.sendPaused(false);
		events.start(configs);
		Utils.log('[timer] Hooked events');
	}
}