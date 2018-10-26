import Dialog, { DialogResult } from "./Dialog";
import { ButtonEvent } from "./Button";
export { DialogResult } from "./Dialog";

export function ShowOKDialog(game: Phaser.Game, message: string, onCreate?: (dialog: OKDialog) => void): Promise<DialogResult> {
    return (new OKDialog(game, message, onCreate)).Show();
}

export function ShowOKCancelDialog(game: Phaser.Game, message: string, onCreate?: (dialog: OKCancelDialog) => void): Promise<DialogResult> {
    return (new OKCancelDialog(game, message, onCreate)).Show();
}

export function ShowYesNoDialog(game: Phaser.Game, message: string, onCreate?: (dialog: YesNoDialog) => void): Promise<DialogResult> {
    return (new YesNoDialog(game, message, onCreate)).Show();
}

export function ShowYesNoCancelDialog(game: Phaser.Game, message: string, onCreate?: (dialog: YesNoCancelDialog) => void): Promise<DialogResult> {
    return (new YesNoCancelDialog(game, message, onCreate)).Show();
}

export class OKDialog extends Dialog {
    public okButton: ButtonEvent;
    public messageText: Phaser.Text;
    public message: string;
    constructor(game: Phaser.Game, message: string, onCreate?: (dialog: OKDialog) => void, parent?: PIXI.DisplayObjectContainer) {
        super(game, (dialog: OKDialog) => {
            if (onCreate) {
                onCreate(dialog);
            }
            dialog.message = message;
        }, parent);
    }

    protected Create() {
        super.Create();
        const dialogBG = this.game.add.graphics(0, 0, this);
        const messageText = this.game.add.text(0, 0, this.message, { font: "24px Calibri", fill: "#000000" }, this);
        messageText.anchor.set(0.5, 0.5);
        const confirmButton = this.game.add.graphics(0, 0, this);
        const okText = this.game.add.text(0, 0, "OK", { font: "24px Calibri", fill: "#000000" }, this);
        okText.anchor.set(0.5, 0.5);

        this.okButton = confirmButton.events;
        this.messageText = messageText;

        confirmButton.inputEnabled = true;
        confirmButton.input.useHandCursor = true;
        confirmButton.lineStyle(1, 0, 1);
        confirmButton.beginFill(0, 0);
        this.SetReplyButton(confirmButton.events, Dialog.result.OK);

        const messageBGWidth = messageText.width + 20;
        const messageBGHeight = messageText.height + 20;
        const okBGWidth = okText.width + 10;
        const okBGHeight = okText.height + 5;
        const buttonBGWidth = messageBGWidth;
        const buttonBGHeight = okBGHeight + 20;
        const dialogBGWidth = messageBGWidth + 20;
        const dialogBGHeight = messageBGHeight + buttonBGHeight + 20;

        dialogBG.beginFill(0xffffff);
        dialogBG.drawRect(messageBGWidth / -2, messageBGHeight / -2, messageBGWidth, messageBGHeight);
        dialogBG.beginFill(0xf0f0f0);
        dialogBG.drawRect(messageBGWidth / -2, messageBGHeight / 2, buttonBGWidth, buttonBGHeight);
        dialogBG.beginFill(0, 0);
        dialogBG.lineStyle(5, 0x2587e9);
        dialogBG.drawRect(messageBGWidth / -2, messageBGHeight / -2, messageBGWidth, messageBGHeight + buttonBGHeight);
        dialogBG.lineStyle(0);
        confirmButton.position.set(0, (messageBGHeight + buttonBGHeight) / 2);
        okText.position = confirmButton.position.clone();
        confirmButton.drawRect(okBGWidth / -2, okBGHeight / -2, okBGWidth, okBGHeight);
    }
}

export class OKCancelDialog extends Dialog {
    constructor(game: Phaser.Game, message: string, onCreate?: (dialog: OKCancelDialog) => void, parent?: PIXI.DisplayObjectContainer) {
        super(game, (dialog: OKCancelDialog) => {
            if (onCreate) {
                onCreate(dialog);
            }
        }, parent);
    }
}

