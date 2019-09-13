#include "emscripten.h"
#include "engine.h"
#include "eval.h"
#include "reversi.h"
#include "solver.h"
#include "util.h"
#include <algorithm>

using HalfBitboard = unsigned int;

extern "C" {
Pattern _usedPattern;
PatternEvaluator _evaluator;

EMSCRIPTEN_KEEPALIVE
void initialize_exported() {
    initCountFlipTables();
    initToBase3();
    _usedPattern = Pattern(LogistelloPatterns);
    _evaluator = PatternEvaluator(&_usedPattern, 15);
}

// JS側で解凍してTypedArrayに入っている評価値データの先頭ポインタを渡す
EMSCRIPTEN_KEEPALIVE
void initWeightTable_exported(int stage, const int *const decompressedData) {
    _evaluator.loadWeights(stage, decompressedData);
}

// マスiに石が置けない場合は-EvalInfが入っている
static double evalValues[64];

EMSCRIPTEN_KEEPALIVE
double *evalAllMoves_exported(HalfBitboard p0, HalfBitboard p1, HalfBitboard o0, HalfBitboard o1, int depth) {
    std::fill(evalValues, evalValues + 64, -EvalInf);
    Bitboard p = (Bitboard)p0 << 32 | (Bitboard)p1;
    Bitboard o = (Bitboard)o0 << 32 | (Bitboard)o1;

    NegaScoutEngine engine(_evaluator);
    auto movesWithScore = engine.evalAllMoves(p, o, depth);

    for (auto ms : movesWithScore) {
        evalValues[ms.move] = ms.score;
    }

    return &evalValues[0];
}

/*
最善スコア、探索ノード数、スコア確定時間、手順まで読み切り時間、
最善手順(60)
 */
static int solutionArray[64];

EMSCRIPTEN_KEEPALIVE
int *solve_exported(HalfBitboard p0, HalfBitboard p1, HalfBitboard o0, HalfBitboard o1) {
    std::fill(solutionArray, solutionArray + 64, -1);
    Bitboard p = (Bitboard)p0 << 32 | (Bitboard)p1;
    Bitboard o = (Bitboard)o0 << 32 | (Bitboard)o1;

    Solver solver(_evaluator);
    auto solution = solver.solve(p, o);
    solutionArray[0] = solution.bestScore;
    solutionArray[1] = (int)solution.nodeCount;
    solutionArray[2] = (int)solution.scoreLockTime;
    solutionArray[3] = (int)solution.wholeTime;

    int i = 4;
    for (int sq : solution.bestMoves) {
        solutionArray[i++] = sq;
    }

    return &solutionArray[0];
}

struct FFO {
    Bitboard p, o;

    // X: 黒, O: 白, -: 空白マス
    FFO(std::string boardText, Color color) : p(), o() {
        Bitboard bit = 1ULL << 63;
        for (char c : boardText) {
            if (c == 'X')
                p |= bit;
            else if (c == 'O')
                o |= bit;

            bit >>= 1;
        }
        if (color == White)
            std::swap(p, o);
    }
};

void ffotest() {
    const FFO tests[] = {
        {"O--OOOOX-OOOOOOXOOXXOOOXOOXOOOXXOOOOOOXX---OOOOX----O--X--------", Black},
        {"-OOOOO----OOOOX--OOOOOO-XXXXXOO--XXOOX--OOXOXX----OXXO---OOO--O-", Black},
        {"--OOO-------XX-OOOOOOXOO-OOOOXOOX-OOOXXO---OOXOO---OOOXO--OOOO--", Black},
        {"--XXXXX---XXXX---OOOXX---OOXXXX--OOXXXO-OOOOXOO----XOX----XXXXX-", White},
        {"--O-X-O---O-XO-O-OOXXXOOOOOOXXXOOOOOXX--XXOOXO----XXXX-----XXX--", White},
        {"---XXXX-X-XXXO--XXOXOO--XXXOXO--XXOXXO---OXXXOO-O-OOOO------OO--", Black},
        {"---XXX----OOOX----OOOXX--OOOOXXX--OOOOXX--OXOXXX--XXOO---XXXX-O-", Black},
        {"-OOOOO----OOOO---OOOOX--XXXXXX---OXOOX--OOOXOX----OOXX----XXXX--", White},
        {"-----X--X-XXX---XXXXOO--XOXOOXX-XOOXXX--XOOXX-----OOOX---XXXXXX-", White},
        {"--OX-O----XXOO--OOOOOXX-OOOOOX--OOOXOXX-OOOOXX-----OOX----X-O---", Black},
        {"----X-----XXX----OOOXOOO-OOOXOOO-OXOXOXO-OOXXOOO--OOXO----O--O--", Black},
        {"----O-X------X-----XXXO-OXXXXXOO-XXOOXOOXXOXXXOO--OOOO-O----OO--", White},
        {"---X-------OX--X--XOOXXXXXXOXXXXXXXOOXXXXXXOOOXX--XO---X--------", White},
        {"----OO-----OOO---XXXXOOO--XXOOXO-XXXXXOO--OOOXOO--X-OX-O-----X--", Black},
        {"--OOO---XXOO----XXXXOOOOXXXXOX--XXXOXX--XXOOO------OOO-----O----", Black},
        {"--------X-X------XXXXOOOOOXOXX--OOOXXXX-OOXXXX--O-OOOX-----OO---", White},
        {"--XXXXX---XXXX---OOOXX---OOXOX---OXXXXX-OOOOOXO----OXX----------", White},
        {"-------------------XXOOO--XXXOOO--XXOXOO-OOOXXXO--OXOO-O-OOOOO--", Black},
        {"--XOOO----OOO----OOOXOO--OOOOXO--OXOXXX-OOXXXX----X-XX----------", Black},
        {"-----------------------O--OOOOO---OOOOOXOOOOXXXX--XXOOXX--XX-O-X", Black},
    };

    Solver solver(_evaluator);
    StopWatch stopWatch;

    for (FFO ffo : tests) {
        Solution solution = solver.solve(ffo.p, ffo.o);
        Reversi reversi(ffo.p, ffo.o);

        reversi.print();
        std::cout << "Depth:" << (64 - reversi.stoneCount()) << std::endl
                  << "BestScore:" << solution.bestScore << std::endl
                  << "ScoreLockTime:" << (solution.scoreLockTime / 1000.0) << " sec" << std::endl
                  << "WholeTime:" << (solution.wholeTime / 1000.0) << " sec" << std::endl
                  << "Nodes:" << solution.nodeCount << std::endl
                  << "NPS:" << solution.NPS() << std::endl;

        for (int sq : solution.bestMoves) {
            std::cout << convertToLegibleSQ(sq) << ' ';
        }

        std::cout << std::endl;
    }

    stopWatch.setTimePoint();
    std::cout << "Done!" << std::endl
              << (double)stopWatch.getElapsedTime_millisec(0) / 1000.0 << " sec elapsed." << std::endl;
}
}