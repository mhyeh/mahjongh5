export interface Text {
    text: string;
}

export default class NumberFormatter<TextType extends Text = Text> {
    public displayDecimal: boolean = false;
    public displayDecimalZero: boolean = false;
    public displayLeadingZero: boolean = false;
    public displayThousands: boolean = false;
    public displayZero: boolean = true;
    public maxIntegerLength: number = 10;
    public maxDecimalLength: number = 2;
    public prefixText: string = "";
    public suffixText: string = "";

    private numberValue: number;
    private valueChangedSignal: Phaser.Signal;
    private text: TextType;
    constructor(text: TextType, value: number = 0) {
        this.text = text;
        this.value = value;
    }

    public get textDisplayer(): TextType {
        return this.text;
    }

    /**
     * get/set function for setting the Number of NumberDisplayer
     */
    public get value(): number {
        return this.numberValue;
    }
    public set value(value: number) {
        value = Math.min(Math.max(value, this.minValue), this.maxValue);
        if (value !== this.numberValue) {
            this.numberValue = value;
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

    public get maxValue(): number {
        return Math.pow(10, this.maxIntegerLength) - Math.pow(10, -this.maxDecimalLength);
    }

    public get minValue(): number {
        return 0;
    }

    public UpdateText(): void {
        let str = "";
        if (this.value === Number.POSITIVE_INFINITY) {
            str = String.fromCharCode(0x221E); // ∞
        } else if (this.value === Number.NEGATIVE_INFINITY) {
            str = "-" + String.fromCharCode(0x221E); // -∞
        } else if (Number.isNaN(this.value)) {
            str = "";
        } else {
            str = this.value.toFixed(this.maxDecimalLength);
            if (/\d*e/.test(str)) {
                const negativeSign = this.value < 0 ? "-" : "";
                const fraction = Math.abs(this.value % 1).toFixed(this.maxDecimalLength).substring(1);
                str = "";
                let n = Math.abs(this.value);
                while (n > 1e+10) {
                    const s = (n % 1e+10).toFixed(0);
                    str = "0".repeat(10 - s.length) + s + str;
                    n = Math.trunc(n / 1e+10);
                }
                str = negativeSign + n.toFixed(0) + str + fraction;
            }
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
        this.text.text = this.prefixText + str + this.suffixText;
    }
}
