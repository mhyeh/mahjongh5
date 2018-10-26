/**
 * 在Phaser載入後執行，用來修正一些Phaser的問題
 */
window.scrollLayer = function() {
    document.documentElement.style.height = "120%";

    const scrollElem = document.createElement("div");
    scrollElem.style.position = "fixed";
    scrollElem.style.width = "100%";
    scrollElem.style.height = "100%";
    scrollElem.style.backgroundColor = "#00000080";
    document.getElementById("game").appendChild(scrollElem);

    // Add swipe up picture
    const swipeImg = document.createElement("div");
    swipeImg.innerHTML = require("../icon-fullscreen.svg");
    swipeImg.style.position = "absolute";
    swipeImg.style.width = "600px";
    swipeImg.style.height = "600px";
    swipeImg.style.top = "50%";
    swipeImg.style.left = "50%";
    swipeImg.style.marginLeft = "-260px";
    swipeImg.style.marginTop = "-300px";
    swipeImg.style.fill = "#ffffff";
    scrollElem.appendChild(swipeImg);

    // Get orientation
    const isPortrait = () => document.documentElement.clientWidth < document.documentElement.clientHeight;
    // Save height and orientation
    // 44px is the iPhoneX status bar height
    const info = {
        Portrait: isPortrait() ? window.innerHeight : window.innerWidth - 44,
        Landscape: (isPortrait() ? window.innerWidth : window.innerHeight) - 44,
    };

    // Overlay must be a callback for setTimeout (Thanks iOS Chrome :0)
    let resizeTimeout;
    window.onresize = function () {
        if (resizeTimeout) {
            window.clearTimeout(resizeTimeout);
        }
        resizeTimeout = window.setTimeout(() => {
            // Compare current height to stored height w.r.t. orientation
            if (window.innerHeight <= (isPortrait() ? info.Portrait : info.Landscape)) {
                // Display scroll picture
                scrollElem.hidden = false;
            } else {
                // Hide scroll picture
                scrollElem.hidden = true;
            }
        }, 100);
    };

    // back to top
    let scrollTimeout = null;
    window.onscroll = function () {
        if (scrollTimeout !== null) {
            window.clearTimeout(scrollTimeout);
        }
        scrollTimeout = window.setTimeout(() => {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            scrollTimeout = null;
        }, 200);
    };
}
window.builddate = BUILD_DATE;

Phaser.Component.LoadTexture.prototype.loadTexture =
Phaser.Sprite.prototype.loadTexture =
Phaser.Image.prototype.loadTexture =
Phaser.Rope.prototype.loadTexture =
Phaser.TileSprite.prototype.loadTexture =
// copy from Phaser CE v2.10.3 phaser-no-physics.js
function (key, frame, stopAnimation) {
    if (key === Phaser.PENDING_ATLAS)
    {
        key = frame;
        frame = 0;
    }
    else
    {
        frame = frame || 0;
    }

    if ((stopAnimation || stopAnimation === undefined) && this.animations)
    {
        this.animations.stop();
    }

    this.key = key;
    this.customRender = false;
    var cache = this.game.cache;

    var setFrame = true;
    var smoothed = !this.texture.baseTexture.scaleMode;

    if (Phaser.RenderTexture && key instanceof Phaser.RenderTexture)
    {
        this.key = key.key;
        this.setTexture(key);
    }
    else if (Phaser.BitmapData && key instanceof Phaser.BitmapData)
    {
        this.customRender = true;

        this.setTexture(key.texture);

        if (cache.hasFrameData(key.key, Phaser.Cache.BITMAPDATA))
        {
            setFrame = !this.animations.loadFrameData(cache.getFrameData(key.key, Phaser.Cache.BITMAPDATA), frame);
        }
        else
        {
            setFrame = !this.animations.loadFrameData(key.frameData, 0);
        }
    }
    else if (Phaser.Video && key instanceof Phaser.Video)
    {
        this.customRender = true;

        //  This works from a reference, which probably isn't what we need here
        var valid = key.texture.valid;
        this.setTexture(key.texture);
        this.setFrame(key.texture.frame.clone());
        key.onChangeSource.add(this.resizeFrame, this);
        this.texture.valid = valid;
    }
    else if (Phaser.Tilemap && key instanceof Phaser.TilemapLayer)
    {
        // this.customRender = true;

        this.setTexture(PIXI.Texture.fromCanvas(key.canvas));
    }
    else if (key instanceof PIXI.Texture)
    {
        this.setTexture(key);
        smoothed = !this.texture.baseTexture.scaleMode; // add for fix baseTexture.scaleMode when scaleMode != default
    }
    else
    {
        var img = cache.getImage(key, true);

        this.key = img.key;
        this.setTexture(new PIXI.Texture(img.base));

        if (key === '__default')
        {
            this.texture.baseTexture.skipRender = true;
        }
        else
        {
            this.texture.baseTexture.skipRender = false;
        }

        setFrame = !this.animations.loadFrameData(img.frameData, frame);
    }
    
    if (setFrame)
    {
        this._frame = Phaser.Rectangle.clone(this.texture.frame);
    }

    if (!smoothed)
    {
        this.texture.baseTexture.scaleMode = 1;
    }
}

