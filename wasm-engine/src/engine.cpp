#include "engine.h"
#include "eval.h"
#include "search.h"
#include "util.h"
#include <algorithm>
#include <cassert>
#include <chrono>

RandomEngine::RandomEngine() : mt(std::random_device()()) {}

int RandomEngine::chooseMove(Bitboard p, Bitboard o, int depth) {
    Bitboard moves = getMoves(p, o);
    int mobility = popcount(moves);
    int chosen = mt() % mobility;

    for (int i = 0; i < chosen; ++i) {
        moves &= moves - 1ULL;
    }

    return tzcnt(moves);
}

AlphaBetaEngine::AlphaBetaEngine(const Evaluator &evaluator) : evaluator(evaluator) {}

double AlphaBetaEngine::negaAlpha(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed) {
    ++nodeCount;

    if (depth == currentSearchDepth)
        return evaluator.evaluate(p, o);

    Bitboard moves = getMoves(p, o);
    if (moves == 0ULL)
        return passed ? (popcount(p) - popcount(o)) : (--nodeCount, -negaAlpha(o, p, -beta, -alpha, depth, true));

    double bestScore = -EvalInf;

    while (moves) {
        Bitboard sqbit = moves & -moves;
        moves ^= sqbit;
        Bitboard flip = getFlip(p, o, sqbit);

        double score = -negaAlpha(o ^ flip, p ^ flip ^ sqbit, -beta, -bestScore, depth + 1, false);
        if (score >= beta)
            return score;

        bestScore = std::max(score, bestScore);
    }

    return bestScore;
}

std::vector<MoveWithScore> AlphaBetaEngine::evalAllMoves(Bitboard p, Bitboard o, int depth) {
    nodeCount = 0LL;
    currentSearchDepth = depth;

    std::vector<MoveWithScore> movesWithScore;

    Bitboard moves = getMoves(p, o);
    while (moves != 0ULL) {
        Bitboard sqbit = moves & -moves;
        moves ^= sqbit;
        Bitboard flip = getFlip(p, o, sqbit);
        double score = -negaAlpha(o ^ flip, p ^ flip ^ sqbit, -EvalInf, EvalInf, 1, false);
        int sq = tzcnt(sqbit);
        movesWithScore.push_back({sq, score});
    }

    return movesWithScore;
}

int AlphaBetaEngine::chooseMove(Bitboard p, Bitboard o, int depth) {
    nodeCount = 0LL;
    currentSearchDepth = depth;

    double bestScore = -EvalInf;
    int sq = -1;

    Bitboard moves = getMoves(p, o);
    while (moves != 0ULL) {
        Bitboard sqbit = moves & -moves;
        moves ^= sqbit;
        Bitboard flip = getFlip(p, o, sqbit);
        double score = -negaAlpha(o ^ flip, p ^ flip ^ sqbit, -EvalInf, -bestScore, 1, false);
        if (score >= bestScore) {
            bestScore = score;
            sq = tzcnt(sqbit);
        }
    }

    assert(sq != -1);
    return sq;
}

NegaScoutEngine::NegaScoutEngine(const Evaluator &evaluator) : current(&tt1), prev(&tt2), AlphaBetaEngine(evaluator) {}

constexpr int ShallowDepth = 0;

