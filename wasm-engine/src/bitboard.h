#pragma once

#include <iostream>
#include <stdint.h>

#ifndef __EMSCRIPTEN__
#include <immintrin.h>
#endif

enum Color {
    Black,
    White
};

constexpr Color operator~(Color c) { return (Color)(c ^ 1); }
std::istream &operator>>(std::istream &is, Color &c);

using Bitboard = unsigned long long;

// CPU命令は使わずに実装する.

/*
ビットと実際のマスの対応

    A  B  C  D  E  F  G  H
1  63 62 61 60 59 58 57 56
2  55 54 53 52 51 50 49 48
3  47 46 45 44 43 42 41 40
4  39 38 37 36 35 34 33 32
5  31 30 29 28 27 26 25 24
6  23 22 21 20 19 18 17 16
7  15 14 13 12 11 10 09 08
8  07 06 05 04 03 02 01 00 <- 0ビット目

      Top
<- Left Right ->
     Bottom

これ逆の方がいいんじゃ...（）
*/

// ビットマスク
constexpr Bitboard LeftTop = 0xf0f0f0f000000000ULL;
constexpr Bitboard RightTop = 0x0f0f0f0f00000000ULL;
constexpr Bitboard LeftBottom = 0x00000000f0f0f0f0ULL;
constexpr Bitboard RightBottom = 0x000000000f0f0f0fULL;

// 立っているビットの数を数える
constexpr int popcount(Bitboard x) {
    // x -= (x >> 1) & 0x5555555555555555ULL;
    // x = (x & 0x3333333333333333ULL) + ((x >> 2) & 0x3333333333333333ULL);
    // x = (x & 0x0f0f0f0f0f0f0f0fULL) + ((x >> 4) & 0x0f0f0f0f0f0f0f0fULL);
    // return x * 0x0101010101010101ULL >> 56;
    return __builtin_popcountll(x);
}

// 一番下のビットが下から数えて何ビット目にあるか求める(0-indexed)
constexpr int tzcnt(Bitboard x) {
    // return popcount(~x & x - 1ULL);
    return __builtin_ctzll(x);
}

// popcount % 2
inline int parity(Bitboard x) {
#ifdef __EMSCRIPTEN__
    x ^= x >> 32;
    x ^= x >> 16;
    x ^= x >> 8;
    x ^= x >> 4;
    x ^= x >> 2;
    return (x ^ x >> 1) & 1;
#else
    return popcount(x) & 1;
#endif
}

inline int paritySum(Bitboard occupancy) {
    return parity(occupancy & LeftTop) + parity(occupancy & RightTop) + parity(occupancy & LeftBottom) + parity(occupancy & RightBottom);
}

inline Bitboard pext(Bitboard x, Bitboard mask) {
#ifdef __EMSCRIPTEN__
    Bitboard extracted = 0ULL;
    for (Bitboard i = 1ULL; mask != 0ULL; i <<= 1) {
        Bitboard lb = mask & -mask;
        mask ^= lb;
        if (x & lb)
            extracted |= i;
    }
    return extracted;
#else
    return _pext_u64(x, mask);
#endif
}

// コピペ
constexpr Bitboard delta_swap(Bitboard x, Bitboard mask, int delta) {
    // ペアのxor
    Bitboard t = (x ^ (x >> delta)) & mask;
    // これを使えば簡単にswapできる
    return t ^ (t << delta) ^ x;
}

constexpr Bitboard flipVertical(Bitboard x) {
    x = x >> 32 | x << 32;
    x = (x >> 16 & 0x0000ffff0000ffffULL) | (x & 0x0000ffff0000ffffULL) << 16;
    return (x >> 8 & 0x00ff00ff00ff00ffULL) | (x & 0x00ff00ff00ff00ffULL) << 8;
}

