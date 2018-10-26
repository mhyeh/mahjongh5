import MahjongState from "../../data/typeSM/MahjongState";

export default class MahjongResult {
    public main: MahjongState;

    constructor(data: any) {
        this.main = new MahjongState(data.Main);
    }
}
