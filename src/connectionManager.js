import { Utils } from './utils.js';

export class ConnectionManager {
	constructor() {
		this.net = require('net');
	}

	connect(onconnect, ondisconnect) {
		onconnect = onconnect || (() => {});
		ondisconnect = ondisconnect || (() => {});
        
        ondisconnect()

		this.livesplit = this.net.connect(12346);
		this.livesplit.on('connect', () => onconnect());
		this.livesplit.on('disconnect', () => this.connect());
	}

	sendStart() {
		if (!this.livesplit) {
			return;
		}

		this.livesplit.write('1\n');
		Utils.log('Sent start');
	}

	/**
	 * 
	 * @param {number} value 
	 */
	sendIgt(value) {
		if (!this.livesplit) {
			return;
		}

		this.livesplit.write('3');
		this.livesplit.write(value.toString());
		this.livesplit.write('\n');
	}

	sendSplit() {
		if (!this.livesplit) {
			console.warn('[timer] Could not send split');
			return;
		}

		this.livesplit.write('2\n');
		Utils.log('Sent split');
	}

	/**
	 * 
	 * @param {boolean} paused
	 */
	sendPaused(paused) {
		if (!this.livesplit) {
			return;
		}

		if (paused) {
			this.livesplit.write('4\n');
		} else {
			this.livesplit.write('5\n');
		}
	}
}
