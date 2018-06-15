'use strict';

class Task{
    constructor(task,select){
        this.task = task;
        this.select = select;
        this.el = undefined;
    }

    initlist(){
        this.el = document.createElement("tr");
        this.el.innerHTML = '<td><input type="checkbox" class="rule_id"></td>'
                +'<td>'+task[0]+'</td>'
                +'<td>'+task[3]+'</td>'
                +'<td class="rule_status">'+task[4]+'</td>'
                +'<td class="rule_start" ><div class="btn-group">'
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
                +'<td>'+task[5]+'</td>'
                +'<td><a href="">查看剪辑结果</a></td>'
                +'<td><a href="">观看视频</a></td>'
            $("#result_list").append(this.el);
    }
    changelist(task,select){

    }



}

void Tasklist;
