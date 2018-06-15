'use strict';

class Result{
    constructor(clipdetail){
        
        this.clip = clipdetail;
        this.el = null;
        this.btn = null;
        this.displayfilelist = "";
        this.initel();
        this.sethandler();
    }
    initel(){
        this.el = document.createElement("div");    
        this.btn = document.createElement("button");

    }

    loadresult(currentpage){
        
        let updiv = document.createElement("div");
        let upstatus = document.createElement("span");
        upstatus.setAttribute("class","glyphicon glyphicon-ok");
        if(this.clip[8]!=0){
            updiv.setAttribute("class","upstatus");
        }else{
            updiv.setAttribute("class","upstatus hide");
        }
        let deletethis = document.createElement("span");
        deletethis.setAttribute("class","glyphicon glyphicon-trash deletethis");
        deletethis.setAttribute("value",this.clip[0]);

        let innerdiv = document.createElement("div");
        let img = document.createElement("img");
        let captiondiv = document.createElement("div");
        let timep = document.createElement("p");
        let playicon = document.createElement("span");
        this.el.setAttribute("class","col-sm-4 col-md-3");        
        innerdiv.setAttribute("class","thumbnail");
        let imgurl = "/static/web/timg.jpeg";
        let imgpaths = this.clip[7]=="[]"?"":(this.clip[7].substr(1,this.clip[7].length-2)).split(",");
        let imgpath = imgpaths==""?imgurl:imgpaths[0].substr(1,imgpaths[0].length-2);
        img.setAttribute("src",imgpath);
        img.setAttribute("onerror","onerror=null;src='/static/web/timg.jpeg'");
        captiondiv.setAttribute("class","caption");
        var min = Math.floor(this.clip[2]/60);
        var sec = Math.floor(this.clip[2]%60);
        var t="";
        if(min < 10){t += "0";}
        t += min + ":";
        if(sec < 10){t += "0";}
        t += sec;
        timep.innerHTML=this.clip[0]+":"+this.clip[10]+"<br>"+this.clip[9]+"<br>"+"时长: "+t;
        $(this.btn).attr({"class":"btn-none","data-toggle":"modal","data-target":".player"});
        playicon.setAttribute("class","glyphicon glyphicon-play-circle");
        updiv.appendChild(upstatus);
        innerdiv.appendChild(deletethis);
        this.btn.append(playicon);
        captiondiv.appendChild(timep);
        captiondiv.appendChild(this.btn);
        innerdiv.appendChild(updiv);
        innerdiv.appendChild(img);
        innerdiv.appendChild(captiondiv);
        this.el.appendChild(innerdiv);

        $(".resultlist").append(this.el);
    }
    sethandler(){

        $(this.btn).on('click',()=>{this.play()});
        // $(this.btn).click(alert("adfsdf"));
        // this.on('clickbtn',()=>{this.play()});
    }
    play(){
        if(this.clip[8]!=0){
            $("#change_result").attr("disabled","disabled")
        }else{
            $("#change_result").removeAttr("disabled")
        }
        let videopath = this.clip[1];
        $("#myModalLabel").html(this.clip[5]);
        $("input[name='sequence']").val(this.clip[0]);
        $(".clipvideo").attr("src",videopath);
        $("input[name='mediafilelist']").val(this.clip[1]);
        $("input[name='cduration']").val(this.clip[2]);
        $("input[name='keywords']").val(this.clip[3]);
        $("input[name='name']").attr("placeholder","请输入唯一的标题（不可重复）");
        $("input[name='shortname']").val(this.clip[5]);
        $("input[name='description']").val(this.clip[6]);
        $("input[name='displayfilelist']").val(this.clip[7]);
        $("input[name='recommend']").val(this.clip[10]);
    }

}

void Result;

