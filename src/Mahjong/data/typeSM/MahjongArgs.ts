export enum COMMAND_TYPE {
    NONE = 0b0000000,
    COMMAND_PON    = 0b0000001, // 碰
    COMMAND_GON    = 0b0000010, // 直槓
    COMMAND_ONGON  = 0b0000100, // 暗槓
    COMMAND_PONGON = 0b0001000, // 面下槓
    COMMAND_HU     = 0b0010000, // 胡
    COMMAND_ZIMO   = 0b0100000, // 自摸
    COMMAND_THROW  = 0b1000000,
}

export default class MahjongArgs {
    /** 壓線 */
    public command: COMMAND_TYPE = COMMAND_TYPE.NONE;

    /** 押注代幣 */
    public card: number = 0;

    constructor();
    /**
     * BetLineArgs
     * @param line 賭幾條線
     * @param bet 賭多少
     * @param denom 代幣價值
     * @param debugMode 除錯模式
     */
    constructor(command: COMMAND_TYPE, card: number);
    // tslint:disable-next-line:unified-signatures
    constructor(jsonData: any);
    constructor(arg0?: COMMAND_TYPE | any, card?: number) {
        if (typeof arg0 === "number" && typeof card === "number") {
            this.command = arg0;
            this.card = card;
        } else if (arg0) {
            this.command = arg0.command;
            this.card = arg0.card;
        }
    }

    public toString(): string {
        return `{{command=${this.command}, card=${this.card}}}`;
    }

    public toJSON() {
        const data: any = {
            Command: this.command,
            Card: this.card,
        };
        return data;
    }

    public Clone(): MahjongArgs {
        const args = new MahjongArgs(0, -1);
        args.command = this.command;
        args.card = this.card;
        return args;
    }
}
