import Dialog, { DialogResult } from "mahjongh5/ui/Dialog";
import Button from "mahjongh5/ui/Button";
export default class CommandDialog extends Dialog {
    public pon:    Button;
    public gon:    Button;
    public hu:     Button;
    public none:   Button;
    public pongon: Button;
    public ongon:  Button;
    public cards:  Button[] = new Array<Button>();

    public windowGroup: Phaser.Group;

    constructor(game: Phaser.Game, onCreate: (dialog: CommandDialog) => void, show: boolean = false, parent?: PIXI.DisplayObjectContainer) {
        super(game, onCreate, parent);
        // 強制回應、點擊背景等於按下取消、視窗關閉時不銷毀(可重用)
        this.modal = true;
        this.backgroundCancel = false;
        this.destoryOnHide = false;
        this.windowGroup = game.add.group(this);
        this.windowGroup.add(this.pon);
        this.windowGroup.add(this.gon);
        this.windowGroup.add(this.hu);
        this.windowGroup.add(this.none);
        this.windowGroup.add(this.pongon);
        this.windowGroup.add(this.ongon);
        this.windowGroup.addMultiple(this.cards);
    }

    public Show(): Promise<DialogResult> {
        this.windowGroup.visible = true;
        this.pon.visible    = false;
        this.pon.enable     = false;
        this.hu.visible     = false;
        this.hu.enable      = false;
        this.gon.visible    = false;
        this.gon.enable     = false;
        this.pongon.visible = false;
        this.pongon.enable  = false;
        this.ongon.visible  = false;
        this.ongon.enable   = false;
        this.none.visible   = true;
        this.none.enable    = true;
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

    public setCardButton(card: string[]) {
        for (let i = 0; i < card.length; i++) {
            this.cards[i].pendingDestroy = true;
        }
        this.cards = new Array<Button>();
        for (let i = 0; i < card.length; i++) {
            this.cards.push(new Button(this.game, 60 + 90 * i, -150, card[i]));
            this.cards[i].stateTint.down = 0x707070;
        }
    }

    protected Create() {
        super.Create();

        this.SetReplyButton(this.pon,  DialogResult.Cancel);
        this.SetReplyButton(this.hu,   DialogResult.Cancel);
        this.SetReplyButton(this.none, DialogResult.Cancel);
    }
}
