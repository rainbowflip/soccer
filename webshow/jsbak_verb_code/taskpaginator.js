def tasks(request):
    try:
        starttime = time.time()
        req = getjsonrequest(request)
        keyword = getvalue(req,'keyword')
        taskid = getvalue(req,'taskid')
        page = int(getvalue(req,'page'))
        perpage = int(getvalue(req,'perpage'))
        res2 = []
        if taskid != 'all':
            if keyword=="all":
                tmp = AIResult.objects.filter(pid=taskid)
            else:
                tmp = AIResult.objects.filter(pid=taskid,keywords__icontains=keyword)
        else:
            if keyword == 'all':
                tmp = AIResult.objects.all()
            else:
                tmp = AIResult.objects.filter(keywords__icontains=keyword)
        count = len(tmp)
        pages = count//perpage
        endlast = count%perpage
        if endlast != 0:
            pages += 1
        if page >= pages:
            if pages != 0:
                tmp = tmp[perpage*(pages-1):]
            else:
                pass
        else:
            tmp = tmp[(page-1)*perpage:page*perpage]
        for item in tmp:
            res2.append(getitem(item))
        #print("all files count:",len(res2))
        endtime = time.time()
        #print("costtime:------",endtime-starttime)
        return JsonResponse({"status":'OK',"mediainfo":res2,'pages':pages})
    except Exception as e:
        print(str(e))
        return JsonResponse({"status":str(e)})



        finally:
        alltask = TaskInfo.objects.all()
        tasks = []
        for task in alltask:
            tasks.append(gettaskitem(task))
        return JsonResponse({"status":msg,'tasks':tasks})
===================
py::::::
    try:
        req = getjsonrequest(request)
        taskopr = getvalue(req,'taskopr')
        taskpage = getvalue(req,'taskpage')
        taskstatus = getvalue(req,'taskstatus')
        taskquery = getvalue(req,'taskquery')
        if taskstatus == 'all':
            if taskquery == '':
                alltask = TaskInfo.objects.all()
            else:
                alltask = TaskInfo.objects.filter(name_icontains=taskquery)
        elif taskstatus == 'running'or taskstatus == 'waiting' or taskstatus == 'pause':
            if taskquery =='':
                alltask = TaskInfo.objects.filter(status=taskstatus)
            else:
                alltask = TaskInfo.objects.filter(status=taskstatus,name_icontains=taskquery)
        else:
            if taskquery =='':
                alltask = TaskInfo.objects.filter(status_in = ['free','done'])
            else:
                alltask = TaskInfo.objects.filter(status_in = ['free','done'],,name_icontains=taskquery)
        
        # ####分页
        total = len(alltask)
        task_pages = total//10
        task_in_endpage = total%10
        if total%10 != 0:
            task_pages += 1
        if taskpage >= task_pages:
            if task_pages != 0:
                alltask = alltask[10*(task_pages-1):] 
            else:
                pass
        else:
            alltask = alltask[(taskpage-1)*10 : taskpage*10]
        for task in alltask:
            tasks.append(gettaskitem(task))
    except Exception as e:
        print(str(e))
        msg = "error:"+str(e)
    finally:
        return JsonResponse({"status":msg,"tasks":tasks,"task_pages":task_pages})
js::::::
function gettasklist(){
    let taskstatus = $(".cliptype button.active").attr("name");
    let taskquery = $(".taskquery").val();
    $.ajax({
        url:"/task/",
        type:"POST",
        data:JSON.stringify({"taskopr":"get","taskstatus":taskstatus,"taskpage":taskpage,"taskquery":taskquery}),
        success:function(res){
            if(!res["status"]=="OK"){
                $("#result_list").html(res["msg"]);
                refreshTbar(res["task_pages"]);
                $(".taskquery").val("");
            }else{
                getRuleList(res["tasks"]);
            }
        },
        error:function(e){
            console.log(e);
        }
    })
}

let taskpage = 1;

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
    $("#taskbar").bootstrapPaginator(options);
}


$(".query-task").click(function(){
    gettasklist();
})

html::::::

<div class="btn-group col-sm-4">
    <div class="input-group">
        <input type="text" class="form-control taskquery">
        <span class="input-group-btn">
            <button class="btn btn-default query-task" type="button">
                搜索
            </button>
        </span>
    </div>
</div>



//轮询 状态
let ailist = undefined;
function statuschange(){
        $.ajax({
            type:"POST",
            url:"/aiinfo/",
            ifModified:true,
            timeout:4000,
            data:JSON.stringify(info),
            success:function(res){
                if(res["status"]=="OK"){
                    return JSON.stringify(ailist)!=JSON.stringify(res["ailist"])
                }else{
                    alert(res["status"])
                    return false;
                }
            },
            error:function(e){
                console.log(e);
                return false;
            }
}
let taskinterval = setInterval(function(){
    if(statuschange()){
        gettasklist()
    }
},5000)

$.ajax({
    type:"POST",
    url:"/aiinfo/",
    ifModified:true,
    timeout:4000,
    data:JSON.stringify(info),
    success:function(res){
        if(res["status"]=="OK"){

        }else{

        }
    },
    error:function(e){
        console.log(e);
        return false;
    }
})