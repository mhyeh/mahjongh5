export interface Cache {
    addAtlasBitmapFont: (key: string, data: CacheData) => void;
    getAtlasBitmapFont: (key: string) => CacheData;
    atlasBitmapFont: { [key: string]: CacheData };
}

export interface Loader {
    atlasBitmapFont: (key: string, url: string, atlas: { type: string, key: string }, frame: string) => void;
}

interface ABFCache extends Phaser.Cache, Cache {

}

interface ABFLoader extends Phaser.Loader, Loader {
    cache: ABFCache;
    game: ABFGame;
}

interface ABFGame extends Phaser.Game {
    load: ABFLoader;
    cache: ABFCache;
}

export interface CacheData {
    atlasKey: string;
    atlasFrame: string;
    dataKey: string;
    dataType?: string;
    xSpacing?: number;
    ySpacing?: number;
}

export class Plugin extends Phaser.Plugin {
    public game: ABFGame;

    constructor(game: ABFGame, parent: Phaser.PluginManager) {
        super(game, parent);
        this.addCache();
        this.addLoader();
    }

    private addLoader() {
        let atlasBitmapFontLoadQueue: CacheData[] = [];
        (Phaser.Loader.prototype as ABFLoader).atlasBitmapFont = function atlasBitmapFont(this: ABFLoader, key: string, url: string, atlas: { type: string, key: string }, frame: string) {
            const cacheData: CacheData = {
                atlasKey: atlas.key,
                atlasFrame: frame,
                dataKey: key,
            };
            atlasBitmapFontLoadQueue.push(cacheData);
            this.xml(key, url);
        };
        this.game.load.onLoadComplete.add(() => {
            for (const data of atlasBitmapFontLoadQueue) {
                this.game.cache.addAtlasBitmapFont(data.dataKey, data);
            }
            atlasBitmapFontLoadQueue = [];
        });
    }

    private addCache(): void {
        (Phaser.Cache.prototype as ABFCache).atlasBitmapFont = {};

        (Phaser.Cache.prototype as ABFCache).addAtlasBitmapFont = function addAtlasBitmapFont(key: string, data: CacheData) {
            this.game.cache.addBitmapFontFromAtlas(key, data.atlasKey, data.atlasFrame, data.dataKey, data.dataType, data.xSpacing, data.ySpacing);
            this.atlasBitmapFont[key] = data;
        };

        (Phaser.Cache.prototype as ABFCache).getAtlasBitmapFont = function getAtlasBitmapFont(key: string): CacheData {
            if (!this.atlasBitmapFont.hasOwnProperty(key)) {
                console.warn('"' + key + '" not found in Cache.');
            }
            return this.atlasBitmapFont[key];
        };
    }
}
