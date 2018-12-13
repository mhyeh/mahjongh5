import Effect from "./Effect";
import NumberFormatter from "mahjongh5/ui/NumberFormatter";
import * as System from "mahjongh5/System";

const SEC = 1000;

export default class Timer extends Effect {
    private enableTint:  number;
    private disableTint: number;

    private timer: NumberFormatter<Phaser.Text>;

    public get Text(): Phaser.Text {
        return this.timer.textDisplayer;
    }

    constructor(game: Phaser.Game, timer: NumberFormatter<Phaser.Text>, enableTint: number = 0xFFFFFF, disableTint: number = 0xFFFFFF, parent?: PIXI.DisplayObjectContainer) {
        super(game, parent);
        this.timer = timer;
        this.enableTint  = enableTint;
        this.disableTint = disableTint;
        this.Text.tint   = this.disableTint;
    }

    protected *RunEffect(time: number): IterableIterator<Promise<void>> {
        this.timer.value = time / SEC;
        this.Text.tint   = this.enableTint;
        while (this.timer.value > 0) {
            yield System.Delay(SEC);
            this.timer.value--;
        }
    }

    protected async EndEffect(): Promise<void> {
        this.timer.value = 0;
        this.Text.tint   = this.disableTint;
    }
}
