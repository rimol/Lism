import { Player, flipState } from './reversi.js';

export let Engine = (function () {
    let isReady = false;
    let callbackOnReady = () => { };
    let isWorkerRunning = false;
    let callback = {
        resolve: function () { },
        reject: function () { }
    }

    let engineWorker = new Worker('../engine/wrapper.js');
    engineWorker.addEventListener('message', ({ data }) => {
        if (data.type === "init_completed") {
            isReady = true;
            console.log('init completed');
            callbackOnReady();
        }
        else if (data.type === "evaluation") {
            isWorkerRunning = false;
            callback.resolve(data.result);
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

    function evalAllMoves(p, o) {
        if (isWorkerRunning) {
            return new Promise((_, reject) => {
                reject("wait for the previous task");
            });
        }
        else {
            isWorkerRunning = true;
            engineWorker.postMessage({ type: "eval", p: p, o: o });
            return new Promise((resolve, reject) => {
                callback.resolve = resolve;
                callback.reject = reject;
            });
        }
    }

    function solve(p, o) {
        if (isWorkerRunning) {
            return new Promise((_, reject) => {
                reject("wait for the previous task");
            });
        }
        else {
            isWorkerRunning = true;
            engineWorker.postMessage({ type: "solve", p: p, o: o });
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

        let p = toBitboard(reversi, reversi.player);
        let o = toBitboard(reversi, flipState(reversi.player));

        if (cnt < 64 - SolverSearchDepth) {
            let movesWithScore = await evalAllMoves(p, o);
            return {
                x: movesWithScore[0].move % 8,
                y: movesWithScore[0].move / 8 | 0
            }
        }
        else {
            let solution = await solve(p, o);
            return {
                x: solution.bestMoves[0] % 8,
                y: solution.bestMoves[0] / 8 | 0
            };
        }
    }

    return {
        isReady() { return isReady; },
        onReady(func) {
            if (typeof func === "function")
                callbackOnReady = func;
        },
        chooseBestMove: chooseBestMove,
    };
})();