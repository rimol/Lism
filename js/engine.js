{
    const MIN_INT = 1 << 31;
    const MAX_INT = ~MIN_INT;

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

    let calcFinalStoneCount = function calcFinalStoneCount(board) {
        let map = new Board();
        map.set(board.get(0, 0), 0, 0);
        map.set(board.get(0, 7), 0, 7);
        map.set(board.get(7, 0), 7, 0);
        map.set(board.get(7, 7), 7, 7);

        if (map.getStoneCount() == 0) return map;

        for (let i = 1; i <= 4; i++) {
            for (let j = 1; j <= 6; j++) {
                let edge = board.get(0, j);
                let pre = map.get(0, j - 1);
                if (pre != GridState.empty && edge == pre) map.set(edge, 0, j);
            }

            for (let k = 1; k <= 6; k++) {
                let edge = board.get(k, 0);
                let pre = map.get(k - 1, 0);
                if (pre != GridState.empty && edge == pre) map.set(edge, k, 0);
            }

            board.rotate(90);
            map.rotate(90);
        }

        for (let i = 1; i <= 6; i++) {
            for (let j = 1; j <= 6; j++) {
                let fc = 0;
                loop: for (let ii = -1; ii <= 1; ii++) {
                    for (let jj = -1; jj <= 1; jj++) {
                        if (ii == 0 && jj == 0) continue;
                        fc += map.get(i + ii, j + jj) != GridState.empty;
                        if (fc >= 4) {
                            map.set(board.get(i, j), i, j);
                            break loop;
                        }
                    }
                }
            }
        }

        return map;
    };

    const EvaluationType = {
        opening: 0,
        final_stage: 1,
        final: 2
    };

    this.AI = function(ownStone) {
        this.ownStone = ownStone;
        this.prediction = null;
        this.evaluationType = EvaluationType.opening;
    };

    this.AI.prototype.determineNextBoard = function(nextBoards) {
        let candidates = [], mscore = MIN_INT;
        let turn = nextBoards[0].getStoneCount() - 1, depth = 6;
        if (turn < 32) {
            this.evaluationType = EvaluationType.opening;
        }
        else if (turn < 50) {
            this.evaluationType = EvaluationType.final_stage;
        }
        else {
            this.evaluationType = EvaluationType.final;
            depth = 14;
        }

        for (let i = 0; i < nextBoards.length; i++) {
            let score = -1 * this.evaluateFutureBoards(nextBoards[i], ~this.ownStone, depth, MIN_INT, MAX_INT);
            if (score == mscore) {
                candidates.push(nextBoards[i]);
            }
            else if (score > mscore) {
                candidates.length = 0;
                mscore = score;
                candidates.push(nextBoards[i]);
            }
        }

        if (this.evaluationType == EvaluationType.final) {
            this.prediction = mscore;
        }

        return candidates[Math.floor(Math.random() * candidates.length)];
    };

    this.AI.prototype.evaluate_opening = function(board, attacker) {
        let whiteScore = 0;
        let blackScore = 0;

        for (let h = 0; h < 8; h++) {
            for (let v = 0; v < 8; v++) {
                let stone = board.get(h, v);

                whiteScore += stone == GridState.white && GridValues[h][v];
                blackScore += stone == GridState.black && GridValues[h][v];
            }
        }

        return attacker == GridState.black ? blackScore - whiteScore : whiteScore - blackScore;
    };

    this.AI.prototype.evaluate_finalstage = function(board, attacker) {
        let finalStoneCount = calcFinalStoneCount(board);

        let whiteScore = 0;
        let blackScore = 0;

        for (let h = 0; h < 8; h++) {
            for (let v = 0; v < 8; v++) {
                let stone = board.get(h, v);

                whiteScore += stone == GridState.white && GridValues[h][v];
                blackScore += stone == GridState.black && GridValues[h][v];
            }
        }

        return attacker == GridState.black
            ? blackScore - whiteScore + finalStoneCount.getBlackCount() - finalStoneCount.getWhiteCount()
            : whiteScore - blackScore + finalStoneCount.getWhiteCount() - finalStoneCount.getBlackCount();
    };

    this.AI.prototype.evaluate_final = function(board, attacker) {
        return attacker == GridState.black ? board.getBlackCount() - board.getWhiteCount() : board.getWhiteCount() - board.getBlackCount();
    };

    this.AI.prototype.evaluateFutureBoards = function(board, attacker, depth, min, max) {
        if (board.isFinal()) return this.evaluate_final(board, attacker);
        else if (depth == 0) {
            switch (this.evaluationType) {
                case EvaluationType.opening:
                    return this.evaluate_opening(board, attacker);
                case EvaluationType.final_stage:
                    return this.evaluate_finalstage(board, attacker);
                case EvaluationType.final:
                    return this.evaluate_final(board, attacker);
            }
        }

        let childCount = 0;

        for (let child of board.enumerateNextBoard(attacker)) {
            childCount++;
            min = Math.max(min, -1 * this.evaluateFutureBoards(child, ~attacker, depth - 1, -max, -min));
            if (min >= max) return min;
        }

        if (childCount == 0) return -1 * this.evaluateFutureBoards(board, ~attacker, depth - 1, -max, -min);

        return min;
    };
}