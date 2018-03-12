let runBenchmark = (function () {
    // 上から #40-#47
    // http://www.radagast.se/othello/ffotest.html
    let ffotests = [
        { pos: "O--OOOOX-OOOOOOXOOXXOOOXOOXOOOXXOOOOOOXX---OOOOX----O--X--------", player: Player.black },
        { pos: "-OOOOO----OOOOX--OOOOOO-XXXXXOO--XXOOX--OOXOXX----OXXO---OOO--O-", player: Player.black },
        { pos: "--OOO-------XX-OOOOOOXOO-OOOOXOOX-OOOXXO---OOXOO---OOOXO--OOOO--", player: Player.black },
        { pos: "--XXXXX---XXXX---OOOXX---OOXXXX--OOXXXO-OOOOXOO----XOX----XXXXX-", player: Player.white },
        { pos: "--O-X-O---O-XO-O-OOXXXOOOOOOXXXOOOOOXX--XXOOXO----XXXX-----XXX--", player: Player.white },
        { pos: "---XXXX-X-XXXO--XXOXOO--XXXOXO--XXOXXO---OXXXOO-O-OOOO------OO--", player: Player.black },
        { pos: "---XXX----OOOX----OOOXX--OOOOXXX--OOOOXX--OXOXXX--XXOO---XXXX-O-", player: Player.black },
        { pos: "-OOOOO----OOOO---OOOOX--XXXXXX---OXOOX--OOOXOX----OOXX----XXXX--", player: Player.white },
    ];

    return function () {
        for (let ffo of ffotests) {
            let pos = new Reversi();
            pos.reset();
            pos.loadFFO(ffo.pos, ffo.player);

            let solver = new ReversiSolver();
            let result = solver.solve(pos.bb[ffo.player].bits[1], pos.bb[ffo.player].bits[0], pos.bb[ffo.player ^ 1].bits[1], pos.bb[ffo.player ^ 1].bits[0]);

            console.log(`結果: ${result.result}`);
            console.log(`経過時間: ${result.elapsed / 1000} 秒`);
            console.log(`Nodes: ${result.nodes}`);
            console.log(`NPS: ${Math.round(result.nodes / result.elapsed * 1000)} nodes/s`);
        }
    };
})();