double NegaScoutEngine::negaAlpha_iddfs(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed) {
    ++nodeCount;

    if (depth == currentSearchDepth) {
        const PositionKey key = {p, o};
        if (current->count(key)) {
            return (*current)[key].lower;
        } else {
            auto e = evaluator.evaluate(p, o);
            (*current)[key] = {e, e, p, o};
            return e;
        }
    }

    Bitboard moves = getMoves(p, o);
    if (moves == 0ULL)
        return passed ? (popcount(p) - popcount(o)) : (--nodeCount, -negaAlpha_iddfs(o, p, -beta, -alpha, depth, true));

    const PositionKey key = {p, o};
    bool isSearched = current->count(key);
    SearchedPosition<double> &sp = (*current)[key];
    if (isSearched) {
        if (sp.lower >= beta)
            return sp.lower;
        if (sp.upper <= alpha)
            return sp.upper;
        if (sp.upper == sp.lower)
            return sp.upper;

        alpha = std::max(alpha, sp.lower);
        beta = std::min(beta, sp.upper);
    } else {
        sp = {EvalInf, -EvalInf, p, o};
    }

    if (depth <= ShallowDepth) {
        alpha = -EvalInf;
        beta = EvalInf;
    }

    double bestScore = -EvalInf;
    while (moves != 0ULL) {
        Bitboard sqbit = moves & -moves;
        moves ^= sqbit;
        Bitboard flip = getFlip(p, o, sqbit);

        double score = -negaAlpha_iddfs(o ^ flip, p ^ flip ^ sqbit, -beta, -bestScore, depth + 1, false);
        if (score >= beta) {
            return sp.lower = std::max(sp.lower, score);
        }

        bestScore = std::max(score, bestScore);
    }

    return sp.lower = sp.upper = bestScore;
}

double NegaScoutEngine::negaScout_iddfs(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed) {
    if (depth > prevSearchDepth)
        return negaAlpha_iddfs(p, o, alpha, beta, depth, passed);

    ++nodeCount;

    Bitboard moves = getMoves(p, o);
    if (moves == 0ULL)
        return passed ? (popcount(p) - popcount(o)) : (--nodeCount, -negaScout_iddfs(o, p, -beta, -alpha, depth, true));

    const PositionKey key = {p, o};
    bool isSearched = current->count(key);
    SearchedPosition<double> &sp = (*current)[key];
    if (isSearched) {
        if (sp.lower >= beta)
            return sp.lower;
        if (sp.upper <= alpha)
            return sp.upper;
        if (sp.upper == sp.lower)
            return sp.upper;

        alpha = std::max(alpha, sp.lower);
        beta = std::min(beta, sp.upper);
    } else {
        sp = {EvalInf, -EvalInf, p, o};
    }

    std::vector<CandidateMove<double>> orderedMoves;
    while (moves != 0ULL) {
        Bitboard sqbit = moves & -moves;
        moves ^= sqbit;
        Bitboard flip = getFlip(p, o, sqbit);
        Bitboard nextP = o ^ flip;
        Bitboard nextO = p ^ flip ^ sqbit;

        if (prev->count({nextP, nextO})) {
            orderedMoves.push_back({nextP, nextO, (*prev)[{nextP, nextO}].lower});
        }
        // 次の局面がパスかつ終局でない場合はp, oをひっくり返したやつの局面が記録されているはず！
        else if (prev->count({nextO, nextP})) {
            orderedMoves.push_back({nextP, nextO, (*prev)[{nextO, nextP}].lower * -1});
        } else {
            orderedMoves.push_back({nextP, nextO, EvalInf});
        }
    }

    // 敵から見て評価値の小さい順にみていく
    std::sort(orderedMoves.begin(), orderedMoves.end());

    if (depth <= ShallowDepth) {
        alpha = -EvalInf;
        beta = EvalInf;
    }

    double bestScore = -negaScout_iddfs(orderedMoves[0].nextP, orderedMoves[0].nextO, -beta, -alpha, depth + 1, false);
    if (bestScore >= beta) {
        return sp.lower = std::max(sp.lower, bestScore);
    }

    double a = std::max(alpha, bestScore);
    for (int i = 1; i < orderedMoves.size(); ++i) {
        auto &cm = orderedMoves[i];
        /*
        これ、評価値が実数なので1より少し幅を小さくしたほうがいいかも.
        ということで0.001ぐらいにしてみる.

        以下NWSでなぜalpha=betaとしないかの自分なりの考察。
        NWSでalpha以下かbeta以上であることがわかる（ここだとa以下かa+0.001以上）ので、
        もしalpha=betaとするとroughScoreでalphaが帰ってきたときに真の評価値が結局alpha以上かalpha以下かがわからない。
        よって微妙にずらす（あいだに真の評価値がこないぐらいの幅をもたせる）必要がある。
        */
        constexpr double NWSWindowSize = 0.001;
        double roughScore = -negaScout_iddfs(cm.nextP, cm.nextO, -a - NWSWindowSize, -a, depth + 1, false);

        if (roughScore >= beta) {
            return sp.lower = std::max(roughScore, sp.lower);
        } else if (roughScore <= a) {
            bestScore = std::max(bestScore, roughScore);
        } else if (roughScore >= (a + NWSWindowSize)) {
            a = bestScore = -negaScout_iddfs(cm.nextP, cm.nextO, -beta, -roughScore, depth + 1, false);

            if (bestScore >= beta) {
                return sp.lower = std::max(sp.lower, bestScore);
            }
        }
        // (a, a+WindowSize)にroughScoreがあった場合。
        // roughScoreは局面(nextP, nextO)の真の評価値ということ
        else {
            a = bestScore = roughScore;
        }
    }

    if (bestScore <= alpha) {
        return sp.upper = std::min(sp.upper, bestScore);
    } else {
        return sp.lower = sp.upper = bestScore;
    }
}

