import { Player, flipState } from './reversi.js';

export let Engine = (function () {
    let isReady = false;
    let isWorkerRunning = false;
    let callback = {
        resolve: function () { },
        reject: function () { }
    }

    let solverWorker = new Worker('../engine/wasmsolver.js');
    solverWorker.addEventListener('message', ({ data }) => {
        if (data.type === "init_completed") {
            isReady = true;
            console.log('init completed');
        }
        else if (data.type === "solution") {
            isWorkerRunning = false;
            callback.resolve(data.result);
        }
        else if (data.type === "error") {
            callback.reject(data.message);
        }
    });

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

    function solve(p, o) {
        if (isWorkerRunning) {
            return new Promise((_, reject) => {
                reject("wait for the previous task");
            });
        }
        else {
            isWorkerRunning = true;
            solverWorker.postMessage({ p: p, o: o });
            return new Promise((resolve, reject) => {
                callback.resolve = resolve;
                callback.reject = reject;
            });
        }
    }

    function intrand(N) {
        return Math.random() * N | 0;
    }

    async function chooseBestMove(reversi) {
        const SolverSearchDepth = 20;
        let cnt = reversi.getStoneCount(Player.black) + reversi.getStoneCount(Player.white);

        if (cnt < 64 - SolverSearchDepth) {
            let legalMoves = [];
            for (let i = 0; i < 64; ++i) {
                let x = i % 8;
                let y = i / 8 | 0;

                if (reversi.isLegalMove(x, y, reversi.player)) {
                    legalMoves.push({ x: x, y: y });
                }
            }

            return legalMoves[intrand(legalMoves.length)];
        }
        else {
            let p = toBitboard(reversi, reversi.player);
            let o = toBitboard(reversi, flipState(reversi.player));

            let solution = await solve(p, o);
            return {
                x: solution.bestMoves[0] % 8,
                y: solution.bestMoves[0] / 8 | 0
            };
        }
    }

    return {
        isReady() { return isReady; },
        chooseBestMove: chooseBestMove,
    };
})();