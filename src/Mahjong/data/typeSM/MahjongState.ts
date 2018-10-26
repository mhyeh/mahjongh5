import { COMMAND_TYPE } from "./MahjongArgs";

export default class MahjongState {
    public deckCount: number;
    public hand: number[];
    public actPlayer: number;
    public command: COMMAND_TYPE;
    public actCard: number;

    constructor(data: any) {
        this.deckCount = data.deckCount;
        this.hand = data.hand;
        this.actPlayer = data.actPlayer;
        this.command = data.command;
        this.actCard = data.actCard;
    }
}
