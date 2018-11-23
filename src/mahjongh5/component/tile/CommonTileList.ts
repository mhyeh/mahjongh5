import TileList from "./TileList";
import ImageTile from "./ImageTile";
import ImageTileTable from "./ImageTileTable";
import Input from "mahjongh5/input/Input";
import { v4 } from "uuid";

enum Direction {
    Right = 0,
    Down  = 1,
    Left  = 2,
    Up    = 3,
}

export default class CommonTileList extends TileList<ImageTile> {
    public direction: number = Direction.Right;

    private tileWidth:    number = 0;
    private tileHeight:   number = 0;
    private tileTable:    ImageTileTable;
    private tileAnchor:   Phaser.Point;
    private tileScale:    Phaser.Point;
    private tilePosition: Phaser.Point;

    /**
     * 符號顯示寬度
     */
    public get TileWidth(): number {
        return this.tileWidth;
    }
    public set TileWidth(value: number) {
        this.tileWidth = Math.max(value, 0);
        for (const tile of this.tiles) {
            tile.width = this.tileWidth;
        }
        this.ArrangeTile();
    }

    /**
     * 符號顯示高度
     */
    public get TileHeight(): number {
        return this.tileHeight;
    }
    public set TileHeight(value: number) {
        this.tileHeight = Math.max(value, 0);
        for (const tile of this.tiles) {
            tile.height = this.tileHeight;
        }
        this.ArrangeTile();
    }

    public get TileAnchor(): Phaser.Point {
        return this.tileAnchor;
    }
    public set TileAnchor(value: Phaser.Point) {
        this.tileAnchor = value;
        for (const tile of this.tiles) {
            tile.AdjustTile(value);
        }
        this.ArrangeTile();
    }

    public get TileScale(): Phaser.Point {
        return this.tileScale;
    }
    public set TileScale(value: Phaser.Point) {
        this.tileScale = value;
        for (const tile of this.tiles) {
            tile.AdjustTile(undefined, value);
        }
        this.ArrangeTile();
    }

    public get TilePosition(): Phaser.Point {
        return this.tilePosition;
    }
    public set TilePosition(value: Phaser.Point) {
        this.tilePosition = value;
        for (const tile of this.tiles) {
            tile.AdjustTile(undefined, undefined, value);
        }
        this.ArrangeTile();
    }

    /**
     * 建立Reel
     * @param game Phaser.Game
     * @param tileCount tile的數量
     * @param tileTable tile table資料
     * @param parent reel的parent，通常是ReelManager
     * @param tileWidth 指定排列時的tile寬度
     * @param tileHeight 指定排列時的tile高度
     */
    constructor(game: Phaser.Game, tileCount: number, tileTable: ImageTileTable, parent?: PIXI.DisplayObjectContainer, tileWidth?: number, tileHeight?: number, direction: number = Direction.Right, clickable: boolean = false, maxLen = -1) {
        super(game, parent, clickable, maxLen);
        // Create Add tile
        this.tileTable = tileTable;
        for (let i = 0; i < tileCount; i++) {
            this.tiles.push(new ImageTile(this.game, tileTable));
            if (clickable) {
                this.tiles[this.tiles.length - 1].setTint(0x707070, 0x707070);
            } else {
                this.tiles[this.tiles.length - 1].enable = false;
            }
        }
        this.addMultiple(this.tiles);
        this.direction = direction;
        // Set TileWidth
        if (tileWidth !== undefined) {
            this.TileWidth = tileWidth;
        } else if (tileTable.tileWidth !== undefined) {
            this.TileWidth = tileTable.tileWidth;
        } else if (this.tiles.length > 0) {
            this.TileWidth = this.tiles[0].tileWidth;
        }
        // Set TileWidth
        if (tileHeight !== undefined) {
            this.TileHeight = tileHeight;
        } else if (tileTable.tileHeight !== undefined) {
            this.TileHeight = tileTable.tileHeight;
        } else if (this.tiles.length > 0) {
            this.TileHeight = this.tiles[0].tileHeight;
        }
    }

    public AdjustAllTile(anchor?: Phaser.Point, scale?: Phaser.Point, position?: Phaser.Point) {
        for (const tile of this.tiles) {
            tile.AdjustTile(anchor, scale, position);
        }
        this.ArrangeTile();
    }

    public AddTile(ID: string) {
        let index = 0;
        const map: {[key: string]: number} = {c: 0, d: 1, b: 2};
        for (index = 0; index < this.tileCount; index++) {
            const t1 = this.tiles[index].ID;
            const t2 = ID;
            if (map[t1.charAt(0)] * 10 + Number(t1.charAt(1)) > map[t2.charAt(0)] * 10 + Number(t2.charAt(1))) {
                break;
            }
        }
        this.tiles.splice(index, 0, new ImageTile(this.game, this.tileTable));
        this.add(this.tiles[index]);
        this.tiles[index].ID     = ID;
        this.tiles[index].color  = ID.slice(0, 1);
        this.tiles[index].uuid   = v4();
        this.tiles[index].width  = this.TileWidth;
        this.tiles[index].height = this.TileHeight;
        this.tiles[index].AdjustTile(this.tileAnchor, this.tileScale, this.tilePosition);
        if (this.clickable) {
            this.tiles[index].setTint(0x707070, 0x707070);
            this.Input.AddButton(this.tiles[index], Input.key.Throw, undefined, this.tiles[index].uuid);
        } else {
            this.tiles[index].enable = false;
        }
        this.ArrangeTile();
    }

    public RemoveTile(ID: string) {
        const index = this.tiles.findIndex((a) => a.ID === ID);
        if (index !== -1) {
            this.tiles[index].destroy();
            this.tiles.splice(index, 1);
        }
        this.ArrangeTile();
    }

    private ArrangeTile() {
        for (const [i, tile] of this.tiles.entries()) {
            tile.angle = -this.direction * 90;
            if (this.direction === Direction.Down) {
                tile.x = (this.TileHeight + 5) * ~~(i / this.MaxLen);
                tile.y = (this.TileWidth + 5) * (this.MaxLen - i % this.MaxLen);
            } else if (this.direction === Direction.Up) {
                tile.x = -(this.TileHeight + 5) * ~~(i / this.MaxLen);
                tile.y = (this.TileWidth + 5) * (i % this.MaxLen);
            } else if (this.direction === Direction.Left) {
                tile.x = (this.TileWidth + 5) * (this.MaxLen - i % this.MaxLen);
                tile.y = -(this.TileHeight + 5) * ~~(i / this.MaxLen);
            } else if (this.direction === Direction.Right) {
                tile.x = (this.TileWidth + 5) * (i % this.MaxLen);
                tile.y = (this.TileHeight + 5) * ~~(i / this.MaxLen);
            }
        }
    }
}
