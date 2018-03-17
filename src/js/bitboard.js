// solver.js, engine.jsにも同じコードがあるが、webworkerを使うため仕方がない。

/*
    参考:
    http://primenumber.hatenadiary.jp/entry/2016/12/26/063226
    http://el-ement.com/blog/2017/02/20/reversi-ai/
    http://t-ishii.cocolog-nifty.com/blog/2014/02/flip-02bb.html
*/

let BitboardUtils = {

    tzcnt(x) {
        x = ~x & x - 1;

        x -= x >>> 1 & 0x55555555;
        x = (x & 0x33333333) + (x >>> 2 & 0x33333333);
        x = x + (x >>> 4) & 0x0F0F0F0F;
        return x * 0x01010101 >>> 24;
    },

    popcount64(x1, x0) {
        let t0 = x1 - (x1 >>> 1 & 0x55555555);
        t0 = (t0 & 0x33333333) + ((t0 & 0xcccccccc) >>> 2);
        let t1 = x0 - (x0 >>> 1 & 0x55555555);
        t0 += (t1 & 0x33333333) + ((t1 & 0xcccccccc) >>> 2);
        t0 = (t0 & 0x0f0f0f0f) + ((t0 & 0xf0f0f0f0) >>> 4);
        return t0 * 0x01010101 >>> 24;
    },

    mobility(p1, p0, o1, o0, out) {
        let mob1 = 0;
        let mob0 = 0;

        let blank1 = ~(p1 | o1);
        let blank0 = ~(p0 | o0);

        let mo1 = o1 & 0x7e7e7e7e;
        let mo0 = o0 & 0x7e7e7e7e;

        // ここは複雑なので優先的にデバッグ

        let ps1 = p1 << 1;
        let ps0 = p0 << 1;

        mob1 = (mo1 + ps1) & blank1 & ~ps1;
        mob0 = (mo0 + ps0) & blank0 & ~ps0; // <- ~(o0 | p0 | ps0) = blank0 & ~ps0

        // シフトを繰り返す
        // 左向きに返せるマス

        let t0 = p0 >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;

        mob0 |= t0 >>> 1 & blank0;

        let t1 = p1 >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;

        mob1 |= t1 >>> 1 & blank1;
        
        // 上下

        mo1 = o1 & 0x00ffffff;
        mo0 = o0 & 0xffffff00;

        // 下向き
        t0 = p0 << 8 & mo0;
        t0 |= t0 << 8 & mo0;
        t0 |= t0 << 8 & mo0;

        t1 = (p1 << 8 | (t0 | p0) >>> 24) & mo1;
        t1 |= t1 << 8 & mo1;
        t1 |= t1 << 8 & mo1;

        mob1 |= (t1 << 8 | t0 >>> 24) & blank1;
        mob0 |= t0 << 8 & blank0;

        // 上
        t1 = p1 >>> 8 & mo1;
        t1 |= t1 >>> 8 & mo1;
        t1 |= t1 >>> 8 & mo1;

        t0 = (p0 >>> 8 | (t1 | p1) << 24) & mo0;
        t0 |= t0 >>> 8 & mo0;
        t0 |= t0 >>> 8 & mo0;

        mob1 |= t1 >>> 8 & blank1;
        mob0 |= (t0 >>> 8 | t1 << 24) & blank0;

        // 斜め

        mo1 = o1 & 0x007e7e7e;
        mo0 = o0 & 0x7e7e7e00;

        // 右下
        t0 = p0 << 9 & mo0;
        t0 |= t0 << 9 & mo0;
        t0 |= t0 << 9 & mo0;

        t1 = (p1 << 9 | (t0 | p0) >>> 23) & mo1;
        t1 |= t1 << 9 & mo1;
        t1 |= t1 << 9 & mo1;

        mob1 |= (t1 << 9 | t0 >>> 23) & blank1;
        mob0 |= t0 << 9 & blank0;

        // 左上
        t1 = p1 >>> 9 & mo1;
        t1 |= t1 >>> 9 & mo1;
        t1 |= t1 >>> 9 & mo1;

        t0 = (p0 >>> 9 | (t1 | p1) << 23) & mo0;
        t0 |= t0 >>> 9 & mo0;
        t0 |= t0 >>> 9 & mo0;

        mob1 |= t1 >>> 9 & blank1;
        mob0 |= (t0 >>> 9 | t1 << 23) & blank0;

        // 左下
        t0 = p0 << 7 & mo0;
        t0 |= t0 << 7 & mo0;
        t0 |= t0 << 7 & mo0;

        t1 = (p1 << 7 | (t0 | p0) >>> 25) & mo1;
        t1 |= t1 << 7 & mo1;
        t1 |= t1 << 7 & mo1;

        mob1 |= (t1 << 7 | t0 >>> 25) & blank1;
        mob0 |= t0 << 7 & blank0;

        // 右上
        t1 = p1 >>> 7 & mo1;
        t1 |= t1 >>> 7 & mo1;
        t1 |= t1 >>> 7 & mo1;

        t0 = (p0 >>> 7 | (t1 | p1) << 25) & mo0;
        t0 |= t0 >>> 7 & mo0;
        t0 |= t0 >>> 7 & mo0;

        mob1 |= t1 >>> 7 & blank1;
        mob0 |= (t0 >>> 7 | t1 << 25) & blank0;

        out.mob1 = mob1;
        out.mob0 = mob0;
    },

    // 上側に石を置いた時用
    flip1(p1, p0, o1, o0, sq_bit, out) {
        let f1 = 0;
        let f0 = 0;

        let mo1 = o1 & 0x7e7e7e7e;
        let mo0 = o0 & 0x7e7e7e7e;

        // 左
        let d1 = 0x000000fe * sq_bit;
        let t1 = (mo1 | ~d1) + 1 & d1 & p1;
        f1 = t1 - ((t1 | -t1) >>> 31) & d1;

        // 左上
        d1 = 0x08040200 * sq_bit;
        t1 = (mo1 | ~d1) + 1 & d1 & p1;
        f1 |= t1 - ((t1 | -t1) >>> 31) & d1;

        // 上 マスクは付けてはだめ。
        d1 = 0x01010100 * sq_bit;
        t1 = (o1 | ~d1) + 1 & d1 & p1;
        f1 |= t1 - ((t1 | -t1) >>> 31) & d1;

        // 右上
        d1 = 0x00204080 * sq_bit;
        t1 = (mo1 | ~d1) + 1 & d1 & p1;
        f1 |= t1 - ((t1 | -t1) >>> 31) & d1;

        // 右
        t1 = sq_bit >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;
        t1 |= t1 >>> 1 & mo1;

        f1 |= t1 & -(t1 >>> 1 & p1);

        // 右下 やることは右向きの処理と同じ
        t1 = sq_bit >>> 9 & mo1;
        t1 |= t1 >>> 9 & mo1;
        t1 |= t1 >>> 9 & mo1;

        let t0 = (t1 | sq_bit) << 23 & mo0;
        t0 |= t0 >>> 9 & mo0;
        t0 |= t0 >>> 9 & mo0;

        let t = t1 >>> 9 & p1 | (t0 >>> 9 | t1 << 23) & p0;
        t = (t | -t) >> 31;

        f1 |= t1 & t;
        f0 |= t0 & t;

        // 下 敵石にマスクはつけない
        t1 = sq_bit >>> 8 & o1;
        t1 |= t1 >>> 8 & o1;
        t1 |= t1 >>> 8 & o1;

        t0 = (t1 | sq_bit) << 24 & o0;
        t0 |= t0 >>> 8 & o0;
        t0 |= t0 >>> 8 & o0;

        t = t1 >>> 8 & p1 | (t0 >>> 8 | t1 << 24) & p0;
        t = (t | -t) >> 31;

        f1 |= t1 & t;
        f0 |= t0 & t;

        // 左下
        t1 = sq_bit >>> 7 & mo1;
        t1 |= t1 >>> 7 & mo1;
        t1 |= t1 >>> 7 & mo1;

        t0 = (t1 | sq_bit) << 25 & mo0;
        t0 |= t0 >>> 7 & mo0;
        t0 |= t0 >>> 7 & mo0;

        t = t1 >>> 7 & p1 | (t0 >>> 7 | t1 << 25) & p0;
        t = (t | -t) >> 31;

        f1 |= t1 & t;
        f0 |= t0 & t;

        out.f1 = f1;
        out.f0 = f0;
    },

    // 下側
    flip0(p1, p0, o1, o0, sq_bit, out) {
        let f1 = 0;
        let f0 = 0;

        let mo1 = o1 & 0x7e7e7e7e;
        let mo0 = o0 & 0x7e7e7e7e;

        // 左
        let d0 = 0x000000fe * sq_bit;
        let t0 = (mo0 | ~d0) + 1 & d0 & p0;
        f0 = t0 - ((t0 | -t0) >>> 31) & d0;

        // 左上
        t0 = sq_bit << 9 & mo0;
        t0 |= t0 << 9 & mo0;
        t0 |= t0 << 9 & mo0;

        let t1 = (t0 | sq_bit) >>> 23 & mo1;
        t1 |= t1 << 9 & mo1;
        t1 |= t1 << 9 & mo1;

        let t = (t1 << 9 | t0 >>> 23) & p1 | t0 << 9 & p0;
        t = (t | -t) >> 31;

        f1 |= t1 & t;
        f0 |= t0 & t;

        // 上 敵石にマスクはつけない
        t0 = sq_bit << 8 & o0;
        t0 |= t0 << 8 & o0;
        t0 |= t0 << 8 & o0;

        t1 = (t0 | sq_bit) >>> 24 & o1;
        t1 |= t1 << 8 & o1;
        t1 |= t1 << 8 & o1;

        t = (t1 << 8 | t0 >>> 24) & p1 | t0 << 8 & p0;
        t = (t | -t) >> 31;

        f1 |= t1 & t;
        f0 |= t0 & t;

        // 右上
        t0 = sq_bit << 7 & mo0;
        t0 |= t0 << 7 & mo0;
        t0 |= t0 << 7 & mo0;

        t1 = (t0 | sq_bit) >>> 25 & mo1;
        t1 |= t1 << 7 & mo1;
        t1 |= t1 << 7 & mo1;

        t = (t1 << 7 | t0 >>> 25) & p1 | t0 << 7 & p0;
        t = (t | -t) >> 31;

        f1 |= t1 & t;
        f0 |= t0 & t;

        // 右
        t0 = sq_bit >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;
        t0 |= t0 >>> 1 & mo0;

        f0 |= t0 & -(t0 >>> 1 & p0);

        // 右下
        t0 = sq_bit >>> 9 & mo0;
        t0 |= t0 >>> 9 & mo0;
        f0 |= t0 & -(t0 >>> 9 & p0);

        // 下 敵石マスク無し
        t0 = sq_bit >>> 8 & o0;
        t0 |= t0 >>> 8 & o0;
        f0 |= t0 & -(t0 >>> 8 & p0);

        // 左下
        t0 = sq_bit >>> 7 & mo0;
        t0 |= t0 >>> 7 & mo0;
        f0 |= t0 & -(t0 >>> 7 & p0);

        out.f1 = f1;
        out.f0 = f0;
    }
};

