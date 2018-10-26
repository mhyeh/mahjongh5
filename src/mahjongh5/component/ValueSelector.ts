export default class ValueSelector<ValueType> {
    public cycleSelection: boolean;
    private values: ValueType[];
    private index: number;

    private valueChangedSignal: Phaser.Signal;

    constructor();
    constructor(values?: ValueType[], index?: number);
    constructor(values: ValueType[] = [], index: number = 0) {
        this.values = values;
        this.Index = index;
    }

    public get onValueChanged(): Phaser.Signal {
        if (!this.valueChangedSignal) {
            this.valueChangedSignal = new Phaser.Signal();
        }
        return this.valueChangedSignal;
    }

    public get Value(): ValueType {
        return this.values[this.index];
    }
    public set Value(value: ValueType) {
        if (this.Value !== value) {
            this.Index = this.values.indexOf(value);
        }
    }

    public get ValueCount(): number {
        return this.values.length;
    }

    public get Index(): number {
        return this.index;
    }
    public set Index(index: number) {
        if (this.cycleSelection) {
            index = ((index % this.Values.length) + this.Values.length) % this.Values.length;
        } else {
            index = Math.min(Math.max(0, index), this.values.length - 1);
        }

        if (this.index !== index) {
            this.index = index;
            if (this.valueChangedSignal) {
                this.valueChangedSignal.dispatch(this.Value);
            }
        }
    }

    public get Values(): ValueType[] {
        return this.values;
    }
    public set Values(value: ValueType[]) {
        const newIndex = value.indexOf(this.Value);

        this.values = value;
        this.index = newIndex < 0 ? 0 : newIndex;
    }

    public get HasNextValue(): boolean {
        return this.cycleSelection || this.Index + 1 < this.Values.length;
    }

    public get HasPreviousValue(): boolean {
        return this.cycleSelection || this.Index - 1 >= 0;
    }

    public NextValue(): ValueType {
        this.Index++;
        return this.Value;
    }

    public PreviousValue(): ValueType {
        this.Index--;
        return this.Value;
    }

    public LastValue(): ValueType {
        this.Index = this.values.length - 1;
        return this.Value;
    }

    public FirstValue(): ValueType {
        this.Index = 0;
        return this.Value;
    }
}