double NegaScoutEngine::negaScout_tt(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed) {
    if (currentSearchDepth - depth <= NearLeaf)
        return negaAlpha(p, o, alpha, beta, depth, passed);

    // 並べ替えにはdepth+1の深さの局面を使うので...
    if (depth + 1 > prevSearchDepth)
        return negaScout_eval(p, o, alpha, beta, depth, passed);

    ++nodeCount;

    Bitboard moves = getMoves(p, o);
    if (moves == 0ULL)
        return passed ? (popcount(p) - popcount(o)) : (--nodeCount, -negaScout_tt(o, p, -beta, -alpha, depth, true));

    const PositionKey key = {p, o};
    bool isSearched = current->count(key);
    SearchedPosition<double> &sp = (*current)[key];
    if (isSearched) {
        if (sp.lower >= beta)
            return sp.lower;
        if (sp.upper <= alpha)
            return sp.upper;
        if (sp.upper == sp.lower)
            return sp.upper;

        alpha = std::max(alpha, sp.lower);
        beta = std::min(beta, sp.upper);
    } else {
        sp = {EvalInf, -EvalInf, p, o};
    }

    std::vector<CandidateMove<double>> orderedMoves;
    while (moves != 0ULL) {
        Bitboard sqbit = moves & -moves;
        moves ^= sqbit;
        Bitboard flip = getFlip(p, o, sqbit);
        Bitboard nextP = o ^ flip;
        Bitboard nextO = p ^ flip ^ sqbit;

        if (prev->count({nextP, nextO})) {
            orderedMoves.push_back({nextP, nextO, (*prev)[{nextP, nextO}].lower});
        }
        // 次の局面がパスかつ終局でない場合はp, oをひっくり返したやつの局面が記録されているはず！
        else if (prev->count({nextO, nextP})) {
            orderedMoves.push_back({nextP, nextO, (*prev)[{nextO, nextP}].lower * -1});
        } else {
            orderedMoves.push_back({nextP, nextO, EvalInf});
        }
    }

    // 敵から見て評価値の小さい順にみていく
    std::sort(orderedMoves.begin(), orderedMoves.end());

    double bestScore = -negaScout_tt(orderedMoves[0].nextP, orderedMoves[0].nextO, -beta, -alpha, depth + 1, false);
    if (bestScore >= beta) {
        return sp.lower = std::max(sp.lower, bestScore);
    }

    double a = std::max(alpha, bestScore);
    for (int i = 1; i < orderedMoves.size(); ++i) {
        auto &cm = orderedMoves[i];
        /*
        これ、評価値が実数なので1より少し幅を小さくしたほうがいいかも.
        ということで0.001ぐらいにしてみる.

        以下NWSでなぜalpha=betaとしないかの自分なりの考察。
        NWSでalpha以下かbeta以上であることがわかる（ここだとa以下かa+0.001以上）ので、
        もしalpha=betaとするとroughScoreでalphaが帰ってきたときに真の評価値が結局alpha以上かalpha以下かがわからない。
        よって微妙にずらす（あいだに真の評価値がこないぐらいの幅をもたせる）必要がある。
        */
        constexpr double NWSWindowSize = 0.001;
        double roughScore = -negaScout_tt(cm.nextP, cm.nextO, -a - NWSWindowSize, -a, depth + 1, false);

        if (roughScore >= beta) {
            return sp.lower = std::max(roughScore, sp.lower);
        } else if (roughScore <= a) {
            bestScore = std::max(bestScore, roughScore);
        } else if (roughScore >= (a + NWSWindowSize)) {
            a = bestScore = -negaScout_tt(cm.nextP, cm.nextO, -beta, -roughScore, depth + 1, false);

            if (bestScore >= beta) {
                return sp.lower = std::max(sp.lower, bestScore);
            }
        }
        // (a, a+WindowSize)にroughScoreがあった場合。
        // roughScoreは局面(nextP, nextO)の真の評価値ということ
        else {
            a = bestScore = roughScore;
        }
    }

    if (bestScore <= alpha) {
        return sp.upper = std::min(sp.upper, bestScore);
    } else {
        return sp.lower = sp.upper = bestScore;
    }
}

