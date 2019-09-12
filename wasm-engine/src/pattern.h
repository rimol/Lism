#pragma once

#include "bitboard.h"
#include <map>

// 1つのパターンで最大何個マスをみるか
constexpr int MaxDigit = 10;

constexpr int pow3(int n) {
    int r = 1;
    for (int i = 0; i < n; ++i)
        r *= 3;
    return r;
}

// abcdef...(2) -> abcdef...(3)
extern int ToBase3[1 << MaxDigit];
void initToBase3();

// 下位8ビットの表す盤面を3進数での表現に変換
// 空=0, 黒=1, 白=2;
// テーブル最高。
inline int convert(Bitboard p, Bitboard o) {
    constexpr int mask = (1 << MaxDigit) - 1;
    // 3進数では桁かぶりがないので足し算できる。
    return ToBase3[p & mask] + (ToBase3[o & mask] * 2);
}

enum RotationType {
    Rot0,
    Rot90,
    Rot180,
    Rot270,
    Rot0F,
    Rot90F,
    Rot180F,
    Rot270F
};

class Pattern {
private:
    // _packedIndex[i][j] := group i(i <= numGroup)のパターンインデックスj(j <= 3^popcount(mask[i]))を対称性で圧縮した新しいインデックス
    int **_packedIndex;
    //  回転・反転して同じパターンを1つとして数えたパターンの数
    int _numGroup;
    // 回転、反転をそれぞれ違うものとして数えたパターンの数
    int _numPattern;
    int *_group;
    RotationType *_rotationType;
    Bitboard *_mask;

    // numIndex[i] := 3^popcount(mask[i])
    int *_numIndex;
    // numPackedIndex[i] := 対称なインデックスを1つにして数えたパターンiのインデックスの数
    int *_numPackedIndex;

public:
    int numGroup() const { return _numGroup; }
    int numPattern() const { return _numPattern; }
    int numIndex(int group) const { return _numIndex[group]; }
    int numPackedIndex(int group) const { return _numPackedIndex[group]; }

    int group(int pattern) const {
        return _group[pattern];
    }

    int rotationType(int pattern) const {
        return _rotationType[pattern];
    }

    int packedIndex(int group, int patternIndex) const {
        return _packedIndex[group][patternIndex];
    }

    int extract(Bitboard p, Bitboard o, int group) const {
        return _packedIndex[group][convert(pext(p, _mask[group]), pext(o, _mask[group]))];
    }

    Bitboard mask(int group) const {
        return _mask[group];
    }

    Pattern &operator=(const Pattern &pattern);

    Pattern();
    Pattern(const Pattern &pattern);
    /*
        patternDefStrの書式:
        改行
        72 * numGroup
        (ヌル文字)
    */
    Pattern(const std::string &patternDefStr);
    ~Pattern();
};

extern const std::string LogistelloPatterns;

// extern const std::map<std::string, Pattern> Patterns;