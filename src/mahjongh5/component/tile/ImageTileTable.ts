import TilelTable from "./TileTable";
/** 用來記錄符號的字串與編號的對應關係以及每個符號的圖片 */
export default class ImageTileTable extends TilelTable<ImageTileConfig> {
    /** 包含所有符號的sprite sheet的key */
    public spriteKey:   string;
    public tileWidth?:  number;
    public tileHeight?: number;

    constructor(data?: any, spriteKey?: string) {
        super(data);
        if (data) {
            this.spriteKey  = data.spriteKey;
            this.tileWidth  = data.tileWidth;
            this.tileHeight = data.tileHeight;
        }
        if (spriteKey) {
            this.spriteKey = spriteKey;
        }
    }

    public GetSprite(tile: number | string): number | string | null {
        const config = this.GetConfig(tile);
        if (config !== null) {
            return config.image;
        }
        return null;
    }

    public GetConfig(tile: number | string): ImageTileConfig | null {
        return super.GetConfig(tile);
    }
}

export interface ImageTileConfig {
    tile:  string;
    image: string | number;
}
