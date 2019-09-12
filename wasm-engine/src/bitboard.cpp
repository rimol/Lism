#include "bitboard.h"
#include <cassert>
#include <iostream>
#include <random>

std::istream &operator>>(std::istream &is, Color &c) {
    int t;
    is >> t;
    c = (Color)t;
    return is;
}

// a <= x <= bか?
static bool within(int a, int b, int x) {
    return a <= x && x <= b;
}

Bitboard getMoves_slow(Bitboard p, Bitboard o) {
    Bitboard moves = 0ULL;

    for (int i = 0; i < 64; ++i) {
        // 空白マス以外はcontinue
        if ((p | o) >> i & 1ULL)
            continue;

        // 8方向みる
        for (int x = -1; x <= 1; ++x) {
            for (int y = -1; y <= 1; ++y) {
                if (x == 0 && y == 0)
                    continue;

                // 連続が切れるor端に到達したときにそのマスに自分の石があればひっくり返せる.
                int cur = i;
                int streak = 0;
                // curから調べている方向に1つ伸ばしたマスが盤面の外なら、curは端に位置している.
                while (within(0, 7, cur % 8 + x) && within(0, 7, cur / 8 + y)) {
                    if (cur != i) {
                        if (o >> cur & 1ULL)
                            ++streak;
                        else
                            break;
                    }

                    cur += x + y * 8;
                }

                // この方向にひっくり返せる
                // goto書くの嫌なので途中でひっくり返せると分かっても8方向全部見る
                if (streak > 0 && (p >> cur & 1ULL))
                    moves |= 1ULL << i;
            }
        }
    }

    return moves;
}

Bitboard getFlip_slow(Bitboard p, Bitboard o, Bitboard sqbit) {
    int sq = tzcnt(sqbit);
    Bitboard flip = 0ULL;

    for (int x = -1; x <= 1; ++x) {
        for (int y = -1; y <= 1; ++y) {
            if (x == 0 && y == 0)
                continue;

            int cur = sq;
            Bitboard fl = 0ULL;
            while (within(0, 7, cur % 8 + x) && within(0, 7, cur / 8 + y)) {
                if (cur != sq) {
                    if (o >> cur & 1ULL)
                        fl |= 1ULL << cur;
                    else
                        break;
                }

                cur += x + y * 8;
            }

            if (fl != 0ULL && (p >> cur & 1ULL))
                flip |= fl;
        }
    }

    return flip;
}

void printBitboard(const Bitboard x) {
    for (int i = 63; i >= 0; --i) {
        std::cout << ((x >> i & 1) ? 'o' : '-');
        if (i % 8 != 0)
            std::cout << ' ';
        else
            std::cout << std::endl;
    }
    std::cout << std::endl;
}

static inline Bitboard getHorizontalFlip(Bitboard ep, Bitboard eo, Bitboard sqbit) {
    eo &= 0x7eULL;
    Bitboard t = (eo + (sqbit << 1)) & ep;
    Bitboard lflip = (t - (t != 0ULL)) & (0xfeULL * sqbit);
    t = sqbit;
    t |= t >> 1 & eo;
    eo &= eo >> 1;
    t |= t >> 2 & eo;
    eo &= eo >> 2;
    t |= t >> 4 & eo;
    t >>= 1;
    Bitboard rflip = t & (-(t & ep) << 1);
    return lflip | rflip;
}

static inline Bitboard getStonesHorizontallyLinkedToCorner(Bitboard ep) {
    Bitboard lstable = ((ep + 1ULL) & ~ep) - 1ULL;
    Bitboard rstable = ep & 0x80ULL;
    rstable |= rstable >> 1 & ep;
    ep &= ep >> 1;
    rstable |= rstable >> 2 & ep;
    ep &= ep >> 2;
    rstable |= rstable >> 4 & ep;
    return lstable | rstable;
}

static Bitboard getStableStonesInHorizontalEdge(Bitboard ep, Bitboard eo) {
    Bitboard edgeOccupancy = ep | eo;
    assert(edgeOccupancy < (1ULL << 8));
    if (edgeOccupancy == 0xffULL) {
        return 0xffULL;
    } else {
        int numEdgeEmpties = 8 - popcount(edgeOccupancy);
        if (numEdgeEmpties == 1) {
            Bitboard sqbit = ~edgeOccupancy & 0xffULL;
            Bitboard horFlip = getHorizontalFlip(ep, eo, sqbit) | getHorizontalFlip(eo, ep, sqbit);

            return edgeOccupancy & ~horFlip;
        } else {
            return getStonesHorizontallyLinkedToCorner(ep) | getStonesHorizontallyLinkedToCorner(eo);
        }
    }
}