Phaser.Component.LoadTexture.prototype.setFrame =
Phaser.Sprite.prototype.setFrame =
Phaser.Image.prototype.setFrame =
Phaser.Rope.prototype.setFrame =
Phaser.TileSprite.prototype.setFrame =
// copy from Phaser CE v2.10.0 phaser-split.js
function (frame) {

    this._frame = frame;

    this.texture.frame.x = frame.x;
    this.texture.frame.y = frame.y;
    this.texture.frame.width = frame.width;
    this.texture.frame.height = frame.height;

    this.texture.crop.x = frame.x;
    this.texture.crop.y = frame.y;
    this.texture.crop.width = frame.width;
    this.texture.crop.height = frame.height;

    if (frame.trimmed)
    {
        if (this.texture.trim)
        {
            this.texture.trim.x = frame.spriteSourceSizeX;
            this.texture.trim.y = frame.spriteSourceSizeY;
            this.texture.trim.width = frame.sourceSizeW;
            this.texture.trim.height = frame.sourceSizeH;
        }
        else
        {
            this.texture.trim = { x: frame.spriteSourceSizeX, y: frame.spriteSourceSizeY, width: frame.sourceSizeW, height: frame.sourceSizeH };
        }

        this.texture.width = frame.sourceSizeW;
        this.texture.height = frame.sourceSizeH;
        this.texture.frame.width = frame.sourceSizeW;
        this.texture.frame.height = frame.sourceSizeH;
    }
    else if (!frame.trimmed && this.texture.trim)
    {
        this.texture.trim = null;
    }

    if (frame.rotated)
    {
        this.texture.rotated = true;
    }
    else this.texture.rotated = false; // add for support atlas rotate

    if (this.cropRect)
    {
        this.updateCrop();
    }
    
    this.texture.requiresReTint = true;
    
    this.texture._updateUvs();

    if (this.tilingTexture)
    {
        this.refreshTexture = true;
    }

};

