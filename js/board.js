{
    this.Board = function () {
        this._upperBlack = this._lowerBlack = this._upperWhite = this._lowerWhite = 0;
    };

    this.Board.prototype.get = function (h, v) {
        if (h < 0 || h >= 8 || v < 0 || v >= 8) return -1;

        let pos = 1 << (h + (v % 4) * 8);

        return v < 4
            ? this._upperBlack & pos
                ? GridState.black
                : this._upperWhite & pos ? GridState.white
                : GridState.empty
            : this._lowerBlack & pos
                ? GridState.black
                : this._lowerWhite & pos ? GridState.white
                : GridState.empty;
    };

    this.Board.prototype.set = function (state, h, v) {
        if (h < 0 || h >= 8 || v < 0 || v >= 8) return;

        let pos = 1 << (h + (v % 4) * 8);

        switch (state) {
            case GridState.black:
                if (v < 4) {
                    this._upperBlack |= pos;
                    this._upperWhite &= ~pos;
                }
                else {
                    this._lowerBlack |= pos;
                    this._lowerWhite &= ~pos;
                }
                break;
            case GridState.white:
                if (v < 4) {
                    this._upperBlack &= ~pos;
                    this._upperWhite |= pos;
                }
                else {
                    this._lowerBlack &= ~pos;
                    this._lowerWhite |= pos;
                }
                break;
            case GridState.empty:
                if (v < 4) {
                    this._upperBlack &= ~pos;
                    this._upperWhite &= ~pos;
                }
                else {
                    this._lowerBlack &= ~pos;
                    this._lowerWhite &= ~pos;
                }
                break;
        }
    };

    this.Board.prototype.clone = function () {
        let newBoard = new Board();
        newBoard._upperBlack = this._upperBlack;
        newBoard._lowerBlack = this._lowerBlack;
        newBoard._upperWhite = this._upperWhite;
        newBoard._lowerWhite = this._lowerWhite;
        return newBoard;
    };

    this.Board.prototype.getStoneCount = function () {
        let s1 = this._upperBlack | this._upperWhite;
        s1 = (s1 & 0x55555555) + ((s1 & 0xaaaaaaaa) >>> 1);
        s1 = (s1 & 0x33333333) + ((s1 & 0xcccccccc) >>> 2);
        let s2 = this._lowerBlack | this._lowerWhite;
        s2 = (s2 & 0x55555555) + ((s2 & 0xaaaaaaaa) >>> 1);
        s1 += (s2 & 0x33333333) + ((s2 & 0xcccccccc) >>> 2);
        s1 = (s1 & 0x0f0f0f0f) + ((s1 & 0xf0f0f0f0) >>> 4);
        s1 = (s1 & 0x00ff00ff) + ((s1 & 0xff00ff00) >>> 8);
        return (s1 & 0x0000ffff) + ((s1 & 0xffff0000) >>> 16);
    };

    this.Board.prototype.getBlackCount = function () {
        let b1 = (this._upperBlack & 0x55555555) + ((this._upperBlack & 0xaaaaaaaa) >>> 1);
        b1 = (b1 & 0x33333333) + ((b1 & 0xcccccccc) >>> 2);
        let b2 = (this._lowerBlack & 0x55555555) + ((this._lowerBlack & 0xaaaaaaaa) >>> 1);
        b1 += (b2 & 0x33333333) + ((b2 & 0xcccccccc) >>> 2);
        b1 = (b1 & 0x0f0f0f0f) + ((b1 & 0xf0f0f0f0) >>> 4);
        b1 = (b1 & 0x00ff00ff) + ((b1 & 0xff00ff00) >>> 8);
        return (b1 & 0x0000ffff) + ((b1 & 0xffff0000) >>> 16);
    };

    this.Board.prototype.getWhiteCount = function () {
        let w1 = (this._upperWhite & 0x55555555) + ((this._upperWhite & 0xaaaaaaaa) >>> 1);
        w1 = (w1 & 0x33333333) + ((w1 & 0xcccccccc) >>> 2);
        let w2 = (this._lowerWhite & 0x55555555) + ((this._lowerWhite & 0xaaaaaaaa) >>> 1);
        w1 += (w2 & 0x33333333) + ((w2 & 0xcccccccc) >>> 2);
        w1 = (w1 & 0x0f0f0f0f) + ((w1 & 0xf0f0f0f0) >>> 4);
        w1 = (w1 & 0x00ff00ff) + ((w1 & 0xff00ff00) >>> 8);
        return (w1 & 0x0000ffff) + ((w1 & 0xffff0000) >>> 16);
    };

    this.Board.prototype.enumerateNextBoard = function* (attacker) {
        let b1 = this._upperBlack, b2 = this._lowerBlack, w1 = this._upperWhite, w2 = this._lowerWhite;
        let mobility = new Board();

        for (let r = 1; r <= 8; r++) {
            if (r % 2) {
                this.rotate(45);
                mobility.rotate(45);
            }
            else {
                this.rotate(90);
                mobility.rotate(90);
            }

            let pu = attacker == GridState.black ? this._upperBlack : this._upperWhite;
            let pb = attacker == GridState.black ? this._lowerBlack : this._lowerWhite;
            let ou = ~attacker == GridState.black ? this._upperBlack : this._upperWhite;
            let ob = ~attacker == GridState.black ? this._lowerBlack : this._lowerWhite;

            let ou_m = ou & 0x7f7f7f7f;
            let ob_m = ob & 0x7f7f7f7f;

            let pu1 = (pu << 1) & 0xfefefefe;
            let pb1 = (pb << 1) & 0xfefefefe;

            mobility._upperBlack |= (~(pu1 | ou) & (pu1 + ou_m));
            mobility._lowerBlack |= (~(pb1 | ob) & (pb1 + ob_m));

            if (r % 2) {
                this.rotate(-45);
                mobility.rotate(-45);
            }
        }

        mobility._upperBlack &= ~(b1 | w1);
        mobility._lowerBlack &= ~(b2 | w2);

        for (let h = 0; h < 8; h++) {
            for (let v = 0; v < 8; v++) {
                if (mobility.get(h, v) == GridState.empty) continue;

                let h0 = h, v0 = v;

                for (let r = 0; r < 8; r++) {
                    if (r % 2 - 1) {
                        this.rotate(45);
                        v0 = (v0 + h0) % 8;
                    }
                    else {
                        this.rotate(90);
                        v0 += h0;
                        h0 = v0 - h0;
                        v0 = h0 + 7 - v0;
                    }

                    let as = v0 < 4
                        ? attacker == GridState.black
                            ? this._upperBlack & (0x000000ff << ((v0 % 4) * 8))
                            : this._upperWhite & (0x000000ff << ((v0 % 4) * 8))
                        : attacker == GridState.black
                            ? this._lowerBlack & (0x000000ff << ((v0 % 4) * 8))
                            : this._lowerWhite & (0x000000ff << ((v0 % 4) * 8));

                    let ds = v0 < 4
                        ? ~attacker == GridState.black
                            ? this._upperBlack & (0x000000ff << ((v0 % 4) * 8))
                            : this._upperWhite & (0x000000ff << ((v0 % 4) * 8))
                        : ~attacker == GridState.black
                            ? this._lowerBlack & (0x000000ff << ((v0 % 4) * 8))
                            : this._lowerWhite & (0x000000ff << ((v0 % 4) * 8));

                    if (r % 2 - 1) {
                        let dmask = (v0 < 4 ? 0x0f070301 : 0xff7f3f1f);
                        as &= v0 - h0 >= 0 ? dmask : ~dmask;
                        ds &= v0 - h0 >= 0 ? dmask : ~dmask;
                    }

                    let stonePos = 1 << (h0 + (v0 % 4) * 8);
                    let rev = ds ^ (ds + (stonePos << 1));

                    if (rev != 0 && (rev & as) != 0) {
                        rev &= ~(rev & as);
                        if (v0 < 4) {
                            this._upperBlack ^= rev;
                            this._upperWhite ^= rev;
                        }
                        else {
                            this._lowerBlack ^= rev;
                            this._lowerWhite ^= rev;
                        }
                    }

                    if (r % 2 - 1) {
                        this.rotate(-45);
                        v0 = (v0 - h0 + 8) % 8;
                    }
                }

                if (this._upperBlack != b1 || this._lowerBlack != b2) {
                    this.set(attacker, h, v);
                    let child = this.clone();
                    this._upperBlack = b1;
                    this._lowerBlack = b2;
                    this._upperWhite = w1;
                    this._lowerWhite = w2;
                    yield child;
                }
            }
        }
    };

    let delta_swap = function delta_swap(bits, mask, delta) {
        let x = (bits ^ (bits >>> delta)) & mask;
        return bits ^ x ^ (x << delta);
    };

    let flipVertical = function flipVertical(x) {
        return (x << 24) | ((x << 8) & 0x00ff0000) | ((x >>> 8) & 0x0000ff00) | (x >>> 24);
    };

    let mirrorHorizontal = function mirrorHorizontal(x) {
        x = delta_swap(x, 0x0f0f0f0f, 4);
        x = delta_swap(x, 0x11111111, 3);
        return delta_swap(x, 0x22222222, 1);
    };

    let vertical_loop_8_4 = function vertical_loop_8_4(x, d) {
        return (x << d * 8) | (x >>> 32 - d * 8);
    };

    this.Board.prototype._flipVertical = function () {
        let b1 = flipVertical(this._lowerBlack);
        let b2 = flipVertical(this._upperBlack);
        let w1 = flipVertical(this._lowerWhite);
        let w2 = flipVertical(this._upperWhite);
        this._upperBlack = b1;
        this._lowerBlack = b2;
        this._upperWhite = w1;
        this._lowerWhite = w2;
    };

    this.Board.prototype._flipDiagA1H8 = function () {
        let b1 = delta_swap(this._upperBlack, 0x00000011, 27);
        b1 = delta_swap(b1, 0x00001122, 18);
        b1 = delta_swap(b1, 0x00112244, 9);

        let b2 = delta_swap(this._lowerBlack, 0x00000011, 27);
        b2 = delta_swap(b2, 0x00001122, 18);
        b2 = delta_swap(b2, 0x00112244, 9);

        let w1 = delta_swap(this._upperWhite, 0x00000011, 27);
        w1 = delta_swap(w1, 0x00001122, 18);
        w1 = delta_swap(w1, 0x00112244, 9);

        let w2 = delta_swap(this._lowerWhite, 0x00000011, 27);
        w2 = delta_swap(w2, 0x00001122, 18);
        w2 = delta_swap(w2, 0x00112244, 9);

        this._upperBlack = ((b2 & 0xf0f0f0f0) >>> 4) | (b1 & 0xf0f0f0f0);
        this._lowerBlack = (b2 & 0x0f0f0f0f) | ((b1 & 0x0f0f0f0f) << 4);

        this._upperWhite = ((w2 & 0xf0f0f0f0) >>> 4) | (w1 & 0xf0f0f0f0);
        this._lowerWhite = (w2 & 0x0f0f0f0f) | ((w1 & 0x0f0f0f0f) << 4);
    };

    this.Board.prototype.rotate = function (angle) {
        let b1, b2, w1, w2;
        switch (angle) {
            case 270:
                this._flipDiagA1H8();
                this._flipVertical();
                break;
            case 180:
                b1 = mirrorHorizontal(flipVertical(this._lowerBlack));
                b2 = mirrorHorizontal(flipVertical(this._upperBlack));
                w1 = mirrorHorizontal(flipVertical(this._lowerWhite));
                w2 = mirrorHorizontal(flipVertical(this._upperWhite));
                this._upperBlack = b1;
                this._lowerBlack = b2;
                this._upperWhite = w1;
                this._lowerWhite = w2;
                break;
            case 90:
                this._flipVertical();
                this._flipDiagA1H8();
                break;
            case 45:
                b1 = (this._upperBlack & 0x11111111) | vertical_loop_8_4(this._upperBlack & 0x22222222, 1) | vertical_loop_8_4(this._upperBlack & 0x44444444, 2) | vertical_loop_8_4(this._upperBlack & 0x88888888, 3);
                b2 = (this._lowerBlack & 0x11111111) | vertical_loop_8_4(this._lowerBlack & 0x22222222, 1) | vertical_loop_8_4(this._lowerBlack & 0x44444444, 2) | vertical_loop_8_4(this._lowerBlack & 0x88888888, 3);
                this._upperBlack = (b1 & 0x0f87c3e1) | (b2 & 0xf0783c1e);
                this._lowerBlack = (b2 & 0x0f87c3e1) | (b1 & 0xf0783c1e);
                w1 = (this._upperWhite & 0x11111111) | vertical_loop_8_4(this._upperWhite & 0x22222222, 1) | vertical_loop_8_4(this._upperWhite & 0x44444444, 2) | vertical_loop_8_4(this._upperWhite & 0x88888888, 3);
                w2 = (this._lowerWhite & 0x11111111) | vertical_loop_8_4(this._lowerWhite & 0x22222222, 1) | vertical_loop_8_4(this._lowerWhite & 0x44444444, 2) | vertical_loop_8_4(this._lowerWhite & 0x88888888, 3);
                this._upperWhite = (w1 & 0x0f87c3e1) | (w2 & 0xf0783c1e);
                this._lowerWhite = (w2 & 0x0f87c3e1) | (w1 & 0xf0783c1e);
                break;
            case -45:
                b1 = (this._upperBlack & 0x11111111) | vertical_loop_8_4(this._upperBlack & 0x22222222, 3) | vertical_loop_8_4(this._upperBlack & 0x44444444, 2) | vertical_loop_8_4(this._upperBlack & 0x88888888, 1);
                b2 = (this._lowerBlack & 0x11111111) | vertical_loop_8_4(this._lowerBlack & 0x22222222, 3) | vertical_loop_8_4(this._lowerBlack & 0x44444444, 2) | vertical_loop_8_4(this._lowerBlack & 0x88888888, 1);
                this._upperBlack = (b1 & 0xe1c3870f) | (b2 & 0x1e3c78f0);
                this._lowerBlack = (b2 & 0xe1c3870f) | (b1 & 0x1e3c78f0);
                w1 = (this._upperWhite & 0x11111111) | vertical_loop_8_4(this._upperWhite & 0x22222222, 3) | vertical_loop_8_4(this._upperWhite & 0x44444444, 2) | vertical_loop_8_4(this._upperWhite & 0x88888888, 1);
                w2 = (this._lowerWhite & 0x11111111) | vertical_loop_8_4(this._lowerWhite & 0x22222222, 3) | vertical_loop_8_4(this._lowerWhite & 0x44444444, 2) | vertical_loop_8_4(this._lowerWhite & 0x88888888, 1);
                this._upperWhite = (w1 & 0xe1c3870f) | (w2 & 0x1e3c78f0);
                this._lowerWhite = (w2 & 0xe1c3870f) | (w1 & 0x1e3c78f0);
                break;
        }
    };

    this.Board.prototype.equals = function (board) {
        return this._upperBlack === board._upperBlack && this._lowerBlack === board._lowerBlack && this._upperWhite === board._upperWhite && this._lowerWhite === board._lowerWhite;
    };

    this.Board.prototype.isFinal = function () {
        return this.getStoneCount() == 64 || (this.enumerateNextBoard(GridState.black).next().value === void 0 && this.enumerateNextBoard(GridState.white).next().value === void 0);
    };

    this.Board.prototype.getUpperBlack = function() {
        return this._upperBlack;
    };

    this.Board.prototype.getLowerBlack = function() {
        return this._lowerBlack;
    };

    this.Board.prototype.getUpperWhite = function() {
        return this._upperWhite;
    };

    this.Board.prototype.getLowerWhite = function() {
        return this._lowerWhite;
    };

    this.Board.prototype.calcDifference = function(board) {
        let diff = new Board();
        diff._upperBlack = this._upperBlack ^ board._upperBlack;
        diff._upperWhite = this._upperWhite ^ board._upperWhite;
        diff._lowerBlack = this._lowerBlack ^ board._lowerBlack;
        diff._lowerWhite = this._lowerWhite ^ board._lowerWhite;
        return diff;
    };

    this.Board.prototype.toString = function () {
        let string = "";
        for (let v = 0; v < 8; v++) {
            for (let h = 0; h < 8; h++) {
                let stone = this.get(h, v);
                string += stone == GridState.black ? "黒"
                    : stone == GridState.white ? "白"
                        : "ー";
            }
            string += "\n";
        }
        return string;
    };
}