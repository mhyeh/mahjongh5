import Tile from "./Tile";
import Input from "mahjongh5/input/Input";
import { v4 } from "uuid";

export default abstract class TileList<TileType extends Tile> extends Phaser.Group implements Iterable<TileType> {
    public visiblePosition: number = 0;
    public visibleCount:    number = 0;
    public maxLen:    number;
    public clickable: boolean;
    public tiles: TileType[] = [];

    private input: Input;

    public get Input(): Input {
        if (!this.input) {
            this.input = new Input();
        }
        return this.input;
    }

    /**
     * 符號數量
     */
    public get tileCount(): number {
        return this.tiles.length;
    }

    public get MaxLen(): number {
        if (this.maxLen !== -1) {
            return this.maxLen;
        }
        return this.tileCount;
    }

    constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer, clickable: boolean = false, maxLen = -1) {
        super(game, parent);
        this.clickable = clickable;
        this.maxLen    = maxLen;
    }

    /**
     * 取得符號
     * @param index 第幾個符號
     */
    public GetTile(index: number): TileType {
        return this.tiles[index];
    }

    /**
     * 取得符號
     */
    public [Symbol.iterator](): IterableIterator<TileType> {
        return this.tiles[Symbol.iterator]();
    }

    public entries(): IterableIterator<[number, TileType]> {
        return this.tiles.entries();
    }

    /**
     * 立刻設定 tiles，要是給的symbol數量超過reel的symbol數，多的就沒有作用，要是少於的話剩下的symbol不會改變
     * @param tiles 要顯示的符號
     */
    public SetImmediate(tiles: Iterable<string>): void {
        const tileIterator = tiles[Symbol.iterator]();
        let result: IteratorResult<string> = tileIterator.next();
        for (let i = 0; i < this.tileCount && !result.done; i++ , result = tileIterator.next()) {
            this.tiles[i].ID = result.value;
            this.tiles[i].uuid = v4();
            this.tiles[i].color = result.value.slice(0, 1);
            if (this.clickable) {
                this.Input.AddButton(this.tiles[i], Input.key.Throw, undefined, this.tiles[i].uuid);
            }
        }
    }

    public Enable() {
        for (const tile of this.tiles) {
            if (tile) {
                tile.enable = true;
            }
        }
    }

    public Disable() {
        for (const tile of this.tiles) {
            if (tile) {
                tile.enable = false;
            }
        }
    }

    public async getClickCardIndex(): Promise<number> {
        const uuid = await this.Input.WaitKeyUp(Input.key.Throw);
        const card = this.tiles.findIndex((value) => value.uuid === uuid.toString());
        return card;
    }

    public async getClickCardID(): Promise<string> {
        const uuid = await this.Input.WaitKeyUp(Input.key.Throw);
        const card = this.tiles.find((value) => value.uuid === uuid.toString());
        return card.ID;
    }
}
