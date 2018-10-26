import Dialog from "./Dialog";
import Button from "./Button";
import { ButtonEvent } from "./Button";
import NumberDisplayer from "./NumberDisplayer";
export default class NumberInputDialog extends Dialog {
    public numberDisplayer: NumberDisplayer | Phaser.Text;
    public maxValue: number;
    public minValue: number;
    public numberButtons: ButtonEvent[];
    public backButton: ButtonEvent;
    public maxButton: ButtonEvent;
    public minButton: ButtonEvent;
    public zeroButton: ButtonEvent;
    public confirmButton: Button;
    public closeButton: ButtonEvent;

    constructor(game: Phaser.Game, onCreate?: (dialog: NumberInputDialog) => void, parent?: PIXI.DisplayObjectContainer) {
        super(game, onCreate, parent);
        this.modal = true;
        this.destoryOnHide = false;
        this.backgroundAlpha = 0.5;
    }

    public get value(): number {
        if (this.numberDisplayer instanceof NumberDisplayer) {
            return this.numberDisplayer.Value;
        } else {
            return Number.parseInt(this.numberDisplayer.text);
        }
    }
    public set value(value: number) {
        if (value > this.maxValue) {
            value = this.maxValue;
        }
        if (this.numberDisplayer instanceof NumberDisplayer) {
            this.numberDisplayer.Value = value;
        } else {
            this.numberDisplayer.text = value.toString();
        }
        if (this.confirmButton) {
            this.confirmButton.enable = value >= this.minValue;
        }
    }

    protected Create() {
        super.Create();
        for (let i = 0; this.numberButtons && i < this.numberButtons.length; i++) {
            if (this.numberButtons[i]) {
                this.numberButtons[i].onInputUp.add(this.AppendValue.bind(this, i));
            }
        }
        if (this.backButton) {
            this.backButton.onInputUp.add(this.BackspaceValue, this);
        }
        if (this.maxButton) {
            this.maxButton.onInputUp.add(() => this.value = this.maxValue);
        }
        if (this.minButton) {
            this.minButton.onInputUp.add(() => this.value = this.minValue);
        }
        if (this.zeroButton) {
            this.zeroButton.onInputUp.add(() => this.value = 0);
        }
        if (this.confirmButton) {
            this.SetReplyButton(this.confirmButton, Dialog.result.OK);
        }
        if (this.confirmButton) {
            this.SetReplyButton(this.closeButton, Dialog.result.Cancel);
        }
        this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE).onUp.add(this.BackspaceValue, this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_0).onUp.add(this.AppendValue.bind(this, 0), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_1).onUp.add(this.AppendValue.bind(this, 1), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_2).onUp.add(this.AppendValue.bind(this, 2), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_3).onUp.add(this.AppendValue.bind(this, 3), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_4).onUp.add(this.AppendValue.bind(this, 4), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_5).onUp.add(this.AppendValue.bind(this, 5), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_6).onUp.add(this.AppendValue.bind(this, 6), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_7).onUp.add(this.AppendValue.bind(this, 7), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_8).onUp.add(this.AppendValue.bind(this, 8), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_9).onUp.add(this.AppendValue.bind(this, 9), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.ZERO).onUp.add(this.AppendValue.bind(this, 0), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.ONE).onUp.add(this.AppendValue.bind(this, 1), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.TWO).onUp.add(this.AppendValue.bind(this, 2), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.THREE).onUp.add(this.AppendValue.bind(this, 3), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.FOUR).onUp.add(this.AppendValue.bind(this, 4), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.FIVE).onUp.add(this.AppendValue.bind(this, 5), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.SIX).onUp.add(this.AppendValue.bind(this, 6), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.SEVEN).onUp.add(this.AppendValue.bind(this, 7), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.EIGHT).onUp.add(this.AppendValue.bind(this, 8), this);
        this.game.input.keyboard.addKey(Phaser.KeyCode.NINE).onUp.add(this.AppendValue.bind(this, 9), this);
    }

    private AppendValue(value: number): void {
        this.value *= value < 10 ? 10 : Math.pow(10, Math.trunc(Math.log10(value)) + 1);
        this.value += value;
    }

    private BackspaceValue(): void {
        this.value = Math.trunc(this.value / 10);
    }
}
