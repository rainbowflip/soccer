$(document).ready(function(){
    let viewclick = 0;
    let tasklist = undefined; //save tasksinfo in it;
    let taskuptype = "add";
    let edittaskid = null;
    let aiid = 1;
    let skiptaskid = "all";
    let taskpage = 1;
$("#drawrect").hide();
    function deleteresult(sequence){
        try{
        if(confirm("确认删除？")){
            fetch("/deleteinfo/?sequence="+sequence,{
                method:"GET",
            }).then((res)=>res.json())
            .then((res)=>{
                    //console.log(res["status"]);
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
                        
                        jsonlist = res["mediainfo"];                        
                        showresult();
                        refreshbar(res["pages"]);
                    })
                    alert("删除成功！");
                    }else{
                    alert(res["status"]);
                    }
                }).catch(e=>$(".resultlist").html(e));
            }
        }catch(e){
            $(".resultlist").html("");
        }
    }
   $(".player").on('hidden.bs.modal',function(){
        $(".clipvideo")[0].pause();
    })
   $(".flvplayer").on('hidden.bs.modal',function(){
        $("#videoElement")[0].pause();
    })
/** --------------flv.js---------------**/
    let flvPlayer;
    let flvurl;
    function playflv(url){
        let flv; 
        let videotype = "flv";
        if(url.indexOf("rtmp")<0){
            flv = url;
            videotype = "MP4"
        }else{
            flv =  "http"+url.split("rtmp")[1]+".flv";
        }
        
        if (flvjs.isSupported()) {
            let videoElement = document.getElementById('videoElement');
            //console.log("issupported");
            //console.log(videoElement);
            flvPlayer = flvjs.createPlayer({
                type: videotype,
                isLive: true,
                url: flv,
            });
            flvPlayer.attachMediaElement(videoElement);
            flvPlayer.load();
        }else{
            alert("不支持视频流！")
        }
    }

    function destroyflv(){
        flvPlayer.pause();
        flvPlayer.unload();
        flvPlayer.detachMediaElement();
        flvPlayer.destroy();
        flvPlayer = null;
    }

/*** ---------button selected status-----------**/

    $(".cliptype .btn").click(function(){
        $(this).addClass("active").siblings(".btn").removeClass("active");
    })
    $(".labels li").click(function(){
        $(this).addClass("active").siblings("li").removeClass("active");
    })


/*** ----------get clip results------------- **/
let currentpage = 1,jsonlist=[],getResultInterval;

$(".labels li").click(function(){
    currentpage = 1;
    let key = $(".labels li.active").attr("name")
    let truekey = key==undefined?$(".labels li.active button").attr("title"):key;
    fetch("/mediainfo/",
    {
        method:"POST",
        body:JSON.stringify({
            perpage:8,
            page:1,
            taskid:skiptaskid,
            keyword:truekey,
        })
    }).then((res)=>res.json())
    .then((res)=>{
        if(res["status"]=="OK"){
            jsonlist = res["mediainfo"];
            totalnumber = res["pages"];
            //console.warn(totalnumber);
            refreshbar(totalnumber);
            showresult();
        }else{
            $(".resultlist").html(res["status"]);
        }
 
    }).catch(e=>alert(e));

})
    function showresult(){
        $(".resultlist").html("");
      if(jsonlist.length<1){
          $(".resultlist").html("no results！");  
      }
        for(let i of jsonlist){
            let y = new Result(i);
            y.loadresult(currentpage);
        }
        $(".thumbnail img").width("100%");
        $(".thumbnail img").height($(".thumbnail img").width()*9/16);
        console.log("=====testbug====="+$(".thumbnail img").width()+"--"+$(".thumbnail img").height());
    }
    function getallresults(a){
	fetch("/mediainfo/",
            {
                method:"POST",
                body:JSON.stringify({
                    perpage:8,
                    page:currentpage,
                    taskid:a,
                    keyword:"all",
                    })
               }).then((res)=>res.json())
            .then((res)=>{
                if(res["status"]=="OK"){
	            
		    jsonlist = res["mediainfo"];
                    showresult();
                    refreshbar(res["pages"]);			
		}else{
                    $(".resultlist").html(res["status"]);
                }
	})}
    function getresults(){
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
            
                if(res["status"]=="OK"){
                    if(JSON.stringify(jsonlist) != JSON.stringify(res["mediainfo"])){
		        jsonlist = res["mediainfo"];
                        showresult();
                        refreshbar(res["pages"]);
                    }
                }else{
                    $(".resultlist").html(res["status"]);
                    jsonlist = [];
                    return;
                }
            }).catch(e=>$(".resultlist"));
    }
