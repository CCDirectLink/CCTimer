import { Utils } from './utils.js';

export class LiveSplitOneServer {
    constructor() {
        this.ws = require('ws')

        this.server = null
        this.wsList = null
        this.serverRunning = false
    }

    connect(onconnect, ondisconnect) {
		onconnect = onconnect || (() => {});
		ondisconnect = ondisconnect || (() => {});

        ondisconnect()


        this.serverRunning = true

        window.addEventListener('beforeunload', () => {
            if (this.serverRunning) {
                this.serverRunning = false
                this.server.close()
            }
        });

        const host = 'localhost'
        const port = 5000

        this.server = new this.ws.Server({ host, port });
        this.wsList = new Set();

        this.server.on('connection', (ws) => {
            onconnect()
            this.wsList.add(ws);

            ws.on('close', () => {
                this.wsList.delete(ws);
                if (this.wsList.size == 0) {
		            ondisconnect()
                }
            });
        });
    }

    _sendCommand(name) {
        if (this.wsList) {
            for (const ws of Array.from(this.wsList)) {
                ws.send(name);
            }
        }
    }

    sendStart() {
        this._sendCommand('reset');
        this._sendCommand('start')

		Utils.log('Sent start');
    }
    
	/**
	 * 
	 * @param {number} value 
	 */
    sendIgt(value) {
        console.log('sendIgt:', value)
        this._sendCommand(`setgametime ${value}`)
    }

    sendSplit() {
        this._sendCommand('split')
        
		Utils.log('Sent split');
    }

	/**
	 * 
	 * @param {boolean} paused
	 */
    sendPaused(paused) {
        if (paused) {
            this._sendCommand('pausegametime')
        } else {
            this._sendCommand('resumegametime')
        }
    }
}
