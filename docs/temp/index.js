let AI = (function () {
    // お借りしました: http://d.hatena.ne.jp/tshino/20180106/1515218776
    function newWorkerViaBlob(relativePath) {
        let baseURL = window.location.href.replace(/\\/g, '/').replace(/\/[^\/]*$/, '/');
        let array = ['importScripts("' + baseURL + relativePath + '");'];
        let blob = new Blob(array, { type: 'text/javascript' });
        let url = window.URL.createObjectURL(blob);
        return new Worker(url);
    };

    return {
        think(pos, callback) {
            let engine;

            if (pos.count_of(Player.black) + pos.count_of(Player.white) < 44) {
                // デバッグごとにいちいちeval.jsとengine.jsをコンパイルするのはめんどくさいので、ここではWebWorkerを使っていない。
                // let e = new ReversiEngine(4);
                // let result = e.think(pos.bb[pos.player].bits[1], pos.bb[pos.player].bits[0], pos.bb[pos.player ^ 1].bits[1], pos.bb[pos.player ^ 1].bits[0]);
                // callback(result);
                // return;

                engine = newWorkerViaBlob("engine_compiled.js");
                engine.addEventListener("message", res => {
                    let result = res.data;

                    callback(result);
                });
            }
            else {
                engine = newWorkerViaBlob("solver_compiled.js");
                engine.addEventListener("message", res => {
                    let result = res.data;

                    callback(result);
                });
            }

            engine.postMessage({
                "p1": pos.bb[pos.player].bits[1],
                "p0": pos.bb[pos.player].bits[0],
                "o1": pos.bb[pos.player ^ 1].bits[1],
                "o0": pos.bb[pos.player ^ 1].bits[0],
            });
        }
    }
})();

!function () {
    let current_game = new Reversi();

    current_game.onPass(function () {
        alert("pass!");
    });

    current_game.onGameFinished(function () {
        let black_count = current_game.count_of(Player.black);
        let white_count = current_game.count_of(Player.white);

        let win = black_count > white_count ? "黒の勝ち" : white_count > black_count ? "白の勝ち" : "引き分け";
        alert(`黒 ${black_count}石、白 ${white_count}石で${win}です！`);
    });

    // enum無いのはなぜなのか
    let PlayerType = {
        human: 0,
        ai: 1
    };

    let players = (function() {
        let player_1 = (function () {
            let stone_count = document.getElementById("count1");
            let message = document.getElementById("message1");
    
            return {
                type: PlayerType.human,
                update() {
                    stone_count.innerHTML = current_game.count_of(Player.black);
                },
                showMessage(message_str) {
                    message.innerHTML = message_str || "";                    
                }
            };
        })();
    
        let player_2 = (function () {
            let stone_count = document.getElementById("count2");
            let message = document.getElementById("message2");            
    
            return {
                type: PlayerType.human,
                update() {
                    stone_count.innerHTML = current_game.count_of(Player.white);
                },
                showMessage(message_str) {
                    message.innerHTML = message_str || "";                    
                }
            };
        })();

        return [player_1, player_2];
    })();

    let recode_str = document.getElementById("recode-str");

    function update() {
        BoardCanvas.render(current_game);

        recode_str.value = current_game.recode;

        players[Player.black].update();
        players[Player.white].update();
    };

    update();

    function onAiFinishedThinking(move) {
        let comment = "";
        let result = move["result"];

        if (move["exact"]) {
            comment = result > 0 ? `${result}石差で僕の勝ちでおまんがな。`
                : result < 0 ? `${-result}石差で負ける...妙だな`
                : "引き分けって分かってしもたんでんがな"
        }
        else {
            comment = result > 100 ? "真実はいつもひとつ！"
                : result > 60 ? "謎は全て解けた！"
                : result > 20 ? "迷宮なしの名探偵です"
                : result > 10 ? "（ニンマリ）"
                : result > -10 ? "いい試合だねー！"
                : result > -20 ? "あれれーっ...."
                : result > -60 ? "おっかしいぞ～？？？"
                : result > -100 ? "マズイな..."
                : "バーロー、もっと手加減してください";

            //comment += ` (評価値:${result})`
        }

        comment += "\n";
        let nps = move["nodes"] / move["elapsed"] * 1000 | 0;
        comment += `${nps} nodes/s`;

        players[current_game.player].showMessage(comment);

        main(move["x"], move["y"]);
    }

    // loop
    function main(x, y) {
        if (!current_game.can_put_at(x, y)) return;

        current_game.putAt(x, y);
        update();

        if (players[current_game.player].type === PlayerType.ai) {
            players[current_game.player].showMessage("考え中...");
            AI.think(current_game, onAiFinishedThinking);
        }
    }

    BoardCanvas.onCanvasClicked((x, y) => {
        if (players[current_game.player].type === PlayerType.human) main(x, y);
    });

    this["startGame"] = () => {
        // runBenchmark();

        current_game.reset();

        let black_type = +document.getElementById("type1").value;
        let white_type = +document.getElementById("type2").value;

        players[Player.black].type = black_type;
        players[Player.white].type = white_type;

        update();

        if (players[current_game.player].type === PlayerType.ai) {
            players[current_game.player].showMessage("考え中...");
            AI.think(current_game, onAiFinishedThinking);
        }
    };

    this["loadRecode"] = () => {
        current_game.loadRecode(recode_str.value);

        let black_type = +document.getElementById("type1").value;
        let white_type = +document.getElementById("type2").value;

        players[Player.black].type = black_type;
        players[Player.white].type = white_type;

        update();

        if (players[current_game.player].type === PlayerType.ai) {
            players[current_game.player].showMessage("考え中...");
            AI.think(current_game, onAiFinishedThinking);
        }
    };

    this["undo"] = () => {
        current_game.undo();

        update();
    };

    this["redo"] = () => {
        current_game.redo();

        update();
    };
}();