//-------task paginator bar
function refreshTbar(total){
    let options={
        bootstrapMajorVersion:3,    //版本
        currentPage:taskpage,    //当前页数
        numberOfPages:10,    //最多显示Page页
        totalPages:total,    //所有数据可以显示的页数
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
            if(taskpage!=page){
                taskpage = page;
                gettasklist();
            }
        }
    }
console.log($("#taskbar"))
    $("#taskbar").bootstrapPaginator(options);
}
function gettasklist(){
    let taskstatus = $(".cliptype button.active").attr("name");
    let taskquery = $(".taskquery").val()==""?"all_":$(".taskquery").val();
    $.ajax({
        url:"/task/",
        type:"POST",
        data:JSON.stringify({"taskopr":"get","taskstatus":taskstatus,"taskpage":taskpage,"taskquery":taskquery}),
        success:function(res){
            if(!res["status"]=="OK"){
                $("#result_list").html(res["msg"]);
                $(".taskquery").val("");
            }else{
                getRuleList(res["tasks"]);
                refreshTbar(res["task_pages"]);
            }
        },
        error:function(e){
            console.log(e);
        }
    })
}
$(".query-task").click(function(){
    gettasklist();
})
    function refreshbar(totalnumber){
        let len = jsonlist.length;

        let options={
            bootstrapMajorVersion:3,    //版本
            currentPage:currentpage,    //当前页数
            numberOfPages:10,    //最多显示Page页
            totalPages:totalnumber,    //所有数据可以显示的页数
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
                    //console.log("click index  page",currentpage)
                    getresults();
                }
            }
        }
        $("#paginator").bootstrapPaginator(options);
    }

    
/** --------engine status-------**/
let getAistatusInterval,statuslist={},errorstatus=undefined;
    function get_aistatus(aiid){
        fetch("/enginestatus/?aiid="+aiid,{
            method:"GET"
        }).then((res)=>res.json())
        .then((res)=>{
            if(statuslist[aiid]==undefined){statuslist[aiid]={}}
            try{
                if(errorstatus != undefined){
			errorstatus.hide_();   
                }
                for(let i in statuslist){
                    for(let j in statuslist[i]){
                        statuslist[i][j].hide_();
                    }
                }
            }catch(e){
                console.log("hidealltr"+e);
            }
            if(res["status"]!="OK"){
            
                if(errorstatus==undefined){
                    errorstatus = new Status();
                }
                errorstatus.show_();
                errorstatus.changeStatus("status",res["status"]);
            }else{
                for(let i in res){
                    if(i == "status"){continue};
                    if(statuslist[aiid][i]!=undefined){
                        statuslist[aiid][i].changeStatus(i,res[i]);
                    }else{
                        let status = new Status();
                        statuslist[aiid][i] = status;
                        statuslist[aiid][i].changeStatus(i,res[i]);
                    }
                    statuslist[aiid][i].show_();               
                }
            }
        }).catch(e=>console.error("jssss"+e));
    }

