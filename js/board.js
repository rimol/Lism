class Board {
    constructor() {
        this.upperBlack = this.lowerBlack = this.upperWhite = this.lowerWhite = 0;
    }

    getStateAt(h, v) {
        if (h < 0 || h >= 8 || v < 0 || v >= 8) return 0xffffffff;

        let pos = 1 << ((7 - h) | ((3 - (v & 3)) << 3));

        return v < 4
            ? this.upperBlack & pos
                ? GridState.black
                : this.upperWhite & pos ? GridState.white
                    : GridState.empty
            : this.lowerBlack & pos
                ? GridState.black
                : this.lowerWhite & pos ? GridState.white
                    : GridState.empty;
    }

    setState(stoneType, h, v) {
        if (h < 0 || h >= 8 || v < 0 || v >= 8) return;

        let pos = 1 << ((7 - h) | ((3 - (v & 3)) << 3));

        switch (stoneType) {
            case GridState.black:
                if (v < 4) {
                    this.upperBlack |= pos;
                    this.upperWhite &= ~pos;
                }
                else {
                    this.lowerBlack |= pos;
                    this.lowerWhite &= ~pos;
                }
                break;
            case GridState.white:
                if (v < 4) {
                    this.upperBlack &= ~pos;
                    this.upperWhite |= pos;
                }
                else {
                    this.lowerBlack &= ~pos;
                    this.lowerWhite |= pos;
                }
                break;
            case GridState.empty:
                if (v < 4) {
                    this.upperBlack &= ~pos;
                    this.upperWhite &= ~pos;
                }
                else {
                    this.lowerBlack &= ~pos;
                    this.lowerWhite &= ~pos;
                }
                break;
        }
    }

    clone() {
        let cloneBoard = new Board();
        cloneBoard.upperBlack = this.upperBlack;
        cloneBoard.lowerBlack = this.lowerBlack;
        cloneBoard.upperWhite = this.upperWhite;
        cloneBoard.lowerWhite = this.lowerWhite;
        return cloneBoard;
    }

    getStoneCount() {
        return Utils.popCount64(this.upperBlack + this.upperWhite, this.lowerBlack + this.lowerWhite);
    }

    getBlackCount() {
        return Utils.popCount64(this.upperBlack, this.lowerBlack);
    }

    getWhiteCount() {
        return Utils.popCount64(this.upperWhite, this.lowerWhite);
    }

    getDifference(board) {
        let difference = new Board();
        difference.upperBlack = this.upperBlack ^ board.upperBlack;
        difference.upperWhite = this.upperWhite ^ board.upperWhite;
        difference.lowerBlack = this.lowerBlack ^ board.lowerBlack;
        difference.lowerWhite = this.lowerWhite ^ board.lowerWhite;
        return difference;
    }

    equals(board) {
        return this.upperBlack === board.upperBlack && this.lowerBlack === board.lowerBlack && this.upperWhite === board.upperWhite && this.lowerWhite === board.lowerWhite;
    }

    print() {
        let string = " A B C D E F G H\n";
        for (let v = 0; v < 8; v++) {
            string += v + 1;
            for (let h = 0; h < 8; h++) {
                let stone = this.getStateAt(h, v);
                string += stone == GridState.black ? "黒"
                    : stone == GridState.white ? "白"
                        : "ー";
            }
            string += "\n";
        }
        console.log(string);
    }
}

Board.getMoveBit = function(h, v) {
    return 1 << ((7 - h) | ((3 - (v & 3)) << 3));
};

