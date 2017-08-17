{
    let reversi = new Reversi();
    let conankun = new AI(GridState.white);

    let PlayerInfo = {
        stone: Player.black
    };

    let AIInfo = {
        stone: Player.white
    };

    window.onload = function() {
        main(-1, -1);
    };

    let main = function (h, v) {
        if (reversi.isFinished()) return;

        let placeFlag = reversi.canPlaceAt(h, v);
        reversi.placeAt(h, v);
        if (placeFlag) reversi.switchAttacker();

        reversi.updateCandidates();

        let currentBoard = reversi.getCurrentBoard();

        BoardRenderer.update(currentBoard, h, v);
        //テキストの表示の更新
        //player_stone_count.innerHTML = PlayerInfo.stone == Player.black ? currentBoard.getBlackCount() : currentBoard.getWhiteCount();
        //opponent_stone_count.innerHTML = OpponentInfo.stone == Player.black ? currentBoard.getBlackCount() : currentBoard.getWhiteCount();
    };

    BoardRenderer.setCallbackOnRenderingFinished(function () {
        if (!reversi.isFinished() && reversi.getAttacker() == AIInfo.stone) {
            let currentBoard = reversi.getCurrentBoard();
            let nextBoards = [];
            for (let child of currentBoard.enumerateNextBoard(AIInfo.stone)) {
                nextBoards.push(child);
            }

            let startTime = Date.now();
            let nextBoard = conankun.determineNextBoard(nextBoards);

            setTimeout(function () {
                let placed_upper = (nextBoard.getUpperBlack() | nextBoard.getUpperWhite()) ^ (currentBoard.getUpperBlack() | currentBoard.getUpperWhite());
                let placed_lower = (nextBoard.getLowerBlack() | nextBoard.getLowerWhite()) ^ (currentBoard.getLowerBlack() | currentBoard.getLowerWhite());

                let bitPosition = bitPos(placed_upper || placed_lower);
                let h = bitPosition % 8;
                let v = (bitPosition - h) / 8 + (placed_upper != 0 ? 0 : 4);

                main(h, v);
            }, 250 - Date.now() + startTime);
        }
    });

    BoardRenderer.setCallbackOnGridClicked(function (h, v) {
        if (reversi.getAttacker() == PlayerInfo.stone) main(h, v);
    });
}