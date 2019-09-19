import { Player, flipState } from './reversi.js';

export let Engine = (function () {
    // お借りしました: http://d.hatena.ne.jp/tshino/20180106/1515218776
    function newWorkerViaBlob(relativePath) {
        let baseURL = window.location.href.replace(/\\/g, '/').replace(/\/[^\/]*$/, '/');
        let array = ['importScripts("' + baseURL + relativePath + '");'];
        let blob = new Blob(array, { type: 'text/javascript' });
        let url = window.URL.createObjectURL(blob);
        return new Worker(url);
    };

    let isReady = false;
    let callbackOnReady = () => { };

    // 新しいtaskが追加されたら、今あるタスクをすべてterminateするので、最も後ろの要素のみがterminated=falseとなっている
    // 型を認識させたいので、ゴミを入れて削除するという無駄コードを書いている。
    let tasks = [{
        resolve: function () { },
        reject: function () { },
        terminated: true,
    }];
    tasks.shift();

    let engineWorker = newWorkerViaBlob('../engine/wrapper.js');
    engineWorker.addEventListener('message', ({ data }) => {
        if (data.type === "init_completed") {
            isReady = true;
            console.log('init completed');
            callbackOnReady();
        }
        else if (data.type === "result") {
            let task = tasks.shift();
            if (!task.terminated) {
                task.resolve(data.result);
            }
        }
        else if (data.type === "error") {
            let task = tasks.shift();
            if (!task.terminated) {
                task.reject(data.message);
            }
            // すでにrejectされているので、一応throwしておく
            else throw data.message;
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

    function addTask(postedData) {
        engineWorker.postMessage(postedData);
        tasks.forEach(task => {
            task.terminated = true;
            task.reject("terminated");
        });

        return new Promise((resolve, reject) => {
            tasks.push({
                resolve: resolve,
                reject: reject,
                terminated: false,
            });
        });
    }

    function chooseMove(p, o, depth) {
        return addTask({ type: "choose", p: p, o: o, depth: depth });
    }

    function solve(p, o) {
        return addTask({ type: "solve", p: p, o: o });
    }

    function _computeEvalValue(p, o, depth) {
        return addTask({ type: "eval", p: p, o: o, depth: depth });
    }

    function _computeBestScore(p, o) {
        return addTask({ type: "eval_exact", p: p, o: o });
    }

    function intrand(N) {
        return Math.random() * N | 0;
    }

    async function chooseBestMove(reversi, searchDepth, exactDepth) {
        let cnt = reversi.getStoneCount(Player.black) + reversi.getStoneCount(Player.white);

        let p = toBitboard(reversi, reversi.player);
        let o = toBitboard(reversi, flipState(reversi.player));

        if (cnt < 64 - exactDepth) {
            return await chooseMove(p, o, searchDepth);
        }
        else {
            let solution = await solve(p, o);
            return {
                x: solution.bestMoves[0] % 8,
                y: solution.bestMoves[0] / 8 | 0
            };
        }
    }

    async function computeEvalValue(reversi, depth) {
        let p = toBitboard(reversi, reversi.player);
        let o = toBitboard(reversi, flipState(reversi.player));

        return await _computeEvalValue(p, o, depth);
    }

    async function computeBestScore(reversi) {
        let p = toBitboard(reversi, reversi.player);
        let o = toBitboard(reversi, flipState(reversi.player));

        return await _computeBestScore(p, o);
    }

    return {
        isReady() { return isReady; },
        onReady(func) {
            if (typeof func === "function")
                callbackOnReady = func;
        },
        chooseBestMove: chooseBestMove,
        computeEvalValue: computeEvalValue,
        computeBestScore: computeBestScore,
    };
})();