//借り物: https://github.com/saharan/ReversiAI/blob/master/src/reversi/core/Board.hx
Board.mobility = function (upperPlr, lowerPlr, upperOpnt, lowerOpnt, out_mobility) {
    let upperMobility = 0;
    let lowerMobility = 0;

    let umo = upperOpnt & 0x7e7e7e7e;
    let lmo = lowerOpnt & 0x7e7e7e7e;
    let ueg = ~(upperPlr | upperOpnt);
    let leg = ~(lowerPlr | lowerOpnt);

    let ut = (upperPlr >>> 1) & umo;
    ut |= (ut >>> 1) & umo;
    ut |= (ut >>> 1) & umo;
    ut |= (ut >>> 1) & umo;
    ut |= (ut >>> 1) & umo;
    ut |= (ut >>> 1) & umo;

    let lt = (lowerPlr >>> 1) & lmo;
    lt |= (lt >>> 1) & lmo;
    lt |= (lt >>> 1) & lmo;
    lt |= (lt >>> 1) & lmo;
    lt |= (lt >>> 1) & lmo;
    lt |= (lt >>> 1) & lmo;

    upperMobility |= (ut >>> 1) & ueg;
    lowerMobility |= (lt >>> 1) & leg;

    ut = (upperPlr << 1) & umo;
    ut |= (ut << 1) & umo;
    ut |= (ut << 1) & umo;
    ut |= (ut << 1) & umo;
    ut |= (ut << 1) & umo;
    ut |= (ut << 1) & umo;

    lt = (lowerPlr << 1) & lmo;
    lt |= (lt << 1) & lmo;
    lt |= (lt << 1) & lmo;
    lt |= (lt << 1) & lmo;
    lt |= (lt << 1) & lmo;
    lt |= (lt << 1) & lmo;

    upperMobility |= (ut << 1) & ueg;
    lowerMobility |= (lt << 1) & leg;

    umo = upperOpnt & 0x00ffffff;
    lmo = lowerOpnt & 0xffffff00;

    lt = (lowerPlr << 8) & lmo;
    lt |= (lt << 8) & lmo;
    lt |= (lt << 8) & lmo;

    let ovf = lt >>> 24;
    ut = ((upperPlr << 8) | (lowerPlr >>> 24) | ovf) & umo;
    ut |= ((ut << 8) | ovf) & umo;
    ut |= ((ut << 8) | ovf) & umo;

    upperMobility |= ((ut << 8) | ovf) & ueg;
    lowerMobility |= (lt << 8) & leg;

    ut = (upperPlr >>> 8) & umo;
    ut |= (ut >>> 8) & umo;
    ut |= (ut >>> 8) & umo;

    ovf = ut << 24;
    lt = ((lowerPlr >>> 8) | (upperPlr << 24) | ovf) & lmo;
    lt |= ((lt >>> 8) | ovf) & lmo;
    lt |= ((lt >>> 8) | ovf) & lmo;

    upperMobility |= (ut >>> 8) & ueg;
    lowerMobility |= ((lt >>> 8) | ovf) & leg;

    umo = upperOpnt & 0x007e7e7e;
    lmo = lowerOpnt & 0x7e7e7e00;

    lt = (lowerPlr << 9) & lmo;
    lt |= (lt << 9) & lmo;
    lt |= (lt << 9) & lmo;

    ovf = lt >>> 23;
    ut = ((upperPlr << 9) | (lowerPlr >>> 23) | ovf) & umo;
    ut |= ((ut << 9) | ovf) & umo;
    ut |= ((ut << 9) | ovf) & umo;

    upperMobility |= ((ut << 9) | ovf) & ueg;
    lowerMobility |= (lt << 9) & leg;

    lt = (lowerPlr << 7) & lmo;
    lt |= (lt << 7) & lmo;
    lt |= (lt << 7) & lmo;

    ovf = lt >>> 25;
    ut = ((upperPlr << 7) | (lowerPlr >>> 25) | ovf) & umo;
    ut |= ((ut << 7) | ovf) & umo;
    ut |= ((ut << 7) | ovf) & umo;

    upperMobility |= ((ut << 7) | ovf) & ueg;
    lowerMobility |= (lt << 7) & leg;

    ut = (upperPlr >>> 7) & umo;
    ut |= (ut >>> 7) & umo;
    ut |= (ut >>> 7) & umo;

    ovf = ut << 25;
    lt = ((lowerPlr >>> 7) | (upperPlr << 25) | ovf) & lmo;
    lt |= ((lt >>> 7) | ovf) & lmo;
    lt |= ((lt >>> 7) | ovf) & lmo;

    upperMobility |= (ut >>> 7) & ueg;
    lowerMobility |= ((lt >>> 7) | ovf) & leg;

    ut = (upperPlr >>> 9) & umo;
    ut |= (ut >>> 9) & umo;
    ut |= (ut >>> 9) & umo;

    ovf = ut << 23;
    lt = ((lowerPlr >>> 9) | (upperPlr << 23) | ovf) & lmo;
    lt |= ((lt >>> 9) | ovf) & lmo;
    lt |= ((lt >>> 9) | ovf) & lmo;

    upperMobility |= (ut >>> 9) & ueg;
    lowerMobility |= ((lt >>> 9) | ovf) & leg;

    out_mobility.upperMobility = upperMobility;
    out_mobility.lowerMobility = lowerMobility;
};

