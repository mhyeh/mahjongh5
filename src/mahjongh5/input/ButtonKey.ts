enum ButtonKey {
    None   = 0b000000000,
    Pon    = 0b000000001,
    Gon    = 0b000001110,
    Hu     = 0b000110000,
    Throw  = 0b001000000,
    Eat    = 0b010000000,
    enter      = -1,
    command    = -2,
    lack       = -3,
    chooseCard = -4,
}

export default ButtonKey;
