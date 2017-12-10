{
    const popCount64 = Utils.popCount64;
    const tzcnt = Utils.tzcnt;
    const flipOnUpperMove = Board.flipOnUpperMove;
    const flipOnLowerMove = Board.flipOnLowerMove;
    const mobility = Board.mobility;

    const tableIndex = function (uplr, lplr, uopnt, lopnt) {
        return ((uplr * 2 + lplr * 3 + uopnt * 5 + lopnt * 7) >>> 7) & 0x7ffff;
    };

    const bitParity = function(x) {
        x = (x & 0xffff) ^ (x >>> 16);
        x = (x & 0xff) ^ (x >>> 8);
        x = (x & 0xf) ^ (x >>> 4);
        x = (x & 3) ^ (x >>> 2);
        return (x & 1) ^ (x >>> 1);
    };

    this.ReversiSolver = function (board, player) {
        let leafCount = 0;
        let internalNodeCount = 0;
        const temp = {};

        const evaluateFinalBoards = function (uplr, lplr, uopnt, lopnt, min, max, passed) {
            let pCount = popCount64(uplr, lplr);
            let oCount = popCount64(uopnt, lopnt);

            if (pCount + oCount === 63) {
                let upperMoveBit = ~(uplr | uopnt);
                let lowerMoveBit = ~(lplr | lopnt);
                let uplrFlp = (lplr << 24) | ((lplr << 8) & 0x00ff0000) | ((lplr >>> 8) & 0x0000ff00) | (lplr >>> 24);
                let lplrFlp = (uplr << 24) | ((uplr << 8) & 0x00ff0000) | ((uplr >>> 8) & 0x0000ff00) | (uplr >>> 24);
                let uopntFlp = (lopnt << 24) | ((lopnt << 8) & 0x00ff0000) | ((lopnt >>> 8) & 0x0000ff00) | (lopnt >>> 24);
                let lopntFlp = (uopnt << 24) | ((uopnt << 8) & 0x00ff0000) | ((uopnt >>> 8) & 0x0000ff00) | (uopnt >>> 24);

                if (upperMoveBit !== 0) {
                    flipOnUpperMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, upperMoveBit, temp);
                    if ((temp.upperFlip | temp.lowerFlip) === 0) {
                        flipOnUpperMove(uopnt, lopnt, uplr, lplr, uopntFlp, lopntFlp, uplrFlp, lplrFlp, upperMoveBit, temp);

                        let flipCountDoubled = popCount64(temp.upperFlip, temp.lowerFlip) * -2;
                        return pCount - oCount + (flipCountDoubled && (flipCountDoubled - 1));
                    }
                    else {
                        let flipCountDoubled = popCount64(temp.upperFlip, temp.lowerFlip) * 2;
                        return pCount - oCount + (flipCountDoubled && (flipCountDoubled + 1));
                    }
                }
                else {
                    flipOnLowerMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, lowerMoveBit, temp);
                    if ((temp.upperFlip | temp.lowerFlip) === 0) {
                        flipOnLowerMove(uopnt, lopnt, uplr, lplr, uopntFlp, lopntFlp, uplrFlp, lplrFlp, lowerMoveBit, temp);

                        let flipCountDoubled = popCount64(temp.upperFlip, temp.lowerFlip) * -2;
                        return pCount - oCount + (flipCountDoubled && (flipCountDoubled - 1));
                    }
                    else {
                        let flipCountDoubled = popCount64(temp.upperFlip, temp.lowerFlip) * 2;
                        return pCount - oCount + (flipCountDoubled && (flipCountDoubled + 1));
                    }
                }
            }

            mobility(uplr, lplr, uopnt, lopnt, temp);
            let upMobility = temp.upperMobility;
            let lpMobility = temp.lowerMobility;

            if ((upMobility | lpMobility) === 0) {
                return passed ? pCount - oCount
                    : -evaluateFinalBoards(uopnt, lopnt, uplr, lplr, -max, -min, true);
            }

            let uplrFlp = (lplr << 24) | ((lplr << 8) & 0x00ff0000) | ((lplr >>> 8) & 0x0000ff00) | (lplr >>> 24);
            let lplrFlp = (uplr << 24) | ((uplr << 8) & 0x00ff0000) | ((uplr >>> 8) & 0x0000ff00) | (uplr >>> 24);
            let uopntFlp = (lopnt << 24) | ((lopnt << 8) & 0x00ff0000) | ((lopnt >>> 8) & 0x0000ff00) | (lopnt >>> 24);
            let lopntFlp = (uopnt << 24) | ((uopnt << 8) & 0x00ff0000) | ((uopnt >>> 8) & 0x0000ff00) | (uopnt >>> 24);

            let upperEmpty = ~(uplr | uopnt);
            let oddUpperMobility = (upMobility & 0xf0f0f0f0 & -bitParity(upperEmpty & 0xf0f0f0f0)) | (upMobility & 0x0f0f0f0f & -bitParity(upperEmpty & 0x0f0f0f0f));

            upMobility ^= oddUpperMobility;

            let lowerEmpty = ~(lplr | lopnt);
            let oddLowerMobility = (lpMobility & 0xf0f0f0f0 & -bitParity(lowerEmpty & 0xf0f0f0f0)) | (lpMobility & 0x0f0f0f0f & -bitParity(lowerEmpty & 0x0f0f0f0f));

            lpMobility ^= oddLowerMobility;

            let moveBit = oddUpperMobility & -oddUpperMobility;
            while (moveBit !== 0) {
                flipOnUpperMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
                let uflip = temp.upperFlip;
                let lflip = temp.lowerFlip;

                let score = -evaluateFinalBoards(uopnt ^ uflip, lopnt ^ lflip, (uplr ^ uflip) | moveBit, lplr ^ lflip, -max, -min, false);
                if (score >= max) return score;
                min = min < score ? score : min;

                oddUpperMobility ^= moveBit;
                moveBit = oddUpperMobility & -oddUpperMobility;
            }

            moveBit = oddLowerMobility & -oddLowerMobility;
            while (moveBit !== 0) {
                flipOnLowerMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
                let uflip = temp.upperFlip;
                let lflip = temp.lowerFlip;

                let score = -evaluateFinalBoards(uopnt ^ uflip, lopnt ^ lflip, uplr ^ uflip, (lplr ^ lflip) | moveBit, -max, -min, false);
                if (score >= max) return score;
                min = min < score ? score : min;

                oddLowerMobility ^= moveBit;
                moveBit = oddLowerMobility & -oddLowerMobility;
            }

            moveBit = upMobility & -upMobility;
            while (moveBit !== 0) {
                flipOnUpperMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
                let uflip = temp.upperFlip;
                let lflip = temp.lowerFlip;

                let score = -evaluateFinalBoards(uopnt ^ uflip, lopnt ^ lflip, (uplr ^ uflip) | moveBit, lplr ^ lflip, -max, -min, false);
                if (score >= max) return score;
                min = min < score ? score : min;

                upMobility ^= moveBit;
                moveBit = upMobility & -upMobility;
            }

            moveBit = lpMobility & -lpMobility;
            while (moveBit !== 0) {
                flipOnLowerMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
                let uflip = temp.upperFlip;
                let lflip = temp.lowerFlip;

                let score = -evaluateFinalBoards(uopnt ^ uflip, lopnt ^ lflip, uplr ^ uflip, (lplr ^ lflip) | moveBit, -max, -min, false);
                if (score >= max) return score;
                min = min < score ? score : min;

                lpMobility ^= moveBit;
                moveBit = lpMobility & -lpMobility;
            }

            return min;
        };

        const transpositionTable = [];

        const evaluateFutureBoards = function (uplr, lplr, uopnt, lopnt, alpha, beta, passed) {
            let pCount = popCount64(uplr, lplr);
            let oCount = popCount64(uopnt, lopnt);
            if (pCount + oCount >= 58) {
                return evaluateFinalBoards(uplr, lplr, uopnt, lopnt, alpha, beta, passed);
            }

            mobility(uplr, lplr, uopnt, lopnt, temp);
            let upMobility = temp.upperMobility;
            let lpMobility = temp.lowerMobility;

            if ((upMobility | lpMobility) === 0) {
                return passed ? pCount - oCount
                    : -evaluateFutureBoards(uopnt, lopnt, uplr, lplr, -beta, -alpha, true);
            }

            let upperBound = 64;
            let lowerBound = -64;
            let index = tableIndex(uplr, lplr, uopnt, lopnt);
            let value = transpositionTable[index];
            if (value && value.uplr === uplr && value.lplr === lplr && value.uopnt === uopnt && value.lopnt === lopnt) {
                upperBound = value.upperBound;
                lowerBound = value.lowerBound;
                if (lowerBound >= beta) return lowerBound;
                else if (upperBound <= alpha) return upperBound;
                else if (upperBound === lowerBound) return upperBound;

                alpha = lowerBound > alpha ? lowerBound : alpha;
                beta = upperBound < beta ? upperBound : beta;
            }
            else {
                value = {
                    uplr: uplr,
                    lplr: lplr,
                    uopnt: uopnt,
                    lopnt: lopnt,
                    lowerBound: lowerBound,
                    upperBound: upperBound
                };
            }

            let uplrFlp = (lplr << 24) | ((lplr << 8) & 0x00ff0000) | ((lplr >>> 8) & 0x0000ff00) | (lplr >>> 24);
            let lplrFlp = (uplr << 24) | ((uplr << 8) & 0x00ff0000) | ((uplr >>> 8) & 0x0000ff00) | (uplr >>> 24);
            let uopntFlp = (lopnt << 24) | ((lopnt << 8) & 0x00ff0000) | ((lopnt >>> 8) & 0x0000ff00) | (lopnt >>> 24);
            let lopntFlp = (uopnt << 24) | ((uopnt << 8) & 0x00ff0000) | ((uopnt >>> 8) & 0x0000ff00) | (uopnt >>> 24);

            let orderedMoves = [];
            let moveBit = upMobility & -upMobility;
            while (moveBit !== 0) {
                let next = {};
                flipOnUpperMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, next);
                let uflip = next.upperFlip;
                let lflip = next.lowerFlip;
                next.uplr = (uplr ^ uflip) | moveBit;
                next.lplr = lplr ^ lflip;
                next.uopnt = uopnt ^ uflip;
                next.lopnt = lopnt ^ lflip;
                mobility(next.uopnt, next.lopnt, next.uplr, next.lplr, next);
                let m1 = next.upperMobility;
                let m2 = next.lowerMobility;
                let wmc = popCount64(m1, m2) + ((m1 >>> 24) & 1) + (m1 >>> 31) + ((m2 >>> 7) & 1) + (m2 & 1);
                next.weightedMobilityCount = wmc;

                for (let i = 0; i < orderedMoves.length + 1; i++) {
                    if (orderedMoves[i] === void 0) {
                        orderedMoves[i] = next;
                        break;
                    }
                    else if (wmc <= orderedMoves[i].weightedMobilityCount) {
                        orderedMoves.splice(i, 0, next);
                        break;
                    }
                }

                upMobility ^= moveBit;
                moveBit = upMobility & -upMobility;
            }

            moveBit = lpMobility & -lpMobility;
            while (moveBit !== 0) {
                let next = {};
                flipOnLowerMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, next);
                let uflip = next.upperFlip;
                let lflip = next.lowerFlip;
                next.uplr = uplr ^ uflip;
                next.lplr = (lplr ^ lflip) | moveBit;
                next.uopnt = uopnt ^ uflip;
                next.lopnt = lopnt ^ lflip;
                mobility(next.uopnt, next.lopnt, next.uplr, next.lplr, next);
                let m1 = next.upperMobility, m2 = next.lowerMobility;
                let wmc = popCount64(m1, m2) + ((m1 >>> 24) & 1) + (m1 >>> 31) + ((m2 >>> 7) & 1) + (m2 & 1);
                next.weightedMobilityCount = wmc;

                for (let i = 0; i < orderedMoves.length + 1; i++) {
                    if (orderedMoves[i] === void 0) {
                        orderedMoves[i] = next;
                        break;
                    }
                    else if (wmc <= orderedMoves[i].weightedMobilityCount) {
                        orderedMoves.splice(i, 0, next);
                        break;
                    }
                }

                lpMobility ^= moveBit;
                moveBit = lpMobility & -lpMobility;
            }

            let bestScore = -evaluateFutureBoards(orderedMoves[0].uopnt, orderedMoves[0].lopnt, orderedMoves[0].uplr, orderedMoves[0].lplr, -beta, -alpha, false);
            if (bestScore >= beta) {
                value.lowerBound = bestScore > lowerBound ? bestScore : lowerBound;
                value.upperBound = upperBound;
                transpositionTable[index] = value;
                return bestScore;
            }
            let a = bestScore > alpha ? bestScore : alpha;
            for (let i = 1; i < orderedMoves.length; i++) {
                let move = orderedMoves[i];

                let score = -evaluateFutureBoards(move.uopnt, move.lopnt, move.uplr, move.lplr, -a - 1, -a, false);

                if (score >= beta) {
                    value.lowerBound = score > lowerBound ? score : lowerBound;
                    value.upperBound = upperBound;
                    transpositionTable[index] = value;
                    return score;
                }
                else if (score > a) {
                    a = bestScore = -evaluateFutureBoards(move.uopnt, move.lopnt, move.uplr, move.lplr, -beta, -score, false);
                    if (bestScore >= beta) {
                        value.lowerBound = bestScore > lowerBound ? bestScore : lowerBound;
                        value.upperBound = upperBound;
                        transpositionTable[index] = value;
                        return bestScore;
                    }
                }
                else {
                    bestScore = score > bestScore ? score : bestScore;
                }
            }

            if (bestScore > alpha) {
                value.lowerBound = bestScore;
                value.upperBound = bestScore;

            }
            else {
                value.lowerBound = lowerBound;
                value.upperBound = bestScore < upperBound ? bestScore : upperBound;
            }

            transpositionTable[index] = value;

            return bestScore;
        };

        this.solve = function () {
            let startTime = Date.now();
            
            let uplr = player === Player.black ? board.upperBlack : board.upperWhite;
            let lplr = player === Player.black ? board.lowerBlack : board.lowerWhite;
            let uopnt = -player === Player.black ? board.upperBlack : board.upperWhite;
            let lopnt = -player === Player.black ? board.lowerBlack : board.lowerWhite;
            let uplrFlp = (lplr << 24) | ((lplr << 8) & 0x00ff0000) | ((lplr >>> 8) & 0x0000ff00) | (lplr >>> 24);
            let lplrFlp = (uplr << 24) | ((uplr << 8) & 0x00ff0000) | ((uplr >>> 8) & 0x0000ff00) | (uplr >>> 24);
            let uopntFlp = (lopnt << 24) | ((lopnt << 8) & 0x00ff0000) | ((lopnt >>> 8) & 0x0000ff00) | (lopnt >>> 24);
            let lopntFlp = (uopnt << 24) | ((uopnt << 8) & 0x00ff0000) | ((uopnt >>> 8) & 0x0000ff00) | (uopnt >>> 24);

            mobility(uplr, lplr, uopnt, lopnt, temp);
            let upperMobility = temp.upperMobility;
            let lowerMobility = temp.lowerMobility;

            let moveBit = upperMobility & -upperMobility;
            let bestMove = tzcnt(moveBit);
            let bestScore = -64;
            while (moveBit !== 0) {
                flipOnUpperMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
                let uflip = temp.upperFlip;
                let lflip = temp.lowerFlip;

                let score = -evaluateFutureBoards(uopnt ^ uflip, lopnt ^ lflip, (uplr ^ uflip) | moveBit, lplr ^ lflip, -64, -bestScore, false);
                if (score > bestScore) {
                    bestMove = tzcnt(moveBit);
                    bestScore = score;
                }

                upperMobility ^= moveBit;
                moveBit = upperMobility & -upperMobility;
            }

            moveBit = lowerMobility & -lowerMobility;
            while (moveBit !== 0) {
                flipOnLowerMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
                let uflip = temp.upperFlip;
                let lflip = temp.lowerFlip;

                let score = -evaluateFutureBoards(uopnt ^ uflip, lopnt ^ lflip, uplr ^ uflip, (lplr ^ lflip) | moveBit, -64, -bestScore, false);
                if (score > bestScore) {
                    bestMove = tzcnt(moveBit) + 32;
                    bestScore = score;
                }

                lowerMobility ^= moveBit;
                moveBit = lowerMobility & -lowerMobility;
            }

            return {
                result: bestScore,
                time: Date.now() - startTime,
                h: 7 - bestMove & 7,
                v: 3 - ((bestMove >>> 3) & 3) + (bestMove >>> 5) * 4
            };
        }
    }
}