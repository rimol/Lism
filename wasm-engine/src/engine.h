#pragma once

#include "bitboard.h"
#include "eval.h"
#include "search.h"
#include <random>
#include <unordered_map>

struct MoveWithScore {
    int move;
    double score;
};

class ReversiEngine {
public:
    // 返り値は石を置くマス番号。(bitboard.h参照、0<=sq<=63)
    virtual int chooseMove(Bitboard p, Bitboard o, int depth) = 0;
    virtual ~ReversiEngine() {}
};

class RandomEngine : public ReversiEngine {
    std::mt19937 mt;

public:
    // 返り値は石を置くマス番号。(bitboard.h参照、0<=sq<=63)
    int chooseMove(Bitboard p, Bitboard o, int depth);

    RandomEngine();
};

// AlphaBetaを実装しただけのやつ。negaScout版とかのテスト用に使う予定
// これをNegaScoutの親にするとよさそう.
class AlphaBetaEngine : public ReversiEngine {
protected:
    long long nodeCount;
    int currentSearchDepth;
    const Evaluator &evaluator;
    double negaAlpha(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed);

public:
    virtual std::vector<MoveWithScore> evalAllMoves(Bitboard p, Bitboard o, int depth);
    // 返り値は石を置くマス番号。(bitboard.h参照、0<=sq<=63)
    virtual int chooseMove(Bitboard p, Bitboard o, int depth);

    AlphaBetaEngine(const Evaluator &evaluator);
    virtual ~AlphaBetaEngine() {}
};

constexpr int NearLeaf = 1;

// 本命
class NegaScoutEngine : public AlphaBetaEngine {
    // solverから直接置換表にアクセスしたい！
    friend class Solver;

    int prevSearchDepth;
    std::unordered_map<PositionKey, SearchedPosition<double>, PositionKey::PositionHash> tt1, tt2;
    std::unordered_map<PositionKey, SearchedPosition<double>, PositionKey::PositionHash> *current, *prev;

    // 単純AlphaBetaだが、置換表に探索結果を書き込む
    // unused
    double negaAlpha_iddfs(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed);
    // 前回探索の結果による並べ替え＋negaScout
    // unused
    double negaScout_iddfs(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed);

    // 置換表による並べかえ
    // unused
    double negaScout_tt(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed);
    // 評価関数による並べ替え
    double negaScout_eval(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed);

public:
    // prevSearchDepthの設定、currentのクリア、depth以下のあいだ、だんだん深さを増やしつつ探索して、最後の探索結果をprevに格納s
    // unused
    void iterativeDeepening(Bitboard p, Bitboard o, int depth);

    std::vector<MoveWithScore> evalAllMoves(Bitboard p, Bitboard o, int depth);
    // 返り値は石を置くマス番号。(bitboard.h参照、0<=sq<=63)
    int chooseMove(Bitboard p, Bitboard o, int depth);

    NegaScoutEngine(const Evaluator &evaluator);
    ~NegaScoutEngine() {}
};