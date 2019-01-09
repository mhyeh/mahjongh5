export default class ScrollTextArea extends Phaser.Group {
    public text: Phaser.Text;
    public game: Phaser.Game;

    public ox: number;
    public oy: number;

    private backGround: Phaser.Graphics;
    private maskArea:   Phaser.Graphics;
    private w: number;
    private h: number;

    public get Width(): number {
        return this.w;
    }

    public get Height(): number {
        return this.h;
    }

    constructor(game: Phaser.Game, t: Phaser.Text, w: number, h: number) {
        super(game);
        this.game = game;

        this.w = w;
        this.h = h;

        this.backGround = game.add.graphics(0, 0);
        this.backGround.beginFill(0x2A3EAF, 1);
        this.backGround.drawRect(0, 0, w, h);
        this.backGround.endFill();

        this.maskArea = game.add.graphics(0, 0);
        this.maskArea.inputEnabled = true;
        this.maskArea.beginFill(0, 0);
        this.maskArea.drawRect(0, 0, w, h);
        this.maskArea.endFill();

        this.text      = t;
        this.text.mask = this.maskArea;

        this.ox = this.text.x;
        this.oy = this.text.y;

        this.addChild(this.backGround);
        this.addChild(this.maskArea);
        this.addChild(this.text);
    }

    public scroll() {
        this.text.y += this.game.input.mouse.wheelDelta * 20;
        if (this.text.y > this.oy) {
            this.text.y = this.oy;
        }
        if (this.text.y < this.Height - this.text.height) {
            this.text.y = this.Height - this.text.height;
        }
    }
}