class Bitboard {
    constructor() {
        // [0]: 0-31, [1]: 32-64
        this.bits = [0, 0];
    }

    set(b1, b0) {
        this.bits = [b0, b1];
        return this;
    }

    pop_count() {
        return BitboardUtils.popcount64(this.bits[0], this.bits[1]);
    }

    foreach(func) {
        if (typeof func !== "function") return;

        for (let b = this.bits[0]; b !== 0; b &= b - 1) {
            let sq = BitboardUtils.tzcnt(b);

            // func(x, y);
            func(sq % 8, sq / 8 | 0);
        }

        for (let b = this.bits[1]; b !== 0; b &= b - 1) {
            let sq = BitboardUtils.tzcnt(b) + 32;

            // func(x, y);
            func(sq % 8, sq / 8 | 0);
        }
    }

    clone() {
        return (new Bitboard()).set(this.bits[1], this.bits[0]);
    }

    and(bb) {
        if (bb instanceof Bitboard) {
            let _this = this.clone();
            _this.bits[1] &= bb.bits[1];
            _this.bits[0] &= bb.bits[0];

            return _this;
        }

        throw new Error("bbがBitboardではありません");
    }

    xor(bb) {
        if (bb instanceof Bitboard) {
            let _this = this.clone();
            _this.bits[1] ^= bb.bits[1];
            _this.bits[0] ^= bb.bits[0];

            return _this;
        }

        throw new Error("bbがBitboardではありません");
    }

    or(bb) {
        if (bb instanceof Bitboard) {
            let _this = this.clone();
            _this.bits[1] |= bb.bits[1];
            _this.bits[0] |= bb.bits[0];

            return _this;
        }

        throw new Error("bbがBitboardではありません");
    }

    // 0 or 1
    test(sq) {
        if (sq < 0 || sq >= 64) return 0;

        return this.bits[sq >>> 5] >>> (sq & 0b11111) & 1;
    }

    none() {
        return this.bits[1] === 0 && this.bits[0] === 0;
    }

    print() {
        let str = "";

        for (let i = 0; i < 64; ++i) {
            if (i % 8 == 0) str += "\n";

            str += this.test(i) ? "o" : "-";
        }

        console.log(str);
    }
}

function square_to_bb(sq) {
    if (sq < 0 || sq >= 64) return new Bitboard();
    else if (sq < 32) return (new Bitboard()).set(0, 1 << sq);
    else return (new Bitboard()).set(1 << sq - 32, 0);
}