static inline Bitboard getVerticalFlip(Bitboard ep, Bitboard eo, Bitboard sqbit) {
    Bitboard d = 0x0101010101010100ULL * sqbit;
    Bitboard t = (eo | ~d) + 1ULL & d & ep;
    Bitboard uflip = t - (t != 0ULL) & d;

    eo &= 0x00ffffffffffff00ULL;
    t = sqbit;
    t |= t >> 8 & eo;
    eo &= eo >> 8;
    t |= t >> 16 & eo;
    eo &= eo >> 16;
    t |= t >> 32 & eo;
    t >>= 8;
    Bitboard dflip = t & (-(t & ep) << 8);

    return uflip | dflip;
}

static inline Bitboard getStonesVerticallyLinkedToCorner(Bitboard ep) {
    ep |= 0xfefefefefefefefeULL;
    Bitboard ustable = ((ep + 1ULL & ~ep) - 1ULL) & 0x0101010101010101ULL;
    Bitboard dstable = ep & 0x0100000000000000ULL;
    dstable |= dstable >> 8 & ep;
    ep &= ep >> 8;
    dstable |= dstable >> 16 & ep;
    ep &= ep >> 16;
    dstable |= dstable >> 32 & ep;
    return ustable | dstable;
}

static Bitboard getStableStonesInVerticalEdge(Bitboard ep, Bitboard eo) {
    Bitboard edgeOccupancy = ep | eo;
    assert((edgeOccupancy & ~0x0101010101010101ULL) == 0ULL);
    if (edgeOccupancy == 0x0101010101010101ULL) {
        return 0x0101010101010101ULL;
    } else {
        int numEdgeEmpties = 8 - popcount(edgeOccupancy);
        if (numEdgeEmpties == 1) {
            Bitboard sqbit = ~edgeOccupancy & 0x0101010101010101ULL;
            Bitboard verFlip = getVerticalFlip(ep, eo, sqbit) | getVerticalFlip(eo, ep, sqbit);

            return edgeOccupancy & ~verFlip;
        } else {
            return getStonesVerticallyLinkedToCorner(ep) | getStonesVerticallyLinkedToCorner(eo);
        }
    }
}

static inline Bitboard getSurroundedStableStones(Bitboard p, Bitboard pstable) {
    Bitboard stable = 0ULL;
    Bitboard cand = (pstable << 7 & pstable << 8 & pstable << 9) | (pstable >> 7 & pstable >> 8 & pstable >> 9);
    stable |= cand & (pstable << 1 | pstable >> 1) & p & 0x007e7e7e7e7e7e00;

    cand = (pstable << 9 & pstable << 1 & pstable >> 7) | (pstable << 7 & pstable >> 1 & pstable >> 9);
    stable |= cand & (pstable << 8 | pstable >> 8) & p & 0x007e7e7e7e7e7e00;

    return stable;
}

