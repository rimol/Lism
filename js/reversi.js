const GridState = {
    empty: 0,
    black: 1,
    white: ~1,
};

const Player = {
    black: 1,
    white: ~1,
};

let Reversi = function () {
    let currentBoard = new Board();
    currentBoard.set(GridState.white, 3, 3);
    currentBoard.set(GridState.black, 3, 4);
    currentBoard.set(GridState.black, 4, 3);
    currentBoard.set(GridState.white, 4, 4);

    let candidates = [];
    let currentPlayer = Player.black;
    let isFinished = false;

    this.updateCandidates = function () {
        if (isFinished) return;

        candidates.length = 0;

        let count = 0;
        for (let child of currentBoard.enumerateNextBoard(currentPlayer)) {
            let placed_upper = (child.getUpperBlack() | child.getUpperWhite()) ^ (currentBoard.getUpperBlack() | currentBoard.getUpperWhite());
            let placed_lower = (child.getLowerBlack() | child.getLowerWhite()) ^ (currentBoard.getLowerBlack() | currentBoard.getLowerWhite());

            let bitPosition = bitPos(placed_upper || placed_lower) + (placed_upper != 0 ? 0 : 32);
            candidates[bitPosition] = child;
            count++;
        }

        if (count == 0) {
            currentPlayer = ~currentPlayer;

            let count = 0;
            for (let child of currentBoard.enumerateNextBoard(currentPlayer)) {
                let placed_upper = (child.getUpperBlack() | child.getUpperWhite()) ^ (currentBoard.getUpperBlack() | currentBoard.getUpperWhite());
                let placed_lower = (child.getLowerBlack() | child.getLowerWhite()) ^ (currentBoard.getLowerBlack() | currentBoard.getLowerWhite());

                let bitPosition = bitPos(placed_upper || placed_lower) + (placed_upper != 0 ? 0 : 32);
                candidates[bitPosition] = child;
                count++;
            }

            if (count == 0) {
                isFinished = true;
                return;
            }
        }
    };

    this.isFinished = function () {
        return isFinished;
    };

    this.getAttacker = function () {
        return currentPlayer;
    };

    this.getCurrentBoard = function () {
        return currentBoard.clone();
    };

    this.canPlaceAt = function (h, v) {
        return candidates[h + v * 8] !== void 0;
    };

    this.switchAttacker = function () {
        currentPlayer = ~currentPlayer;
    };

    this.placeAt = function (h, v) {
        if (!this.canPlaceAt(h, v)) return;

        currentBoard = candidates[h + v * 8];
    };

    this.updateCandidates();
};