/**---------------pill trans & result/status show control----------*/
    $('a[data-toggle="pill"]').on('show.bs.tab',function(e){

        switch(e.target){
            case $('a[href="#tasks"]')[0]:
                gettasklist(); 
//                $.ajax({
//                    url:"/task/",
//                    type:"POST",
//                    data:JSON.stringify({"taskopr":"get"}),
//                    success:function(res){
//                        console.log(res["tasks"].length)
//                        if(res["status"]=="OK"){
//                        }else{
//                            alert(res["msg"])
//                        }
//                        getRuleList(res["tasks"]);
//			//console.warn(tasklist)
//                    },
//                    error:function(e){
//                        console.log(e);
//                    }
//                })
                break;
            case $('a[href="#results"]')[0]:
                    if(!viewclick){
                        skiptaskid = "all";
                        currentpage = 1;
                    }else{
                        viewclick = 0;
                    } 
                $("#show_aiid").text(skiptaskid=="all"?"所有任务":skiptaskid);
                if(flvPlayer!=undefined){flvPlayer.pause()};
                if(getResultInterval!=undefined){
                     getresults();
                    //return;
                }else{
                        let key = $(".labels li.active").attr("name")
                        let truekey = key==undefined?$(".labels li.active button").attr("title"):key;
                        fetch("/mediainfo/",
                        {
                            method:"POST",
                            body:JSON.stringify({
                                perpage:8,
                                page:currentpage,
                                taskid:skiptaskid,
                                keyword:truekey,
                            })
                        }).then((res)=>res.json())
                        .then((res)=>{
                                
                            if(res["status"]=="OK"){
                                jsonlist = res["mediainfo"];
                                totalnumber = res["pages"];
                                console.log("json change value");
                            }else{
                               $(".resultlist").html("get clip results error:"+res["status"]);                                 
                            }
                            console.log("/////",getResultInterval);
                            if(getResultInterval==undefined){
                                if(jsonlist!=[]){
                                    showresult();
                                }
                                refreshbar(totalnumber);
                                getResultInterval = setInterval(function(){
                                    
                                    getresults();
                                                                        
                                },5000);
                            }
                        }).catch(e=>{
                            $(".resultlist").html("get clip results error");
                            jsonlist = [];                     
                            console.warn(e);
                        });                         
                    }
                
                break;
            case $('a[href="#status"]')[0]:
                    
                if(flvPlayer!=undefined){flvPlayer.pause()}
                if(getAistatusInterval!=undefined){
                    return;
                }else{
                    get_aistatus(aiid);
                    getAistatusInterval = setInterval(function(){
                        get_aistatus(aiid);
                    },5000);
                }
                // 在切换"引擎状态监控"时执行：
                    $.ajax({
                        url:"/aiinfo/",
                        type:"POST",
                        data:JSON.stringify({"aiopr":"get","aiid":"all"}),
                        success:function (data) {
                            console.log(data);
                            if(data["status"]!="OK"){alert(data["status"]);return;}
                            else{
                                getAiList(data["ailist"]);
                                $("marquee").html("当前展示的为：AI资源池"+aiid+"各组件的状态，"+(typeof(data["ailist"][0][2])=="number"?"正在运行的任务是"+data["ailist"][0][2] :"无正在运行任务！"))
                            }
                        }
                    })
                break;
            case $('a[href="#setting"]')[0]:
                $.ajax({
                    url:"/setwholeurl/",
                    type:"GET",
                    success:function (data) {
                        console.log(data);
                        $("input[name='ftp_url']").val(data.ftp_url);
                        $("input[name='stream_url']").val(data.stream_url);
                        $("input[name='medialevel']").val(data.medialevel);
                    },
                    error:function () {
                        alert("抱歉，页面刷新失败，请刷新重试");
                    }
                })
                break;
         
            default:
                console.log("default");
        }
    })

    /**--------mediainfo submit || delete----------- */

    $("#change_result").click(function(){
        if(!confirm("提交成功后无法修改，确认提交？")){return};
        $(this).attr("disabled","disabled")
        let info={};
        for(let i of $(".player .modal-content input")){
            let name = i.name,val = i.value;
            info[name]=val;
        }
        //if($("input[name='recommend']").val().indexOf("世界杯,AI")== -1){
           // alert("推荐标签配置错误：需包含'世界杯,AI'")
            //$("#change_result").removeAttr("disabled");
            //return;
        //}
        fetch("/upmedia/",{
            body:JSON.stringify(info),
            method:"POST",
        }).then((res)=>res.json())
        .then((res)=>{
            if(res["status"]=="OK"){
                alert("媒资注入成功！")
                getresults();
            }else{
                alert(res["msg"]);
                //alert(res["msg"].slice(45,-24));
                $(this).removeAttr("disabled");
            }
            
        }).catch(e=>alert(e));
    })

    $("#delete_result").click(function(){
        deleteresult($("input[name='sequence']").val());
        $(".player").modal('hide');
    })
    $(document).on('click','.deletethis',function(){
console.log(this);       
deleteresult(this.getAttribute("value"))
    })

    $(".deleteall").click(function(){
        let pwd = prompt("您确认删除掉所有的数据？","请输入密码进行删除！");
        if(pwd!=null && pwd != ""){
            fetch("/deleteall/",{
                body:JSON.stringify({
                    "pwd":pwd,
                }),
                method:"POST",
            }).then((res)=>res.json())
            .then((res)=>{
                if(res["status"]=="OK"){
                    alert("数据已经清空！");
                    jsonlist = [];
                    showresult();
                    refreshbar();
                }else{
                    alert("清除失败！请重试");
                }
            }).catch(e=>alert(e));
        }
        
    })

