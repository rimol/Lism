// 評価部
// コンパイル前にengine.jsとくっつける。 <- ので、共用の関数を一番上においておく。

function popcount64(x1, x0) {
    let t0 = x1 - (x1 >>> 1 & 0x55555555);
    t0 = (t0 & 0x33333333) + ((t0 & 0xcccccccc) >>> 2);
    let t1 = x0 - (x0 >>> 1 & 0x55555555);
    t0 += (t1 & 0x33333333) + ((t1 & 0xcccccccc) >>> 2);
    t0 = (t0 & 0x0f0f0f0f) + ((t0 & 0xf0f0f0f0) >>> 4);
    return t0 * 0x01010101 >>> 24;
}

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

// 評価部本体
let evaluate = (function() {

    const PositionValues = [];
    {
        const GridValues = [
            [30, -12, 0, -1, -1, 0, -12, 30],
            [-12, -15, -3, -3, -3, -3, -15, -12],
            [0, -3, 0, -1, -1, 0, -3, 0],
            [-1, -3, -1, -1, -1, -1, -3, -1],
            [-1, -3, -1, -1, -1, -1, -3, -1],
            [0, -3, 0, -1, -1, 0, -3, 0],
            [-12, -15, -3, -3, -3, -3, -15, -12],
            [30, -12, 0, -1, -1, 0, -12, 30]
        ];

        for (let i = 0; i < 8; i++) {
            PositionValues[i] = [];
            for (let j = 0; j <= 0xff; j++) {
                let score = 0;

                score += (j & 1) && GridValues[i][0];
                score += (j & 2) && GridValues[i][1];
                score += (j & 4) && GridValues[i][2];
                score += (j & 8) && GridValues[i][3];
                score += (j & 16) && GridValues[i][4];
                score += (j & 32) && GridValues[i][5];
                score += (j & 64) && GridValues[i][6];
                score += (j & 128) && GridValues[i][7];

                PositionValues[i][j] = score;
            }
        }
    }

    //辺の確定石
    const EdgeStability = [];
    {
        EdgeStability[0b00000001] = 1;
        EdgeStability[0b00000011] = 2;
        EdgeStability[0b00000111] = 3;
        EdgeStability[0b00001111] = 4;
        EdgeStability[0b00011111] = 5;
        EdgeStability[0b00111111] = 6;
        EdgeStability[0b01111111] = 7;
        EdgeStability[0b11111111] = 8;
        EdgeStability[0b11111110] = 7;
        EdgeStability[0b11111100] = 6;
        EdgeStability[0b11111000] = 5;
        EdgeStability[0b11111100] = 4;
        EdgeStability[0b11100000] = 3;
        EdgeStability[0b11000000] = 2;
        EdgeStability[0b10000000] = 1;

        // 要素がないところを0埋めする
        for (let i = 0; i <= 0xff; ++i) {
            if (!EdgeStability[i]) {
                EdgeStability[i] = 0;
            }
        }
    }

    const EdgeValues = [];
    {
        // ウイング
        EdgeValues[0b01111100] = -10//適当
        EdgeValues[0b00111110] = -10//適当
        // 終わってる辺
        EdgeValues[0b01111101] = -20//適当
        EdgeValues[0b10111110] = -20//適当
        // そんなに不利ではないが少し危険
        EdgeValues[0b00111101] = 5//適当
        EdgeValues[0b10111100] = 5//適当
        // 山 良い
        EdgeValues[0b01111110] = 10//適当

        EdgeValues[0b11111110] = 20//適当
        EdgeValues[0b01111111] = 20//適当

        EdgeValues[0b11111111] = 25//適当

        // 要素がないところを0埋めする
        for (let i = 0; i <= 0xff; ++i) {
            if (!EdgeValues[i]) {
                EdgeValues[i] = 0;
            }
        }
    }

    // 適当
    const FeatureWeight = [];
    {
        //pos, mobility, edge, edge stability, parity
        FeatureWeight[0] = [1, 3, 0.5, 1, 0];
        FeatureWeight[1] = [1, 3, 0.5, 1, 0];
        FeatureWeight[2] = [1, 3, 0.5, 1, 0];
        FeatureWeight[3] = [1, 3, 0.5, 1, 0];
        FeatureWeight[4] = [1, 3, 0.5, 1, 0];
        FeatureWeight[5] = [1, 3, 0.5, 1, 0];
        FeatureWeight[6] = [1, 3, 0.5, 1, 0];
        FeatureWeight[7] = [1, 3, 0.5, 1, 0];
        FeatureWeight[8] = [1, 3, 0.5, 1, 0];
        FeatureWeight[9] = [1, 3, 0.5, 1, 0];
        FeatureWeight[10] = [1, 3, 0.6, 1, 0];
        FeatureWeight[11] = [1, 3, 0.6, 1, 0];
        FeatureWeight[12] = [1, 4, 0.6, 1, 0];
        FeatureWeight[13] = [1, 4, 0.6, 1, 0];
        FeatureWeight[14] = [1, 4, 0.6, 1, 0];
        FeatureWeight[15] = [1, 4, 0.6, 1, 0];
        FeatureWeight[16] = [0.9, 4, 0.6, 1, 0];
        FeatureWeight[17] = [0.9, 4, 0.6, 1, 0];
        FeatureWeight[18] = [0.9, 4, 0.6, 1, 0];
        FeatureWeight[19] = [0.9, 4, 0.6, 1, 0];
        FeatureWeight[20] = [0.8, 4, 0.8, 1, 0];
        FeatureWeight[21] = [0.8, 4, 0.8, 1, 0];
        FeatureWeight[22] = [0.8, 4, 0.8, 1, 1];
        FeatureWeight[23] = [0.8, 5, 0.8, 1, 1];
        FeatureWeight[24] = [0.8, 5, 0.8, 1, 1];
        FeatureWeight[25] = [0.8, 5, 0.8, 1.1, 1];
        FeatureWeight[26] = [0.8, 5, 0.8, 1.2, 2];
        FeatureWeight[27] = [0.7, 5, 0.8, 1.3, 2];
        FeatureWeight[28] = [0.7, 5, 0.8, 1.4, 2];
        FeatureWeight[29] = [0.6, 5, 0.8, 1.5, 2];
        FeatureWeight[30] = [0.6, 5, 1, 1.6, 3];
        FeatureWeight[31] = [0.6, 5, 1, 1.7, 3];
        FeatureWeight[32] = [0.6, 5, 1, 1.8, 3];
        FeatureWeight[33] = [0.6, 5, 1, 1.9, 3];
        FeatureWeight[34] = [0.6, 5, 1, 2, 3];
        FeatureWeight[35] = [0.6, 5, 1, 2, 3];
        FeatureWeight[36] = [0.6, 5, 1, 2, 3];
        FeatureWeight[37] = [0.5, 5, 1, 2, 3];
        FeatureWeight[38] = [0.5, 5, 1, 2.1, 3];
        FeatureWeight[39] = [0.5, 5, 1, 2.2, 3];
        FeatureWeight[40] = [0.5, 4, 1, 2.2, 4];
        FeatureWeight[41] = [0.5, 4, 1, 2.3, 4];
        FeatureWeight[42] = [0.5, 4, 1, 2.3, 4];
        FeatureWeight[43] = [0.5, 4, 1, 2.5, 4];
        FeatureWeight[44] = [0.5, 4, 1, 2.5, 4];
        FeatureWeight[45] = [0.5, 4, 0.8, 2.5, 4];
        FeatureWeight[46] = [0.4, 3, 0.6, 3, 4];
        FeatureWeight[47] = [0.4, 3, 0.4, 3, 5];
        FeatureWeight[48] = [0.4, 3, 0.2, 3, 5];
        FeatureWeight[49] = [0.4, 3, 0, 3, 5];
        FeatureWeight[50] = [0.4, 3, 0, 3, 5];
        FeatureWeight[51] = [0.4, 3, 0, 3, 5];
        FeatureWeight[52] = [0.4, 3, 0, 3, 5];
        FeatureWeight[53] = [0.4, 3, 0, 3, 5];
        FeatureWeight[54] = [0.4, 3, 0, 3, 5];
        FeatureWeight[55] = [0.3, 3, 0, 3, 5];
        FeatureWeight[56] = [0.3, 3, 0, 3, 5];
        FeatureWeight[57] = [0.3, 3, 0, 3, 5];
        FeatureWeight[58] = [0.3, 3, 0, 3, 5];
        FeatureWeight[59] = [0.3, 3, 0, 3, 5];
    }

    // 対角線を軸にビットボードを反転させる。
    function flipDiagonal (b1, b0, out) {
        let t = b1;

        b1 = (t ^ (t >>> 27)) & 0x00000011;
        t = b1 = t ^ b1 ^ (b1 << 27);
        b1 = (t ^ (t >>> 18)) & 0x00001122;
        t = b1 = t ^ b1 ^ (b1 << 18);
        b1 = (t ^ (t >>> 9)) & 0x00112244;
        b1 = t ^ b1 ^ (b1 << 9);

        t = b0;

        b0 = (t ^ (t >>> 27)) & 0x00000011;
        t = b0 = t ^ b0 ^ (b0 << 27);
        b0 = (t ^ (t >>> 18)) & 0x00001122;
        t = b0 = t ^ b0 ^ (b0 << 18);
        b0 = (t ^ (t >>> 9)) & 0x00112244;
        b0 = t ^ b0 ^ (b0 << 9);

        out.f1 = ((b0 & 0x0f0f0f0f) << 4) | (b1 & 0x0f0f0f0f);
        out.f0 = (b0 & 0xf0f0f0f0) | ((b1 & 0xf0f0f0f0) >>> 4);
    }

    // 立っているビットの数の偶奇を返す。 popcount() % 2と同義。
    function parity(x) {
        x ^= x >>> 16;
        x ^= x >>> 8;
        x ^= x >>> 4;
        x ^= x >>> 2;
        return (x ^ x >>> 1) & 1;
    }

    const temp = {};

    function evaluate(p1, p0, o1, o0) {
       let player_score = popcount64(p1, p0);
       let opponent_score = popcount64(o1, o0);

       // 全取りを防ぐ
       if (player_score === 0) return -999999;
       else if (opponent_score === 0) return 999999;

       flipDiagonal(p1, p0, temp);
       let pf1 = temp.f1;
       let pf0 = temp.f0;

       flipDiagonal(o1, o0, temp);
       let of1 = temp.f1;
       let of0 = temp.f0;

       // pos

       let player_pos_val = PositionValues[0][p1 >>> 24];
       player_pos_val += PositionValues[1][p1 >>> 16 & 0xff];
       player_pos_val += PositionValues[2][p1 >>> 8 & 0xff];
       player_pos_val += PositionValues[3][p1 & 0xff];

       player_pos_val += PositionValues[4][p0 >>> 24];
       player_pos_val += PositionValues[5][p0 >>> 16 & 0xff];
       player_pos_val += PositionValues[6][p0 >>> 8 & 0xff];
       player_pos_val += PositionValues[7][p0 & 0xff];

       let opponent_pos_val = PositionValues[0][o1 >>> 24];
       opponent_pos_val += PositionValues[1][o1 >>> 16 & 0xff];
       opponent_pos_val += PositionValues[2][o1 >>> 8 & 0xff];
       opponent_pos_val += PositionValues[3][o1 & 0xff];

       opponent_pos_val += PositionValues[4][o0 >>> 24];
       opponent_pos_val += PositionValues[5][o0 >>> 16 & 0xff];
       opponent_pos_val += PositionValues[6][o0 >>> 8 & 0xff];
       opponent_pos_val += PositionValues[7][o0 & 0xff];

       // mobility

       mobility(p1, p0, o1, o0, temp);
       let player_mobility = popcount64(temp.mob1, temp.mob0);

       mobility(o1, o0, p1, p0, temp);
       let opponent_mobility = popcount64(temp.mob1, temp.mob0);

       // edge stability
       let player_stability = EdgeStability[p1 >>> 24];
       player_stability += EdgeStability[p0 & 0xff];
       player_stability += EdgeStability[pf1 >>> 24];
       player_stability += EdgeStability[pf0 & 0xff];

       let opponent_stability = EdgeStability[o1 >>> 24];
       opponent_stability += EdgeStability[o0 & 0xff];
       opponent_stability += EdgeStability[of1 >>> 24];
       opponent_stability += EdgeStability[of0 & 0xff];

       let player_edge_val = EdgeValues[p1 >>> 24];
       player_edge_val += EdgeValues[p0 & 0xff];
       player_edge_val += EdgeValues[pf1 >>> 24];
       player_edge_val += EdgeValues[pf0 & 0xff];

       let opponent_edge_val = EdgeValues[o1 >>> 24];
       opponent_edge_val += EdgeValues[o0 & 0xff];
       opponent_edge_val += EdgeValues[of1 >>> 24];
       opponent_edge_val += EdgeValues[of0 & 0xff];

       let blank1 = ~(p1 | o1);
       let blank0 = ~(p0 | o0);

       let quad_parity = parity(blank1 & 0x0f0f0f0f) + parity(blank1 & 0xf0f0f0f0) + parity(blank0 & 0x0f0f0f0f) + parity(blank0 & 0xf0f0f0f0);

       let weight = FeatureWeight[player_score + opponent_score - 4];

       player_score = player_pos_val * weight[0] + player_mobility * weight[1] + player_edge_val * weight[2] * player_stability * weight[3] + quad_parity * weight[4];
       opponent_score = opponent_pos_val * weight[0] + opponent_mobility * weight[1] + opponent_edge_val * weight[2] * opponent_stability * weight[3] - quad_parity * weight[4];

       return player_score - opponent_score;
    }

    return evaluate;
})();