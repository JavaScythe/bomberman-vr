let ws = new WebSocket("ws://"+location.hostname+":3000");
let tk;
let pid;
let prvpos = [0,0];
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
function collisioncheck(p){
    //boundaries
    if(p[0] < 0 || p[0] > 12 || p[1] < 0 || p[1] > 12){
        return "W";
    }
    //walls
    //round to nearest integer
    let o = game.map[Math.round(p[0])][Math.round(p[1])];
    return o;
}
function phyTick(){
    let or = document.getElementById("camera").object3D.rotation;
    let p = document.getElementById("camera").object3D.position;
    p = [p.x, p.y, p.z];
    let x = controller.thumbstick.x;
    let y = controller.thumbstick.y;
    let speed = 0.1;
    x *= speed;
    y *= speed;
    let dx = Math.cos(or.y) * x + Math.sin(or.y) * y;
    let dy = Math.sin(or.x) * y;
    let dz = Math.cos(or.y) * y - Math.sin(or.y) * x;
    let o = collisioncheck([p[0]+dx, p[2]+dz]);
    if(
        o == "W" ||
        o == "C" ||
        (o == "B" && (collisioncheck([p[0],p[1]]) != "B" || collisioncheck(prvpos) !== "B"))
    ){
        
    } else {
        p[0] += dx;
        p[2] += dz;
    }
    prvpos = [p[0],p[1]];
    document.getElementById("camera").object3D.position.set(p[0], p[1], p[2]);

}
setInterval(phyTick, 1000/50);
function rotProc(r){
    return [
        r._x,
        r._y,
        r._z
    ]
}
function dropBomb(){
    console.log("BOMBS AWAY", [Math.round(document.getElementById("camera").object3D.position.x), Math.round(document.getElementById("camera").object3D.position.z)]);
    sn({
        "ty": "bomb",
        "p": [Math.round(document.getElementById("camera").object3D.position.x), Math.round(document.getElementById("camera").object3D.position.z)],
        "tk": tk
    });
}
function packet(){
    sn({
        "ty": "pos",
        "d": {
            "p": Object.values(document.getElementById("camera").object3D.position),
            "r": rotProc(document.getElementById("camera").object3D.rotation)
        },
        "tk": tk
    });  
}
setInterval(packet, 200);
function fabMap(t,p){
    if(document.getElementById("map-"+p[0]+"-"+p[1])){
        document.getElementById("map-"+p[0]+"-"+p[1]).parentElement.removeChild(document.getElementById("map-"+p[0]+"-"+p[1]));
    }
    if(t == "B"){
        let o = document.createElement("a-sphere");
        o.setAttribute("id", "map-"+p[0]+"-"+p[1]);
        o.setAttribute("position", p[0]+" 1 "+p[1]);
        o.setAttribute("radius", "0.5");
        o.setAttribute("color", "#0000FF");
        document.getElementsByTagName("a-scene")[0].appendChild(o);
        return o;
    } else if(t == "E"){
        return;
    } else if(t == "C"){
        let o = document.createElement("a-box");
        o.setAttribute("id", "map-"+p[0]+"-"+p[1]);
        o.setAttribute("position", p[0]+" 1 "+p[1]);
        o.setAttribute("height", "2");
        o.setAttribute("color", "#00FF00");
        document.getElementsByTagName("a-scene")[0].appendChild(o);
        return o;
    } else if(t == "W"){
        let o = document.createElement("a-box");
        o.setAttribute("id", "map-"+p[0]+"-"+p[1]);
        o.setAttribute("position", p[0]+" 1 "+p[1]);
        o.setAttribute("height", "2");
        o.setAttribute("color", "#FF0000");
        document.getElementsByTagName("a-scene")[0].appendChild(o);
    } else if(t == "P"){
        let o = document.createElement("a-box");
        o.setAttribute("scale", "0.5 0.5 0.5");
        o.setAttribute("position", p.join(" "));
        o.setAttribute("color", "#000000");
        document.getElementsByTagName("a-scene")[0].appendChild(o);
        return o;
    }
}
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
        pid = m.player;
    } else if(m.ty == "init"){
        game.map = m.d.map;
        game.players = m.d.players;
        for(let i in game.players){
            if(i == pid){
                document.getElementById("camera").object3D.position.set(...game.players[i].p);
                continue;
            }
            if(!document.getElementById("player-"+i)){
                let o = fabMap("P", game.players[i].p);
                o.setAttribute("id", "player-"+i);
            } else {
                document.getElementById("player-"+i).object3D.position.set(...game.players[i].p);
            }
        }
        console.log("initrendermap");
        for(let i in game.map){
            for(let j in game.map[i]){
                fabMap(game.map[i][j], [i,j]);
            }
        }
    } else if(m.ty == "pos"){
        if(pid == m.id) return;
        game.players[m.id].p = m.d.p;
        game.players[m.id].r = m.d.r;
        console.log(m.d.r);
        if(!document.getElementById("player-"+m.id)){
            let o = fabMap("P", game.players[m.id].p);
            o.setAttribute("id", "player-"+m.id);
        }
        document.getElementById("player-"+m.id).object3D.position.set(...game.players[m.id].p);
        document.getElementById("player-"+m.id).object3D.rotation.set(...game.players[m.id].r);
    } else if(m.ty == "mapupdate"){
        let d = m.d;
        for(let i in d){
            let o = d[i];
            let tar = document.getElementById("map-"+o.p[0]+"-"+o.p[1]);
            if(o.t == "E"){
                if(tar){
                    tar.parentElement.removeChild(tar);
                }
            }
            fabMap(o.t, o.p);
            game.map[o.p[0]][o.p[1]] = o.t;
        }
    } else if(m.ty == "death"){
        alert("Player "+m.id+" died");
        document.getElementById("player-"+m.id).parentElement.removeChild(document.getElementById("player-"+m.id));
    }
}