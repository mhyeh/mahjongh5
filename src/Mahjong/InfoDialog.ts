import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
export default class InfoDialog extends Dialog {
    public lack:     Phaser.Image;
    public scoreLog: Phaser.Text;

    public windowGroup: Phaser.Group;

    private background: Phaser.Graphics;

    constructor(game: Phaser.Game, onCreate: (dialog: InfoDialog) => void, show: boolean = false, parent?: PIXI.DisplayObjectContainer) {
        super(game, onCreate, parent);
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        this.modal = true;
        this.backgroundCancel = true;
        this.destoryOnHide = false;

        this.windowGroup = game.add.group(this);
        this.background = new Phaser.Graphics(game, 0, 0);
        this.background.beginFill(0x000000, 0.6);
        this.background.drawRoundedRect(0, 0, 400, 100, 5);
        this.background.endFill();
        this.windowGroup.add(this.background);
        this.windowGroup.add(this.lack);
        this.windowGroup.add(this.scoreLog);
    }

    public Show(): Promise<DialogResult> {
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
