export default class NinePatchData extends Phaser.BitmapData {
    public source: any;
    public left: number;
    public right: number;
    public top: number;
    public bottom: number;
    constructor(game: Phaser.Game, source: any, positoin: { left: number, right: number, top: number, bottom: number, width?: number, height?: number }, width?: number, height?: number);
    constructor(game: Phaser.Game, source: any, left: number, right: number, top: number, bottom: number, width?: number, height?: number);
    constructor(game: Phaser.Game, source: any, left: number | { left: number, right: number, top: number, bottom: number, width?: number, height?: number }, right?: number, top?: number, bottom?: number, width?: number, height?: number) {
        super(game, game.rnd.uuid(), width, height);
        this.source = source;
        if (typeof left !== "number") {
            this.left = left.left;
            this.right = left.right;
            this.top = left.top;
            this.bottom = left.bottom;
            const w = right ? right : (left.width ? left.width : this.width);
            const h = top ? top : (left.height ? left.height : this.height);
            if (this.width !== w || this.height !== h) {
                this.resize(w, h);
            }
        } else {
            this.left = left ? left : 0;
            this.right = right ? right : 0;
            this.top = top ? top : 0;
            this.bottom = bottom ? bottom : 0;
        }
        this.UpdateImageData();
    }

    public resize(width: number, height: number) {
        const data = super.resize(width, height);
        this.UpdateImageData();
        return data;
    }

    public UpdateImageData() {
        let width = 0;
        let height = 0;
        if (this.source.width && this.source.width) {
            width = this.source.width;
            height = this.source.height;
        } else if (typeof this.source === "string") {
            const image = this.game.cache.getImage(this.source);
            width = image.width;
            height = image.height;
        } else {
            width = this.left + this.right;
            height = this.top + this.bottom;
        }
        this.cls();
        const leftWidth = this.left;
        const rightWidth = width - this.right;
        const topHeight = this.top;
        const bottomHeight = height - this.bottom;
        const centerWidth = this.right - this.left;
        const centerHeight = this.bottom - this.top;
        const scaleWidth = this.width - leftWidth - rightWidth;
        const scaleHeight = this.height - topHeight - bottomHeight;
        this.copy(this.source, 0, 0, leftWidth, topHeight, 0, 0, leftWidth, topHeight); // 左上
        this.copy(this.source, leftWidth, 0, centerWidth, topHeight, leftWidth, 0, scaleWidth, topHeight); // 上
        this.copy(this.source, leftWidth + centerWidth, 0, rightWidth, topHeight, leftWidth + scaleWidth, 0, rightWidth, topHeight); // 右上
        this.copy(this.source, 0, topHeight, leftWidth, centerHeight, 0, topHeight, leftWidth, scaleHeight); // 左
        this.copy(this.source, leftWidth, topHeight, centerWidth, centerHeight, leftWidth, topHeight, scaleWidth, scaleHeight); // 中
        this.copy(this.source, leftWidth + centerWidth, topHeight, rightWidth, centerHeight, leftWidth + scaleWidth, topHeight, rightWidth, scaleHeight); // 右
        this.copy(this.source, 0, topHeight + centerHeight, leftWidth, bottomHeight, 0, topHeight + scaleHeight, leftWidth, bottomHeight); // 左下
        this.copy(this.source, leftWidth, topHeight + centerHeight, centerWidth, bottomHeight, leftWidth, topHeight + scaleHeight, scaleWidth, bottomHeight); // 下
        this.copy(this.source, leftWidth + centerWidth, topHeight + centerHeight, rightWidth, bottomHeight, leftWidth + scaleWidth, topHeight + scaleHeight, rightWidth, bottomHeight); // 右下
    }
}