double NegaScoutEngine::negaScout_eval(Bitboard p, Bitboard o, double alpha, double beta, int depth, bool passed) {
    if (currentSearchDepth - depth <= NearLeaf)
        return negaAlpha(p, o, alpha, beta, depth, passed);

    ++nodeCount;

    Bitboard moves = getMoves(p, o);
    if (moves == 0ULL)
        return passed ? (popcount(p) - popcount(o)) : (--nodeCount, -negaScout_eval(o, p, -beta, -alpha, depth, true));

    const PositionKey key = {p, o};
    bool isSearched = current->count(key);
    SearchedPosition<double> &sp = (*current)[key];
    if (isSearched) {
        if (sp.lower >= beta)
            return sp.lower;
        if (sp.upper <= alpha)
            return sp.upper;
        if (sp.upper == sp.lower)
            return sp.upper;

        alpha = std::max(alpha, sp.lower);
        beta = std::min(beta, sp.upper);
    } else {
        sp = {EvalInf, -EvalInf, p, o};
    }

    std::vector<CandidateMove<double>> orderedMoves;
    while (moves != 0ULL) {
        Bitboard sqbit = moves & -moves;
        moves ^= sqbit;
        Bitboard flip = getFlip(p, o, sqbit);
        Bitboard nextP = o ^ flip;
        Bitboard nextO = p ^ flip ^ sqbit;

        orderedMoves.push_back({nextP, nextO, evaluator.evaluate(nextP, nextO)});
    }

    // 敵から見て評価値の小さい順にみていく
    std::sort(orderedMoves.begin(), orderedMoves.end());

    double bestScore = -negaScout_eval(orderedMoves[0].nextP, orderedMoves[0].nextO, -beta, -alpha, depth + 1, false);
    if (bestScore >= beta) {
        return sp.lower = std::max(sp.lower, bestScore);
    }

    double a = std::max(alpha, bestScore);
    for (int i = 1; i < orderedMoves.size(); ++i) {
        auto &cm = orderedMoves[i];
        /*
        これ、評価値が実数なので1より少し幅を小さくしたほうがいいかも.
        ということで0.001ぐらいにしてみる.

        以下NWSでなぜalpha=betaとしないかの自分なりの考察。
        NWSでalpha以下かbeta以上であることがわかる（ここだとa以下かa+0.001以上）ので、
        もしalpha=betaとするとroughScoreでalphaが帰ってきたときに真の評価値が結局alpha以上かalpha以下かがわからない。
        よって微妙にずらす（あいだに真の評価値がこないぐらいの幅をもたせる）必要がある。
        */
        constexpr double NWSWindowSize = 0.001;
        double roughScore = -negaScout_eval(cm.nextP, cm.nextO, -a - NWSWindowSize, -a, depth + 1, false);

        if (roughScore >= beta) {
            return sp.lower = std::max(roughScore, sp.lower);
        } else if (roughScore <= a) {
            bestScore = std::max(bestScore, roughScore);
        } else if (roughScore >= (a + NWSWindowSize)) {
            a = bestScore = -negaScout_eval(cm.nextP, cm.nextO, -beta, -roughScore, depth + 1, false);

            if (bestScore >= beta) {
                return sp.lower = std::max(sp.lower, bestScore);
            }
        }
        // (a, a+WindowSize)にroughScoreがあった場合。
        // roughScoreは局面(nextP, nextO)の真の評価値ということ
        else {
            a = bestScore = roughScore;
        }
    }

    if (bestScore <= alpha) {
        return sp.upper = std::min(sp.upper, bestScore);
    } else {
        return sp.lower = sp.upper = bestScore;
    }
}