Bitboard getStableStones(Bitboard p, Bitboard o) {
    Bitboard stable = 0ULL;
    // 辺の確定石
    stable |= getStableStonesInHorizontalEdge(p & 0xffULL, o & 0xffULL);
    stable |= getStableStonesInHorizontalEdge(p >> 56 & 0xffULL, o >> 56 & 0xffULL) << 56;
    stable |= getStableStonesInVerticalEdge(p & 0x0101010101010101ULL, o & 0x0101010101010101ULL);
    stable |= getStableStonesInVerticalEdge(p >> 7 & 0x0101010101010101ULL, o >> 7 & 0x0101010101010101ULL) << 7;

    // 8方向が埋まっているタイプの確定石
    Bitboard cand = 0xffffffffffffffffULL;
    Bitboard occupancy = p | o;

    Bitboard t = occupancy;
    t &= t << 1 | 0x8181818181818181ULL;
    t &= t << 1 | 0x8181818181818181ULL;
    t &= t << 1 | 0x8181818181818181ULL;
    t &= t << 1 | 0x8181818181818181ULL;
    t &= t << 1 | 0x8181818181818181ULL;
    t &= t << 1 | 0x8181818181818181ULL;

    t &= t >> 1 | 0x8181818181818181ULL;
    t &= t >> 1 | 0x8181818181818181ULL;
    t &= t >> 1 | 0x8181818181818181ULL;
    t &= t >> 1 | 0x8181818181818181ULL;
    t &= t >> 1 | 0x8181818181818181ULL;
    t &= t >> 1 | 0x8181818181818181ULL;

    cand &= t;

    t = occupancy;
    t &= t << 8 | 0xff000000000000ffULL;
    t &= t << 8 | 0xff000000000000ffULL;
    t &= t << 8 | 0xff000000000000ffULL;
    t &= t << 8 | 0xff000000000000ffULL;
    t &= t << 8 | 0xff000000000000ffULL;
    t &= t << 8 | 0xff000000000000ffULL;

    t &= t >> 8 | 0xff000000000000ffULL;
    t &= t >> 8 | 0xff000000000000ffULL;
    t &= t >> 8 | 0xff000000000000ffULL;
    t &= t >> 8 | 0xff000000000000ffULL;
    t &= t >> 8 | 0xff000000000000ffULL;
    t &= t >> 8 | 0xff000000000000ffULL;

    cand &= t;

    t = occupancy;
    t &= t << 7 | 0xff818181818181ffULL;
    t &= t << 7 | 0xff818181818181ffULL;
    t &= t << 7 | 0xff818181818181ffULL;
    t &= t << 7 | 0xff818181818181ffULL;
    t &= t << 7 | 0xff818181818181ffULL;
    t &= t << 7 | 0xff818181818181ffULL;

    t &= t >> 7 | 0xff818181818181ffULL;
    t &= t >> 7 | 0xff818181818181ffULL;
    t &= t >> 7 | 0xff818181818181ffULL;
    t &= t >> 7 | 0xff818181818181ffULL;
    t &= t >> 7 | 0xff818181818181ffULL;
    t &= t >> 7 | 0xff818181818181ffULL;

    cand &= t;

    t = occupancy;
    t &= t << 9 | 0xff818181818181ffULL;
    t &= t << 9 | 0xff818181818181ffULL;
    t &= t << 9 | 0xff818181818181ffULL;
    t &= t << 9 | 0xff818181818181ffULL;
    t &= t << 9 | 0xff818181818181ffULL;
    t &= t << 9 | 0xff818181818181ffULL;

    t &= t >> 9 | 0xff818181818181ffULL;
    t &= t >> 9 | 0xff818181818181ffULL;
    t &= t >> 9 | 0xff818181818181ffULL;
    t &= t >> 9 | 0xff818181818181ffULL;
    t &= t >> 9 | 0xff818181818181ffULL;
    t &= t >> 9 | 0xff818181818181ffULL;

    cand &= t;
    stable |= cand;

    /*
        確確確      確確確
        確自   -->  確確
        みたいな処理を繰り返す。
        8回ループすれば十分。
    */
    for (int i = 0; i < 8; ++i) {
        Bitboard newStable = getSurroundedStableStones(p, stable & p);
        if (newStable != 0ULL)
            stable |= newStable;
        else
            break;
    }

    for (int i = 0; i < 8; ++i) {
        Bitboard newStable = getSurroundedStableStones(o, stable & o);
        if (newStable != 0ULL)
            stable |= newStable;
        else
            break;
    }

    return stable;
}

Bitboard DiagonalMask[64][2];
int CountFlip[8][1 << 8];

void initCountFlipTables() {
    // 対角線のマスク
    for (int i = 0; i < 64; ++i) {
        Bitboard diag1 = 1ULL << i, diag2 = 1ULL << i;

        for (int j = 0; j < 6; ++j) {
            diag1 |= diag1 << 9 | diag1 >> 9;
            diag2 |= diag2 << 7 | diag2 >> 7;
            diag1 &= 0x7e7e7e7e7e7e7e7eULL;
            diag2 &= 0x7e7e7e7e7e7e7e7eULL;
        }

        DiagonalMask[i][0] = diag1 << 9 | diag1 >> 9;
        DiagonalMask[i][1] = diag2 << 7 | diag2 >> 7;
    }

    // CountFlip
    for (int i = 0; i < 8; ++i) {
        for (int j = 0; j < (1 << 8); ++j) {
            if (j >> i & 1)
                continue;

            Bitboard sqbit = 1ULL << i;
            Bitboard p = static_cast<Bitboard>(j);
            Bitboard o = ~p ^ sqbit;

            Bitboard flip = getFlip(p, o, sqbit);
            CountFlip[i][j] = popcount(flip);
        }
    }
}