/*** -------------- add/load config for task-------------*****/
    $('.spinner .btn:first-of-type').on('click', function() {  
        $('.spinner input').val( parseInt($('.spinner input').val(), 10) + 1 == 10?0:parseInt($('.spinner input').val(), 10) + 1);  
    });  
    $('.spinner .btn:last-of-type').on('click', function() {  
        $('.spinner input').val( parseInt($('.spinner input').val(), 10) - 1 == -1?9:parseInt($('.spinner input').val(), 10) - 1);  
    }); 
    function load_config(){
        let baseset = "";
        let taskset = [["PID","pid","请输入媒资ID(1-10位字符)"],["任务名字","name","请输入任务名称(1-50位字符)"],["配置地址","taskurl","请输入地址(1-500位字符)"]];
        for(let i in taskset){
            baseset+='<div class="form-group">'
                    +'<label for="name">'+taskset[i][0]+'</label>'
                    +'<input type="text" class="form-control" name="'+taskset[i][1]+'" placeholder="'+taskset[i][2]+'">'
                    +'</div>';
        }
        $(".baseset").html(baseset);
        let str="";
        let score = [["timeocr",865,80,75,25],["scoreocr",960,80,240,25],["备用ocr",0,0,0,0]];
        for(let i in score){
             str+= '<div class="input-group"><span class="input-group-addon">'+score[i][0]+'</span>'
                +'<span class="input-group-addon">x</span>'
                +'<input type="text" name="x'+(parseInt(i)+1)+'" class="form-control" value="'+score[i][1]+'">'
                +'<span class="input-group-addon">y</span>'
                +'<input type="text" name="y'+(parseInt(i)+1)+'" class="form-control" value="'+score[i][2]+'">'
                +'<span class="input-group-addon">w</span>'
                +'<input type="text" name="w'+(parseInt(i)+1)+'" class="form-control" value="'+score[i][3]+'">'
                +'<span class="input-group-addon">h</span>'
                +'<input type="text" name="h'+(parseInt(i)+1)+'" class="form-control" value="'+score[i][4]+'"></div>';
        }
        $(".xyset").html('<label for="name">OCR坐标(请输入正整数或0！)</label><button id="autoxy">重新选取坐标</button>'+str);
    }
    $("input[name='aiid']").on('input',function(){
        let str = "请确认是否以下AI引擎："+"web_control_"+this.value+",engine_status_"+this.value+",report_"+this.value
                +",engine_decode_"+this.value+",engine_mux_"+this.value+",engine_shot_"+this.value+",engine_ocr_"+this.value
                +",engine_detect_"+this.value+",engine_3d_"+this.value+",engine_audio_"+this.value+",engine_face_"+this.value
        $(".enginelist").html(str);
    })
    $(".addaipool").click(function(){
        $(".addaiconfig").modal("show");

    })
    $("#addaipool").click(function(){
        let val = $("input[name='aiid']").val();
        if(!(val>=1&&val<10000)){alert("请输入1-10000的整数!");return}
        let enginelist = ["web_control_"+val,"engine_status_"+val,"report_"+val
        ,"engine_decode_"+val,"engine_mux_"+val,"engine_shot_"+val,"engine_ocr_"+val
        ,"engine_detect_"+val,"engine_3d_"+val,"engine_audio_"+val,"engine_face_"+val]
        let info = {"aiid":val,"aikeys":enginelist,"aiopr":"add"};
   
        $.ajax({
            type:"POST",
            url:"/aiinfo/",
            ifModified:true,
            timeout:4000,
            data:JSON.stringify(info),
            success:function(res){
                if(res["status"]=="OK"){
                    $(".addaiconfig").modal("hide");
                    alert("配置成功！")
                }else{
                    alert(res["status"])
                }
            },
            error:function(e){
                console.log(e);
                alert(e);
            }
        })
    })
    $(".addtask").click(function(){
        load_config();
        $("#updateocr").hide();
        // 显示任务详情======
        $(".addmediaconfig").modal('show');
        taskuptype = "add";
    })
    $("#addtask").click(function(){
        let info={};
        if($(".baseset input[name='pid']").val().length>10){alert("媒资id字符长度限制：1-10");return}
        if($(".baseset input[name='name']").val().length>50){alert("任务名字字符长度限制：1-50");return}
        if($(".baseset input[name='taskurl']").val().length>500){alert("任务名字字符长度限制：1-500");return}
        for(let i of $(".baseset input")){
            info[i.name] = i.value;
            if(i.value ==""){
                alert("任务配置中所有值都不可为空，请确认后重试");
                return;
            }
        }
        let xy = [];
        for(let i of $(".xyset input")){
            xy.push(i.value);
            if(i.value ==""){
                alert("任务配置中所有值都不可为空，请确认后重试");
                return;
            }  
        }
        let fusion = [[],[]]
        for(let i of $("#left_second input")){
            fusion[0].push(i.value)
            if(i.value ==""){
                alert("任务配置中所有值都不可为空，请确认后重试");
                return;
            }
        }
        for(let i of $("#right_second input")){
            fusion[1].push(i.value)
            if(i.value ==""){
                alert("任务配置中所有值都不可为空，请确认后重试");
                return;
            }
        }
        info["fusion"] = fusion
        info["config"] = xy;
        info["priority"] = $("input[name='priority']").val();
        info["taskopr"] = taskuptype;     
        if(taskuptype == "change"){
           info["taskid"] = edittaskid;
        }   
        info["taskpage"] = taskpage;
        info["taskquery"] = $(".taskquery").val()==""?"all_":$(".taskquery").val();
        info["taskstatus"] = $(".cliptype button.active").attr("name");
        $.ajax({
            type:"POST",
            url:"/task/",
            ifModified:true,
            timeout:4000,
            data:JSON.stringify(info),
            success:function(res){
                if(res["status"]=="OK"){
                    $(".addmediaconfig").modal('hide');
                    alert("添加成功！");
                }else{
                    alert(res["status"])
                }
                getRuleList(res["tasks"]);
		//console.warn(tasklist)
                refreshTbar(res["task_pages"])
            },
            error:function(e){
                console.log(e);
                alert(e);
            }
        })
    })
   $(document).on("click","#updateocr",function(){
      // edittaskid 
        let xy = [];
        for(let i of $(".xyset input")){
            xy.push(i.value);
            if(i.value ==""){
                alert("任务配置中所有值都不可为空，请确认后重试");
                return;
            }  
        }
       let pid = $("input[name='pid']").val()
       let info = {"taskid":edittaskid,"config":xy,"pid":pid};
       $.ajax({
            url:"/updateocr/",
            type:"POST",
            data:JSON.stringify(info),
            success:function(res){
               if(res["status"]=="OK"){
                   alert("更新成功！")
                    $(".addmediaconfig").modal('hide');
                    gettasklist();
		}else{
		    alert("更新失败！"+res["status"])
		}
	    },
        })
   })

   $(document).on("click",".edittask",function(){
        if($(this).siblings(".rule_status").text()=="running"){
            $("#updateocr").show();
            $("#addtask").hide();
        }else{
            $("#addtask").show();
            $("#updateocr").hide();
        }
        let data = tasklist[$(this).siblings("td").children(".task_id").val()];
        edittaskid = data[8];
        load_config();
        $(".baseset input[name='pid']")[0].value = data[0];
        $(".baseset input[name='name']")[0].value = data[3];
        $(".baseset input[name='taskurl']")[0].value = data[2];
        for(let i in data[6]){
            $(".xyset input")[i].value = parseInt(data[6][i]);
        }
        for(let i in eval(data[9])[0]){
            $("#left_second input")[i].value = parseInt(eval(data[9])[0][i])
        }
        for(let i in eval(data[9])[1]){
            $("#right_second input")[i].value = parseInt(eval(data[9])[1][i])
        }
        $("input[name='priority']")[0].value = data[5];
        //$("#updateocr").show();
        taskuptype = "change";
        $(".addmediaconfig").modal('show');
    })
    $(document).on("click",".deletetask",function(){
        if(!confirm("确认删除此任务？")){return};
        let idlist = [];
        $("#result_list input[type='checkbox']:checked").each(function(){
            idlist.push($(this).val());
        })
        if(idlist.length==0){
            alert("未选择需要删除的任务");
            return;
        }
        let taskstatus = $(".cliptype button.active").attr("name");
        let taskquery = $(".taskquery").val()==""?"all_":$(".taskquery").val();
        let info = {"taskopr":"delete","taskid":idlist,"taskpage":taskpage,"taskstatus":taskstatus,"taskquery":taskquery};
        $.ajax({
            type:"POST",
            url:"/task/",
            ifModified:true,
            data:JSON.stringify(info),
            success:function(res){
                if(res["status"]=="OK"){
                    $(".addmediaconfig").modal('hide');
                    alert("成功删除");
                }else{
                    alert(res["status"])
                }
                getRuleList(res["tasks"]);

            },
            error:function(e){
                alert(e);
            }
        })
    })


