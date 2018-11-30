import NumberFormatter from "mahjongh5/ui/NumberFormatter";
import * as System from "mahjongh5/System";

const SEC = 1000;

export default class Timer {
    private enableTint:  number;
    private disableTint: number;

    private timer: NumberFormatter<Phaser.Text>;

    public get Text(): Phaser.Text {
        return this.timer.textDisplayer;
    }

    constructor(timer: NumberFormatter<Phaser.Text>, enableTint: number = 0xFFFFFF, disableTint: number = 0xFFFFFF) {
        this.timer = timer;
        this.enableTint  = enableTint;
        this.disableTint = disableTint;
        this.Text.tint = this.disableTint;
    }

    public async timeStart(time: number): Promise<void> {
        this.timer.value = time / SEC;
        this.Text.tint = this.enableTint;
        while (this.timer.value > 0) {
            await System.Delay(SEC);
            this.timer.value--;
        }
    }

    public timeStop() {
        this.timer.value = 0;
        this.Text.tint = this.disableTint;
    }
}
