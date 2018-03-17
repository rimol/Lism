function tzcnt(x) {
    x = ~x & x - 1;
    x -= x >>> 1 & 0x55555555;
    x = (x & 0x33333333) + (x >>> 2 & 0x33333333);
    x = x + (x >>> 4) & 0x0F0F0F0F;
    return x * 0x01010101 >>> 24;
}

function parity(x) {
    x ^= x >>> 16;
    x ^= x >>> 8;
    x ^= x >>> 4;
    x ^= x >>> 2;
    return (x ^ x >>> 1) & 1;
}

function popcount64(x1, x0) {
    let t0 = x1 - (x1 >>> 1 & 0x55555555);
    t0 = (t0 & 0x33333333) + ((t0 & 0xcccccccc) >>> 2);
    let t1 = x0 - (x0 >>> 1 & 0x55555555);
    t0 += (t1 & 0x33333333) + ((t1 & 0xcccccccc) >>> 2);
    t0 = (t0 & 0x0f0f0f0f) + ((t0 & 0xf0f0f0f0) >>> 4);
    return t0 * 0x01010101 >>> 24;
}

// この下3つの関数はできたら展開したい、が、めんどくさい。

function mobility(p1, p0, o1, o0, out) {
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

// 置換表のサイズ
// これより大きくすると逆に遅くなる
const MAX_TABLE_SIZE = 0x80000;

function table_index(p1, p0, o1, o0) {
    return ((p1 * 2 + p0 * 3 + o1 * 5 + o0 * 7) >>> 7) & 0x7ffff;
}

let ReversiSolver = function () {
    let leaf = 0;
    let nodes = 0;

    const temp = {};

    // αβ探索
    const search_final = function (p1, p0, o1, o0, min, max, passed) {
        let player_score = popcount64(p1, p0);
        let opponent_score = popcount64(o1, o0);

        if (player_score + opponent_score === 63) {
            let m1 = ~(p1 | o1);
            let m0 = ~(p0 | o0);

            ++nodes; // このノード

            if (m0) {
                flip0(p1, p0, o1, o0, m0, temp);

                // おける
                if (temp.f1 | temp.f0) {
                    ++leaf; // 次のノードは葉

                    let flip_count = popcount64(temp.f1, temp.f0);
                    return player_score - opponent_score + 1 + flip_count * 2;
                }
                // おけない
                else {
                    // パス
                    flip0(o1, o0, p1, p0, m0, temp);

                    let flip_count = popcount64(temp.f1, temp.f0);
                    return flip_count ? (++leaf, (player_score - opponent_score - 1 - flip_count * 2)) : (player_score - opponent_score);
                }
            }
            else {
                flip1(p1, p0, o1, o0, m1, temp);

                // おける
                if (temp.f1 | temp.f0) {
                    ++leaf; // 次のノードは葉

                    let flip_count = popcount64(temp.f1, temp.f0);
                    return player_score - opponent_score + 1 + flip_count * 2;
                }
                // おけない
                else {
                    // パス
                    flip1(o1, o0, p1, p0, m1, temp);

                    let flip_count = popcount64(temp.f1, temp.f0);
                    return flip_count ? (++leaf, (player_score - opponent_score - 1 - flip_count * 2)) : (player_score - opponent_score);
                }
            }
        }

        // 偶数理論にもとづいて探索

        let blank0 = ~(p0 | o0);

        let blank_left = blank0 & 0xf0f0f0f0;
        let blank_right = blank0 & 0x0f0f0f0f;

        let target0 = blank_left & -parity(blank_left) | blank_right & -parity(blank_right);
        blank0 ^= target0;

        let blank1 = ~(p1 | o1);

        blank_left = blank1 & 0xf0f0f0f0;
        blank_right = blank1 & 0x0f0f0f0f;

        let target1 = blank_left & -parity(blank_left) | blank_right & -parity(blank_right);
        blank1 ^= target1;

        let pass = true;

        for (let b = target0 & -target0; b; target0 ^= b, b = target0 & -target0) {
            flip0(p1, p0, o1, o0, b, temp);

            let f0 = temp.f0;
            let f1 = temp.f1;

            // おける
            if (f0 | f1) {
                pass = false;
                let score = -search_final(o1 ^ f1, o0 ^ f0, p1 ^ f1, p0 ^ f0 | b, -max, -min, false);

                if (score >= max) return score;

                min = min < score ? score : min;
            }
        }

        for (let b = target1 & -target1; b; target1 ^= b, b = target1 & -target1) {
            flip1(p1, p0, o1, o0, b, temp);

            let f0 = temp.f0;
            let f1 = temp.f1;

            // おける
            if (f0 | f1) {
                pass = false;
                let score = -search_final(o1 ^ f1, o0 ^ f0, p1 ^ f1 | b, p0 ^ f0, -max, -min, false);

                if (score >= max) return score;

                min = min < score ? score : min;
            }
        }

        for (let b = blank0 & -blank0; b; blank0 ^= b, b = blank0 & -blank0) {
            flip0(p1, p0, o1, o0, b, temp);

            let f0 = temp.f0;
            let f1 = temp.f1;

            // おける
            if (f0 | f1) {
                pass = false;
                let score = -search_final(o1 ^ f1, o0 ^ f0, p1 ^ f1, p0 ^ f0 | b, -max, -min, false);

                if (score >= max) return score;

                min = min < score ? score : min;
            }
        }

        for (let b = blank1 & -blank1; b; blank1 ^= b, b = blank1 & -blank1) {
            flip1(p1, p0, o1, o0, b, temp);

            let f0 = temp.f0;
            let f1 = temp.f1;

            // おける
            if (f0 | f1) {
                pass = false;
                let score = -search_final(o1 ^ f1, o0 ^ f0, p1 ^ f1 | b, p0 ^ f0, -max, -min, false);

                if (score >= max) return score;

                min = min < score ? score : min;
            }
        }

        if (pass) {
            // 2回連続パスならこのノードは葉
            return passed ? (++leaf, player_score - opponent_score)
                : -search_final(o1, o0, p1, p0, -max, -min, true);
        }

        return ++nodes, min;
    };

    // 置換表
    const transposition_table = [];
    transposition_table.length = MAX_TABLE_SIZE;

    // negascout + fastest-first heuristic + 置換表
    const search = function (p1, p0, o1, o0, alpha, beta, passed) {
        let player_score = popcount64(p1, p0);
        let opponent_score = popcount64(o1, o0);

        // 葉に近い枝
        if (player_score + opponent_score >= 58) {
            return search_final(p1, p0, o1, o0, alpha, beta, passed);
        }

        mobility(p1, p0, o1, o0, temp);
        let mob1 = temp.mob1;
        let mob0 = temp.mob0;

        // パスの処理
        if ((mob1 | mob0) === 0) {
            return passed ? (++leaf, player_score - opponent_score)
                : -search(o1, o0, p1, p0, -beta, -alpha, true);
        }

        ++nodes;

        let upper_bound = 64;
        let lower_bound = -64;
        let index = table_index(p1, p0, o1, o0);
        let value = transposition_table[index];

        if (value && value.p1 === p1 && value.p0 === p0 && value.o1 === o1 && value.o0 === o0) {
            upper_bound = value.upper_bound;
            lower_bound = value.lower_bound;

            if (lower_bound >= beta) return lower_bound;
            else if (upper_bound <= alpha) return upper_bound;
            else if (upper_bound === lower_bound) return upper_bound;

            alpha = lower_bound > alpha ? lower_bound : alpha;
            beta = upper_bound < beta ? upper_bound : beta;
        }
        else {
            value = {
                p1: p1,
                p0: p0,
                o1: o1,
                o0: o0,
                lower_bound: lower_bound,
                upper_bound: upper_bound
            };
        }

        // ソート
        let ordered_moves = [];

        // 0-31
        for (let b = mob0 & -mob0; mob0; mob0 ^= b, b = mob0 & -mob0) {
            let move_data = {};

            flip0(p1, p0, o1, o0, b, temp);
            let f0 = temp.f0;
            let f1 = temp.f1;

            move_data.p0 = p0 ^ f0 | b;
            move_data.p1 = p1 ^ f1;
            move_data.o0 = o0 ^ f0;
            move_data.o1 = o1 ^ f1;

            mobility(move_data.o1, move_data.o0, move_data.p1, move_data.p0, temp);
            let m0 = temp.mob0;
            let m1 = temp.mob1;

            let weighted_mobility = popcount64(m1, m0) + (m1 >>> 24 & 1) + (m1 >>> 31) + (m0 >>> 7 & 1) + (m0 & 1);
            move_data.weighted_mobility = weighted_mobility;

            let move_count = ordered_moves.length;
            for (let i = 0; i < move_count; ++i) {
                // 少ない順に並べる
                if (weighted_mobility < ordered_moves[i].weighted_mobility) {
                    ordered_moves.splice(i, 0, move_data);
                    break;
                }
            }

            if (ordered_moves.length == move_count) {
                ordered_moves.push(move_data);
            }
        }

        // 32-64
        for (let b = mob1 & -mob1; mob1; mob1 ^= b, b = mob1 & -mob1) {
            let move_data = {};

            flip1(p1, p0, o1, o0, b, temp);
            let f0 = temp.f0;
            let f1 = temp.f1;

            move_data.p0 = p0 ^ f0;
            move_data.p1 = p1 ^ f1 | b;
            move_data.o0 = o0 ^ f0;
            move_data.o1 = o1 ^ f1;

            mobility(move_data.o1, move_data.o0, move_data.p1, move_data.p0, temp);
            let m0 = temp.mob0;
            let m1 = temp.mob1;

            let weighted_mobility = popcount64(m1, m0) + (m1 >>> 24 & 1) + (m1 >>> 31) + (m0 >>> 7 & 1) + (m0 & 1);
            move_data.weighted_mobility = weighted_mobility;

            let move_count = ordered_moves.length;
            for (let i = 0; i < move_count; ++i) {
                // 少ない順に並べる
                if (weighted_mobility < ordered_moves[i].weighted_mobility) {
                    ordered_moves.splice(i, 0, move_data);
                    break;
                }
            }

            if (ordered_moves.length == move_count) {
                ordered_moves.push(move_data);
            }
        }

        // negascout
        let best_move = ordered_moves[0];
        let best_score = -search(best_move.o1, best_move.o0, best_move.p1, best_move.p0, -beta, -alpha, false);

        if (best_score >= beta) {
            value.lower_bound = best_score > lower_bound ? best_score : lower_bound;
            value.upper_bound = upper_bound;

            transposition_table[index] = value;

            return best_score;
        }

        // 常に a >= best_score
        for (let i = 1, a = best_score > alpha ? best_score : alpha; i < ordered_moves.length; ++i) {
            let move = ordered_moves[i];

            let score = -search(move.o1, move.o0, move.p1, move.p0, -a - 1, -a, false);

            if (score >= beta) {
                // この局面のミニマックス値はscore以上upper_bound以下
                value.lower_bound = score > lower_bound ? score : lower_bound;
                value.upper_bound = upper_bound;

                transposition_table[index] = value;

                return score;
            }
            else if (score > a) {
                // 再探索
                a = best_score = -search(move.o1, move.o0, move.p1, move.p0, -beta, -score, false);

                if (best_score >= beta) {
                    value.lower_bound = best_score > lower_bound ? best_score : lower_bound;
                    value.upper_bound = upper_bound;

                    transposition_table[index] = value;

                    return best_score;
                }
            }
            // score <= a
            // best_scoreがalpha値未満の時に必要
            else {
                best_score = score > best_score ? score : best_score;
            }
        }

        // alpha < best_score == ミニマックス値 < beta
        if (best_score > alpha) {
            value.lower_bound = best_score;
            value.upper_bound = best_score;

        }
        // best_score <= alpha
        else {
            value.lower_bound = lower_bound;
            value.upper_bound = best_score < upper_bound ? best_score : upper_bound;
        }

        transposition_table[index] = value;

        return best_score;
    };

    this.solve = function (p1, p0, o1, o0) {
        let start = Date.now();

        let temp = {};
        mobility(p1, p0, o1, o0, temp);

        let mob0 = temp.mob0;
        let mob1 = temp.mob1;

        // 手のソート
        let ordered_moves = [];

        // 0-31
        for (let b = mob0 & -mob0; mob0; mob0 ^= b, b = mob0 & -mob0) {
            let move_data = { sq_bit: b, offset: 0 };

            flip0(p1, p0, o1, o0, b, temp);
            let f0 = temp.f0;
            let f1 = temp.f1;

            move_data.p0 = p0 ^ f0 | b;
            move_data.p1 = p1 ^ f1;
            move_data.o0 = o0 ^ f0;
            move_data.o1 = o1 ^ f1;

            mobility(move_data.o1, move_data.o0, move_data.p1, move_data.p0, temp);
            let m0 = temp.mob0;
            let m1 = temp.mob1;

            let weighted_mobility = popcount64(m1, m0) + (m1 >>> 24 & 1) + (m1 >>> 31) + (m0 >>> 7 & 1) + (m0 & 1);
            move_data.weighted_mobility = weighted_mobility;

            let move_count = ordered_moves.length;
            for (let i = 0; i < move_count; ++i) {
                // 少ない順に並べる
                if (weighted_mobility < ordered_moves[i].weighted_mobility) {
                    ordered_moves.splice(i, 0, move_data);
                    break;
                }
            }

            if (ordered_moves.length == move_count) {
                ordered_moves.push(move_data);
            }
        }

        // 32-64
        for (let b = mob1 & -mob1; mob1; mob1 ^= b, b = mob1 & -mob1) {
            let move_data = { sq_bit: b, offset: 32 };

            flip1(p1, p0, o1, o0, b, temp);
            let f0 = temp.f0;
            let f1 = temp.f1;

            move_data.p0 = p0 ^ f0;
            move_data.p1 = p1 ^ f1 | b;
            move_data.o0 = o0 ^ f0;
            move_data.o1 = o1 ^ f1;

            mobility(move_data.o1, move_data.o0, move_data.p1, move_data.p0, temp);
            let m0 = temp.mob0;
            let m1 = temp.mob1;

            let weighted_mobility = popcount64(m1, m0) + (m1 >>> 24 & 1) + (m1 >>> 31) + (m0 >>> 7 & 1) + (m0 & 1);
            move_data.weighted_mobility = weighted_mobility;

            let move_count = ordered_moves.length;
            for (let i = 0; i < move_count; ++i) {
                // 少ない順に並べる
                if (weighted_mobility < ordered_moves[i].weighted_mobility) {
                    ordered_moves.splice(i, 0, move_data);
                    break;
                }
            }

            if (ordered_moves.length == move_count) {
                ordered_moves.push(move_data);
            }
        }


        let move_count = ordered_moves.length;
        let best_move = ordered_moves[0];
        let best_score = -search(best_move.o1, best_move.o0, best_move.p1, best_move.p0, -64, 64, false);

        for (let i = 1; i < move_count; ++i) {
            let move = ordered_moves[i];

            // null-window search
            let score = -search(move.o1, move.o0, move.p1, move.p0, -best_score - 1, -best_score, false);

            if (score > best_score) {
                // 再探索
                best_score = -search(move.o1, move.o0, move.p1, move.p0, -64, -score, false);
                best_move = move;
            }
        }

        let end = Date.now();
        let move_sq = tzcnt(best_move.sq_bit) + best_move.offset;

        return {
            "result": best_score,
            "nodes": nodes + leaf,
            "elapsed": end - start,
            "x": move_sq % 8,
            "y": move_sq / 8 | 0
        };
    }
}

self.addEventListener("message", function (position) {
    let board = position.data;

    let solver = new ReversiSolver();
    let result = solver.solve(board["p1"], board["p0"], board["o1"], board["o0"]);

    result["exact"] = true;

    self.postMessage(result);
});