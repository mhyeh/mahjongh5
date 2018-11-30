import NumberFormatter from "mahjongh5/ui/NumberFormatter";
import * as System from "mahjongh5/System";

const SEC = 1000;

export default class Timer {
    private enableTint:  number;
    private disableTint: number;

    private timer: NumberFormatter<Phaser.BitmapText>;

    public set anchor(point: Phaser.Point) {
        this.timer.textDisplayer.anchor = point;
    }

    constructor(timer: NumberFormatter<Phaser.BitmapText>, enableTint: number = 0xFFFFFF, disableTint: number = 0xFFFFFF) {
        this.timer = timer;
        this.enableTint  = enableTint;
        this.disableTint = disableTint;
    }

    public async timeStart(time: number): Promise<void> {
        this.timer.value = time / SEC;
        this.timer.textDisplayer.tint = this.enableTint;
        while (this.timer.value > 0) {
            await System.Delay(SEC);
            this.timer.value--;
        }
    }

    public timeStop() {
        this.timer.value = 0;
        this.timer.textDisplayer.tint = this.disableTint;
    }
}
