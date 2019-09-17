#include "eval.h"
#include "bitboard.h"
#include "pattern.h"
#include "util.h"
#include <algorithm>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

using std::cerr;
using std::endl;

PatternEvaluator::PatternEvaluator() : usedPattern(nullptr), weights(nullptr) {}

PatternEvaluator::PatternEvaluator(const Pattern *usedPattern, int numStages) : usedPattern(usedPattern), numStages(numStages), stageInterval(60 / numStages) {
    weights = new int **[numStages];
    for (int i = 0; i < numStages; ++i) {
        weights[i] = new int *[usedPattern->numGroup()];
        for (int j = 0; j < usedPattern->numGroup(); ++j) {
            weights[i][j] = new int[usedPattern->numPackedIndex(j)];
        }
    }
}

PatternEvaluator &PatternEvaluator::operator=(const PatternEvaluator &patternEvaluator) {
    // 今確保しているメモリを解放
    if (weights != nullptr) {
        for (int i = 0; i < numStages; ++i) {
            if (weights[i] != nullptr) {
                for (int j = 0; j < usedPattern->numGroup(); ++j) {
                    delete[] weights[i][j];
                }
                delete[] weights[i];
            }
        }
        delete[] weights;
    }

    numStages = patternEvaluator.numStages;
    stageInterval = patternEvaluator.stageInterval;
    usedPattern = patternEvaluator.usedPattern;

    weights = new int **[numStages];
    for (int i = 0; i < numStages; ++i) {
        weights[i] = new int *[usedPattern->numGroup()];
        for (int j = 0; j < usedPattern->numGroup(); ++j) {
            weights[i][j] = new int[usedPattern->numPackedIndex(j)];
            for (int k = 0; k < usedPattern->numPackedIndex(j); ++k) {
                weights[i][j][k] = patternEvaluator.weights[i][j][k];
            }
        }
    }

    return *this;
}

PatternEvaluator::PatternEvaluator(const PatternEvaluator &patternEvaluator) {
    *this = patternEvaluator;
}

PatternEvaluator::~PatternEvaluator() {
    if (weights != nullptr) {
        for (int i = 0; i < numStages; ++i) {
            for (int j = 0; j < usedPattern->numGroup(); ++j) {
                delete[] weights[i][j];
            }
            delete[] weights[i];
        }
        delete[] weights;
    }
}

void PatternEvaluator::loadWeights(int stage, const int *const decompressedData) {
    int x = 0;
    for (int j = 0; j < usedPattern->numGroup(); ++j) {
        for (int k = 0; k < usedPattern->numPackedIndex(j); ++k) {
            weights[stage][j][k] = decompressedData[x++];
        }
    }
}
/*
jhgf edba
0i00 00c0

-> jihgfedcba
*/
static inline int getHor1Bits(Bitboard x) {
    return (x >> 56 & 0b11) | (x >> 47 & 0b100) | (x >> 55 & 0b11111000) | (x >> 46 & 0b100000000) | (x >> 54 & 0b1000000000);
}

static inline int getHor1Index(Bitboard p, Bitboard o) {
    return ToBase3[getHor1Bits(p)] + ToBase3[getHor1Bits(o)] * 2;
}

static inline int getHor2Index(Bitboard p, Bitboard o) {
    return ToBase3[p >> 8 & 0xff] + ToBase3[o >> 8 & 0xff] * 2;
}

static inline int getHor3Index(Bitboard p, Bitboard o) {
    return ToBase3[p >> 16 & 0xff] + ToBase3[o >> 16 & 0xff] * 2;
}

static inline int getHor4Index(Bitboard p, Bitboard o) {
    return ToBase3[p >> 24 & 0xff] + ToBase3[o >> 24 & 0xff] * 2;
}

static inline int getCornerBits(Bitboard x) {
    return (x >> 40 & 0b111) | (x >> 45 & 0b111000) | (x >> 50 & 0b111000000);
}

static inline int getCornerIndex(Bitboard p, Bitboard o) {
    return ToBase3[getCornerBits(p)] + ToBase3[getCornerBits(o)] * 2;
}

static inline Bitboard extractDiagonal(Bitboard x) {
    return x * 0x0101010101010101ULL;
}

static inline int getDiag8Index(Bitboard p, Bitboard o) {
    return ToBase3[extractDiagonal(p & 0x8040201008040201ULL) >> 56] + ToBase3[extractDiagonal(o & 0x8040201008040201ULL) >> 56] * 2;
}

static inline int getDiag7Index(Bitboard p, Bitboard o) {
    return ToBase3[extractDiagonal(p & 0x0080402010080402ULL) >> 57] + ToBase3[extractDiagonal(o & 0x0080402010080402ULL) >> 57] * 2;
}

static inline int getDiag6Index(Bitboard p, Bitboard o) {
    return ToBase3[extractDiagonal(p & 0x0000804020100804ULL) >> 58] + ToBase3[extractDiagonal(o & 0x0000804020100804ULL) >> 58] * 2;
}

