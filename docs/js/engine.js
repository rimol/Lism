let Engine = !function () {
    let isReady = false;

    // 長さ2の配列を返す 0: 0~31番目まで 1: 32~63番目まで
    function toBitboard(reversi, color) {
        let bb = [0, 0];
        for (let i = 0; i < 64; ++i) {
            let index = i >>> 5;

            if (reversi.board[i] === color) {
                bb[index] |= 1 << (i % 32);
            }
        }
        return bb;
    }

    // _solve_exportedのラッパー
    // webworker上で呼ぶ
    async function solve(p, o) {

    }

    async function chooseBestMove(reversi) {
        // とりあえずsolve_exportedを呼ぶようにする.
        let p = toBitboard(reversi, reversi.player);
        let o = toBitboard(reversi, flipState(reversi.player));

        let solution = await solve(p, o);
        return solution.bestMoves[0];
    }

    return {
        isReady() { return isReady; },
        chooseBestMove: chooseBestMove,
    };
}();