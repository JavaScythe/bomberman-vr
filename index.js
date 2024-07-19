const uWS = require('uWebSockets.js');
const app = uWS.App();
const fs = require('fs');
const MAP = [
    ["E","E","C","W","C","W","C","E","E"],
    ["E","C","C","C","C","C","C","C","E"],
    ["C","W","C","W","C","W","C","W","C"],
    ["C","C","C","C","C","C","C","C","C"],
    ["C","W","C","W","C","W","C","W","C"],
    ["C","C","C","C","C","C","C","C","C"],
    ["C","W","C","W","C","W","C","W","C"],
    ["C","C","C","C","C","C","C","C","C"],
    ["E","W","C","W","C","W","C","W","C"],
    ["E","E","C","C","C","C","C","C","C"],
];

let game = {
    playing: false,
    players: [],
    map: 0,
    bombs: {}
}
let enc = new TextDecoder("utf-8");
app.get('/', (res, req) => {
	res.end(fs.readFileSync(__dirname + '/index.html'));
});
app.get('/test', (res, req) => {
	res.end(fs.readFileSync(__dirname + '/test.html'));
});
app.get('/cl.js', (res, req) => {
	res.end(fs.readFileSync(__dirname + '/cl.js'));
});
app.get('/aframe.min.js', (res, req) => {
	res.end(fs.readFileSync(__dirname + '/aframe.min.js'));
});
app.get('/aframe.min.js.map', (res, req) => {
	res.end(fs.readFileSync(__dirname + '/aframe.min.js.map'));
});
app.get("/favicon.ico", (res, req) => {
	res.writeStatus("200").end();
});
app.ws('/*', {
	compression: uWS.SHARED_COMPRESSOR,
	maxPayloadLength: 16 * 1024 * 1024,
	idleTimeout: 10,
	maxBackpressure: 1024,
	open: (ws) => {
        console.log("ws connected");
	},
	message: (ws, message, isBinary) => {
        let m;
        try{m=JSON.parse(enc.decode(message))}catch(e){
            console.log(e);
            return;
        };
        if(m.ty == "join"){
            if(game.playing){
                wd(ws,{
                    "ty": "reject",
                    "player": -1,
                    "reason": "game already active"
                });
                return;
            }
            if(game.players.length >= 4){
                wd(ws,{
                    "ty": "reject",
                    "player": -1,
                    "reason": "game full"
                });
                return;
            }
		    ws.subscribe('game');
            let tk = Math.random().toString().replace(".","");
            game.players.push({
                id: tk,
                p: []
            });
            ws.getUserData().tk = tk;
            wd(ws, {
                "ty": "success",
                "player": game.players.length-1,
                "tk": tk
            });
        } else if(m.ty == "pos"){
            if(!checkId(m.tk)) return;
            app.publish("game", {
                "ty": "pos",
                "d": m.d,
                id: numById(m.tk)
            });
        } else if(m.ty == "bomb"){
            if(!checkId(m.tk)) return;
            let pn = numById(m.tk);
            let p = game.players[pn];
            if(p.bombs != 0){
                if(game.map[m.p[0]][m.p[1]] == "E"){
                    game.map[m.p[0]][m.p[1]] = "B";
                    app.publish("game", JSON.stringify({
                        "ty": "mapupdate",
                        "d": [
                            {
                                "p": m.p,
                                "t": "B"
                            }
                        ]
                    }));
                    game.players[pn].bombs--;
                    let bid = Math.random().toString().replace(".","");
                    bombs[bid] = m.p;
                    setTimeout(detonate.bind(null,bid), 3000)
                }
            }
        } else if(m.ty == "start"){
            if(!checkId(m.tk)) return;
            gameInit();
        }
    },
    drain: (ws) => {

    },
    close: (ws,code,message) =>{
        game.players.splice(numById(ws.getUserData().tk));
    }
});
function checkId(id){
    for(let i in game.players){
        if(game.players[i].id == id) return true;
    }
    return false;
}
function detonate(bid){
    if(game.bombs[bid] == undefined){
        return;
    }
    let p = game.bombs[bid];
    if(ignite([p[0]-1, p[1]])) ignite([p[0]-2, p[1]]);
    if(ignite([p[0], p[1]-1])) ignite([p[0], p[1]-2]);
    if(ignite([p[0], p[1]+1])) ignite([p[0], p[1]+2]);
    if(ignite([p[0]+1, p[1]])) ignite([p[0]+2, p[1]]);

    delete game.bombs[bid];
}
function ignite(p){
    if(game.map[p[0]][p[1]] == "C"){
        game.map[p[0]][p[1]] == "E";
        return false;
    }
    if(game.map[p[0]][p[1]] == "B"){
        let bid;
        for(let i in game.bombs){
            if(game.bombs[i] == p){
                bid = i;
                break;
            }
        }
        detonate(bid);
        return false;
    }
    if(game.map[p[0]] == undefined || game.map[p[0]][p[1]] == undefined){
        return false;
    }
    return true;
}
function numById(id){
    for(let i in game.players){
        if(game.players[i].id == id) return i;
    }
}
function wd(ws,m){
    ws.send(JSON.stringify(m));
}
function gameInit(){
    game.playing = true;
    if(game.players[0]){
        game.players[0].p = [0,0];
    } else if(game.players[1]){
        game.players[1].p = [9,0];
    } else if(game.players[2]){
        game.players[2].p = [9,9];
    } else if(game.players[3]){
        game.players[3].p = [0,9];
    }
    for(let i in game.players){
        game.players[i].bombs = 1;
    }
    game.bombs = {};
    game.map = MAP;
    app.publish("game", JSON.stringify({
        "ty": "init",
        "d": game
    }));

}
app.listen(3000, (token) => {
    if (token) {
        console.log('Listening to port 3000');
    }
    else {
        console.log('Failed to listen to port 3000');
    }
});