static inline int getDiag5Index(Bitboard p, Bitboard o) {
    return ToBase3[extractDiagonal(p & 0x0000008040201008ULL) >> 59] + ToBase3[extractDiagonal(o & 0x0000008040201008ULL) >> 59] * 2;
}

static inline int getDiag4Index(Bitboard p, Bitboard o) {
    return ToBase3[extractDiagonal(p & 0x0000000080402010ULL) >> 60] + ToBase3[extractDiagonal(o & 0x0000000080402010ULL) >> 60] * 2;
}

static inline int getCorner25Bits(Bitboard x) {
    return (x & 0b11111) | (x >> 3 & 0b1111100000);
}

static inline int getCorner25Index(Bitboard p, Bitboard o) {
    return ToBase3[getCorner25Bits(p)] + ToBase3[getCorner25Bits(o)] * 2;
}

double PatternEvaluator::evaluate(Bitboard p, Bitboard o) const {
    // ロジステロパターンに最適化してます
    if (popcount(p) == 0)
        return -popcount(o);

    if (popcount(o) == 0)
        return popcount(p);

    Bitboard rotatedP[8], rotatedO[8];
    rotateAndFlipBB(p, rotatedP);
    rotateAndFlipBB(o, rotatedO);

    int t = getStage(p, o);

    int e = 0;

    e += weights[t][0][usedPattern->packedIndex(0, getHor1Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][0][usedPattern->packedIndex(0, getHor1Index(rotatedP[1], rotatedO[1]))];
    e += weights[t][0][usedPattern->packedIndex(0, getHor1Index(rotatedP[2], rotatedO[2]))];
    e += weights[t][0][usedPattern->packedIndex(0, getHor1Index(rotatedP[3], rotatedO[3]))];

    e += weights[t][1][usedPattern->packedIndex(1, getHor2Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][1][usedPattern->packedIndex(1, getHor2Index(rotatedP[1], rotatedO[1]))];
    e += weights[t][1][usedPattern->packedIndex(1, getHor2Index(rotatedP[2], rotatedO[2]))];
    e += weights[t][1][usedPattern->packedIndex(1, getHor2Index(rotatedP[3], rotatedO[3]))];

    e += weights[t][2][usedPattern->packedIndex(2, getHor3Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][2][usedPattern->packedIndex(2, getHor3Index(rotatedP[1], rotatedO[1]))];
    e += weights[t][2][usedPattern->packedIndex(2, getHor3Index(rotatedP[2], rotatedO[2]))];
    e += weights[t][2][usedPattern->packedIndex(2, getHor3Index(rotatedP[3], rotatedO[3]))];

    e += weights[t][3][usedPattern->packedIndex(3, getHor4Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][3][usedPattern->packedIndex(3, getHor4Index(rotatedP[1], rotatedO[1]))];
    e += weights[t][3][usedPattern->packedIndex(3, getHor4Index(rotatedP[2], rotatedO[2]))];
    e += weights[t][3][usedPattern->packedIndex(3, getHor4Index(rotatedP[3], rotatedO[3]))];

    e += weights[t][4][usedPattern->packedIndex(4, getCornerIndex(rotatedP[0], rotatedO[0]))];
    e += weights[t][4][usedPattern->packedIndex(4, getCornerIndex(rotatedP[1], rotatedO[1]))];
    e += weights[t][4][usedPattern->packedIndex(4, getCornerIndex(rotatedP[2], rotatedO[2]))];
    e += weights[t][4][usedPattern->packedIndex(4, getCornerIndex(rotatedP[3], rotatedO[3]))];

    e += weights[t][5][usedPattern->packedIndex(5, getDiag8Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][5][usedPattern->packedIndex(5, getDiag8Index(rotatedP[1], rotatedO[1]))];

    e += weights[t][6][usedPattern->packedIndex(6, getDiag7Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][6][usedPattern->packedIndex(6, getDiag7Index(rotatedP[1], rotatedO[1]))];
    e += weights[t][6][usedPattern->packedIndex(6, getDiag7Index(rotatedP[2], rotatedO[2]))];
    e += weights[t][6][usedPattern->packedIndex(6, getDiag7Index(rotatedP[3], rotatedO[3]))];

    e += weights[t][7][usedPattern->packedIndex(7, getDiag6Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][7][usedPattern->packedIndex(7, getDiag6Index(rotatedP[1], rotatedO[1]))];
    e += weights[t][7][usedPattern->packedIndex(7, getDiag6Index(rotatedP[2], rotatedO[2]))];
    e += weights[t][7][usedPattern->packedIndex(7, getDiag6Index(rotatedP[3], rotatedO[3]))];

    e += weights[t][8][usedPattern->packedIndex(8, getDiag5Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][8][usedPattern->packedIndex(8, getDiag5Index(rotatedP[1], rotatedO[1]))];
    e += weights[t][8][usedPattern->packedIndex(8, getDiag5Index(rotatedP[2], rotatedO[2]))];
    e += weights[t][8][usedPattern->packedIndex(8, getDiag5Index(rotatedP[3], rotatedO[3]))];

    e += weights[t][9][usedPattern->packedIndex(9, getDiag4Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][9][usedPattern->packedIndex(9, getDiag4Index(rotatedP[1], rotatedO[1]))];
    e += weights[t][9][usedPattern->packedIndex(9, getDiag4Index(rotatedP[2], rotatedO[2]))];
    e += weights[t][9][usedPattern->packedIndex(9, getDiag4Index(rotatedP[3], rotatedO[3]))];

    e += weights[t][10][usedPattern->packedIndex(10, getCorner25Index(rotatedP[0], rotatedO[0]))];
    e += weights[t][10][usedPattern->packedIndex(10, getCorner25Index(rotatedP[1], rotatedO[1]))];
    e += weights[t][10][usedPattern->packedIndex(10, getCorner25Index(rotatedP[2], rotatedO[2]))];
    e += weights[t][10][usedPattern->packedIndex(10, getCorner25Index(rotatedP[3], rotatedO[3]))];
    e += weights[t][10][usedPattern->packedIndex(10, getCorner25Index(rotatedP[4], rotatedO[4]))];
    e += weights[t][10][usedPattern->packedIndex(10, getCorner25Index(rotatedP[5], rotatedO[5]))];
    e += weights[t][10][usedPattern->packedIndex(10, getCorner25Index(rotatedP[6], rotatedO[6]))];
    e += weights[t][10][usedPattern->packedIndex(10, getCorner25Index(rotatedP[7], rotatedO[7]))];

    return static_cast<double>(e) / 1000.0;
}

double ClassicEvaluator::evaluate(Bitboard p, Bitboard o) const {
    double squareValue[] = {
        30, -12, 0, -1, -1, 0, -12, 30,     // これはコード補完で
        -12, -15, -3, -3, -3, -3, -15, -12, // 左の配列が縦に展開されないように
        0, -3, 0, -1, -1, 0, -3, 0,         // するためのテクニック（？）
        -1, -3, -1, -1, -1, -1, -3, -1,     //
        -1, -3, -1, -1, -1, -1, -3, -1,     //
        0, -3, 0, -1, -1, 0, -3, 0,         //
        -12, -15, -3, -3, -3, -3, -15, -12, //
        30, -12, 0, -1, -1, 0, -12, 30,     //
    };

    Bitboard occupancy = p | o;
    if (occupancy >> 0 & 1ULL) {
        squareValue[1] *= -1;
        squareValue[8] *= -1;
        squareValue[9] *= -1;
    }

    if (occupancy >> 7 & 1ULL) {
        squareValue[6] *= -1;
        squareValue[14] *= -1;
        squareValue[15] *= -1;
    }

    if (occupancy >> 56 & 1ULL) {
        squareValue[48] *= -1;
        squareValue[49] *= -1;
        squareValue[57] *= -1;
    }

    if (occupancy >> 63 & 1ULL) {
        squareValue[54] *= -1;
        squareValue[55] *= -1;
        squareValue[62] *= -1;
    }

    const double weightNumStone[15] = {0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 1, 3};
    const double weightMobility[15] = {0.4, 1.2, 1.3, 1.1, 1, 1, 1, 0.8, 0.7, 0.6, 0.4, 0.4, 0.3, 0, 0};
    const double weightStability[15] = {1, 1, 1, 2, 2, 2, 2, 2, 2, 2.5, 2.5, 2.5, 3, 3, 3};
    const double weightSquareValue[15] = {1, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4};

    int numP = popcount(p);
    int numO = popcount(o);

    if (numP == 0)
        return -999999;

    if (numO == 0)
        return 999999;

    Bitboard stable = getStableStones(p, o);

    int stabilityP = popcount(p & stable);
    int stabilityO = popcount(o & stable);

    int mobilityP = getWeightedMobility(p, o);
    int mobilityO = getWeightedMobility(o, p);

    int valueP = 0, valueO = 0;
    for (int i = 0; i < 64; ++i) {
        if (stable >> i & 1ULL)
            continue;

        if (p >> i & 1ULL) {
            if (stable >> i & 1ULL) {
                valueP += std::max(squareValue[i], 0.0);
            } else
                valueP += squareValue[i];
        } else if (o >> i & 1ULL) {
            if (stable >> i & 1ULL) {
                valueO += std::max(squareValue[i], 0.0);
            } else
                valueO += squareValue[i];
        }
    }

    int stage = (popcount(p | o) - 4 - 1) / 4;
    return weightNumStone[stage] * (numP - numO) + weightSquareValue[stage] * (valueP - valueO) + weightMobility[stage] * (mobilityP - mobilityO) + weightStability[stage] * (stabilityP - stabilityO);
}