import { IngameDisplay } from './ingameDisplay.js';
import { ConnectionManager } from './connectionManager.js';
import { LiveSplitOneServer } from './livesplitone.js';
import { Config } from './config.js';
import { EventManager } from './eventManager.js';
import { Utils } from './utils.js';
import { StateManager } from './stateManager.js';
import { RoomtimeDisplay } from './roomtimeDisplay.js';
import { Hook } from './hooks.js';

export default class CCTimer {
	constructor(mod) {
		this.mod = mod;
		this.splitsDir = 'autosplitters/'; 
	}

	main() {
		this.utils.addOptions();
		this.utils.printEvents();

        this.mode = sc.options.get('timerMode')

        if (this.mode == sc.TIMER_MODE.Off) { return }

        if (this.mode == sc.TIMER_MODE.InGame) {
		    this.ingameDisplay = new IngameDisplay(() => sc.stats.getMap('player', 'playtime'));
            
        } else if (this.mode == sc.TIMER_MODE.LiveSplit) {
		    this.ingameDisplay = new IngameDisplay(() => this.connected ? '' : 'LiveSplit not connected');
            this.connection = new ConnectionManager()

        } else if (this.mode == sc.TIMER_MODE.LiveSplitOne) {
		    this.ingameDisplay = new IngameDisplay(() => this.connected ? '' : 'Connect at one.livesplit.org with adress ws://localhost:5000');
            this.connection = new LiveSplitOneServer()
        }

        if (this.connection) {
            this.connection.connect(() => {
                this.setupLivesplit()
                this.connected = true
            }, () => {
                this.connected = false
            })
        }

        if (this.ingameDisplay) {
		    this.ingameDisplay.initialize();
		    this.ingameDisplay.run();
        }
		this.roomDisplay = new RoomtimeDisplay();
		this.roomDisplay.initialize();
		Hook.loadMap(() => this.roomDisplay.start());
		Hook.update(() => this.roomDisplay.update());
	}

	prestart() {
		this.utils = new Utils();
        this.utils.addOptionsPrestart()
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
