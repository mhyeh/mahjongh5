/** 用來記錄符號的字串與編號的對應關係 */
export default class TileTable<ConfigType extends TileConfig = TileConfig> implements Iterable<ConfigType> {
    protected configs: ConfigType[] = [];
    /**
     * 可以把資料寫在JSON檔再傳進來
     * @param data 包含設定的資料
     */
    constructor(data?: any) {
        if (data) {
            this.configs = data.configs;
        }
    }

    public get tileCount(): number {
        return this.configs.length;
    }

    public ToIndex(value: string): number | null {
        for (let i = 0; i < this.configs.length; i++) {
            if (this.configs[i].tile === value) {
                return i;
            }
        }
        return null;
    }

    public GetConfig(tile: number | string): ConfigType | null {
        if (typeof tile === "number") {
            if (tile >= 0 && tile < this.configs.length) {
                return this.configs[tile];
            }
        } else {
            const index = this.ToIndex(tile);
            if (index !== null) {
                return this.configs[index];
            }
        }
        return null;
    }

    public [Symbol.iterator](): IterableIterator<ConfigType> {
        return this.configs[Symbol.iterator]();
    }
}

export interface TileConfig {
    tile: string;
}
