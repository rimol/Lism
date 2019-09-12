#pragma once
#include "bitboard.h"
#include "eval.h"
#include "search.h"
#include <unordered_map>
#include <vector>

struct Solution {
    int bestScore;
    long long nodeCount;
    // ミリ秒
    double scoreLockTime, wholeTime;
    std::vector<int> bestMoves;

    int NPS() const { return nodeCount / scoreLockTime * 1000; }
};

class Solver {
    long long nodeCount;
    std::unordered_map<PositionKey, SearchedPosition<int>, PositionKey::PositionHash> transpositionTable1;
    SearchedPosition<int> *transpositionTable2;
    const Evaluator &evaluator;

    void clear();
    // 4~6
    int negaAlpha1(Bitboard p, Bitboard o, int alpha, int beta, int depth, bool passed);
    // 1~3
    int negaAlpha2(Bitboard p, Bitboard o, int alpha, int beta, int depth, bool passed);
    // unordered_map製置換表をつかう
    int negaScout1(Bitboard p, Bitboard o, int alpha, int beta, int depth, bool passed);
    // 上書き置換表をつかう
    int negaScout2(Bitboard p, Bitboard o, int alpha, int beta, int depth, bool passed);

    std::vector<int> getBestMoves(Bitboard p, Bitboard o, int bestScore);

public:
    Solution solve(Bitboard p, Bitboard o);
    Solver(const Evaluator &evaluator);
    ~Solver();
};