import * as System from "../System";
import { Loadable } from "../load/LoadState";
import NetRequest from "./NetRequest";
import UserData from "../data/UserData";
import Account from "../data/Account";
export default class GameClient<GameDataType = any, SpinResultType = any, BetArgs = any, NextArgs = any, JackpotBroadcastDataType = any> implements Loadable {
    public static readonly version = "v2";
    public loadMessage = "connecting server";

    public serverHost: string;
    public gameName: string;
    public gameType: string;
    public provider: string;
    public bearer: string;
    public updateRoomInterval: number = 30000;
    public jackpotBroadcastData: JackpotBroadcastDataType;
    public connectJackpot: boolean = true;

    protected gameData: GameDataType;
    protected userData: UserData;
    protected gameDataType: System.DataConstructType;
    protected spinResultType: System.DataConstructType;

    protected roomID: string;
    protected playID: string;
    /** {serverHost}/{version}/{Provider}/ */
    protected providerUrl: string;
    /** {serverHost}/{version}/{Provider}/games/{gameType}/{gameName}/rooms/{roomID}/ */
    protected roomUrl: string;
    protected network: NetRequest;
    protected jackpotSocket: WebSocket | undefined;

    private networkErrorSignal: Phaser.Signal;
    private updateSignal: Phaser.Signal;
    private jackpotBroadcastSignal: Phaser.Signal;

    public get GameData(): GameDataType {
        return this.gameData;
    }

    public get UserData(): UserData {
        return this.userData;
    }

    public get onNetworkError() {
        if (!this.networkErrorSignal) {
            this.networkErrorSignal = new Phaser.Signal();
        }
        return this.networkErrorSignal;
    }

    public get onServerUpdate() {
        if (!this.updateSignal) {
            this.updateSignal = new Phaser.Signal();
        }
        return this.updateSignal;
    }

    public get onJackpotBroadcast() {
        if (!this.jackpotBroadcastSignal) {
            this.jackpotBroadcastSignal = new Phaser.Signal();
        }
        return this.jackpotBroadcastSignal;
    }

    constructor(serverHost: string, gameName: string, gameType: string, provider: string, bearer: string) {
        this.serverHost = serverHost;
        this.gameName = gameName;
        this.gameType = gameType;
        this.provider = provider;
        this.bearer = bearer;
        this.providerUrl = this.BuildURL(this.serverHost, GameClient.version, this.provider, "/");
        this.network = new NetRequest(this.bearer);
        this.network.onNetworkError.add(this.OnNetworkErrorHandler, this);
    }

    public LoadStart(progressCallback?: (progress: number) => void): Promise<void> {
        return this.CreateConnection(progressCallback)
            .then(() => {
                this.IntervalUpdateRoom(this.updateRoomInterval);
            });
    }

    public CreateConnection(progressCallback?: (progress: number) => void): Promise<void> {
        return this.CheckVersion()
            .then(() => this.GetAllGameData())
            .then((data) => {
                if (progressCallback) {
                    progressCallback(0.5);
                }
                this.gameData = data;
                return this.UpdateUserData();
            })
            .then((data) => {
                if (progressCallback) {
                    progressCallback(0.75);
                }
                return this.CreateRoom();
            })
            .then(() => { });
    }

    public BuildURL(host: string, ...args: string[]): string {
        let url = host;
        for (const str of args) {
            url += url[url.length - 1] === "/" ? "" : "/";
            url += str[0] === "/" ? str.substr(1) : str;
        }
        return url;
    }

    /** 檢查失敗直接reject，所以沒有回傳值 */
    public CheckVersion(): Promise<void> {
        return this.GetSupportVersion()
            .then((data) => {
                if (!data || data.indexOf(GameClient.version) < 0) {
                    throw new Error(`NetVersion(${GameClient.version}) is not supported, valid versions (${data})`);
                }
            });
    }

    public UpdateUserData(): Promise<UserData> {
        return this.GetUserData()
            .then((data) => {
                this.userData = data;
                return data;
            });
    }

    public GetCurrent(): Promise<SpinResultType> {
        return this.GetRoomCurrent();
    }

    public GetLatestResult(): Promise<SpinResultType> {
        return this.GetTransactionResult();
    }

    protected GetAllGameData(): Promise<GameDataType> {
        return Promise.resolve(this.gameData);
    }

    // game
    protected GetGameTypeList(): Promise<string[]> {
        return this.network.RequestData<string[]>(this.BuildURL(this.providerUrl, "games/"), NetRequest.GET);
    }