// ビット列を逆転する。 ex) 1010 -> 0101
constexpr Bitboard rotateBy180(Bitboard x) {
    x = (x >> 32) | (x << 32);
    x = (x >> 16 & 0x0000ffff0000ffffULL) | (x << 16 & 0xffff0000ffff0000ULL);
    x = (x >> 8 & 0x00ff00ff00ff00ffULL) | (x << 8 & 0xff00ff00ff00ff00ULL);
    x = (x >> 4 & 0x0f0f0f0f0f0f0f0fULL) | (x << 4 & 0xf0f0f0f0f0f0f0f0ULL);
    x = (x >> 2 & 0x3333333333333333ULL) | (x << 2 & 0xccccccccccccccccULL);
    return (x >> 1 & 0x5555555555555555ULL) | (x << 1 & 0xaaaaaaaaaaaaaaaaULL);
}

constexpr Bitboard flipDiagonalA8H1(Bitboard x) {
    /*
    0x000000000f0f0f0f = 
    0000 0000
    0000 0000
    0000 0000
    0000 0000

    0000 1111
    0000 1111
    0000 1111
    0000 1111
    */
    x = delta_swap(x, 0x000000000f0f0f0fULL, 36);
    /*
    0x0000333300003333 = 
    0000 0000
    0000 0000
    0011 0011
    0011 0011

    0000 0000
    0000 0000
    0011 0011
    0011 0011
    */
    x = delta_swap(x, 0x0000333300003333ULL, 18);
    /*
    0x0055005500550055 = 
    0000 0000
    0101 0101
    0000 0000
    0101 0101

    0000 0000
    0101 0101
    0000 0000
    0101 0101
    */
    return delta_swap(x, 0x0055005500550055ULL, 9);
}

// ビットボードを右に90°回転させる.
// 対角線A8H1を軸に盤面を反転させて、1, 2, 3, ..., 8列を反転させて8, 7, 6, ..., 1列にすればよい
constexpr Bitboard rotateRightBy90(Bitboard x) {
    return flipVertical(flipDiagonalA8H1(x));
}

