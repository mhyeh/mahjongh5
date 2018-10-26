import * as Dialog from "./ui/SimpleDialog";
export default class ErrorHandler {
    public game: Phaser.Game;

    constructor(game?: Phaser.Game) {
        if (game) {
            this.game = game;
        }
    }

    /**
     * 顯示錯誤訊息
     * @param error 錯誤
     */
    public ShowError(error: string | Error): Promise<any> {
        // get error message
        let errorMessage = "Error!";
        if (typeof error === "string") {
            errorMessage = error;
        } else if (error instanceof Error) {
            errorMessage = `[${error.name}]${error.message}`;
        }
        console.log(error);
        // show message
        if (this.game) {
            return Dialog.ShowOKDialog(this.game, errorMessage);
        } else {
            alert(errorMessage);
            return Promise.resolve();
        }
    }
}
