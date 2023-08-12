import { IngameDisplay } from "./ingameDisplay.js";

export class RoomtimeDisplay extends IngameDisplay {
    constructor() {
        super(() => (performance.now() - this.startTime) / 1000);
        this.startTime = performance.now();
		this.isRoomTimer = true;
    }

    start() {
        if (sc.options.get('roomTimer')) {
            this.startTime = performance.now();
        } /*else {
            document.body.removeChild(this.timer);
        }*/
    }

    update() {
        if (sc.options.get('roomTimer')) {
            this._update();
        }
    }
}