// 打てるマスのビットを立てる
inline Bitboard getMoves(Bitboard p, Bitboard o) {
#ifndef __EMSCRIPTEN__
    const __m256i p4 = _mm256_broadcastq_epi64(_mm_cvtsi64_si128(p));
    const __m256i o4 = _mm256_broadcastq_epi64(_mm_cvtsi64_si128(o));
    const __m256i mask4 = {0x7e7e7e7e7e7e7e7eULL, 0x00ffffffffffff00ULL, 0x007e7e7e7e7e7e00ULL, 0x007e7e7e7e7e7e00ULL};
    __m256i shift4 = {1, 8, 9, 7};
    __m256i t4 = _mm256_load_si256(&p4);
    __m256i mo4 = _mm256_and_si256(o4, mask4);
    t4 = _mm256_or_si256(t4, _mm256_and_si256(_mm256_sllv_epi64(t4, shift4), mo4));
    mo4 = _mm256_and_si256(mo4, _mm256_sllv_epi64(mo4, shift4));
    shift4 = _mm256_slli_epi64(shift4, 1);
    t4 = _mm256_or_si256(t4, _mm256_and_si256(_mm256_sllv_epi64(t4, shift4), mo4));
    mo4 = _mm256_and_si256(mo4, _mm256_sllv_epi64(mo4, shift4));
    shift4 = _mm256_slli_epi64(shift4, 1);
    t4 = _mm256_or_si256(t4, _mm256_and_si256(_mm256_sllv_epi64(t4, shift4), mo4));
    shift4 = _mm256_srli_epi64(shift4, 2);
    __m256i moves4 = _mm256_sllv_epi64(_mm256_xor_si256(t4, p4), shift4);

    t4 = _mm256_load_si256(&p4);
    mo4 = _mm256_and_si256(o4, mask4);
    t4 = _mm256_or_si256(t4, _mm256_and_si256(_mm256_srlv_epi64(t4, shift4), mo4));
    mo4 = _mm256_and_si256(mo4, _mm256_srlv_epi64(mo4, shift4));
    shift4 = _mm256_slli_epi64(shift4, 1);
    t4 = _mm256_or_si256(t4, _mm256_and_si256(_mm256_srlv_epi64(t4, shift4), mo4));
    mo4 = _mm256_and_si256(mo4, _mm256_srlv_epi64(mo4, shift4));
    shift4 = _mm256_slli_epi64(shift4, 1);
    t4 = _mm256_or_si256(t4, _mm256_and_si256(_mm256_srlv_epi64(t4, shift4), mo4));
    shift4 = _mm256_srli_epi64(shift4, 2);
    moves4 = _mm256_or_si256(moves4, _mm256_srlv_epi64(_mm256_xor_si256(t4, p4), shift4));

    __m128i moves2 = _mm_or_si128(_mm256_extracti128_si256(moves4, 0), _mm256_extracti128_si256(moves4, 1));
    return (_mm_extract_epi64(moves2, 0) | _mm_extract_epi64(moves2, 1)) & ~(p | o);
#else
    Bitboard moves = 0ULL;
    Bitboard blank = ~(p | o);
    // マスク済み敵石のビットボード
    Bitboard mo = o & 0x7e7e7e7e7e7e7e7eULL;
    Bitboard ps = p << 1;
    // 一時変数
    Bitboard t = 0ULL;

    // 右
    moves = (mo + ps) & blank & ~ps;
    // 左
    t = p;
    t |= t >> 1 & mo;
    mo &= mo >> 1;
    t |= t >> 2 & mo;
    mo &= mo >> 2;
    t |= t >> 4 & mo;
    moves |= (t ^ p) >> 1 & blank;
    // 下
    mo = o & 0x00ffffffffffff00ULL;
    t = p;
    t |= t << 8 & mo;
    mo &= mo << 8;
    t |= t << 16 & mo;
    mo &= mo << 16;
    t |= t << 32 & mo;
    moves |= (t ^ p) << 8 & blank;
    // 上
    mo = o & 0x00ffffffffffff00ULL;
    t = p;
    t |= t >> 8 & mo;
    mo &= mo >> 8;
    t |= t >> 16 & mo;
    mo &= mo >> 16;
    t |= t >> 32 & mo;
    moves |= (t ^ p) >> 8 & blank;
    // 右下
    mo = o & 0x007e7e7e7e7e7e00ULL;
    t = p;
    t |= t << 9 & mo;
    mo &= mo << 9;
    t |= t << 18 & mo;
    mo &= mo << 18;
    t |= t << 36 & mo;
    moves |= (t ^ p) << 9 & blank;
    // 左上
    mo = o & 0x007e7e7e7e7e7e00ULL;
    t = p;
    t |= t >> 9 & mo;
    mo &= mo >> 9;
    t |= t >> 18 & mo;
    mo &= mo >> 18;
    t |= t >> 36 & mo;
    moves |= (t ^ p) >> 9 & blank;
    // 左下
    mo = o & 0x007e7e7e7e7e7e00ULL;
    t = p;
    t |= t << 7 & mo;
    mo &= mo << 7;
    t |= t << 14 & mo;
    mo &= mo << 14;
    t |= t << 28 & mo;
    moves |= (t ^ p) << 7 & blank;
    // 右上
    mo = o & 0x007e7e7e7e7e7e00ULL;
    t = p;
    t |= t >> 7 & mo;
    mo &= mo >> 7;
    t |= t >> 14 & mo;
    mo &= mo >> 14;
    t |= t >> 28 & mo;
    moves |= (t ^ p) >> 7 & blank;

    return moves;
#endif
}