export class YesNoDialog extends Dialog {
    public yesButton: ButtonEvent;
    public noButton: ButtonEvent;
    public background: any;
    public messageText: Phaser.Text;
    public message: string;
    constructor(game: Phaser.Game, message: string, onCreate?: (dialog: YesNoDialog) => void, parent?: PIXI.DisplayObjectContainer) {
        super(game, (dialog: YesNoDialog) => {
            if (onCreate) {
                onCreate(dialog);
            }
            dialog.message = message;
        }, parent);
    }

    protected Create() {
        super.Create();
        const dialogBG = this.background = this.game.add.graphics(0, 0, this);
        const messageText = this.game.add.text(0, 0, this.message, { font: "24px Calibri", fill: "#000000" }, this);
        messageText.anchor.set(0.5, 0.5);
        const yesButton = this.game.add.graphics(0, 0, this);
        const yesText = this.game.add.text(0, 0, "Yes", { font: "24px Calibri", fill: "#000000" }, this);
        yesText.anchor.set(0.5, 0.5);

        this.yesButton = yesButton.events;
        this.messageText = messageText;

        yesButton.inputEnabled = true;
        yesButton.input.useHandCursor = true;
        yesButton.lineStyle(1, 0, 1);
        yesButton.beginFill(0, 0);
        this.SetReplyButton(yesButton.events, Dialog.result.Yes);

        const noButton = this.game.add.graphics(0, 0, this);
        const noText = this.game.add.text(0, 0, "No", { font: "24px Calibri", fill: "#000000" }, this);
        noText.anchor.set(0.5, 0.5);
        this.noButton = noButton.events;
        noButton.inputEnabled = true;
        noButton.input.useHandCursor = true;
        noButton.lineStyle(1, 0, 1);
        noButton.beginFill(0, 0);
        this.SetReplyButton(noButton.events, Dialog.result.No);

        const messageBGWidth = messageText.width + 20;
        const messageBGHeight = messageText.height + 20;
        const yesBGWidth = yesText.width + 10;
        const okBGHeight = yesText.height + 5;
        const noBGWidth = noText.width + 10;
        const noBGHeight = noText.height + 5;
        const buttonBGWidth = messageBGWidth;
        const buttonBGHeight = okBGHeight + 20;
        const dialogBGWidth = messageBGWidth + 20;
        const dialogBGHeight = messageBGHeight + buttonBGHeight + 20;

        dialogBG.beginFill(0xffffff);
        dialogBG.drawRect(messageBGWidth / -2, messageBGHeight / -2, messageBGWidth, messageBGHeight);
        dialogBG.beginFill(0xf0f0f0);
        dialogBG.drawRect(messageBGWidth / -2, messageBGHeight / 2, buttonBGWidth, buttonBGHeight);
        dialogBG.beginFill(0, 0);
        dialogBG.lineStyle(5, 0x2587e9);
        dialogBG.drawRect(messageBGWidth / -2, messageBGHeight / -2, messageBGWidth, messageBGHeight + buttonBGHeight);
        dialogBG.lineStyle(0);
        yesButton.position.set(-buttonBGWidth / 4, (messageBGHeight + buttonBGHeight) / 2);
        yesText.position = yesButton.position.clone();
        yesButton.drawRect(yesBGWidth / -2, okBGHeight / -2, yesBGWidth, okBGHeight);
        noButton.position.set(buttonBGWidth / 4, (messageBGHeight + buttonBGHeight) / 2);
        noText.position = noButton.position.clone();
        noButton.drawRect(noBGWidth / -2, noBGHeight / -2, noBGWidth, noBGHeight);
    }
}

export class YesNoCancelDialog extends Dialog {
    constructor(game: Phaser.Game, message: string, onCreate?: (dialog: YesNoCancelDialog) => void, parent?: PIXI.DisplayObjectContainer) {
        super(game, (dialog: YesNoCancelDialog) => {
            if (onCreate) {
                onCreate(dialog);
            }
        }, parent);
    }
}
