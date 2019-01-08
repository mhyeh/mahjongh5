import UIController from "mahjongh5/component/UIController";
import Button from "mahjongh5/ui/Button";
import MultiThemeButton from "mahjongh5/ui/MultiThemeButton";
import Account from "mahjongh5/data/Account";
import NumberFormatter from "mahjongh5/ui/NumberFormatter";
export default class MahjongUI extends UIController {
    // 其他UI物件
    public accountDisplayer:   NumberFormatter<Phaser.BitmapText>;
    public totalWinDisplayer:  NumberFormatter<Phaser.BitmapText>;
    public betDisplayer:       NumberFormatter<Phaser.BitmapText>;
    public rateDisplayer:      Phaser.BitmapText;
    public messageText:        Phaser.BitmapText;

    // UI音效 // 照 NewPoseidon 設定的 不確定有沒有新的音效
    public spinSound:     Phaser.Sound;
    public countSound:    Phaser.Sound;
    public countEndSound: Phaser.Sound;
    public betSound:      Phaser.Sound;
    public betMaxSound:   Phaser.Sound;
    public roundSound:    Phaser.Sound;

    public infoNextButton:     Button;
    public infoPreviousButton: Button;
    public settingButton:      Button;
    public cancelHelpButton:   Button;
    public checkButton:        Button;
    public readyButton:        Button;

    public avatar: Button[];

    // public autoStartButton:    Button;
    // public saveSeatButton: Button;
    // public bottomMainButton: Button;

    // UI value getter & setter
    public set accountValue(value: Account) {
        if (this.accountDisplayer) {
            this.accountDisplayer.value = value.Credit;
        }
    }

    constructor() {
        super();
        // 設定UI樣式設定
    }

    /**
     * 重新整理全部UI
     */
    public Refresh() {
        if (this.accountDisplayer) {
            this.accountDisplayer.UpdateText();
        }
        if (this.totalWinDisplayer) {
            this.totalWinDisplayer.UpdateText();
        }
        if (this.betDisplayer) {
            this.betDisplayer.UpdateText();
        }
    }
}
