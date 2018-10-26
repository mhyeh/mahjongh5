export default class MessageDisplayer extends Phaser.BitmapText {
    private map: {[symbol: string]: string | number | number[]};
    constructor(game: Phaser.Game, x: number, y: number, font: string, map: {[symbol: string]: string | number | number[]},  text?: string, size?: number, align?: string) {
        super(game, x, y, font, text, size, align);
        this.map = map;
    }

    public set Append(key: string) {
        this.text += this.MapString(key);
    }

    public set Assign(key: string) {
        this.text = this.MapString(key);
    }

    public HideAll(): void {
        this.text = "";
    }

    private MapString(key: string): string {
        const value = this.map[key];
        if (typeof value === "string") {
            return value;
        } else if (typeof value === "number") {
            return String.fromCharCode(value);
        } else if (value instanceof Array ) {
            let str = "";
            for (const s of value) {
                str += String.fromCharCode(s);
            }
            return str;
        } else {
            return "";
        }
    }
}
