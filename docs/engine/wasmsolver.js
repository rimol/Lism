importScripts('./out.js');
importScripts('../lib/unzip.min.js');

let initCompleted = false;
Module.onRuntimeInitialized = () => {
    _initSymmetricPattern_exported();

    fetch('./eval.zip')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            let compressed = new Uint8Array(arrayBuffer);
            let unzip = new Zlib.Unzip(compressed);
            let filenames = unzip.getFilenames();

            let loaded = Array(61).fill(false);
            loaded[0] = true;

            for (let filename of filenames) {
                if (!/eval\/[0-9]+.bin/.test(filename))
                    continue;

                let stage = filename.replace(/[^0-9]/g, '') | 0;

                let plain = unzip.decompress(filename);
                let evalValues = new Float64Array(plain.buffer, plain.byteOffset, plain.byteLength / 8);

                let p_eval = _getEvalArraysPointer_exported(stage) / 8;
                let p_mobility = _getMobilityWeightPointer_exported(stage) / 8;
                let p_intercept = _getInterceptPointer_exported(stage) / 8;

                // 最後二つは開放度の重みと切片なので-2する.
                for (let i = 0; i < evalValues.length - 2; ++i) {
                    Module.HEAPF64[p_eval + i] = evalValues[i];
                }
                Module.HEAPF64[p_mobility] = evalValues[evalValues.length - 2];
                Module.HEAPF64[p_intercept] = evalValues[evalValues.length - 1];

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
        let pointer = _evalAllMoves_exported(data.p[1], data.p[0], data.o[1], data.o[0]) / 8;
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

            if (v.score > -10000)
                evalLog += `${moveString}: ${v.score} `;
        });
        console.log(evalLog);

        postMessage({
            type: "evaluation",
            result: movesWithScore
        });
    }
}