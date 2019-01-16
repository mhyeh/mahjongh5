import TileTable from "./TileTable";
import Button from "mahjongh5/ui/Button";

export default abstract class Tile<TileTableType extends TileTable = TileTable> extends Button {
    /** 紀錄有哪些ID */
    public tile: spine.Tile;
    public isClick = false;
    public color: string;
    public uuid:  string;
    protected tileTable: TileTableType;

    private id: string;
    private idChangedSignal: Phaser.Signal;

    public get ID(): string {
        return this.id;
    }
    public set ID(value: string) {
        this.id = value;
        this.OnIDChangedHandler();
    }

    public abstract get tileWidth():  number;

    public abstract get tileHeight(): number;

    /** 當符號改變時，參數(自己, 新ID) */
    public get onIDChanged(): Phaser.Signal {
        if (!this.idChangedSignal) {
            this.idChangedSignal = new Phaser.Signal();
        }
        return this.idChangedSignal;
    }

    constructor(game: Phaser.Game, tileTable: TileTableType, key?: string) {
        super(game, 0, 0, key);
        this.tileTable = tileTable;
    }

    public abstract AdjustTile(anchor?: Phaser.Point, scale?: Phaser.Point, position?: Phaser.Point): void;

    protected OnIDChangedHandler(): void {
        if (this.idChangedSignal) {
            this.idChangedSignal.dispatch(this, this.id);
        }
    }
}
