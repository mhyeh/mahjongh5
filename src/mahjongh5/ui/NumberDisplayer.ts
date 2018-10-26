export default class NumberDisplayer extends Phaser.BitmapText {
    public displayDecimal: boolean = false;
    public displayDecimalZero: boolean = false;
    public displayLeadingZero: boolean = false;
    public displayThousands: boolean = false;
    public displayZero: boolean = true;
    public maxIntegerLength: number = 10;
    public maxDecimalLength: number = 2;
    public prefixText: string = "";
    public suffixText: string = "";

    private value: number;
    private valueChangedSignal: Phaser.Signal;

    /**
     * @param game
     * @param x
     * @param y
     * @param font
     * @param num 此NumberDisplayer的初始數字，允許使用字串或數字輸入
     * @param size
     * @param align
     * @param toFixedNumber 要輸出到小數點第幾位
     * @param showComma 是否每三位數顯示一個逗號
     * @param showUnit 顯示單位
     * @param showIfZero 當數字為0時是否輸出
     * @param preUnit 設定單位（顯示於數字前）
     * @param postUnit 設定單位（顯示於數字後）
     */
    constructor(game: Phaser.Game, x: number, y: number, font: string, num?: number, size?: number, align?: string, toFixedNumber: number = 2, showComma: boolean = false, showUnit: boolean = true, showIfZero: boolean = true, preUnit: string = "", postUnit: string = "") {
        super(game, x, y, font, "", size, align);
        this.maxDecimalLength = toFixedNumber;
        this.displayThousands = showComma;
        this.displayZero = showIfZero;
        this.prefixText = preUnit;
        this.suffixText = postUnit;
        this.Value = num ? num : 0;
        game.world.add(this);
    }

    /**
     * get/set function for setting the Number of NumberDisplayer
     */
    public get Value(): number {
        return this.value;
    }
    public set Value(value: number) {
        value = Math.min(Math.max(value, this.MinValue), this.MaxValue);
        if (value !== this.value) {
            this.value = value;
            this.UpdateText();
            if (this.valueChangedSignal) {
                this.valueChangedSignal.dispatch(value);
            }
        }
    }

    public get onValueChanged(): Phaser.Signal {
        if (!this.valueChangedSignal) {
            this.valueChangedSignal = new Phaser.Signal();
        }
        return this.valueChangedSignal;
    }

    public get MaxValue(): number {
        return Math.pow(10, this.maxIntegerLength) - Math.pow(10, -this.maxDecimalLength);
    }

    public get MinValue(): number {
        return 0;
    }

    public UpdateText(): void {
        let str = "";
        if (this.Value === Number.POSITIVE_INFINITY) {
            str = String.fromCharCode(0x221E); // ∞
        } else if (this.Value === Number.NEGATIVE_INFINITY) {
            str = "-" + String.fromCharCode(0x221E); // -∞
        } else if (Number.isNaN(this.Value)) {
            str = "";
        } else {
            str = this.Value.toFixed(this.maxDecimalLength);
            if (!this.displayDecimalZero) {
                // 刪除小數後面的0
                str = str.replace(/(\d*\.\d*[1-9]|\d*)(\.?0*)/, "$1");
            }
            if (!this.displayDecimal) {
                // 刪除小數
                str = str.replace(/\.\d+$/, "");
            }
            if (this.displayLeadingZero) {
                // 補整數前面的0
                const result = str.match(/\d(\.\d*)?/g);
                if (result) {
                    str = str.replace(/(\d+)/, "0".repeat(this.maxIntegerLength - result.length) + "$1");
                }
            }
            if (this.displayThousands) {
                // 整數每3位加","
                const strs = str.split(".");
                str = strs[0].replace(/(\d)(?=(\d{3})+$)/g, "$1,") + (strs[1] ? "." + strs[1] : "");
            }
            if (!this.displayZero) {
                // 刪除0
                str = str.replace(/^(0+(\.0*)?)$/, "");
            }
        }
        this.text = this.prefixText + str + this.suffixText;
    }
}