/****============= tasklist & taskcontrol ================****/   
// when get new tasks back：use this function
function getRuleList(tasks){
    $("#result_list").html("");
    tasklist = {};
    for(var i=0;i<tasks.length;i++){
        tasklist[tasks[i][8]] = tasks[i];
        if($(".cliptype button.active").attr("name")!="all"&&$(".cliptype button.active").attr("name").indexOf(tasks[i][4])<0){
            continue;
        }else{
            
        $("#result_list").append(
            '<tr>'
            +'<td width="4%"><input type="checkbox" value="'+tasks[i][8]+'" class="task_id"></td>'
            +'<td width="6%" class="edittask">'+tasks[i][8]+'</td>'
            +'<td width="10%" class="pid">'+tasks[i][0]+'</td>'
            +'<td width="20%">'+tasks[i][3]+'</td>'
            +'<td width="10%">'+tasks[i][7]+'</td>'
            +'<td width="8%" class="rule_status">'+tasks[i][4]+'</td>'
            +'<td width="18%" class="rule_start" ><div class="">'
            +'<button type="button" class="btn btn-default rule_startBtn">开始任务</button>'
            +'</div></td>'
            +'<td width="5%" class="rule_pending" style="display:none"><div class="btn-group">'
            +'<button type="button" class="btn btn-default rule_cancel">取消</button>'  
            +'</div></td>'
            +'<td width="5%" class="rule_running" style="display:none"><div class="btn-group">'
            +'<button type="button" class="btn btn-default rule_pause"><span class="glyphicon glyphicon-pause"></span>暂停</button>'
            +'<button type="button" class="btn btn-default rule_play" style="display:none"><span class="glyphicon glyphicon-play"></span>继续</button>'
            +'<button type="button" class="btn btn-default rule_stop"><span class="glyphicon glyphicon-stop"></span>停止</button>'
            +'</td>'
            +'<td width="7%">'+tasks[i][5]+'</td>'
            +'<td width="12%" class="viewresults"><a>查看剪辑结果</a></td>'
            +'<td width="10%" class="playvideo"><a>观看视频</a></td>'
            +'</tr>'
        )  }
    }
    $(".rule_status").each(function(){
        if($(this).html()=="waiting"){
            $(this).siblings(".rule_pending").show()
            $(this).siblings(".rule_running").hide()
            $(this).siblings(".rule_start").hide()
        }else if($(this).html()=="running"){
            $(this).siblings(".rule_pending").hide()
            $(this).siblings(".rule_running").show().find(".rule_play").hide().siblings(".rule_pause").show()
            $(this).siblings(".rule_start").hide()
        }else if($(this).html()=="pause"){
            $(this).siblings(".rule_pending").hide()
            $(this).siblings(".rule_running").show().find(".rule_play").show().siblings(".rule_pause").hide()
            $(this).siblings(".rule_start").hide()
        }else{
            $(this).siblings(".rule_pending").hide()
            $(this).siblings(".rule_running").hide()
            $(this).siblings(".rule_start").show()
        }
    })
   
} 
    $('a[href="#tasks"]').tab('show');
    // check all rules btn
    $("#check_all_box").click(function(){
        if($("#check_all_box").is(':checked')){
            $(".task_id").prop("checked",true);
        }else{$(".task_id").prop("checked",false)}
    })


    // // 点击开始(start 按钮)
    $(document).on("click",".rule_startBtn",function(){
        var taskid = $(this).parent().parent().siblings("td").children(".task_id").val();
        $.ajax({
            url:"/taskcontrol/",
            type:'post',
            data:JSON.stringify({"taskid":taskid,"taskaction":'start'}),
            beforeSend:function(){
                $(this).html("请求中").attr('disabled','disabled')
            },
            success:function(data){
                if(data["status"]!="OK"){alert("失败，请重试！原因："+data["status"]);return;}
                else{
                alert("启动指令已发送成功")
             }
             getRuleList(data["tasks"]);

            }
        })
    })

    // 点击取消按钮（pending状态时）
    $(document).on("click",".rule_cancel",function(){
        var taskid = $(this).parent().parent().siblings("td").children(".task_id").val();
        $.ajax({
            url:"/taskcontrol/",
            type:'post',
            data:JSON.stringify({"taskid":taskid,"taskaction":'stop'}),
            beforeSend:function(){
                $(this).html("请求中").attr('disabled','disabled')
            },
            success:function(data){
                if(data["status"]!="OK"){alert(data["status"]);return;}                
                    getRuleList(data["tasks"]);
            }
        })
    })

    // 点击暂停按钮（running状态下）
    $(document).on("click",".rule_pause",function(){
        var taskid = $(this).parent().parent().siblings("td").children(".task_id").val();
        $.ajax({
            url:"/taskcontrol/",
            type:'post',
            data:JSON.stringify({"taskid":taskid,"taskaction":'pause'}),
            beforeSend:function(){
                $(this).html("请求中").attr('disabled','disabled')
            },
            success:function(data){
                if(data["status"]!="OK"){alert(data["status"]);return;}
                
                getRuleList(data["tasks"]);
                
            }
        })
    })
    // 点击继续按钮（暂停状态下）
    $(document).on("click",".rule_play",function(){
        var taskid = $(this).parent().parent().siblings("td").children(".task_id").val();
        $.ajax({
            url:"/taskcontrol/",
            type:'post',
            data:JSON.stringify({"taskid":taskid,"taskaction":'start'}),
            beforeSend:function(){
                $(this).html("请求中").attr('disabled','disabled')
            },
            success:function(data){
                if(data["status"]!="OK"){
                    alert(data["status"]);
                }
                getRuleList(data["tasks"]);
                
            }
        })
    })
    //点击停止按钮（running/pause状态下）
    $(document).on('click','.rule_stop',function(){
        var taskid = $(this).parent().parent().siblings("td").children(".task_id").val();
        $.ajax({
            url:"/taskcontrol/",
            type:'post',
            data:JSON.stringify({"taskid":taskid,"taskaction":'stop'}),
            beforeSend:function(){
                $(this).html("请求中").attr('disabled','disabled')
            },
            success:function(data){
                if(data["status"]!="OK"){alert(data["status"]);return;}
                getRuleList(data["tasks"])
                
            }
        })
    })
    //点击查看结果按钮
    $(document).on('click','.viewresults',function(){
        skiptaskid = $(this).siblings(".edittask").text();
console.info("-9-9-9-9-"+skiptaskid)
        viewclick = 1;
        $("a[href='#results']").click();
        $("li[name='all']").click();
    })
    //点击播放视频按钮
    $(document).on('click','.playvideo',function(){
        flvurl = tasklist[$(this).siblings("td").children(".task_id").val()][2];
        playflv(flvurl);
        $(".flvplayer").modal('show');

        flvPlayer.play();
    })
    $(".flvplayer .close").click(function(){
        
        destroyflv();
    })
        // 任务筛选按钮
        $(".cliptype button").click(function(){
            gettasklist(); 
        })
        //资源池
        function getAiList(ailist) {
            $("#id_list").html("");
            for(let i in ailist){
                $("#id_list").append(
                '<tr style="text-align: center">'
                    +'<td><input type="radio"  name="aiselect" value="'+ailist[i][0]+'" class="rule_id"></td>'
                    +'<td class="ai_id">'+ailist[i][0]+'</td>'
                    +'<td>'+ailist[i][1]+'</td>'
                    +'<td>'+ailist[i][2]+'</td>'
                    +'<td><span class="glyphicon glyphicon-remove del_ai" style="color:red;cursor: pointer"></span></td>'
                    +'</tr>'
                )
            }
        }
        $('button[data-target="#myModal"]').click(function(){
            $.ajax({
                url:"/aiinfo/",
                type:"POST",
                data:JSON.stringify({"aiopr":"get","aiid":"all"}),
                success:function (data) {
                    if(data["status"]!="OK"){alert(data["status"]);return;}
                    getAiList(data["ailist"])
                }
            })
        })
    
        // 删除资源池
        $(document).on("click",".del_ai",function () {
            let deleteid = $(this).parent().siblings(".ai_id").text();
            if(confirm("确认删除该资源池？")){
                $.ajax({
                    url:"/aiinfo/",
                    type:"POST",
                    data:JSON.stringify({"aiopr":"delete","aiid":deleteid}),
                    success:function (data) {
                        if(data["status"]!="OK"){alert(data["status"]);return;}
                        getAiList(data["ailist"])
                    }
                })
            }
        })
        $(".aireq").click(function(){
            aiid = $("input[type='radio']:checked").parent().siblings(".ai_id").text();
            $("#choose_aiid").text(aiid);
            get_aistatus(aiid);
            $("#myModal .close").click();
        })

