#pragma once

#include "bitboard.h"
#include "pattern.h"
#include <cassert>
#include <string>

// 全敗勝ちとかAlphaBetaの最初の窓とかで使う。
// これぐらいのおおきさで十分。
constexpr double EvalInf = 1000.0;

class Evaluator {
public:
    virtual double evaluate(Bitboard p, Bitboard o) const = 0;
    virtual ~Evaluator() {}
};

// 古典評価関数
class ClassicEvaluator : public Evaluator {
public:
    double evaluate(Bitboard p, Bitboard o) const;
};

class PatternEvaluator : public Evaluator {
    int numStages;
    int stageInterval;
    const Pattern *usedPattern;

    int weightSize;
    int *weights;

    inline int getStage(Bitboard p, Bitboard o) const {
        return (popcount(p | o) - 4 - 1) / stageInterval;
    }

public:
    void loadWeights(int stage, const int *const decompressedData);
    double evaluate(Bitboard p, Bitboard o) const;

    PatternEvaluator &operator=(const PatternEvaluator &patternEvaluator);
    PatternEvaluator();
    PatternEvaluator(const PatternEvaluator &patternEvaluator);
    PatternEvaluator(const Pattern *usedPattern, int numStages);
    ~PatternEvaluator();
};