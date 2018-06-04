$(document).ready(function(){
 
    let tasklist = undefined; //save tasksinfo in it;
    let taskuptype = "add";
    let edittaskid = null;
    let aiid = 1;
    function deleteresult(sequence){
        try{
        if(confirm("确认删除？")){
            fetch("/deleteinfo/?sequence="+sequence,{
                method:"GET",
            }).then((res)=>res.json())
            .then((res)=>{
                    console.log(res["status"]);
                    if(res["status"]=="OK"){
                    fetch("/mediainfo/?keyword="+$(".labels li.active").attr("name"),
                    {
                        method:"GET",
                    }).then((res)=>res.json())
                    .then((res)=>{
                 
                        jsonlist = res["mediainfo"].reverse();
                        if(currentpage>Math.ceil(jsonlist.length/8)){currentpage = Math.ceil(jsonlist.length/8)};
                        
                        showresult();
                        refreshbar(currentpage);
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
/** --------------flv.js---------------**/
    let flvPlayer;
    let flvurl;
    function playflv(url){
        let flv; 
        if(url.indexOf("rtmp")<0){
            flv = url;
        }else{
            flv =  "http"+url.split("rtmp")[1]+".flv";
        }
        
        if (flvjs.isSupported()) {
            let videoElement = document.getElementById('videoElement');
            console.log("issupported");
            console.log(videoElement);
            flvPlayer = flvjs.createPlayer({
                type: 'flv',
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
    fetch("/mediainfo/?keyword="+truekey,
    {
        method:"GET",
    }).then((res)=>res.json())
    .then((res)=>{
        jsonlist = res["mediainfo"].reverse();
        refreshbar(currentpage);
        showresult();
    }).catch(e=>alert(e));

})
    function showresult(){
        $(".resultlist").html("");
        console.info(jsonlist[0])
        let this_page_result = jsonlist.slice((currentpage-1)*8,currentpage*8<=jsonlist.length?currentpage*8:jsonlist.length);
        for(let i of this_page_result){
            let y = new Result(i);
            y.loadresult(currentpage);
        }
    }
    function getresults(e){
        fetch("/mediainfo/?keyword="+$(".labels li.active").attr("name"),
            {
                method:"GET",
            }).then((res)=>res.json())
            .then((res)=>{
            
                if(res["status"]=="OK"){
                    if(jsonlist.length!=res["mediainfo"].length){
                        jsonlist = res["mediainfo"].reverse();
                        if(e>Math.ceil(jsonlist.length/8)){e = Math.ceil(jsonlist.length/8)};
                        showresult();
                        refreshbar(e);
                    }
                }else{
          	        alert(res["status"]);
                    return;
                }
            }).catch(e=>alert("jserror"+e));
    }
    function refreshbar(e){
        console.warn("refreshbar"+e);
        let len = jsonlist.length;

        let options={
            bootstrapMajorVersion:3,    //版本
            currentPage:currentpage,    //当前页数
            numberOfPages:10,    //最多显示Page页
            totalPages:Math.ceil(len/8),    //所有数据可以显示的页数
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
                console.warn("e == page"+e+"+++"+page+"currnt---"+currentpage)
                if(currentpage!=page){
                    currentpage = page;
                    console.log("click+page",currentpage)
                    showresult();
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
               
                $.ajax({
                    url:"/task/",
                    type:"POST",
                    data:JSON.stringify({"taskopr":"get"}),
                    success:function(res){
                        if(res["status"]=="OK"){
                        }else{
                            alert(res["msg"])
                        }
                        getRuleList(res["tasks"]);
			console.warn(tasklist)
                    },
                    error:function(e){
                        console.log(e);
                    }
                })
                break;
            case $('a[href="#results"]')[0]:
            if(flvPlayer!=undefined){flvPlayer.pause()};
                if(getResultInterval!=undefined){
                    return;
                }else{
                        let key = $(".labels li.active").attr("name")
                        let truekey = key==undefined?$(".labels li.active button").attr("title"):key;
                        fetch("/mediainfo/?keyword="+truekey,
                        {
                            method:"GET",
                        }).then((res)=>res.json())
                        .then((res)=>{
                                
                            if(res["status"]=="OK"){
                                jsonlist = res["mediainfo"].reverse();
                                console.log("json change value");
                            }else{
                                alert("请联系管理员！"+res["status"]);
                            }
                            console.log("/////",getResultInterval);
                            if(getResultInterval==undefined){
                                if(jsonlist!=[]){
                                    showresult();
                                }
                                refreshbar(currentpage);
                                getResultInterval = setInterval(function(){
                                    getresults(currentpage);
                                                                        
                                },5000);
                            }
                        }).catch(e=>alert(e));                         
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
         
            default:
                console.log("default");
        }
    })

    /**--------mediainfo submit || delete----------- */

    $("#change_result").click(function(){
        let info={};
        for(let i of $(".modal-content input")){
            let name = i.name,val = i.value;
            info[name]=val;
        }
        fetch("/upmedia/",{
            body:JSON.stringify(info),
            method:"POST",
        }).then((res)=>res.json())
        .then((res)=>{
            if(res["status"]=="OK"){
                alert("媒资注入成功！")
            }else{
                alert(res["status"]+","+res["msg"])
            }
            
        }).catch(e=>alert(e));
    })

    $("#delete_result").click(function(){
        deleteresult($("input[name='sequence']").val());
    })

    $(".deletethis").click(function(){
        deleteresult(this.value);

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
        let taskset = [["媒资ID","pid","请输入媒资ID"],["任务名字","name","请输入任务名称"],["配置地址","taskurl","请输入地址"]];
        for(let i in taskset){
            baseset+='<div class="form-group">'
                    +'<label for="name">'+taskset[i][0]+'</label>'
                    +'<input type="text" class="form-control" name="'+taskset[i][1]+'" placeholder="'+taskset[i][2]+'">'
                    +'</div>';
        }
        $(".baseset").html(baseset);
        let str="";
        let score = [["score1",865,80,75,25],["score2",960,80,240,25],["score3",0,0,0,0]];
        for(let i in score){
             str+='<label for="name">OCR坐标(请输入正整数或0！)</label><div class="input-group">'
                +'<span class="input-group-addon">'+score[i][0]+'</span>'
                +'<span class="input-group-addon">x</span>'
                +'<input type="text" name="x'+(parseInt(i)+1)+'" class="form-control" value="'+score[i][1]+'">'
                +'<span class="input-group-addon">y</span>'
                +'<input type="text" name="y'+(parseInt(i)+1)+'" class="form-control" value="'+score[i][2]+'">'
                +'<span class="input-group-addon">w</span>'
                +'<input type="text" name="w'+(parseInt(i)+1)+'" class="form-control" value="'+score[i][3]+'">'
                +'<span class="input-group-addon">h</span>'
                +'<input type="text" name="h'+(parseInt(i)+1)+'" class="form-control" value="'+score[i][4]+'"></div>';
        }
        $(".xyset").html(str);
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
        // 显示任务详情======
        $(".addmediaconfig").modal('show');
        taskuptype = "add";
    })
    $("#addtask").click(function(){
        let info={};
        for(let i of $(".baseset input")){
            info[i.name] = i.value;
        }
        let xy = [];
        for(let i of $(".xyset input")){
            xy.push(i.value);  
        }
        info["config"] = xy;
        info["priority"] = $("input[name='priority']").val();
        info["taskopr"] = taskuptype;     
        if(taskuptype == "change"){
           info["taskid"] = edittaskid;
        }    
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
		console.warn(tasklist)
            },
            error:function(e){
                console.log(e);
                alert(e);
            }
        })
    })
    $(document).on("click",".edittask",function(){
        let data = tasklist[$(this).siblings("td").children(".task_id").val()];
        edittaskid = data[8];
        console.warn(edittaskid+"-----edittaskid-");
        load_config();
        $(".baseset input[name='pid']")[0].value = data[0];
        $(".baseset input[name='name']")[0].value = data[3];
        $(".baseset input[name='taskurl']")[0].value = data[2];
        for(let i in $(".xyset input")){
            $(".xyset input")[i].value = parseInt(data[6][i]);
        }
        $("input[name='priority']")[0].value = data[5];

        taskuptype = "change";
        $(".addmediaconfig").modal('show');
    })
    $(document).on("click",".deletetask",function(){
        let idlist = [];
        $("#result_list input[type='checkbox']:checked").each(function(){
            idlist.push($(this).val());
        })
        let info = {"taskopr":"delete","taskid":idlist};
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
            +'<td><input type="checkbox" value="'+tasks[i][8]+'" class="task_id"></td>'
            +'<td class="edittask">'+tasks[i][8]+'</td>'
            +'<td class="pid">'+tasks[i][0]+'</td>'
            +'<td>'+tasks[i][3]+'</td>'
            +'<td class="rule_status">'+tasks[i][4]+'</td>'
            +'<td class="rule_start" ><div class="">'
            +'<button type="button" class="btn btn-default rule_startBtn">开始任务</button>'
            +'</div></td>'
            +'<td class="rule_pending" style="display:none"><div class="btn-group">'
            +'<button type="button" class="btn btn-default rule_cancel">取消</button>'  
            +'</div></td>'
            +'<td class="rule_running" style="display:none"><div class="btn-group">'
            +'<button type="button" class="btn btn-default rule_pause"><span class="glyphicon glyphicon-pause"></span>暂停</button>'
            +'<button type="button" class="btn btn-default rule_play" style="display:none"><span class="glyphicon glyphicon-play"></span>继续</button>'
            +'<button type="button" class="btn btn-default rule_stop"><span class="glyphicon glyphicon-stop"></span>停止</button>'
            +'</td>'
            +'<td>'+tasks[i][5]+'</td>'
            +'<td class="viewresults"><a>查看剪辑结果</a></td>'
            +'<td class="playvideo"><a>观看视频</a></td>'
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
            success:function(data){
                if(data["status"]!="OK"){alert(data["status"]);return;}
                getRuleList(data["tasks"])
                
            }
        })
    })
    //点击产看结果按钮
    $(document).on('click','.viewresults',function(){
        $("a[href='#results']").click();
        alert("尚未关联任务！")

    })
    //点击播放视频安努
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
            $.ajax({
                url:"/task/",
                type:"POST",
                data:JSON.stringify({"taskopr":"get"}),
                success:function(res){
                    if(res["status"]=="OK"){
                    }else{
                        alert(res["status"]);
                    }
                    getRuleList(res["tasks"]);
                },
                error:function(e){
                    alert(e);
                }
            })
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
            get_aistatus(aiid);
            $("#myModal .close").click();
        })
    
});
