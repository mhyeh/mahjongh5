import { ButtonEvent } from "./Button";

/**
 * 參考Windows Form DialogResult
 * https://msdn.microsoft.com/zh-tw/library/system.windows.forms.dialogresult(v=vs.110).aspx
 */
export enum DialogResult {
    Abort,  // 對話方塊中，傳回值為 Abort （通常是從標記為 [中止] 按鈕傳送）。
    Cancel, // 對話方塊中，傳回值為 Cancel （通常是從一個標示為取消按鈕傳送）。
    Ignore, // 對話方塊中，傳回值為 Ignore （通常是從標記為 [忽略] 按鈕傳送）。
    No,     // 對話方塊中，傳回值為 No （通常是從標記為 [否] 按鈕傳送）。
    None,   // Nothing 從對話方塊傳回。 這表示強制回應對話方塊會繼續執行。
    OK,     // 對話方塊中，傳回值為 OK （通常是從一個標示為 [確定] 按鈕傳送）。
    Retry,  // 對話方塊中，傳回值為 Retry （通常是從標記為重試的按鈕傳送）。
    Yes,    // 對話方塊中，傳回值為 Yes （通常是從一個標示為 [是] 按鈕傳送）。
}

export default class Dialog extends Phaser.Group {
    public static result = DialogResult;

    /** 點擊對話以外的地方等於取消(僅modal為true時有用) */
    public backgroundCancel = false;
    /** 對話方塊隱藏時銷毀 */
    public destoryOnHide = true;
    public title: string = "";

    private showSignal: Phaser.Signal;
    private hideSignal: Phaser.Signal;
    private replySignal: Phaser.Signal = new Phaser.Signal();
    private backgroundGraphics: Phaser.Graphics;
    private bgColor: number = 0;
    private bgAlpha: number = 0.5;

    public get onShow(): Phaser.Signal {
        if (!this.showSignal) {
            this.showSignal = new Phaser.Signal();
        }
        return this.showSignal;
    }

    public get onHide(): Phaser.Signal {
        if (!this.hideSignal) {
            this.hideSignal = new Phaser.Signal();
        }
        return this.hideSignal;
    }

    /** 強制回應對話方塊 */
    public get modal(): boolean {
        return this.backgroundGraphics.inputEnabled;
    }
    public set modal(value: boolean) {
        this.backgroundGraphics.inputEnabled = value;
    }

    /** Dialog以外的區域的顏色 */
    public get backgroundColor(): number {
        return this.bgColor;
    }
    public set backgroundColor(value: number) {
        this.bgColor = value;
        this.RedrawBackground();
    }

    /** Dialog以外的區域的顏色的Alpha */
    public get backgroundAlpha(): number {
        return this.bgAlpha;
    }
    public set backgroundAlpha(value: number) {
        this.bgAlpha = value;
        this.RedrawBackground();
    }

    constructor(game: Phaser.Game, onCreate?: (dialog: any) => void, parent?: PIXI.DisplayObjectContainer) {
        super(game, parent);
        this.position.set(game.world.centerX, game.world.centerY);
        this.backgroundGraphics = this.game.add.graphics(0, 0, this);
        this.backgroundGraphics.inputEnabled = true;
        this.backgroundGraphics.events.onInputDown.add(() => {
            if (this.backgroundCancel) {
                this.replySignal.dispatch(DialogResult.Cancel);
            }
        });
        this.visible = false;
        if (onCreate) {
            onCreate(this);
        }
        this.Create();
    }

    public Show(): Promise<DialogResult> {
        // this.RedrawBackground();
        this.visible = true;
        (this.parent as Phaser.Group).bringToTop(this);
        if (this.showSignal) {
            this.showSignal.dispatch();
        }
        return new Promise((resolve) => {
            this.replySignal.addOnce((result: DialogResult) => {
                resolve(result);
                this.Hide();
            });
        });
    }

    public Hide() {
        this.visible = false;
        if (this.hideSignal) {
            this.hideSignal.dispatch();
        }
        if (this.destoryOnHide) {
            this.destroy();
        }
    }

    public SetReplyButton(button: ButtonEvent, result: DialogResult) {
        button.onInputUp.add(() => this.replySignal.dispatch(result));
    }

    protected Create() {
        this.RedrawBackground();
    }

    protected RedrawBackground() {
        this.backgroundGraphics.clear();
        this.backgroundGraphics.beginFill(this.bgColor, 1);
        this.backgroundGraphics.drawRect(-this.x, -this.y, this.game.width, this.game.height);
        this.backgroundGraphics.endFill();
        this.backgroundGraphics.alpha = this.bgAlpha;
    }
}
