import GameClient from "mahjongh5/net/GameClient";
import GameData from "./GameData";
import MahjongResult from "./MahjongResult";
import SlotBetArgs from "../../data/typeSM/MahjongArgs";
import Account from "mahjongh5/data/Account";

export default class GameClientSF extends GameClient<GameData, MahjongResult, SlotBetArgs> {
    protected gameDataType = GameData;
    protected mahjongResultType = MahjongResult;

    constructor(serverHost: string, gameName: string, provider: string, bearer: string) {
        super(serverHost, gameName, "slot", provider, bearer);
    }

    protected GetAllGameData(): Promise<GameData> {
        return Promise.all([
            this.GetGameData("version"),
        ]).then((data) => {
            const gameData = new GameData(...data);
            return gameData;
        });
    }

    protected GetTransactionResult(playID: string = this.playID, stateIndex: number = 1): Promise<MahjongResult> {
        return super.GetTransactionResult(playID, stateIndex).then((data) => {
            return data;
        });
    }
}
