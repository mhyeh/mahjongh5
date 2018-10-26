import * as Phaser from "phaser-ce";
import GameClient from "mahjongh5/net/GameClient";
import Game from "mahjongh5/Game";

export function StartGame<GameClientType extends GameClient>(config: (game: Game) => void, width?: number | string, height?: number | string, renderer?: number, parent?: any) {
    const gameConfig: Phaser.IGameConfig = {
        width,
        height,
        renderer,
        parent,

        enableDebug: false,
        antialias: false,
        multiTexture: false,

        backgroundColor: undefined,
        canvas: undefined,
        canvasId: undefined,
        canvasStyle: undefined,
        disableVisibilityChange: undefined,
        forceSetTimeOut: undefined,
        fullScreenScaleMode: undefined,
        physicsConfig: undefined,
        preserveDrawingBuffer: undefined,
        resolution: undefined,
        scaleMode: undefined,
        seed: undefined,
        state: undefined,
        transparent: undefined,
        // alignH: undefined,
        // alignV: undefined,
        // crisp: undefined,
        // disableStart: undefined,
        // failIfMajorPerformanceCaveat: undefined,
        // fullScreenTarget: undefined,
        // roundPixels: false,
        // scaleH: undefined,
        // scaleV: undefined,
        // trimH: undefined,
        // trimV: undefined,
    };
    const game = new Game(gameConfig);
    config(game);
    game.Start();
}