// ひっくり返す石があるマスのビットを立てる
inline Bitboard getFlip(Bitboard p, Bitboard o, Bitboard sqbit) {
#ifndef __EMSCRIPTEN__
    const __m256i p4 = _mm256_broadcastq_epi64(_mm_cvtsi64_si128(p));
    const __m256i o4 = _mm256_broadcastq_epi64(_mm_cvtsi64_si128(o));
    const __m256i sqbit4 = _mm256_broadcastq_epi64(_mm_cvtsi64_si128(sqbit));
    const __m256i minus4 = _mm256_broadcastq_epi64(_mm_cvtsi64_si128(-1ULL));
    __m256i mask4 = _mm256_set_epi64x(0x7e7e7e7e7e7e7e7eULL, 0x7e7e7e7e7e7e7e7eULL, 0xffffffffffffffffULL, 0x7e7e7e7e7e7e7e7eULL);
    __m256i d4 = _mm256_set_epi64x(0x00000000000000feULL, 0x8040201008040200ULL, 0x0101010101010100ULL, 0x0002040810204080ULL);
    d4 = _mm256_slli_epi64(d4, tzcnt(sqbit));
    __m256i mo4 = _mm256_and_si256(o4, mask4);
    __m256i t4 = _mm256_sub_epi64(_mm256_or_si256(mo4, _mm256_xor_si256(d4, minus4)), minus4);
    t4 = _mm256_and_si256(_mm256_and_si256(t4, d4), p4);
    __m256i flip4 = _mm256_and_si256(_mm256_add_epi64(t4, _mm256_xor_si256(_mm256_cmpeq_epi64(t4, _mm256_setzero_si256()), minus4)), d4);

    __m256i shift4 = {1, 8, 9, 7};
    mask4 = _mm256_set_epi64x(0x7e7e7e7e7e7e7e7eULL, 0x00ffffffffffff00ULL, 0x007e7e7e7e7e7e00ULL, 0x007e7e7e7e7e7e00ULL);
    t4 = _mm256_load_si256(&sqbit4);
    t4 = _mm256_or_si256(t4, _mm256_and_si256(_mm256_srlv_epi64(t4, shift4), mo4));
    mo4 = _mm256_and_si256(mo4, _mm256_srlv_epi64(mo4, shift4));
    shift4 = _mm256_slli_epi64(shift4, 1);
    t4 = _mm256_or_si256(t4, _mm256_and_si256(_mm256_srlv_epi64(t4, shift4), mo4));
    mo4 = _mm256_and_si256(mo4, _mm256_srlv_epi64(mo4, shift4));
    shift4 = _mm256_slli_epi64(shift4, 1);
    t4 = _mm256_or_si256(t4, _mm256_and_si256(_mm256_srlv_epi64(t4, shift4), mo4));
    shift4 = _mm256_srli_epi64(shift4, 2);
    t4 = _mm256_srlv_epi64(t4, shift4);

    flip4 = _mm256_or_si256(_mm256_and_si256(t4, _mm256_sllv_epi64(_mm256_sub_epi64(_mm256_setzero_si256(), _mm256_and_si256(t4, p4)), shift4)), flip4);

    __m128i flip2 = _mm_or_si128(_mm256_extracti128_si256(flip4, 0), _mm256_extracti128_si256(flip4, 1));
    return _mm_extract_epi64(flip2, 0) | _mm_extract_epi64(flip2, 1);
#else
    Bitboard flip = 0ULL;
    Bitboard mo = o & 0x7e7e7e7e7e7e7e7eULL;

    // 左
    Bitboard d = 0x00000000000000feULL * sqbit;
    Bitboard t = (mo | ~d) + 1ULL & d & p;
    flip = t - (t != 0ULL) & d;
    // 左上
    d = 0x8040201008040200ULL * sqbit;
    t = (mo | ~d) + 1ULL & d & p;
    flip |= t - (t != 0ULL) & d;
    // 上 マスクは付けてはだめ。
    d = 0x0101010101010100ULL * sqbit;
    t = (o | ~d) + 1ULL & d & p;
    flip |= t - (t != 0ULL) & d;
    // 右上
    d = 0x0002040810204080ULL * sqbit;
    t = (mo | ~d) + 1ULL & d & p;
    flip |= t - (t != 0ULL) & d;
    // 右
    t = sqbit;
    t |= t >> 1 & mo;
    mo &= mo >> 1;
    t |= t >> 2 & mo;
    mo &= mo >> 2;
    t |= t >> 4 & mo;
    t >>= 1;
    flip |= t & (-(t & p) << 1);
    // 下
    mo = o & 0x00ffffffffffff00ULL;
    t = sqbit;
    t |= t >> 8 & mo;
    mo &= mo >> 8;
    t |= t >> 16 & mo;
    mo &= mo >> 16;
    t |= t >> 32 & mo;
    t >>= 8;
    flip |= t & (-(t & p) << 8);
    // 右下
    mo = o & 0x007e7e7e7e7e7e00ULL;
    t = sqbit;
    t |= t >> 9 & mo;
    mo &= mo >> 9;
    t |= t >> 18 & mo;
    mo &= mo >> 18;
    t |= t >> 36 & mo;
    t >>= 9;
    flip |= t & (-(t & p) << 9);
    // 左下
    mo = o & 0x007e7e7e7e7e7e00ULL;
    t = sqbit;
    t |= t >> 7 & mo;
    mo &= mo >> 7;
    t |= t >> 14 & mo;
    mo &= mo >> 14;
    t |= t >> 28 & mo;
    t >>= 7;
    flip |= t & (-(t & p) << 7);

    return flip;
#endif
}

