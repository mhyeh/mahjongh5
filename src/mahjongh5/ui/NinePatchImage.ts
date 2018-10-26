export default class NinePatchImage extends Phaser.Image {
    public horizontalBorder: number;
    public verticalBorder: number;
    private patchInfo: { left: number, right: number, top: number, bottom: number, width?: number, height?: number };
    private patchs: PIXI.Sprite[];
    private prevAnchor: Phaser.Point = new Phaser.Point();

    constructor(game: Phaser.Game, x: number, y: number, key: string | Phaser.RenderTexture | Phaser.BitmapData | PIXI.Texture, frame: string | number, positoin: { left: number, right: number, top: number, bottom: number, width?: number, height?: number }, width?: number, height?: number);
    constructor(game: Phaser.Game, x: number, y: number, key: string | Phaser.RenderTexture | Phaser.BitmapData | PIXI.Texture, frame: string | number, left: number, right: number, top: number, bottom: number, width?: number, height?: number);
    constructor(game: Phaser.Game, x: number, y: number, key: string | Phaser.RenderTexture | Phaser.BitmapData | PIXI.Texture, frame: string | number, left: number | { left: number, right: number, top: number, bottom: number, width?: number, height?: number }, right?: number, top?: number, bottom?: number, width?: number, height?: number) {
        super(game, x, y, key, frame);
        if (typeof left !== "number") {
            this.patchInfo = left;
            width = right !== undefined ? right : left.width;
            height = top !== undefined ? top : left.height;
        } else {
            this.patchInfo = {
                left: left || 0,
                right: right || 0,
                top: top || 0,
                bottom: bottom || 0,
            };
        }
        this.UpdatePatch();
        this.width = width !== undefined ? width : super.width;
        this.height = height !== undefined ? height : super.height;
        this.texture.valid = false;
        this.hitArea = {
            contains: (localx: number, localy: number) => {
                localx += this.anchor.x * this.patchInfo.width;
                localy += this.anchor.y * this.patchInfo.height;
                return localx >= 0 && localy >= 0 && localx < this.patchInfo.width && localy < this.patchInfo.height;
            },
        };
    }

    public get width(): number {
        return this.patchInfo.width;
    }
    public set width(value: number) {
        this.patchInfo.width = value > this.horizontalBorder ? value : this.horizontalBorder;
        this.UpdatePatchPosition();
    }

    public get height(): number {
        return this.patchInfo.height;
    }
    public set height(value: number) {
        this.patchInfo.height = value > this.verticalBorder ? value : this.verticalBorder;
        this.UpdatePatchPosition();
    }

    public preUpdate(this: any) {
        if (this.pendingDestroy) {
            this.destroy();
            return false;
        }

        this.previousPosition.set(this.world.x, this.world.y);
        this.previousRotation = this.rotation;

        if (!this.exists || !this.parent.exists) {
            this.renderOrderID = -1;
            return false;
        }

        this.world.setTo(this.game.camera.x + this.worldTransform.tx, this.game.camera.y + this.worldTransform.ty);

        if (this.visible) {
            this.renderOrderID = this.game.stage.currentRenderOrderID++;
        }

        if (this.animations) {
            this.animations.update();
        }

        if (this.body) {
            this.body.preUpdate();
        }

        return true;
    }

    public postUpdate() {

    }

    public updateTransform() {
        if (!this.anchor.equals(this.prevAnchor)) {
            this.UpdatePatchPosition();
            this.prevAnchor.copyFrom(this.anchor);
        }
        super.updateTransform();
    }

    /**
     * Returns the bounds of the Sprite as a rectangle.
     * The bounds calculation takes the worldTransform into account.
     *
     * It is important to note that the transform is not updated when you call this method.
     * So if this Sprite is the child of a Display Object which has had its transform
     * updated since the last render pass, those changes will not yet have been applied
     * to this Sprites worldTransform. If you need to ensure that all parent transforms
     * are factored into this getBounds operation then you should call `updateTransform`
     * on the root most object in this Sprites display list first.
     *
     * @method PIXI.Sprite#getBounds
     * @param matrix {Matrix} the transformation matrix of the sprite
     * @return {Rectangle} the framing rectangle
     */
    public getBounds(this: any, matrix: PIXI.Matrix) {
        const width = this.patchInfo.width; // 只改了這兩行
        const height = this.patchInfo.height; // 只改了這兩行

        let w0 = width * (1 - this.anchor.x);
        let w1 = width * -this.anchor.x;

        let h0 = height * (1 - this.anchor.y);
        let h1 = height * -this.anchor.y;

        const worldTransform = matrix || this.worldTransform;

        let a = worldTransform.a;
        const b = worldTransform.b;
        const c = worldTransform.c;
        let d = worldTransform.d;
        const tx = worldTransform.tx;
        const ty = worldTransform.ty;

        let maxX = -Infinity;
        let maxY = -Infinity;

        let minX = Infinity;
        let minY = Infinity;

        if (b === 0 && c === 0) {
            // scale may be negative!
            if (a < 0) {
                a *= -1;
                const temp = w0;
                w0 = -w1;
                w1 = -temp;
            }

            if (d < 0) {
                d *= -1;
                const temp = h0;
                h0 = -h1;
                h1 = -temp;
            }

            // this means there is no rotation going on right? RIGHT?
            // if thats the case then we can avoid checking the bound values! yay
            minX = a * w1 + tx;
            maxX = a * w0 + tx;
            minY = d * h1 + ty;
            maxY = d * h0 + ty;
        } else {
            const x1 = a * w1 + c * h1 + tx;
            const y1 = d * h1 + b * w1 + ty;

            const x2 = a * w0 + c * h1 + tx;
            const y2 = d * h1 + b * w0 + ty;

            const x3 = a * w0 + c * h0 + tx;
            const y3 = d * h0 + b * w0 + ty;

            const x4 = a * w1 + c * h0 + tx;
            const y4 = d * h0 + b * w1 + ty;

            minX = x1 < minX ? x1 : minX;
            minX = x2 < minX ? x2 : minX;
            minX = x3 < minX ? x3 : minX;
            minX = x4 < minX ? x4 : minX;

            minY = y1 < minY ? y1 : minY;
            minY = y2 < minY ? y2 : minY;
            minY = y3 < minY ? y3 : minY;
            minY = y4 < minY ? y4 : minY;

            maxX = x1 > maxX ? x1 : maxX;
            maxX = x2 > maxX ? x2 : maxX;
            maxX = x3 > maxX ? x3 : maxX;
            maxX = x4 > maxX ? x4 : maxX;

            maxY = y1 > maxY ? y1 : maxY;
            maxY = y2 > maxY ? y2 : maxY;
            maxY = y3 > maxY ? y3 : maxY;
            maxY = y4 > maxY ? y4 : maxY;
        }

        const bounds = this._bounds;

        bounds.x = minX;
        bounds.width = maxX - minX;

        bounds.y = minY;
        bounds.height = maxY - minY;

        // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
        this._currentBounds = bounds;

        return bounds;
    }

    private UpdatePatch() {
        if (!this.patchs) {
            this.patchs = [];
            for (let i = 0; i < 9; i++) {
                const patch = new PIXI.Sprite(new PIXI.Texture(this.texture.baseTexture));
                this.addChild(patch);
                this.patchs.push(patch);
            }
        }
        const crop = this.texture.crop;
        this.horizontalBorder = this.patchInfo.left + this.texture.crop.width - this.patchInfo.right;
        this.verticalBorder = this.patchInfo.top + this.texture.crop.height - this.patchInfo.bottom;
        this.patchs[0].texture.setFrame(new PIXI.Rectangle(crop.x, crop.y, this.patchInfo.left, this.patchInfo.top));
        this.patchs[1].texture.setFrame(new PIXI.Rectangle(crop.x + this.patchInfo.left, crop.y, this.patchInfo.right - this.patchInfo.left, this.patchInfo.top));
        this.patchs[2].texture.setFrame(new PIXI.Rectangle(crop.x + this.patchInfo.right, crop.y, crop.width - this.patchInfo.right, this.patchInfo.top));
        this.patchs[3].texture.setFrame(new PIXI.Rectangle(crop.x, crop.y + this.patchInfo.top, this.patchInfo.left, this.patchInfo.bottom - this.patchInfo.top));
        this.patchs[4].texture.setFrame(new PIXI.Rectangle(crop.x + this.patchInfo.left, crop.y + this.patchInfo.top, this.patchInfo.right - this.patchInfo.left, this.patchInfo.bottom - this.patchInfo.top));
        this.patchs[5].texture.setFrame(new PIXI.Rectangle(crop.x + this.patchInfo.right, crop.y + this.patchInfo.top, crop.width - this.patchInfo.right, this.patchInfo.bottom - this.patchInfo.top));
        this.patchs[6].texture.setFrame(new PIXI.Rectangle(crop.x, crop.y + this.patchInfo.bottom, this.patchInfo.left, crop.height - this.patchInfo.bottom));
        this.patchs[7].texture.setFrame(new PIXI.Rectangle(crop.x + this.patchInfo.left, crop.y + this.patchInfo.bottom, this.patchInfo.right - this.patchInfo.left, crop.height - this.patchInfo.bottom));
        this.patchs[8].texture.setFrame(new PIXI.Rectangle(crop.x + this.patchInfo.right, crop.y + this.patchInfo.bottom, crop.width - this.patchInfo.right, crop.height - this.patchInfo.bottom));
    }

    private UpdatePatchPosition() {
        const offsetX = this.patchInfo.width * -this.anchor.x;
        const offsetY = this.patchInfo.height * -this.anchor.y;
        this.patchs[0].position.x = this.patchs[3].position.x = this.patchs[6].position.x = offsetX;
        this.patchs[0].position.y = this.patchs[1].position.y = this.patchs[2].position.y = offsetY;
        this.patchs[1].position.x = this.patchs[4].position.x = this.patchs[7].position.x = offsetX + this.patchInfo.left;
        this.patchs[3].position.y = this.patchs[4].position.y = this.patchs[5].position.y = offsetY + this.patchInfo.top;
        this.patchs[2].position.x = this.patchs[5].position.x = this.patchs[8].position.x = offsetX + this.patchInfo.width - this.texture.crop.width + this.patchInfo.right;
        this.patchs[6].position.y = this.patchs[7].position.y = this.patchs[8].position.y = offsetY + this.patchInfo.height - this.texture.crop.height + this.patchInfo.bottom;
        this.patchs[1].scale.x = this.patchs[4].scale.x = this.patchs[7].scale.x = (this.patchInfo.width - this.horizontalBorder) / (this.texture.crop.width - this.horizontalBorder);
        this.patchs[3].scale.y = this.patchs[4].scale.y = this.patchs[5].scale.y = (this.patchInfo.height - this.verticalBorder) / (this.texture.crop.height - this.verticalBorder);
    }

    /**
     * Renders the object using the WebGL renderer
     * 把render自己拿掉
     * this.texture.valid = false 對WebGL沒效
     *
     * @method PIXI.Sprite#_renderWebGL
     * @param renderSession {RenderSession}
     * @param {Matrix} [matrix] - Optional matrix. If provided the Display Object will be rendered using this matrix, otherwise it will use its worldTransform.
     * @private
     */
    private _renderWebGL(this: any, renderSession: any, matrix: PIXI.Matrix) {
        // if the sprite is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.alpha <= 0 || !this.renderable) {
            return;
        }

        // They provided an alternative rendering matrix, so use it
        const wt = matrix || this.worldTransform;

        // A quick check to see if this element has a mask or a filter.
        if (this._mask || this._filters) {
            const spriteBatch = renderSession.spriteBatch;

            // push filter first as we need to ensure the stencil buffer is correct for any masking
            if (this._filters) {
                spriteBatch.flush();
                renderSession.filterManager.pushFilter(this._filterBlock);
            }

            if (this._mask) {
                spriteBatch.stop();
                renderSession.maskManager.pushMask(this.mask, renderSession);
                spriteBatch.start();
            }

            // now loop through the children and make sure they get rendered
            for (const child of this.children) {
                (child as any)._renderWebGL(renderSession);
            }

            // time to stop the sprite batch as either a mask element or a filter draw will happen next
            spriteBatch.stop();

            if (this._mask) {
                renderSession.maskManager.popMask(this._mask, renderSession);
            }

            if (this._filters) {
                renderSession.filterManager.popFilter();
            }

            spriteBatch.start();
        } else {
            // Render children!
            for (const child of this.children) {
                (child as any)._renderWebGL(renderSession, wt);
            }
        }
    }
}
