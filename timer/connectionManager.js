export class ConnectionManager {
	constructor() {
		this.net = require('net');
	}

	connect(onconnect, onerror) {
		onconnect = onconnect || (() => {});
		onerror = onerror || (() => {});

		this.livesplit = this.net.connect(12346);
		this.livesplit.on('connect', () => onconnect());
		this.livesplit.on('disconnect', () => this.connect());
		this.livesplit.on('error', () => onerror());
	}

	sendStart() {
		if (!this.livesplit) {
			return;
		}

		this.livesplit.write('1\n');
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
			return;
		}

		this.livesplit.write('2\n');
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
			console.log('pause');
		} else {
			this.livesplit.write('5\n');
			console.log('unpause');
		}
	}
}