window.onresize = function(){
$(".thumbnail img").width("100%")
$(".thumbnail img").height($(".thumbnail img").width()*9/16)

console.log("----onresize---"+$(".thumbnail img").width()+"--"+$(".thumbnail img").height());

}
    $("#setting_btn").click(function () {
        token = prompt("确认修改？请输入权限码:")
        if(!token){return};
        var ftp_url = $("input[name='ftp_url']").val()
        var stream_url = $("input[name='stream_url']").val()
        var medialevel = $("input[name='medialevel']").val()
        if(ftp_url==""){
            alert("ftp地址不可配置为空");
            return;
        }
        if(stream_url==""){
            alert("推流地址不可配置为空");
            return;
        }
        if(medialevel==""){
            alert("视频流清晰度不可为空");
            return;
        }
        $.ajax({
            url:"/setwholeurl/",
            type:'POST',
            data:JSON.stringify({"ftp_url":ftp_url,"stream_url":stream_url,"token":token,"medialevel":medialevel}),
            success:function (data) {
                if(data["status"]!="OK"){alert(data["status"]);return;}
                $("input[name='ftp_url']").val(ftp_url);
                $("input[name='stream_url']").val(stream_url);
                $("input[name='medialevel']").val(medialevel);
                alert("修改成功");
            }
    })
    })    
});

