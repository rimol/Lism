{
    const PositionValues = [];
    {
        const GridValues = [
            [30, -12, 0, -1, -1, 0, -12, 30],
            [-12, -15, -3, -3, -3, -3, -15, -12],
            [0, -3, 0, -1, -1, 0, -3, 0],
            [-1, -3, -1, -1, -1, -1, -3, -1],
            [-1, -3, -1, -1, -1, -1, -3, -1],
            [0, -3, 0, -1, -1, 0, -3, 0],
            [-12, -15, -3, -3, -3, -3, -15, -12],
            [30, -12, 0, -1, -1, 0, -12, 30]
        ];

        for (let i = 0; i < 8; i++) {
            PositionValues[i] = [];
            for (let j = 0; j <= 0xff; j++) {
                let score = 0;
                score += (j & 1) && GridValues[i][0];
                score += (j & 2) && GridValues[i][1];
                score += (j & 4) && GridValues[i][2];
                score += (j & 8) && GridValues[i][3];
                score += (j & 16) && GridValues[i][4];
                score += (j & 32) && GridValues[i][5];
                score += (j & 64) && GridValues[i][6];
                score += (j & 128) && GridValues[i][7];

                PositionValues[i][j] = score;
            }
        }
    }

    const FinalStoneCounts = [];
    {
        FinalStoneCounts[0b00000000] = 0;
        FinalStoneCounts[0b00000001] = 1;
        FinalStoneCounts[0b00000011] = 2;
        FinalStoneCounts[0b00000111] = 3;
        FinalStoneCounts[0b00001111] = 4;
        FinalStoneCounts[0b00011111] = 5;
        FinalStoneCounts[0b00111111] = 6;
        FinalStoneCounts[0b01111111] = 7;
        FinalStoneCounts[0b11111111] = 8;
        FinalStoneCounts[0b11111110] = 7;
        FinalStoneCounts[0b11111100] = 6;
        FinalStoneCounts[0b11111000] = 5;
        FinalStoneCounts[0b11111100] = 4;
        FinalStoneCounts[0b11100000] = 3;
        FinalStoneCounts[0b11000000] = 2;
        FinalStoneCounts[0b10000000] = 1;
    }

    const EdgeValues = [];
    {
        EdgeValues[0b01111100] = -10//適当
        EdgeValues[0b00111110] = -10//適当
        EdgeValues[0b01111101] = -20//適当
        EdgeValues[0b10111110] = -20//適当
        EdgeValues[0b00111101] = 5//適当
        EdgeValues[0b10111100] = 5//適当
        EdgeValues[0b01111110] = 10//適当
    }

    const CornerEmptyValues = [];
    {
        CornerEmptyValues[0x0303] = -5;
        CornerEmptyValues[0x0201] = -5;

        CornerEmptyValues[0xc0c0] = -5;
        CornerEmptyValues[0x4080] = -5;

        CornerEmptyValues[0x03030000] = -5;
        CornerEmptyValues[0x01020000] = -5;

        CornerEmptyValues[0xc0c00000] = -5;
        CornerEmptyValues[0x80400000] = -5;

        CornerEmptyValues[0x0103] = 5;
        CornerEmptyValues[0x0203] = 5;
        CornerEmptyValues[0x0301] = 5;

        CornerEmptyValues[0x80c0] = 5;
        CornerEmptyValues[0x40c0] = 5;
        CornerEmptyValues[0xc080] = 5;

        CornerEmptyValues[0x03010000] = 5;
        CornerEmptyValues[0x03020000] = 5;
        CornerEmptyValues[0x01030000] = 5;

        CornerEmptyValues[0xc0800000] = 5;
        CornerEmptyValues[0xc0400000] = 5;
        CornerEmptyValues[0x80c00000] = 5;
    }

    const FeatureWeight = [];
    {
        FeatureWeight[0] = [1, 1, 1, 1, 1];
    }

    let flipDiagonalA8H1 = function (b1, b2, out_flip) {
        let t = b1;

        b1 = (t ^ (t >>> 27)) & 0x00000011;
        t = b1 = t ^ b1 ^ (b1 << 27);
        b1 = (t ^ (t >>> 18)) & 0x00001122;
        t = b1 = t ^ b1 ^ (b1 << 18);
        b1 = (t ^ (t >>> 9)) & 0x00112244;
        b1 = t ^ b1 ^ (b1 << 9);

        t = b2;

        b2 = (t ^ (t >>> 27)) & 0x00000011;
        t = b2 = t ^ b2 ^ (b2 << 27);
        b2 = (t ^ (t >>> 18)) & 0x00001122;
        t = b2 = t ^ b2 ^ (b2 << 18);
        b2 = (t ^ (t >>> 9)) & 0x00112244;
        b2 = t ^ b2 ^ (b2 << 9);

        out_flip.upper = ((b2 & 0x0f0f0f0f) << 4) | (b1 & 0x0f0f0f0f);
        out_flip.lower = (b2 & 0xf0f0f0f0) | ((b1 & 0xf0f0f0f0) >>> 4);
    };

    let evaluate = function evaluate(uplr, lplr, uopnt, lopnt) {
        let playerScore = 0;
        let opponentScore = 0;

        let temp = {};

        flipDiagonalA8H1(uplr, lplr, temp);
        let uplrFlp = temp.upper;
        let lplrFlp = temp.lower;

        flipDiagonalA8H1(uopnt, lopnt, temp);
        let uopntFlp = temp.upper;
        let lopntFlp = temp.lower;

        let plrPosValue = PositionValues[0][uplr >>> 24];
        plrPosValue += PositionValues[1][(uplr >>> 16) & 0xff];
        plrPosValue += PositionValues[2][(uplr >>> 8) & 0xff];
        plrPosValue += PositionValues[3][uplr & 0xff];
        plrPosValue += PositionValues[4][lplr >>> 24];
        plrPosValue += PositionValues[5][(lplr >>> 16) & 0xff];
        plrPosValue += PositionValues[6][(lplr >>> 8) & 0xff];
        plrPosValue += PositionValues[7][lplr & 0xff];

        let opntPosValue = PositionValues[0][uopnt >>> 24];
        opntPosValue += PositionValues[1][(uopnt >>> 16) & 0xff];
        opntPosValue += PositionValues[2][(uopnt >>> 8) & 0xff];
        opntPosValue += PositionValues[3][uopnt & 0xff];
        opntPosValue += PositionValues[4][lopnt >>> 24];
        opntPosValue += PositionValues[5][(lopnt >>> 16) & 0xff];
        opntPosValue += PositionValues[6][(lopnt >>> 8) & 0xff];
        opntPosValue += PositionValues[7][lopnt & 0xff];

        Board.mobility(uplr, lplr, uopnt, lopnt, temp);
        let plrMobility = Utils.popCount64(temp.upperMobility, temp.lowerMobility);

        Board.mobility(uopnt, lopnt, uplr, lplr, temp);
        let opntMobility = Utils.popCount64(temp.upperMobility, temp.lowerMobility);

        let plrEdgeValue = EdgeValues[uplr >>> 24] || 0;
        plrEdgeValue += EdgeValues[lplr & 0xff] || 0;
        plrEdgeValue += EdgeValues[uplrFlp >>> 24] || 0;
        plrEdgeValue += EdgeValues[lplrFlp & 0xff] || 0;

        let opntEdgeValue = EdgeValues[uopnt >>> 24] || 0;
        opntEdgeValue += EdgeValues[lopnt & 0xff] || 0;
        opntEdgeValue += EdgeValues[uopntFlp >>> 24] || 0;
        opntEdgeValue += EdgeValues[lopntFlp & 0xff] || 0;

        let plrFinalStoneCount = FinalStoneCounts[uplr >>> 24] || 0;
        plrFinalStoneCount += FinalStoneCounts[lplr & 0xff] || 0;
        plrFinalStoneCount += FinalStoneCounts[uplrFlp >>> 24] || 0;
        plrFinalStoneCount += FinalStoneCounts[lplrFlp & 0xff] || 0;

        let opntFinalStoneCount = FinalStoneCounts[uopnt >>> 24] || 0;
        opntFinalStoneCount += FinalStoneCounts[lopnt & 0xff] || 0;
        opntFinalStoneCount += FinalStoneCounts[uopntFlp >>> 24] || 0;
        opntFinalStoneCount += FinalStoneCounts[lopntFlp & 0xff] || 0;

        let upperEmpty = ~(uplr | uopnt);
        let lowerEmpty = ~(lplr | lopnt);

        let cornerValue = CornerEmptyValues[upperEmpty & 0xc0c00000] || 0;
        cornerValue += CornerEmptyValues[upperEmpty & 0x03030000] || 0;
        cornerValue += CornerEmptyValues[lowerEmpty & 0x0000c0c0] || 0;
        cornerValue += CornerEmptyValues[lowerEmpty & 0x00000303] || 0;

        let weight = FeatureWeight[0];

        playerScore = plrPosValue * weight[0] + plrMobility * weight[1] + plrEdgeValue * weight[2] + plrFinalStoneCount * weight[3] + cornerValue;
        opponentScore = opntPosValue * weight[0] + opntMobility * weight[1] + opntEdgeValue * weight[2] + opntFinalStoneCount * weight[3];

        return playerScore - opponentScore;
    };

    let evaluateFutureBoards = function evaluateFutureBoards(uplr, lplr, uopnt, lopnt, depth, min, max) {
        if (depth === 0) return evaluate(uplr, lplr, uopnt, lopnt);

        let temp = {};

        let pCount = Utils.popCount64(uplr, lplr);
        let oCount = Utils.popCount64(uopnt, lopnt);

        Board.mobility(uplr, lplr, uopnt, lopnt, temp);
        let upMobility = temp.upperMobility;
        let lpMobility = temp.lowerMobility;

        if ((upMobility | lpMobility) === 0) {
            Board.mobility(uopnt, lopnt, uplr, lplr, temp);

            return (temp.upperMobility | temp.lowerMobility) === 0
                ? evaluate(uplr, lplr, uopnt, lopnt)
                : -evaluateFutureBoards(uopnt, lopnt, uplr, lplr, depth, -max, -min);
        }

        let uplrFlp = Utils.flipVertical(lplr);
        let lplrFlp = Utils.flipVertical(uplr);
        let uopntFlp = Utils.flipVertical(lopnt);
        let lopntFlp = Utils.flipVertical(uopnt);

        let moveBit = upMobility & -upMobility;
        while (moveBit !== 0) {
            Board.flipOnUpperMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
            let uflip = temp.upperFlip;
            let lflip = temp.lowerFlip;

            let score = -evaluateFutureBoards(uopnt ^ uflip, lopnt ^ lflip, (uplr ^ uflip) | moveBit, lplr ^ lflip, depth - 1, -max, -min);
            if (score >= max) return score;
            min = min < score ? score : min;

            upMobility ^= moveBit;
            moveBit = upMobility & -upMobility;
        }

        moveBit = lpMobility & -lpMobility;
        while (moveBit !== 0) {
            Board.flipOnLowerMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
            let uflip = temp.upperFlip;
            let lflip = temp.lowerFlip;

            let score = -evaluateFutureBoards(uopnt ^ uflip, lopnt ^ lflip, uplr ^ uflip, (lplr ^ lflip) | moveBit, depth - 1, -max, -min);
            if (score >= max) return score;
            min = min < score ? score : min;

            lpMobility ^= moveBit;
            moveBit = lpMobility & -lpMobility;
        }

        return min;
    };

    this.AI = class AI {
        constructor(ownStone) {
            this.ownStone = ownStone;
            this.comment = "";
        }

        determineNextMove(board) {
            if (board.getStoneCount() < 44) {
                let uplr = this.ownStone === Player.black ? board.upperBlack : board.upperWhite;
                let lplr = this.ownStone === Player.black ? board.lowerBlack : board.lowerWhite;
                let uopnt = -this.ownStone === Player.black ? board.upperBlack : board.upperWhite;
                let lopnt = -this.ownStone === Player.black ? board.lowerBlack : board.lowerWhite;
                let uplrFlp = Utils.flipVertical(lplr);
                let lplrFlp = Utils.flipVertical(uplr);
                let uopntFlp = Utils.flipVertical(lopnt);
                let lopntFlp = Utils.flipVertical(uopnt);

                let temp = {};
                let depth = 7;

                Board.mobility(uplr, lplr, uopnt, lopnt, temp);
                let upperMobility = temp.upperMobility;
                let lowerMobility = temp.lowerMobility;

                let moveBit = upperMobility & -upperMobility;
                let bestMove = Utils.tzcnt(moveBit);
                let bestScore = 0x80000000 | 0;
                while (moveBit !== 0) {
                    Board.flipOnUpperMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
                    let uflip = temp.upperFlip;
                    let lflip = temp.lowerFlip;

                    let score = -evaluateFutureBoards(uopnt ^ uflip, lopnt ^ lflip, (uplr ^ uflip) | moveBit, lplr ^ lflip, depth, 0x80000000 | 0, -bestScore);
                    if (score > bestScore) {
                        bestMove = Utils.tzcnt(moveBit);
                        bestScore = score;
                    }

                    upperMobility ^= moveBit;
                    moveBit = upperMobility & -upperMobility;
                }

                moveBit = lowerMobility & -lowerMobility;
                while (moveBit !== 0) {
                    Board.flipOnLowerMove(uplr, lplr, uopnt, lopnt, uplrFlp, lplrFlp, uopntFlp, lopntFlp, moveBit, temp);
                    let uflip = temp.upperFlip;
                    let lflip = temp.lowerFlip;

                    let score = -evaluateFutureBoards(uopnt ^ uflip, lopnt ^ lflip, uplr ^ uflip, (lplr ^ lflip) | moveBit, depth, 0x80000000 | 0, -bestScore);
                    if (score > bestScore) {
                        bestMove = Utils.tzcnt(moveBit) + 32;
                        bestScore = score;
                    }

                    lowerMobility ^= moveBit;
                    moveBit = lowerMobility & -lowerMobility;
                }

                return {
                    h: 7 - bestMove & 7,
                    v: 3 - ((bestMove >>> 3) & 3) + (bestMove >>> 5) * 4
                };
            }
            else {
                let solver = new ReversiSolver(board, this.ownStone);
                let result = solver.solve();
                if (result.result > 0) {
                    this.comment = result.result + "石差で僕の勝ちでおまんがな。";
                }
                else if (result.result === 0) {
                    this.comment = "引き分けって分かってしもたんでんがな";
                }
                else {
                    this.comment = -result.result + "石差で負ける...妙だな";
                }

                return result;
            }
        }
    }
}