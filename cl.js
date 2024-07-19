let ws = new WebSocket("ws://"+location.hostname+":3000");
let tk;
let game = {
    map: [
        ["E","E","C","C","C","C","C","C","C","C","C","E","E"],
        ["E","W","C","W","C","W","C","W","C","W","C","W","E"],
        ["C","C","C","C","C","C","C","C","C","C","C","C","C"],
        ["C","W","C","W","C","W","C","W","C","W","C","W","C"],
        ["C","C","C","C","C","C","C","C","C","C","C","C","C"],
        ["C","W","C","W","C","W","C","W","C","W","C","W","C"],
        ["C","C","C","C","C","C","C","C","C","C","C","C","C"],
        ["C","W","C","W","C","W","C","W","C","W","C","W","C"],
        ["C","C","C","C","C","C","C","C","C","C","C","C","C"],
        ["C","W","C","W","C","W","C","W","C","W","C","W","C"],
        ["C","C","C","C","C","C","C","C","C","C","C","C","C"],
        ["E","W","C","W","C","W","C","W","C","W","C","W","E"],
        ["E","E","C","C","C","C","C","C","C","C","C","E","E"]
    ],
    players: []
}
ws.onopen = function(){
    console.log("ws opened");
    sn({
        "ty": "join"
    })
}
function sn(j){
    ws.send(JSON.stringify(j));
}
function render(){
    for(let i in game.map){
        for(let j in game.map[i]){
            let b = document.createElement("a-box");
            b.setAttribute("position", i+" 1 "+j);
            b.setAttribute("height", "2");
            let ty = game.map[i][j];
            if(ty == "C"){
                b.setAttribute("color", "#00FF00");
            } else if(ty == "W"){
                b.setAttribute("color", "#FF0000");
            } else if(ty == "E"){
                continue;
            }
            document.getElementsByTagName("a-scene")[0].appendChild(b);
        }
    }
}
function phyTick(){
    let p = document.getElementById("rig").getAttribute("position").split(" ");
    p.splice(1,0);
    console.log(p);
}
setTimeout(phyTick, 2000);
/*
<a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
<a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
<a-cylinder
position="1 0.75 -3"
radius="0.5"
height="1.5"
color="#FFC65D"
></a-cylinder>
<a-plane
position="0 0 -4"
rotation="-90 0 0"
width="4"
height="4"
color="#7BC8A4"
></a-plane>
*/
ws.onmessage = function(m){
    m = JSON.parse(m.data);
    if(m.ty == "reject"){
        alert(m.reason);
    } else if(m.ty == "success"){
        tk = m.tk;
        alert("joined as player "+m.player);
    } else if(m.ty == "init"){
        game.map = m.map;
        game.players = m.players;
    } else if(m.ty == "pos"){
        game.players[m.id].p = m.d.p;
        game.players[m.id].r = m.d.r;
    }
}