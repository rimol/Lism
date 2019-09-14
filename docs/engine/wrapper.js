importScripts('./eng.js');
importScripts('../lib/unzip.min.js');

let initCompleted = false;
Module.onRuntimeInitialized = () => {
    _initialize_exported();

    fetch('./eval.zip')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            let compressed = new Uint8Array(arrayBuffer);
            let unzip = new Zlib.Unzip(compressed);
            let filenames = unzip.getFilenames();

            let loaded = Array(15 + 1).fill(false);
            loaded[0] = true;

            for (let filename of filenames) {
                if (!/[0-9]+.bin/.test(filename))
                    continue;
                // これ、バイトオーダーがリトルエンディアンじゃなかったらバグるのでは...
                let stage = filename.replace(/[^0-9]/g, '') | 0;

                if (!(1 <= stage && stage <= 15)) continue;

                let plain = unzip.decompress(filename);
                let pointer = Module._malloc(plain.byteLength);
                Module.HEAPU8.set(plain, pointer);
                _initWeightTable_exported(stage - 1, pointer);
                Module._free(pointer);
                loaded[stage] = true;
            }

            if (loaded.every(v => v)) {
                initCompleted = true;
                postMessage({ type: "init_completed" });
            }
            else throw "failed to load eval files";
        });
};

onmessage = ({ data }) => {
    if (!initCompleted) {
        postMessage({ type: "error", message: "wasm-reversi-engine hasn't been initialized yet" });
    }
    else if (data == null) {
        postMessage({ type: "error", message: "無意味に呼び出すな💢" });
    }
    else if (data.type == null) {
        postMessage({ type: "error", message: "you must specify a type of a message" });
    }
    else if (!Array.isArray(data.p) || !Array.isArray(data.o) || data.p.length < 2 || data.o.length < 2) {
        postMessage({ type: "error", message: "the invalid arguments" });
    }
    else if (data.type === "solve") {
        let pointer = _solve_exported(data.p[1], data.p[0], data.o[1], data.o[0]);
        let bestScore = getValue(pointer, 'i32');
        let nodeCount = getValue(pointer + 4, 'i32');
        let scoreLockTime = getValue(pointer + 8, 'i32');
        let wholeTime = getValue(pointer + 12, 'i32');
        let bestMoves = [];
        for (let i = 0; i < 60; ++i) {
            bestMoves[i] = getValue(pointer + (i + 4) * 4, 'i32');
        }
        console.log(`score: ${bestScore}`);
        console.log(`NPS: ${nodeCount / scoreLockTime | 0}k nodes/sec`);

        postMessage({
            type: "solution",
            result: {
                bestScore: bestScore,
                nodeCount: nodeCount,
                scoreLockTime: scoreLockTime,
                wholeTime: wholeTime,
                bestMoves: bestMoves
            }
        });
    }
    else if (data.type === "eval") {
        let pointer = _evalAllMoves_exported(data.p[1], data.p[0], data.o[1], data.o[0], data.depth) / 8;
        let movesWithScore = [];
        for (let i = 0; i < 64; ++i) {
            movesWithScore.push({
                move: i,
                score: Module.HEAPF64[pointer + i]
            });
        }

        movesWithScore.sort((a, b) => b.score - a.score);
        let evalLog = "";
        movesWithScore.forEach(v => {
            let x = v.move % 8;
            let y = v.move / 8 | 0;
            let moveString = "ABCDEFGH"[x] + (y + 1);

            if (v.score > -1000)
                evalLog += `${moveString}: ${v.score} `;
        });
        console.log(evalLog);

        postMessage({
            type: "evaluation",
            result: movesWithScore
        });
    }
}