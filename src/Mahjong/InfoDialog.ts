import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
import ScrollTextArea from "mahjongh5/ui/ScrollTextArea";

export default class InfoDialog extends Dialog {
    public lack:     Phaser.Image;
    public scoreLog: ScrollTextArea;
    public X:        number;
    public Y:        number;
    public anchorX:  number = 0;
    public anchorY:  number = 0;

    public game: Phaser.Game;

    public windowGroup: Phaser.Group;

    private background: Phaser.Graphics;

    constructor(game: Phaser.Game, onCreate: (dialog: InfoDialog) => void, show: boolean = false, parent?: PIXI.DisplayObjectContainer) {
        super(game, onCreate, parent);
        this.game = game;
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        this.modal            = true;
        this.backgroundCancel = true;
        this.destoryOnHide    = false;

        this.windowGroup = game.add.group(this);
        this.background  = new Phaser.Graphics(game, 0, 0);
        this.background.beginFill(0x000000, 0.6);
        this.background.drawRoundedRect(0, 0, 400, 100, 5);
        this.background.endFill();
        this.windowGroup.add(this.background);
        this.windowGroup.add(this.lack);
        this.windowGroup.add(this.scoreLog);
    }

    public Redraw() {
        this.background.clear();
        this.background.beginFill(0x000000, 0.6);
        this.background.drawRoundedRect(0, 0, 400, this.scoreLog.Height + 150, 5);
        this.background.endFill();
        this.position.y = this.Y - (this.scoreLog.Height + 50) * this.anchorY;
    }

    public Show(): Promise<DialogResult> {
        if (this.lack.visible === false) {
            this.Hide();
            return Promise.resolve(DialogResult.Cancel);
        }
        if (this.scoreLog.visible === true) {
            this.game.input.mouse.mouseWheelCallback = this.scoreLog.scroll.bind(this.scoreLog);
        }
        this.windowGroup.visible = true;
        super.RedrawBackground();
        // 設定dialog物件的值
        return super.Show()
            .then((result) => {
                return result;
            });
    }

    public Hide() {
        this.windowGroup.visible = false;
        super.Hide();
    }

    protected Create() {
        super.Create();
    }
}