{
    const tzcnt = Utils.tzcnt;

    Board.flipOnUpperMove = function (uplr = 0, lplr = 0, uopnt = 0, lopnt = 0, uplrFlp = 0, lplrFlp = 0, uopntFlp = 0, lopntFlp = 0, moveBit = 0, out_flip = {}) {
        let movePos = tzcnt(moveBit);
        let upperFlip = 0;
        let lowerFlip = 0;

        let umo = uopnt & 0x7e7e7e7e;
        let lmo = lopnt & 0x7e7e7e7e;

        let um = 0x000000fe << movePos;
        let ut = (umo | ~um) + 1 & um & uplr;
        upperFlip |= ut - (ut !== 0) & um;

        um = 0x08040200 << movePos;
        ut = (umo | ~um) + 1 & um & uplr;
        upperFlip |= ut - (ut !== 0) & um;

        um = 0x01010100 << movePos;
        ut = (uopnt | ~um) + 1 & um & uplr;
        upperFlip |= ut - (ut !== 0) & um;

        um = 0x00204080 << movePos;
        ut = (umo | ~um) + 1 & um & uplr;
        upperFlip |= ut - (ut !== 0) & um;

        ut = umo & moveBit >>> 1;
        ut |= umo & ut >>> 1;
        ut |= umo & ut >>> 1;
        ut |= umo & ut >>> 1;
        ut |= umo & ut >>> 1;
        ut |= umo & ut >>> 1;

        upperFlip |= ut & -((ut >>> 1 & uplr) !== 0);

        movePos = movePos & 0b111 | 0b11000 - (movePos & 0b11000);
        moveBit = 1 << movePos;
        let _upperFlip = 0;
        let _lowerFlip = 0;

        umo = uopntFlp & 0x7e7e7e7e;
        lmo = lopntFlp & 0x7e7e7e7e;

        let lm = 0x08040200 << movePos;
        um = 0x80402010 << movePos | 0x08040200 >>> 31 - movePos >>> 1;

        let lt = (lmo | ~lm) + 1;
        ut = (umo | ~um) + (lt === 0) & um & uplrFlp;
        lt = lt & lm & lplrFlp;
        lt -= (ut | lt) !== 0;
        ut -= lt === -1;

        _lowerFlip |= lt & lm;
        _upperFlip |= ut & um;

        lm = 0x01010100 << movePos;
        um = 0x01010101 << (movePos & 0b0111);

        lt = (lopntFlp | ~lm) + 1;
        ut = (uopntFlp | ~um) + (lt === 0) & um & uplrFlp;
        lt = lt & lm & lplrFlp;

        lt -= (ut | lt) !== 0;
        ut -= lt === -1;

        _lowerFlip |= lt & lm;
        _upperFlip |= ut & um;

        lm = 0x10204080 << movePos;
        um = 0x00020408 << movePos | 0x10204080 >>> 31 - movePos >>> 1;

        lt = (lmo | ~lm) + 1;
        ut = (umo | ~um) + (lt === 0) & um & uplrFlp;
        lt = lt & lm & lplrFlp;

        lt -= (ut | lt) !== 0;
        ut -= lt === -1;

        _lowerFlip |= lt & lm;
        _upperFlip |= ut & um;

        upperFlip |= _lowerFlip << 24 | _lowerFlip << 8 & 0x00ff0000 | _lowerFlip >>> 8 & 0x0000ff00 | _lowerFlip >>> 24;
        lowerFlip |= _upperFlip << 24 | _upperFlip << 8 & 0x00ff0000 | _upperFlip >>> 8 & 0x0000ff00 | _upperFlip >>> 24;

        out_flip.upperFlip = upperFlip;
        out_flip.lowerFlip = lowerFlip;
    };

    Board.flipOnLowerMove = function (uplr = 0, lplr = 0, uopnt = 0, lopnt = 0, uplrFlp = 0, lplrFlp = 0, uopntFlp = 0, lopntFlp = 0, moveBit = 0, out_flip = {}) {
        let movePos = tzcnt(moveBit);
        let upperFlip = 0;
        let lowerFlip = 0;

        let umo = uopnt & 0x7e7e7e7e;
        let lmo = lopnt & 0x7e7e7e7e;

        let lm = 0x000000fe << movePos;
        let lt = (lmo | ~lm) + 1 & lm & lplr;
        lowerFlip |= lt - (lt !== 0) & lm;

        lm = 0x08040200 << movePos;
        let um = 0x80402010 << movePos | 0x08040200 >>> 31 - movePos >>> 1;

        lt = (lmo | ~lm) + 1;
        let ut = (umo | ~um) + (lt === 0) & um & uplr;
        lt = lt & lm & lplr;

        lt -= (ut | lt) !== 0;
        ut -= lt === -1;

        lowerFlip |= lt & lm;
        upperFlip |= ut & um;

        lm = 0x01010100 << movePos;
        um = 0x01010101 << (movePos & 0b0111);

        lt = (lopnt | ~lm) + 1;
        ut = (uopnt | ~um) + (lt === 0) & um & uplr;
        lt = lt & lm & lplr;

        lt -= (ut | lt) !== 0;
        ut -= lt === -1;

        lowerFlip |= lt & lm;
        upperFlip |= ut & um;

        lm = 0x10204080 << movePos;
        um = 0x00020408 << movePos | 0x10204080 >>> 31 - movePos >>> 1;

        lt = (lmo | ~lm) + 1;
        ut = (umo | ~um) + (lt === 0) & um & uplr;
        lt = lt & lm & lplr;

        lt -= (ut | lt) !== 0;
        ut -= lt === -1;

        lowerFlip |= lt & lm;
        upperFlip |= ut & um;

        lt = lmo & moveBit >>> 1;
        lt |= lmo & lt >>> 1;
        lt |= lmo & lt >>> 1;
        lt |= lmo & lt >>> 1;
        lt |= lmo & lt >>> 1;
        lt |= lmo & lt >>> 1;

        lowerFlip |= lt & -((lt >>> 1 & lplr) !== 0);

        movePos = movePos & 0b0111 | 0b11000 - (movePos & 0b11000);
        moveBit = 1 << movePos;
        let _upperFlip = 0;
        let _lowerFlip = 0;

        umo = uopntFlp & 0x7e7e7e7e;
        lmo = lopntFlp & 0x7e7e7e7e;

        um = 0x08040200 << movePos;
        ut = (umo | ~um) + 1 & um & uplrFlp;
        _upperFlip |= ut - (ut !== 0) & um;

        um = 0x01010100 << movePos;
        ut = (uopntFlp | ~um) + 1 & um & uplrFlp;
        _upperFlip |= ut - (ut !== 0) & um;

        um = 0x00204080 << movePos;
        ut = (umo | ~um) + 1 & um & uplrFlp;
        _upperFlip |= ut - (ut !== 0) & um;

        upperFlip |= _lowerFlip << 24 | _lowerFlip << 8 & 0x00ff0000 | _lowerFlip >>> 8 & 0x0000ff00 | _lowerFlip >>> 24;
        lowerFlip |= _upperFlip << 24 | _upperFlip << 8 & 0x00ff0000 | _upperFlip >>> 8 & 0x0000ff00 | _upperFlip >>> 24;

        out_flip.upperFlip = upperFlip;
        out_flip.lowerFlip = lowerFlip;
    };

}