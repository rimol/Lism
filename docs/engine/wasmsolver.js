importScripts('./out.js');

let initCompleted = false;
Module.onRuntimeInitialized = () => {
    initCompleted = true;
    postMessage({ type: "init_completed" });
};

onmessage = ({ data }) => {
    if (!initCompleted) {
        postMessage({ type: "error", message: "the solver hasn't been initialized yet" });
    }
    else if (data == null || !Array.isArray(data.p) || !Array.isArray(data.o) || data.p.length < 2 || data.o.length < 2) {
        postMessage({ type: "error", message: "the invalid arguments" });
    }
    else {
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
}