void NegaScoutEngine::iterativeDeepening(Bitboard p, Bitboard o, int depth) {
    constexpr int IterationInterval = 1;

    current->clear();
    prev->clear();
    prevSearchDepth = 0;

    if (depth < IterationInterval)
        return;

    currentSearchDepth = IterationInterval;
    do {
        negaScout_iddfs(p, o, -EvalInf, EvalInf, 0, false);
        std::swap(current, prev);
        current->clear();
        prevSearchDepth += IterationInterval;
        currentSearchDepth += IterationInterval;
    } while (currentSearchDepth <= depth);
}

std::vector<MoveWithScore> NegaScoutEngine::evalAllMoves(Bitboard p, Bitboard o, int depth) {
    nodeCount = 0;
    StopWatch stopWatch;

    current->clear();
    prev->clear();

    currentSearchDepth = depth;
    std::vector<MoveWithScore> movesWithScore;
    Bitboard moves = getMoves(p, o);

    while (moves != 0ULL) {
        Bitboard sqbit = moves & -moves;
        moves ^= sqbit;
        Bitboard flip = getFlip(p, o, sqbit);
        double score = -negaScout_eval(o ^ flip, p ^ flip ^ sqbit, -EvalInf, EvalInf, 1, false);
        // double score_ = -negaAlpha(o ^ flip, p ^ flip ^ sqbit, -EvalInf, EvalInf, 1, false);
        // assert(score == score_);
        int sq = tzcnt(sqbit);
        movesWithScore.push_back({sq, score});
    }

    stopWatch.setTimePoint();
    std::cout << "all: " << stopWatch.getElapsedTime_millisec(0) << std::endl;
    std::cout << nodeCount << " Nodes" << std::endl;

    return movesWithScore;
}

int NegaScoutEngine::chooseMove(Bitboard p, Bitboard o, int depth) {
    nodeCount = 0;
    StopWatch stopWatch;

    current->clear();
    prev->clear();

    currentSearchDepth = depth;
    double bestScore = negaScout_eval(p, o, -EvalInf, EvalInf, 0, false);
    int sq = -1;

    Bitboard moves = getMoves(p, o);
    while (moves != 0ULL) {
        Bitboard sqbit = moves & -moves;
        moves ^= sqbit;
        Bitboard flip = getFlip(p, o, sqbit);
        double score = -negaScout_eval(o ^ flip, p ^ flip ^ sqbit, -bestScore - 1, -bestScore + 1, 1, false);
        if (score == bestScore) {
            sq = tzcnt(sqbit);
            break;
        }
    }

    stopWatch.setTimePoint();
    std::cout << "all: " << stopWatch.getElapsedTime_millisec(0) << std::endl;
    std::cout << nodeCount << " Nodes" << std::endl;

    assert(sq != -1);
    return sq;
}