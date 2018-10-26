import Tile from "./Tile";
import ImageTileTable from "./ImageTileTable";
export default class ImageTile extends Tile<ImageTileTable> {
    // protected symbolTable: MultiLayerStyleSymbolTable;
    private tileSize: Phaser.Point;

    public get tileWidth(): number {
        return this.tileSize.x;
    }

    public get tileHeight(): number {
        return this.tileSize.y;
    }

    public get imageWidth(): number {
        return this.width;
    }

    public get imageHeight(): number {
        return this.height;
    }

    constructor(game: Phaser.Game, tileTable: ImageTileTable) {
        super(game, tileTable, tileTable.spriteKey);
        this.tileTable = tileTable;

        this.tileSize = new Phaser.Point(tileTable.tileWidth || this.width, tileTable.tileHeight || this.height);
        if (tileTable.GetConfig(0)) {
            this.ID = tileTable.GetConfig(0).tile;
        }
    }

    public AdjustTile(anchor?: Phaser.Point, scale?: Phaser.Point, position?: Phaser.Point) {
        if (anchor) {
            this.anchor = anchor.clone();
        }
        if (scale) {
            this.scale = scale.clone();
        }
        if (position) {
            this.position = position.clone();
        }
    }

    protected OnIDChangedHandler() {
        this.UpdateImages();
        super.OnIDChangedHandler();
    }

    private UpdateImages(): void {
        const spriteNumber = this.tileTable.GetSprite(this.ID);
        if (typeof spriteNumber === "string") {
            // this.frameName = spriteNumber;
            this.setFrames(spriteNumber, spriteNumber, spriteNumber, spriteNumber);
        } else if (typeof spriteNumber === "number") {
            // this.frame = spriteNumber;
            this.setFrames(spriteNumber, spriteNumber, spriteNumber, spriteNumber);
        }
        this.visible = spriteNumber !== null;
    }
}
