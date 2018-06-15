'use strict';

// class Medialist{
//     constructor(id,title,label,detail,introduce){
        
//         this.id = id;
//         this.title = title;
//         this.label = label;
//         this.detail = detail;
//         this.introduce = introduce;
//         this.el = null;
//         this.btn = null;

//         this.initel();
//         this.sethandler();
//     }
//     initel(){
//         this.el = document.createElement("tr");
//         this.btn = document.createElement("button");
//     }

//     loadresult(){
//         this.btn.setAttribute("class","btn btn-default");
//         this.btn.innerHTML = ("see more");
//         let el_list = "";
//         el_list += "<td>"+this.id+"</td>";
//         el_list += "<td>"+this.title+"</td>";
//         el_list += "<td>"+this.label+"</td>";
//         el_list += "<td>"+this.detail+"</td>";
//         el_list += "<td>"+this.introduce+"</td>";
//         let td = document.createElement("td");
//         td.append(this.btn);
//         this.el.innerHTML = el_list;
//         this.el.append(td);
//         $("#result_list").append(this.el);
//         console.log("loadresult")
//     }
//     sethandler(){

//         $(this.btn).on('click',()=>{this.play()});
//         // $(this.btn).click(alert("adfsdf"));
//         // this.on('clickbtn',()=>{this.play()});
//     }
//     play(){

//         console.log(this.title+"this.title");
//         $("video").attr("src","penalty21.MP4");
//     }

// }
class Pagination{
    constructor(){
        this.pagesize = 8;
        this.showpage = 4;
        this.pagenum = null;
        this.json = null;
        this.currentpage = 1;
        this.pagebar = undefined;
        this.initbar();
        this.sethandler();
    }
    initbar(){
        this.pagebar = document.createElement("ul");
        this.pagebar.setAttribute("class","pagination");
        this.pagebar.innerHTML="<li><a value='1' href='#'>首页</a></li><li><a value='2' href='#'>22</a></li>";
        $("#results").append(this.pagebar);
    }
    refresh(json){
        this.json = json;
        console.log(json.length);
        this.pagenum = parseInt((json.length+this.pagesize-1)/this.pagesize);
    }
    sethandler(){
        this.pagebar.childNodes.onclick = function(){
            console.log(this);
        }
    }
}

void Pagination;
