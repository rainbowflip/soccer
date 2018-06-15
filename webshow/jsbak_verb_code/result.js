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
        console.log("upstatus------",this.clip[8]==0)
        if(this.clip[8]!=0){
            updiv.setAttribute("class","upstatus");
        }else{
            updiv.setAttribute("class","upstatus hide");
        }
// 添加球星精彩剪辑选择框
let addthis = document.createElement("span");
addthis.setAttribute("class","glyphicon glyphicon-plus addthis");
addthis.setAttribute("value",this.clip[0]);
        let deletethis = document.createElement("span");
        deletethis.setAttribute("class","glyphicon glyphicon-trash deletethis");
        deletethis.setAttribute("value",this.clip[0]);
        deletethis.addEventListener("click",function(){
            console.log(this.getAttribute("value"));
            if(confirm("确认删除？")){
                fetch("/deleteinfo/?sequence="+this.getAttribute("value"),{
                    method:"GET",
                }).then((res)=>res.json())
                .then((res)=>{
                        console.log(res["status"]);
                        if(res["status"]=="OK"){
                           fetch("/mediainfo/",
                             {
                            method:"POST",
                           body:JSON.stringify({
                              perpage:8,
                             page:currentpage,
                             taskid:skiptaskid,
                            keyword:$(".labels li.active").attr("name"),
                          }) 
                          }).then((res)=>res.json())
                         .then((res)=>{
                            let jsonlist = res["mediainfo"];
                            
                            $(".resultlist").html("");
                            for(let i of jsonlist){
                                let y = new Result(i);
                                console.info(currentpage+"=====")
                                y.loadresult(currentpage);
                            }
                            let len = jsonlist.length;
                            console.log("zonggong yeshu ",Math.ceil(len/8))
                    
                            let options={
                                bootstrapMajorVersion:3,    //版本
                                currentPage:currentpage,    //当前页数
                                numberOfPages:10,    //最多显示Page页
                                totalPages:res["pages"],    //所有数据可以显示的页数
                                itemTexts: function (type, page, current) { //按钮
                                switch (type) {
                                    case "first":
                                        return "首页";
                                    case "prev":
                                        return "<";
                                    case "next":
                                        return ">";
                                    case "last":
                                        return "末页";
                                    case "page":
                                        return page;
                                    }
                                },
                                onPageClicked:function(event,originalEvent,type,page){
                                    if(currentpage!=page){
                                        currentpage = page;
                                        console.log("click+page",currentpage)
                                        getresults(res["pages"]);
                                    }
                                }
                            }
                            $("#paginator").bootstrapPaginator(options);
                        }).catch(e=>alert(e));
                        alert("删除成功！");
                        }else{
                        alert(res["status"]);
                        }
                    }).catch(e=>console.error(e));
                }
        })
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
        timep.innerHTML=this.clip[3]+"<br>"+this.clip[9];
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
        console.log(this.clip[4]+"this.title");
        let videopath = this.clip[1];
        $("#myModalLabel").html(this.clip[5]);
        $("input[name='sequence']").val(this.clip[0]);
        $(".clipvideo").attr("src",videopath);
        $("input[name='mediafilelist']").val(this.clip[1]);
        $("input[name='cduration']").val(this.clip[2]);
        $("input[name='keywords']").val(this.clip[3]);
        $("input[name='name']").val(this.clip[4]);
        $("input[name='shortname']").val(this.clip[5]);
        $("input[name='description']").val(this.clip[6]);
        $("input[name='displayfilelist']").val(this.clip[7]);
    }

}

void Result;