Phaser.Rope.prototype._renderStrip = function (renderSession) {
    var gl = renderSession.gl;
    var projection = renderSession.projection;
    var offset = renderSession.offset;
    var shader = renderSession.shaderManager.stripShader;
    var drawMode = (this.drawMode === Phaser.Rope.TRIANGLE_STRIP) ? gl.TRIANGLE_STRIP : gl.TRIANGLES;
    
    if (!this.batch || (this.batchs && this.batchs.length === 1)) {
        renderSession.blendModeManager.setBlendMode(this.blendMode);

        // set uniforms
        gl.uniformMatrix3fv(shader.translationMatrix, false, this.worldTransform.toArray(true));
        gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
        gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
        gl.uniform1f(shader.alpha, this.worldAlpha);
        if (this.dirty !== false) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
            gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
        }

        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
        gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);

        // check if a texture is dirty..
        if (this.texture.baseTexture._dirty[gl.id]) {
            renderSession.renderer.updateTexture(this.texture.baseTexture);
        } else {
            // bind the current texture
            gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id]);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        if (this.dirty !== false) {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        }
        this.dirty = false;
        gl.drawElements(drawMode, this.indices.length, gl.UNSIGNED_SHORT, 0);
    } else if (this.batchs) {
        // 檢查batchs內容是否有變更
        var childRefresh = !this.lastBatchs;
        if (!childRefresh) {
            for (var i = 0; i < this.batchs.length; i++) {
                if (this.batchs[i] !== this.lastBatchs[i]) {
                    childRefresh = true;
                    break;
                }
            }
        }
        // 檢查每個batch是否為dirty
        var childDirty = childRefresh;
        for (var i = 0; i < this.batchs.length; i++) {
            // 檢查dirty是否不是false也不是1，1表示上次畫batch時處理過了，不用batch畫時還會再處理
            if (this.batchs[i].dirty && this.batchs[i].dirty !== 1) {
                this.batchs[i].dirty = 1;
                childDirty = true;
                break;
            }
        }
        // childDirty與childRefresh用同樣的方式處理
        childDirty = childDirty || childRefresh;
        // 記憶上次batchs
        this.lastBatchs = this.batchs;

        var batchVerticesCount;
        var batchUvsCount;
        var batchIndicesCount;
        var batchVertices;
        var batchUvs;
        var batchIndices;
        if (childDirty) {
            if (!this.batchVertexBuffer) {
                this.batchVertexBuffer = gl.createBuffer();
                this.batchIndexBuffer = gl.createBuffer();
                this.batchUvBuffer = gl.createBuffer();
            }
            batchVerticesCount = batchUvsCount = batchIndicesCount = 0;
            for (var i = 0; i < this.batchs.length; i++) {
                batchVerticesCount += this.batchs[i].vertices.length;
                batchUvsCount += this.batchs[i].uvs.length;
                batchIndicesCount += this.batchs[i].indices.length;
            }
            batchVertices = new Float32Array(batchVerticesCount);
            batchUvs = new Float32Array(batchUvsCount);
            batchIndices = new Uint16Array(batchIndicesCount);
            this.batchVerticesCount = batchVerticesCount;
            this.batchUvsCount = batchUvsCount;
            this.batchIndicesCount = batchIndicesCount;
            // this.batchVertices = batchVertices;
            // this.batchUvs = batchUvs;
            // this.batchIndices = batchIndices;

            var indexOffset = batchVerticesCount = batchUvsCount = batchIndicesCount = 0;
            for (var i = 0; i < this.batchs.length; i++) {
                for (var j = 0; j < this.batchs[i].vertices.length; j++) {
                    batchVertices[batchVerticesCount++] = this.batchs[i].vertices[j];
                }
                for (var j = 0; j < this.batchs[i].uvs.length; j++) {
                    batchUvs[batchUvsCount++] = this.batchs[i].uvs[j];
                }
                for (var j = 0; j < this.batchs[i].indices.length; j++) {
                    batchIndices[batchIndicesCount++] = this.batchs[i].indices[j] + indexOffset;
                }
                indexOffset += this.batchs[i].uvs.length / 2;
            }
        } else {
            batchVerticesCount = 0;
            batchVertices = new Float32Array(this.batchVerticesCount);
            for (var i = 0; i < this.batchs.length; i++) {
                for (var j = 0; j < this.batchs[i].vertices.length; j++) {
                    batchVertices[batchVerticesCount++] = this.batchs[i].vertices[j];
                }
            }
        }

        renderSession.blendModeManager.setBlendMode(this.blendMode);
        gl.uniformMatrix3fv(shader.translationMatrix, false, this.worldTransform.toArray(true));
        gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
        gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
        gl.uniform1f(shader.alpha, this.worldAlpha);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.batchVertexBuffer);
        if (childDirty) {
            gl.bufferData(gl.ARRAY_BUFFER, batchVertices, gl.STATIC_DRAW);
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, batchVertices);
        }
        gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, this.batchUvBuffer);
        if (childDirty) {
            gl.bufferData(gl.ARRAY_BUFFER, batchUvs, gl.STATIC_DRAW);
        }
        gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);

        // check if a texture is dirty..
        if (this.texture.baseTexture._dirty[gl.id]) {
            renderSession.renderer.updateTexture(this.texture.baseTexture);
        } else {
            // bind the current texture
            gl.bindTexture(gl.TEXTURE_2D, this.texture.baseTexture._glTextures[gl.id]);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.batchIndexBuffer);
        if (childDirty) {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, batchIndices, gl.STATIC_DRAW);
        }

        gl.drawElements(drawMode, this.batchIndicesCount, gl.UNSIGNED_SHORT, 0);
    }
};

Phaser.Rope.prototype.__renderCanvas = Phaser.Rope.prototype._renderCanvas;
Phaser.Rope.prototype._renderCanvas = function (renderSession) {
    if (this.visible && this.alpha) {
        this.__renderCanvas(renderSession);
    }
};
