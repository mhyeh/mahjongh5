// Dollar(decimal) * AccUint(int32) = Credit(int64) * Denom(int32) = Value(int64)

enum Unit {
    Value,
    Dollar,
    Credit,
}

export default class Account implements Number {
    /** 常數，使最小押注金額為 0.0001 */
    public static readonly ACC_UNIT: number = 10000;
    public static denom = Account.ACC_UNIT;
    public static Unit = Unit;

    /** Construct new Account by dollar (and Denom). */
    public static DollarToAccount(dollar: number, denom: number = Account.denom): Account {
        const value = dollar * Account.ACC_UNIT;
        return new Account(value, denom);
    }

    /** Construct new Account by credit (and Denom). */
    public static CreditToAccount(credit: number, denom: number = Account.denom): Account {
        const value = credit * denom;
        return new Account(value, denom);
    }

    /** Construct new Account by credit and dollar. */
    public static CreditAndDollarToAccount(credit: number, dollar: number): Account {
        const value = dollar * Account.ACC_UNIT;
        if (credit === 0) {
            return new Account(value);
        } else {
            const denom = value / credit;
            return new Account(value, denom);
        }
    }

    public static ValueTo(value: number, unit: Unit = Unit.Value): number {
        if (unit === Unit.Dollar) {
            return Account.ValueToDollar(value);
        } else if (unit === Unit.Credit) {
            return Account.ValueToCredit(value);
        } else {
            return value;
        }
    }

    public static ValueToDollar(value: number): number {
        return value / Account.ACC_UNIT;
    }

    public static ValueToCredit(value: number, denom: number = Account.denom): number {
        return value / denom;
    }

    public static DollarToCredit(dollar: number, denom: number = Account.denom): number {
        return dollar * Account.ACC_UNIT / denom;
    }

    public static CreditToDollar(credit: number, denom: number = Account.denom): number {
        return credit * denom / Account.ACC_UNIT;
    }

    /** 單位0.01cent */
    private value: number;

    /** denom元/代幣 */
    private denom: number;

    /** Construct new Account by Value (and Denom). */
    constructor(value: number = 0, denom: number = Account.denom) {
        this.value = value;
        this.denom = denom;
    }

    get Value(): number {
        return this.value;
    }
    set Value(value: number) {
        this.value = value;
    }

    get Denom(): number {
        return this.denom;
    }

    set Denom(value: number) {
        this.denom = value;
    }

    /** 代幣 */
    get Credit(): number {
        return this.value / this.denom;
    }
    set Credit(credit: number) {
        this.value = credit * this.denom;
    }

    /** 現金 */
    get Dollar(): number {
        return this.value / Account.ACC_UNIT;
    }
    set Dollar(dollar: number) {
        this.value = dollar * Account.ACC_UNIT;
    }

    public addValue(add: number): Account {
        this.value = this.value + add;
        return this;
    }

    public addDollar(add: number): Account {
        this.value = (this.Dollar + add) * Account.ACC_UNIT;
        return this;
    }

    public addCredit(add: number): Account {
        this.value = (this.Credit + add) * this.denom;
        return this;
    }

    public toJSON(showDenom: boolean = false): any {
        if (!showDenom) {
            return { Value: this.value };
        } else {
            return { Value: this.value, Denom: this.denom };
        }
    }
    public toString(radix?: number): string {
        return this.value.toString();
    }
    public toFixed(fractionDigits?: number): string {
        return this.value.toFixed(fractionDigits);
    }
    public toExponential(fractionDigits?: number): string {
        return this.value.toExponential(fractionDigits);
    }
    public toPrecision(precision?: number): string {
        return this.value.toPrecision(precision);
    }
    public valueOf(): number {
        return this.value;
    }

    public EqualsTo(other: Account): boolean {
        return this.denom === other.denom && this.value === other.value;
    }

    public Clone(): Account {
        const account = new Account();
        account.Value = this.Value;
        account.Denom = this.Denom;
        return account;
    }
}
