let Player = {
    black: 0,
    white: 1
};

let SquareState = {
    black: 0,
    white: 1,
    blank: -1
};

class Undo {
    constructor(flip_bb, sq, passed) {
        // 盤面描画のときに、Bitboard以外のオブジェクトだと困るのでチェックを挟む
        if (!(flip_bb instanceof Bitboard)) {
            throw new TypeError("flip_bbはBitboardクラスのインスタンスである必要があります");
        }

        this.flip_bb = flip_bb;
        this.sq = sq;
        this.passed = passed;
    }
}

class Reversi {
    constructor() {
        this.player = Player.black;
        this.is_finished = false;
        this.recode = "";

        // [0]: 黒 [1]: 白
        this.bb = [new Bitboard(), new Bitboard()];

        this.mobility_bb = new Bitboard(); 

        this.undo_stack = [];
        this.redo_stack = [];

        this._onPass = () => { };
        this._onGameFinished = () => { };
    }

    // 新しくゲームを開始するときに必ず呼ぶ    
    reset() {
        this.player = Player.black;
        this.is_finished = false;
        this.recode = "";

        // 初期配置をセット
        this.bb[0].set(0x00000008, 0x10000000);
        this.bb[1].set(0x00000010, 0x08000000);

        this.mobility_bb.set(0, 0);
        this.updateMobility();

        this.undo_stack.length = this.redo_stack.length = 0;
    }

    // ベンチマーク用。適当
    loadFFO(ffo, turn) {
        this.player = turn;

        this.bb[0].set(0, 0);
        this.bb[1].set(0, 0);

        for (let i = 0; i < 64; ++i) {
            if (ffo[i] !== "-") {
                let c = ffo[i];
                let p = ffo[i] == "X" ? Player.black : Player.white;

                this.bb[p] = this.bb[p].or(square_to_bb(i));
            }
        }

        // あとで消す
        this.bb[0].print();
        this.bb[1].print();
    }

    // こちらは丁寧に実装する。
    loadRecode(recode_str) {
        if (!recode_str) return;

        this.reset();

        // 小文字化
        recode_str = (recode_str.toString() || "").toLowerCase();

        let len = recode_str.length;

        for (let i = 0; i < len && i + 1 < len; i += 2) {
            let x = "abcdefgh".indexOf(recode_str[i]);
            let y = "12345678".indexOf(recode_str[i + 1]);

            if (x === -1 || y === -1) break;

            if (!this.can_put_at(x, y)) break;

            // 手を進めていく
            this.putAt(x, y);
        }
    }

    // 打てるところの計算と、パスor終局判定もついでにやる
    updateMobility() {
        let mobility = {};

        let player_bb = this.bitboard_of(this.player);
        let opponent_bb = this.bitboard_of(this.player ^ 1);

        BitboardUtils.mobility(player_bb.bits[1], player_bb.bits[0], opponent_bb.bits[1], opponent_bb.bits[0], mobility);

        this.mobility_bb.set(mobility.mob1, mobility.mob0);

        if (this.mobility_bb.none()) {
            BitboardUtils.mobility(opponent_bb.bits[1], opponent_bb.bits[0], player_bb.bits[1], player_bb.bits[0], mobility);

            this.mobility_bb.set(mobility.mob1, mobility.mob0);

            if (this.mobility_bb.none()) {
                // 終局
                this.is_finished = true;

                this._onGameFinished();
            }
            else {
                this.player ^= 1;

                // パスのときもスタックに情報を追加する。
                this.undo_stack.unshift(new Undo(new Bitboard(), -1, true));

                this._onPass();
            }
        }
    }

    bitboard_of(turn) {
        return this.bb[turn];
    }

    last_flip() {
        return this.undo_stack.length ? this.undo_stack[0] : new Undo(new Bitboard(), -1, false);
    }

    stone_at(x, y) {
        let sq = x + y * 8;

        return (this.bb[Player.white].test(sq) << 1 | this.bb[Player.black].test(sq)) - 1;
    }

    count_of(turn) {
        return this.bb[turn].pop_count();
    }

    can_put_at(x, y) {
        return this.mobility_bb.test(x + y * 8);
    }

    putAt(x, y) {
        if (!this.can_put_at(x, y)) return;

        let p = this.player, o = this.player ^ 1;

        // clear
        this.redo_stack.length = 0;

        let player_bb = this.bb[p];
        let opponent_bb = this.bb[o];

        let flip = {};
        let sq = x + y * 8;

        if (sq < 32) {
            BitboardUtils.flip0(player_bb.bits[1], player_bb.bits[0], opponent_bb.bits[1], opponent_bb.bits[0], 1 << sq, flip);
        }
        else {
            BitboardUtils.flip1(player_bb.bits[1], player_bb.bits[0], opponent_bb.bits[1], opponent_bb.bits[0], 1 << sq - 32, flip);
        }

        let flip_bb = (new Bitboard()).set(flip.f1, flip.f0);

        this.bb[p] = player_bb.xor(flip_bb).xor(square_to_bb(sq));
        this.bb[o] = opponent_bb.xor(flip_bb);

        this.undo_stack.unshift(new Undo(flip_bb, sq, false));

        // 手番変更処理
        this.player ^= 1;
        this.updateMobility();

        this.recode += "abcdefgh"[x] + (y + 1);
    }

    undo() {
        if (this.undo_stack.length === 0) return;

        let undo_data = this.undo_stack.shift();

        this.player ^= 1;
        let p = this.player, o = this.player ^ 1;

        this.bb[p] = this.bb[p].xor(undo_data.flip_bb).xor(square_to_bb(undo_data.sq));
        this.bb[o] = this.bb[o].xor(undo_data.flip_bb);

        this.redo_stack.unshift(undo_data);
        
        // ここでupdateMobilityを呼び出すと、パスのときに手番が交代してパスの局面以前に戻れなくなる。
        let mobility = {};
        BitboardUtils.mobility(this.bb[p].bits[1], this.bb[p].bits[0], this.bb[o].bits[1], this.bb[o].bits[0], mobility);

        this.mobility_bb.set(mobility.mob1, mobility.mob0);
    }

    redo() {
        if (this.redo_stack.length === 0) return;

        let redo_data = this.redo_stack.shift();

        this.player ^= 1;
        let p = this.player, o = this.player ^ 1;

        this.bb[o] = this.bb[o].xor(redo_data.flip_bb).xor(square_to_bb(redo_data.sq));
        this.bb[p] = this.bb[p].xor(redo_data.flip_bb);

        this.undo_stack.unshift(redo_data);

        let mobility = {};
        BitboardUtils.mobility(this.bb[p].bits[1], this.bb[p].bits[0], this.bb[o].bits[1], this.bb[o].bits[0], mobility);

        this.mobility_bb.set(mobility.mob1, mobility.mob0);
    }

    // コールバック設定用関数。
    onPass(func) {
        if (typeof func === "function") {
            this._onPass = func;
        }
    }

    // コールバック設定用関数。    
    onGameFinished(func) {
        if (typeof func === "function") {
            this._onGameFinished = func;
        }
    }
}
