let GridState = {
    empty: 0,
    black: 1,
    white: -1,
};

let Player = {
    black: 1,
    white: -1,
};

class Reversi {
    constructor(recode) {
        recode = (recode || "").toLowerCase();
        this.recode = recode;
        this.currentPlayer = Player.black;
        this.isFinished = false;

        this._board = new Board();
        this._board.setState(GridState.white, 3, 3);
        this._board.setState(GridState.black, 3, 4);
        this._board.setState(GridState.black, 4, 3);
        this._board.setState(GridState.white, 4, 4);

        this._mobility = new Board();

        let out_mobility = {};
        Board.mobility(this._board.upperBlack, this._board.lowerBlack, this._board.upperWhite, this._board.lowerWhite, out_mobility);

        this._mobility.upperBlack = out_mobility.upperMobility;
        this._mobility.lowerBlack = out_mobility.lowerMobility;

        for (let i = 0; i < recode.length; i += 2) {
            let h = "abcdefgh".indexOf(recode[i]);
            let v = +recode[i + 1] || -1;
            v -= 1;

            if (h === -1 || v === -1) break;

            if (this._mobility.getStateAt(h, v) !== GridState.empty) {
                this.putStoneAt(h, v);
                this.switchPlayer();
            }
            else break;
        }
    }

    switchPlayer() {
        if (this.isFinished) return;

        this.currentPlayer *= -1;

        let out_blacksMobility = {};
        let out_whitesMobility = {};

        Board.mobility(this._board.upperBlack, this._board.lowerBlack, this._board.upperWhite, this._board.lowerWhite, out_blacksMobility);
        Board.mobility(this._board.upperWhite, this._board.lowerWhite, this._board.upperBlack, this._board.lowerBlack, out_whitesMobility);

        let blacksMobilityCount = Utils.popCount64(out_blacksMobility.upperMobility, out_blacksMobility.lowerMobility);
        let whitesMobilityCount = Utils.popCount64(out_whitesMobility.upperMobility, out_whitesMobility.lowerMobility);

        if (blacksMobilityCount === 0) {
            if (whitesMobilityCount === 0) {
                this.isFinished = true;
                return;
            }
            this.currentPlayer = Player.white;
            this._mobility.upperBlack = out_whitesMobility.upperMobility;
            this._mobility.lowerBlack = out_whitesMobility.lowerMobility;
        }
        else if (whitesMobilityCount === 0) {
            this.currentPlayer = Player.black;
            this._mobility.upperBlack = out_blacksMobility.upperMobility;
            this._mobility.lowerBlack = out_blacksMobility.lowerMobility;
        }
        else if (this.currentPlayer === Player.black) {
            this._mobility.upperBlack = out_blacksMobility.upperMobility;
            this._mobility.lowerBlack = out_blacksMobility.lowerMobility;
        }
        else if (this.currentPlayer === Player.white) {
            this._mobility.upperBlack = out_whitesMobility.upperMobility;
            this._mobility.lowerBlack = out_whitesMobility.lowerMobility;
        }
    }

    getCurrentBoard() {
        return this._board.clone();
    }

    getCurrentMobility() {
        return this._mobility.clone();
    }

    putStoneAt(h, v) {
        if (this.isFinished || this._mobility.getStateAt(h, v) === GridState.empty) return;

        let out_flip = {};
        let moveBit = Board.getMoveBit(h, v);

        let uplr = this.currentPlayer === Player.black ? this._board.upperBlack : this._board.upperWhite;
        let lplr = this.currentPlayer === Player.black ? this._board.lowerBlack : this._board.lowerWhite;
        let uopnt = -this.currentPlayer === Player.black ? this._board.upperBlack : this._board.upperWhite;
        let lopnt = -this.currentPlayer === Player.black ? this._board.lowerBlack : this._board.lowerWhite;
        let uplrFlp = Utils.flipVertical(lplr);
        let lplrFlp = Utils.flipVertical(uplr);
        let uopntFlp = Utils.flipVertical(lopnt);
        let lopntFlp = Utils.flipVertical(uopnt);

        if (v < 4) {
            Board.flipOnUpperMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, out_flip);
            this._board.upperBlack ^= out_flip.upperFlip;
            this._board.upperWhite ^= out_flip.upperFlip;
            this._board.lowerBlack ^= out_flip.lowerFlip;
            this._board.lowerWhite ^= out_flip.lowerFlip;
            this._board.upperBlack |= this.currentPlayer === Player.black ? moveBit : 0;
            this._board.upperWhite |= this.currentPlayer === Player.white ? moveBit : 0;
        }
        else {
            Board.flipOnLowerMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, out_flip);
            this._board.upperBlack ^= out_flip.upperFlip;
            this._board.upperWhite ^= out_flip.upperFlip;
            this._board.lowerBlack ^= out_flip.lowerFlip;
            this._board.lowerWhite ^= out_flip.lowerFlip;
            this._board.lowerBlack |= this.currentPlayer === Player.black ? moveBit : 0;
            this._board.lowerWhite |= this.currentPlayer === Player.white ? moveBit : 0;
        }

        this.recode += "abcdefgh"[h] + (v + 1);
    }
}