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
    let or = document.getElementById("camera").object3D.rotation;
    let p = document.getElementById("camera").object3D.position;
    p = [p.x, p.y, p.z];
    let x = controller.thumbstick.x;
    let y = controller.thumbstick.y;
    
    let dx = Math.cos(or.y) * x + Math.sin(or.y) * y;
    let dy = Math.sin(or.x) * y;
    let dz = Math.cos(or.y) * y - Math.sin(or.y) * x;
    if(game.map[Math.floor(p[0]+dx)][Math.floor(p[2]+dz)] !== "C" || true){
        p[0] += dx;
        p[2] += dz;
    }


    document.getElementById("camera").object3D.position.set(p[0], p[1], p[2]);

}
setInterval(phyTick, 1000/10);
function packet(){
    sn({
        "ty": "pos",
        "d": {
            "p": document.getElementById("camera").object3D.position,
            "r": document.getElementById("camera").object3D.rotation
        },
        "tk": tk
    });  
}
function fabMap(t,p){
    if(document.getElementById("map-"+p[0]+"-"+p[1])){
        document.getElementById("map-"+p[0]+"-"+p[1]).parentElement.removeChild(document.getElementById("map-"+p[0]+"-"+p[1]));
    }
    if(t == "B"){
        let o = document.createElement("a-sphere");
        o.setAttribute("id", "map-"+p[0]+"-"+p[1]);
        o.setAttribute("position", p[0]+" 1 "+p[1]);
        o.setAttribute("radius", "1");
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
    } else if(m.ty == "init"){
        game.map = m.map;
        game.players = m.players;
    } else if(m.ty == "pos"){
        game.players[m.id].p = m.d.p;
        game.players[m.id].r = m.d.r;
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
        }
    }
}