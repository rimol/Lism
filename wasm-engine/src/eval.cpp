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

double PatternEvaluator::evaluate(Bitboard p, Bitboard o) const {
    if (popcount(p) == 0)
        return -popcount(o);

    if (popcount(o) == 0)
        return popcount(p);

    Bitboard playerRotatedBB[8], opponentRotatedBB[8];
    rotateAndFlipBB(p, playerRotatedBB);
    rotateAndFlipBB(o, opponentRotatedBB);

    int t = getStage(p, o);

    int e = 0;
    for (int i = 0; i < usedPattern->numPattern(); ++i) {
        int group = usedPattern->group(i);
        Bitboard p_ = playerRotatedBB[usedPattern->rotationType(i)];
        Bitboard o_ = opponentRotatedBB[usedPattern->rotationType(i)];

        e += weights[t][group][usedPattern->extract(p_, o_, group)];
    }

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