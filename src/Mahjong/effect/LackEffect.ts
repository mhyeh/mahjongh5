import Effect from "mahjongh5/component/Effect";
import * as Assets from "../Assets";
import * as System from "mahjongh5/System";

export default class ChangeTileEffect extends Effect {
    private lack: Phaser.Image;
    private anim: Phaser.Tween;

    constructor(game: Phaser.Game, ox: number, oy: number, dx: number, dy: number, parent?: PIXI.DisplayObjectContainer) {
        super(game, parent);

        this.lack          = game.add.image(0, 0, Assets.button.char.key);
        this.lack.anchor   = new Phaser.Point(0.5, 0.5);
        this.lack.position = new Phaser.Point(ox, oy);
        this.lack.width    = 80;
        this.lack.height   = 80;
        this.lack.visible  = false;

        this.anim = game.add.tween(this.lack).to({ x: dx, y: dy }, 500, Phaser.Easing.Linear.None, false);
        this.anim.onComplete.add(() => {
            game.add.tween(this.lack).to({ alpha: 0 }, 100, Phaser.Easing.Linear.None, true);
        });
    }

    protected *RunEffect(texture: string): IterableIterator<Promise<void>> {
        this.lack.loadTexture(texture);
        this.lack.visible = true;
        yield System.Delay(500);
        this.anim.start();
        yield System.Delay(600);
        this.lack.visible = false;
    }
}
