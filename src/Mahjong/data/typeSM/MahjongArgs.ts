export enum COMMAND_TYPE {
    NONE           = 0b0000000,
    COMMAND_PON    = 0b0000001, // 碰
    COMMAND_GON    = 0b0000010, // 直槓
    COMMAND_ONGON  = 0b0000100, // 暗槓
    COMMAND_PONGON = 0b0001000, // 面下槓
    COMMAND_HU     = 0b0010000, // 胡
    COMMAND_ZIMO   = 0b0100000, // 自摸
    COMMAND_THROW  = 0b1000000,
}
