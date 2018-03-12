function tzcnt(x) {
    x = ~x & x - 1;
    x -= x >>> 1 & 0x55555555;
    x = (x & 0x33333333) + (x >>> 2 & 0x33333333);
    x = x + (x >>> 4) & 0x0F0F0F0F;
    return x * 0x01010101 >>> 24;
}

// 上側に石を置いた時用
function flip1(p1, p0, o1, o0, sq_bit, out) {
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

    let u1 = t1 >>> 9 & p1;
    let u0 = (t0 >>> 9 | t1 << 23) & p0;

    // * -1
    u1 = ~u1 + ((u0 | -u0) >>> 31 ^ 1);
    u0 = -u0;

    f1 |= t1 & u1;
    f0 |= t0 & u0;

    // 下 敵石にマスクはつけない
    t1 = sq_bit >>> 8 & o1;
    t1 |= t1 >>> 8 & o1;
    t1 |= t1 >>> 8 & o1;

    t0 = (t1 | sq_bit) << 24 & o0;
    t0 |= t0 >>> 8 & o0;
    t0 |= t0 >>> 8 & o0;

    u1 = t1 >>> 8 & p1;
    u0 = (t0 >>> 8 | t1 << 24) & p0;

    // * -1
    u1 = ~u1 + ((u0 | -u0) >>> 31 ^ 1);
    u0 = -u0;

    f1 |= t1 & u1;
    f0 |= t0 & u0;

    // 左下
    t1 = sq_bit >>> 7 & mo1;
    t1 |= t1 >>> 7 & mo1;
    t1 |= t1 >>> 7 & mo1;

    t0 = (t1 | sq_bit) << 25 & mo0;
    t0 |= t0 >>> 7 & mo0;
    t0 |= t0 >>> 7 & mo0;

    u1 = t1 >>> 7 & p1;
    u0 = (t0 >>> 7 | t1 << 25) & p0;

    // * -1
    u1 = ~u1 + ((u0 | -u0) >>> 31 ^ 1);
    u0 = -u0;

    f1 |= t1 & u1;
    f0 |= t0 & u0;

    out.f1 = f1;
    out.f0 = f0;
}

// 下側
function flip0(p1, p0, o1, o0, sq_bit, out) {
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

    let u1 = (t1 << 9 | t0 >>> 23) & p1;
    let u0 = t0 << 9 & p0;

    // u0 | u1が0なら0, そうでないなら-1
    let t = u1 | u0;
    // 算術シフト
    t = (t | -t) >> 31;
    u1 += t + ((u0 | -u0) >>> 31);
    u0 += t;

    f1 |= t1 & u1;
    f0 |= t0 & u0;

    // 上 敵石にマスクはつけない
    t0 = sq_bit << 8 & o0;
    t0 |= t0 << 8 & o0;
    t0 |= t0 << 8 & o0;

    t1 = (t0 | sq_bit) >>> 24 & o1;
    t1 |= t1 << 8 & o1;
    t1 |= t1 << 8 & o1;

    u1 = (t1 << 8 | t0 >>> 24) & p1;
    u0 = t0 << 8 & p0;

    // u0 | u1が0なら0, そうでないなら-1
    t = u1 | u0;
    // 算術シフト
    t = (t | -t) >> 31;
    u1 += t + ((u0 | -u0) >>> 31);
    u0 += t;

    f1 |= t1 & u1;
    f0 |= t0 & u0;

    // 右上
    t0 = sq_bit << 7 & mo0;
    t0 |= t0 << 7 & mo0;
    t0 |= t0 << 7 & mo0;

    t1 = (t0 | sq_bit) >>> 25 & mo1;
    t1 |= t1 << 7 & mo1;
    t1 |= t1 << 7 & mo1;

    u1 = (t1 << 7 | t0 >>> 25) & p1;
    u0 = t0 << 7 & p0;

    // u0 | u1が0なら0, そうでないなら-1
    t = u1 | u0;
    // 算術シフト
    t = (t | -t) >> 31;
    u1 += t + ((u0 | -u0) >>> 31);
    u0 += t;

    f1 |= t1 & u1;
    f0 |= t0 & u0;

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

let ReversiEngine = function(depth) {
    let nodes = 0;
    let leaf = 0;

    const temp = {};

    // αβ探索のみ。手抜ｋ
    const search = function(p1, p0, o1, o0, d, min, max, passed) {
        if (d === 0) return ++leaf, evaluate(p1, p0, o1, o0);

        mobility(p1, p0, o1, o0, temp);
        let mob1 = temp.mob1;
        let mob0 = temp.mob0;

        // パスの処理
        if ((mob1 | mob0) === 0) {
            return passed ? (++leaf, popcount64(p1, p0) - popcount64(o1, o0))
                : -search(o1, o0, p1, p0, d, -max, -min, true);
        }

        ++nodes;

        for (let b = mob0 & -mob0; mob0; mob0 ^= b, b = mob0 & -mob0) {
            flip0(p1, p0, o1, o0, b, temp);

            let f0 = temp.f0;
            let f1 = temp.f1;

            let score = -search(o1 ^ f1, o0 ^ f0, p1 ^ f1, p0 ^ f0 | b, d - 1, -max, -min, false);

            if (score >= max) return score;

            min = score > min ? score : min;
        }

        for (let b = mob1 & -mob1; mob1; mob1 ^= b, b = mob1 & -mob1) {
            flip1(p1, p0, o1, o0, b, temp);

            let f0 = temp.f0;
            let f1 = temp.f1;

            let score = -search(o1 ^ f1, o0 ^ f0, p1 ^ f1 | b, p0 ^ f0, d - 1, -max, -min, false);

            if (score >= max) return score;

            min = score > min ? score : min;
        }

        return min;
    };

    this.think = function(p1, p0, o1, o0) {
        let start = Date.now();

        mobility(p1, p0, o1, o0, temp);
        let mob1 = temp.mob1;
        let mob0 = temp.mob0;

        let best_score = -99999999;
        let best_move, offset;

        for (let b = mob0 & -mob0; mob0; mob0 ^= b, b = mob0 & -mob0) {
            flip0(p1, p0, o1, o0, b, temp);

            let f0 = temp.f0;
            let f1 = temp.f1;

            let score = -search(o1 ^ f1, o0 ^ f0, p1 ^ f1, p0 ^ f0 | b, depth - 1, -99999999, -best_score, false);

            if (score > best_score) {
                best_score = score;
                best_move = b, offset = 0;
            }
        }

        for (let b = mob1 & -mob1; mob1; mob1 ^= b, b = mob1 & -mob1) {
            flip1(p1, p0, o1, o0, b, temp);

            let f0 = temp.f0;
            let f1 = temp.f1;

            let score = -search(o1 ^ f1, o0 ^ f0, p1 ^ f1 | b, p0 ^ f0, depth - 1, -99999999, -best_score, false);

            if (score > best_score) {
                best_score = score;
                best_move = b, offset = 32;
            }
        }

        let end = Date.now();
        let move_sq = tzcnt(best_move) + offset;

        return {
            "result": best_score,
            "nodes": nodes + leaf,
            "elapsed": end - start,
            "x": move_sq % 8,
            "y": move_sq / 8 | 0
        };
    };
};

self.addEventListener("message", function (pos_data) {
    let board = pos_data.data;

    let engine = new ReversiEngine(9);
    let result = engine.think(board["p1"], board["p0"], board["o1"], board["o0"]);

    result["exact"] = false;

    self.postMessage(result);
});