    protected GetGameList(gameType: string = this.gameType): Promise<string[]> {
        return this.network.RequestData<string[]>(this.BuildURL(this.providerUrl, "games", gameType, "/"), NetRequest.GET);
    }

    protected GetGameDataFields(): Promise<string[]> {
        return this.network.RequestData<string[]>(this.BuildURL(this.providerUrl, "games", this.gameType, this.gameName, "data/"), NetRequest.GET);
    }

    protected GetGameData<DataType = any>(field: string, dataType?: System.DataConstructType<DataType>): Promise<DataType> {
        return this.network.RequestData<DataType>(this.BuildURL(this.providerUrl, "games", this.gameType, this.gameName, "data", field), NetRequest.GET, undefined, dataType);
    }

    // core
    protected GetUserData(): Promise<UserData> {
        return this.network.RequestData<UserData>(this.BuildURL(this.providerUrl, "me"), NetRequest.GET, undefined, UserData);
    }

    protected GetSupportVersion(): Promise<string[]> {
        return this.network.RequestData<string[]>(this.BuildURL(this.serverHost, "versions"), NetRequest.GET);
    }

    // room
    protected GetRoomList(): Promise<string[]> {
        return this.network.RequestData<string[]>(this.BuildURL(this.providerUrl, "games", this.gameType, this.gameName, "rooms/"), NetRequest.GET);
    }

    protected CreateRoom(): Promise<string> {
        return this.network.RequestData<string>(this.BuildURL(this.providerUrl, "games", this.gameType, this.gameName, "rooms/"), NetRequest.POST);
    }

    protected GetRoomData(): Promise<string> {
        return this.network.RequestData<string>(this.roomUrl, NetRequest.GET);
    }

    protected DestroyRoom(): Promise<any> {
        return this.network.RequestRaw(this.roomUrl, NetRequest.DELETE);
    }

    protected UpdateRoom(): Promise<any> {
        return this.network.RequestRaw(this.roomUrl, NetRequest.PATCH);
    }

    // slot
    protected GetRoomCurrent(): Promise<SpinResultType> {
        return this.network.RequestData<SpinResultType>(this.BuildURL(this.roomUrl, "current"), NetRequest.GET, undefined, this.spinResultType);
    }

    protected GetRoomHistory(): Promise<string> {
        return this.network.RequestData<string>(this.BuildURL(this.roomUrl, "plays/"), NetRequest.GET);
    }

    protected CreateTransaction(betArgs: BetArgs): Promise<string> {
        return this.network.RequestData<string>(this.BuildURL(this.roomUrl, "plays/"), NetRequest.POST, betArgs);
    }

    protected GetTransactionList(playID: string = this.playID): Promise<SpinResultType> {
        return this.network.RequestData<SpinResultType>(this.BuildURL(this.roomUrl, `plays/${playID}/`), NetRequest.GET, undefined, this.spinResultType);
    }

    protected DoTransactionNext(args?: NextArgs, playID: string = this.playID): Promise<number> {
        return this.network.RequestData<number>(this.BuildURL(this.roomUrl, `plays/${playID}/`), NetRequest.POST, args || {});
    }

    protected EndTransaction(playID: string = this.playID): Promise<Account> {
        return this.network.RequestRaw(this.BuildURL(this.roomUrl, `plays/${playID}/`), NetRequest.DELETE)
            .then(([data, header]) => {
                this.userData.account.Value = Number(header["account-value"] || header["Account-Value"] || 0);
                this.userData.currency = header["account-currency"] || header["Account-Currency"] || "";
                return this.userData.account;
            });
    }

    protected UpdateTransaction(playID: string = this.playID): Promise<any> {
        return this.network.RequestRaw(this.BuildURL(this.roomUrl, `plays/${playID}/`), NetRequest.PATCH);
    }

    protected GetTransactionResult(playID: string = this.playID, stateIndex: number = 1): Promise<SpinResultType> {
        return this.network.RequestData<SpinResultType>(this.BuildURL(this.roomUrl, `plays/${playID}/${stateIndex}`), NetRequest.GET, undefined, this.spinResultType);
    }

    private async IntervalUpdateRoom(interval: number) {
        while (true) {
            await System.Delay(interval);
            try {
                const reply = await this.UpdateRoom();
                if (this.updateSignal) {
                    this.updateSignal.dispatch(reply);
                }
            } catch (error) {
                console.log("update fail", error);
            }
        }
    }

    private OnNetworkErrorHandler(error: any) {
        if (this.networkErrorSignal) {
            this.networkErrorSignal.dispatch(error);
        }
    }
}