/*
定数をシフトしてマスクを作ると余分な部分もみてしまうので、
00000000
00000000
00000000
10000000
01000000
00100000
00010000
00001000
のようなそれを省いたマスクをあらかじめ作っておく
*/
extern Bitboard DiagonalMask[64][2];
// CountFlip[i][j] := iの位置に現在手番のプレイヤーが石を置いたときにひっくり返る石の数
extern int CountFlip[8][1 << 8];

void initCountFlipTables();

// 残り1マス空いている時のpopcount(flip)
inline int countFlip(Bitboard p, int sq) {
    int x = sq & 7;
    int y = 7 - (sq >> 3);
    /*  MSB
        A***A*** diag2
        *B**B**B
        **C*C*C*
        ***DDD**
        ABCDEFGH hor
        ***FFF**
        **G*G*G*
        *H**H**H LSB
            v   diag1
            e
            r


        hor = ABCDEFGH
        ver = HGFEDCBA
        diag1 = ABCDEFGH
        diag2 = 0HGFEDCB

        な感じでビットが抽出される。向きに注意
    */
    int hor = p << (y * 8) >> 56;
    int ver = (p >> x & 0x0101010101010101ULL) * 0x8040201008040201ULL >> 56;
    int diag1 = (p & DiagonalMask[sq][0]) * 0x0101010101010101ULL >> 56;
    int diag2 = (p & DiagonalMask[sq][1]) * 0x0101010101010101ULL >> 56;

    return CountFlip[x][hor] + CountFlip[y][ver] + CountFlip[x][diag1] + CountFlip[x][diag2];
}

inline int getMobility(Bitboard p, Bitboard o) {
    return popcount(getMoves(p, o));
}

inline int getWeightedMobility(Bitboard p, Bitboard o) {
    Bitboard moves = getMoves(p, o);
    return popcount(moves) + (moves >> 0 & 1ULL) + (moves >> 7 & 1ULL) + (moves >> 56 & 1ULL) + (moves >> 63 & 1ULL);
}

inline int mobilityDiff(Bitboard p, Bitboard o) {
    return getMobility(p, o) - getMobility(o, p);
}

inline void rotateAndFlipBB(Bitboard x, Bitboard (&out)[8]) {
    out[0] = x;
    out[1] = rotateRightBy90(x);
    out[2] = rotateBy180(x);
    out[3] = rotateRightBy90(out[2]);
    for (int i = 0; i < 4; ++i) {
        out[i + 4] = flipVertical(out[i]);
    }
}

// 確定石列挙
Bitboard getStableStones(Bitboard p, Bitboard o);

// 愚直実装ばーじょん
// バグつぶし用

Bitboard getMoves_slow(Bitboard p, Bitboard o);
Bitboard getFlip_slow(Bitboard p, Bitboard o, Bitboard sqbit);

// cout でビットボードを見やすく出力する用
// ostream: coutとか.
// std::ostream& operator << (std::ostream& os, const Bitboard x);
// ↑typedefでunsigned long long の名前を Bitboard に変えているだけなので, もとのオーバーロードと判断がつかないため使えない

void printBitboard(const Bitboard x);