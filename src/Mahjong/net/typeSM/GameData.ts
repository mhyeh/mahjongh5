export default class GameData {
    /** 應該是遊戲後台的數學計算版本 */
    public version: string;

    constructor(data?: any);
    constructor(version: any);
    constructor(...data: any[]) {
        if (data.length === 1) {
            this.version = data[0].Version;
        } else if (data.length === 9) {
            this.version = data[4];
        }
    }
}
