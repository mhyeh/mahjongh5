import NumberDisplayer from "./NumberDisplayer";
export default class NumberInputDisplayer extends NumberDisplayer {
    public focusing: boolean = false;

    constructor(game: Phaser.Game, x: number, y: number, font: string, num?: number, size?: number, align?: string, toFixedNumber: number = 2, showComma: boolean = false, showUnit: boolean = true, showIfZero: boolean = true, preUnit: string = "", postUnit: string = "") {
        super(game, x, y, font, num, size, align, toFixedNumber, showComma, showUnit, showIfZero, preUnit, postUnit);
        this.inputEnabled = true;
        this.input.useHandCursor = true;
        this.game.input.onDown.add(() => {
            this.focusing = false;
        });
        this.events.onInputUp.add(() => this.focusing = true);
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
        if (this.focusing) {
            this.Value *= value < 10 ? 10 : Math.pow(10, Math.trunc(Math.log10(value)) + 1);
            this.Value += value;
        }
    }

    private BackspaceValue(): void {
        if (this.focusing) {
            this.Value = Math.trunc(this.Value / 10);
        }
    }
}
