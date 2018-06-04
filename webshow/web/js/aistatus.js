'use strict';

const STATUSINFO = {
    "0":["sprun","正常"],
    "1":["spclip","正在剪辑"],
    "2":["sperror","运行出错"],
    "3":["spstop","未启动"]
}
const NAMETOVALUE = {
    "engine_decode_":["vframe","aframe","packet"],
    "engine_producer_":["vframe","aframe","packet"],
    "engine_ocr_":["vframe","packet"],
    "engine_shot_":["vframe","packet"],
    "engine_detect_":["vframe","packet"],
    "engine_3d_":["vframe","packet"],
    "engine_audio_":["aframe","packet"],
    "engine_face_":["vframe","packet"],
    "engine_mux_":["packet","video_num"],
}

class Status{
    constructor(){
        
        this.name = undefined;
        this.light = undefined;
        this.data = undefined;
        this.tr = undefined;
        this.init = 0;
        this.initel();
    }

    initel(){
        this.tr = document.createElement("tr");
        this.name = document.createElement("td");
        this.light = document.createElement("td");
        this.data = document.createElement("td");

        let tdlist = [this.name,this.light,this.data];
        for(let i of tdlist){
            this.tr.appendChild(i);
        }
        $("#engine").append(this.tr);
    }
    changeStatus(name,detail){
        if(name=="status"){
            let classname = "sperror";
            let text = "运行出错";
            this.light.innerHTML = "<span class='light_span "+ classname +"'></span>"+text;
            this.data.innerHTML = detail;
            this.name.innerHTML = name;
            return;
        }
        if(!this.init){
            this.name.innerHTML = name;
            this.init = 1;
        }
        let classname = detail==null?"sperror":"sprun";
        let text = detail==null?"未启动":"运行中";
        this.light.innerHTML = "<span class='light_span "+ classname +"'></span>"+text;
        this.data.innerHTML = detail;
    }
    show_(){
        this.tr.className = "";
    }
    hide_(){
        this.tr.className = "hide";
    }
}

void Status;
