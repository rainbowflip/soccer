var init = {
    // Mousing over the RESIZE_BORDER px-border around each rectangle
    // initiates resize, else initiates move.
    RESIZE_BORDER_EDGE: 5 /* px */,
    RESIZE_BORDER_CORNER: 10 /* px */,

    // Minimum dimensions allowed for box
    MIN_RECT_DIMENSIONS: {
        width: 10 /* px */,
        height: 15 /* px */,
    },
    // Map of dragIntent => cursor
    CURSOR_BY_DRAG_INTENT: {
        'nw-resize': 'nwse-resize',
        'se-resize': 'nwse-resize',
        'sw-resize': 'nesw-resize',
        'ne-resize': 'nesw-resize',
        'n-resize': 'ns-resize',
        's-resize': 'ns-resize',
        'e-resize': 'ew-resize',
        'w-resize': 'ew-resize',
        'move': 'move',
        'create': 'crosshair',
    },
};
var Rectact = {dragIntent:undefined};

function resize(ele,ex,ey,startX,startY){
    if(ex > startX){
        ele.style.width = ex - startX + 'px';
    }else{
        ele.style.left = ex+'px';
        ele.style.width = startX - ex + 'px';
    }
    if(ey > startY){
        ele.style.height = ey - startY + 'px';
    }else{                
        ele.style.top = ey+'px';
        ele.style.height = startY - ey + 'px';
    }
}
 

window.onload = function(e) {
    e = e || window.event;
    // startX, startY 为鼠标点击时初始坐标
    // diffX, diffY 为鼠标初始坐标与 box 左上角坐标之差，用于拖动
    var startX, startY, diffX, diffY;
    var startl, startt, startr, startb;
    // 是否拖动，初始为 false
    var dragging = false;
          
    // 鼠标按下
    document.getElementById("forimg").onmousedown = function(e) {
        $(".box").removeClass("focus");
        startX = e.pageX-$("#forimg").offset().left;
        startY = e.pageY-$("#forimg").offset().top;
        startl = e.target.offsetLeft;
        startt = e.target.offsetTop;
        startr = startl+e.target.offsetWidth;
        startb = startt+e.target.offsetHeight;
        // 如果鼠标在 box 上被按下
        if(e.target.className.match(/box/)) {
            $(e.target).addClass("focus");
            $(e.target).siblings().removeClass("focus");
            // 允许拖动
            dragging = true;
          
            // 设置当前 box 的 id 为 moving_box
            if(document.getElementById("moving_box") !== null) {
                document.getElementById("moving_box").removeAttribute("id");
            }
            e.target.id = "moving_box";
          
            // 计算坐标差值
            diffX = startX - e.target.offsetLeft;
            diffY = startY - e.target.offsetTop;
        }
        else if(e.target.id.match(/img/)){
            // 在页面创建 box
            console.log("create box")
            var active_box = document.createElement("div");
            active_box.id = "active_box";
            active_box.className = "box focus";
            active_box.style.top = startY + 'px';
            active_box.style.left = startX + 'px';
            // document.body.appendChild(active_box);
            $("#forimg").append(active_box)
            active_box = null;
        }
    };
    
    // 鼠标移动
    document.getElementById("forimg").onmousemove = function(e) {

        if(e.target.className.match(/box/)) {
                var relative = {
                    xMin: e.pageX-$("#forimg").offset().left - e.target.offsetLeft,
                    yMin: e.pageY-$("#forimg").offset().top - e.target.offsetTop,
                    xMax: e.target.offsetLeft+e.target.offsetWidth - (e.pageX-$("#forimg").offset().left),
                    yMax: e.target.offsetTop+e.target.offsetHeight - (e.pageY-$("#forimg").offset().top),
                };
            if(e.target.style.cursor && dragging){
            //    console.log("----=-=-"+e.target.style.cursor)
            }else{

                if (relative.xMin > init.RESIZE_BORDER_EDGE && relative.xMax > init.RESIZE_BORDER_EDGE &&
                    relative.yMin > init.RESIZE_BORDER_EDGE && relative.yMax > init.RESIZE_BORDER_EDGE) {
                    Rectact.dragIntent = 'move';
                }
                else if (relative.yMin < init.RESIZE_BORDER_CORNER) {
                    if (relative.xMin < init.RESIZE_BORDER_CORNER)
                        Rectact.dragIntent = 'nw-resize';
                    else if (relative.xMax < init.RESIZE_BORDER_CORNER)
                        Rectact.dragIntent = 'ne-resize';
                    else
                        Rectact.dragIntent = 'n-resize';
                }
                else if (relative.yMax < init.RESIZE_BORDER_CORNER) {
                    if (relative.xMin < init.RESIZE_BORDER_CORNER)
                        Rectact.dragIntent = 'sw-resize';
                    else if (relative.xMax < init.RESIZE_BORDER_CORNER)
                        Rectact.dragIntent = 'se-resize';
                    else
                        Rectact.dragIntent = 's-resize';
                }
                else {
                    if (relative.xMin < init.RESIZE_BORDER_CORNER)
                        Rectact.dragIntent = 'w-resize';
                    else if (relative.xMax < init.RESIZE_BORDER_CORNER)
                        Rectact.dragIntent = 'e-resize';
                    else
                        throw new Error('Rect.onMouseover: internal error');
                }
                e.target.style.cursor=Rectact.dragIntent;
            }
        }
            
            // 更新 box 尺寸
            if(document.getElementById("active_box") !== null) {
                var ab = document.getElementById("active_box");
                resize(ab,e.pageX-$("#forimg").offset().left,e.pageY-$("#forimg").offset().top,startX,startY)
            }
            
            // 移动，更新 box 坐标
            if(document.getElementById("moving_box") !== null && dragging) {

            switch (Rectact.dragIntent) {
                case 'nw-resize':
                    resize(document.getElementById("moving_box"),e.pageX-$("#forimg").offset().left,e.pageY-$("#forimg").offset().top,startr,startb);
                    break;
                case 'ne-resize':
                    resize(document.getElementById("moving_box"),e.pageX-$("#forimg").offset().left,e.pageY-$("#forimg").offset().top,startl,startb);
                    break;
                case 'n-resize':
                    resize(document.getElementById("moving_box"),startl,e.pageY-$("#forimg").offset().top,startr,startb);
                    break;
                case 'sw-resize':
                    resize(document.getElementById("moving_box"),e.pageX-$("#forimg").offset().left,e.pageY-$("#forimg").offset().top,startr,startt);
                    break;
                case 'se-resize':
                    resize(document.getElementById("moving_box"),e.pageX-$("#forimg").offset().left,e.pageY-$("#forimg").offset().top,startl,startt);
                    break;
                case 's-resize':
                    resize(document.getElementById("moving_box"),startl,e.pageY-$("#forimg").offset().top,startr,startt);
                    break;
                case 'w-resize':
                    resize(document.getElementById("moving_box"),e.pageX-$("#forimg").offset().left,startt,startr,startb);
                    break;
                case 'e-resize':
                    resize(document.getElementById("moving_box"),e.pageX-$("#forimg").offset().left,startt,startl,startb);
                    break;
                case 'move':
                    var mb = document.getElementById("moving_box");
                    mb.style.top = e.pageY-$("#forimg").offset().top - diffY + 'px';
                    mb.style.left = e.pageX-$("#forimg").offset().left - diffX + 'px';
                    break;
    
            }

        }
    } 
           
    // 鼠标抬起
    document.getElementById("forimg").onmouseup = function(e) {
        // 禁止拖动
        dragging = false;
        e.target.style.cursor = null;
        if(document.getElementById("active_box") !== null) {
            var ab = document.getElementById("active_box");
            ab.removeAttribute("id");
            // 如果长宽均小于 3px，移除 box
            if(ab.offsetWidth < 4 || ab.offsetHeight < 4) {
                document.getElementById("forimg").removeChild(ab);
            }
        }
    };
    document.onkeydown=function(event){
        if(!$(".focus")[0]){return};
        var e = event || window.event || arguments.callee.caller.arguments[0];
        console.log(e.keyCode)
        if(e.keyCode == 8||e.keyCode == 46 || e.keyCode ==68){
            $(".focus")[0].remove();
         }
    }
   //-----------draw rect & renew ocr-----------------
    $(document).on('click','#autoxy',function(){
        $("#drawrect").show();

   })
    $(document).on('click',"#closedraw",function(){
       $(".box").remove(); 
       $("#drawrect").hide();
    })
   
       var result = document.getElementById("forimg");
        var file = document.getElementById("file");

        //判断浏览器是否支持FileReader接口  
        if(typeof FileReader == 'undefined')  {
            result.InnerHTML = "<p>你的浏览器不支持FileReader接口！</p>";
            //使选择控件不可操作  
            file.setAttribute("disabled", "disabled"); //使得之前操作失效，重新启动
        }

        function readAsDataURL() {
            //检验是否为图像文件  
            var file = document.getElementById("imagefile").files[0];
            if(!/image\/\w+/.test(file.type)) {
                alert("这不是图片文件！请检查！");
                return false;
            }
            var reader = new FileReader();
            //将文件以Data URL形式读入页面  
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                var result = document.getElementById("forimg");
                //显示文件  
                result.innerHTML = '<img id="img" ondragstart="return false" src="' + this.result + '"  width="100%" alt=""/>';
            }
        }
        document.getElementById("imagefile").addEventListener('change',function(){
           var file = document.getElementById("imagefile").files[0];
            if(!/image\/\w+/.test(file.type)) {
                alert("这不是图片文件！请检查！");
                return false;
            }
            var reader = new FileReader();
            //将文件以Data URL形式读入页面  
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                var result = document.getElementById("forimg");
                //显示文件  
                result.innerHTML = '<img id="img" ondragstart="return false" src="' + this.result + '"  width="100%" alt=""/>';
            }
        })
        document.getElementById("imgurl").onclick = function(){
               let val = prompt("请输入图片路径如：/static/**/**.jpg")
              
               if(val){
                   document.getElementById("forimg").innerHTML = '<img id="img" ondragstart="return false" src="'+val+'"  width="100%" alt=""/>';
               }
        }
    //--------------------------------
     function setxy(a,b,c,d){
        let scale = $("#img").width() / $("#img")[0].naturalWidth;
        console.log("---scale---"+scale)
        console.warn(a+"--"+parseInt(parseInt($(".focus").css("left"))/scale));
        console.warn(b+"--"+parseInt(parseInt($(".focus").css("top"))/scale));
        console.warn(c+"--"+parseInt($(".focus").width()/scale));
        console.warn(d+"--"+parseInt($(".focus").height()/scale))       
        $("input[name='"+a+"']").val(parseInt(parseInt($(".focus").css("left"))/scale));
        $("input[name='"+b+"']").val(parseInt(parseInt($(".focus").css("top"))/scale));
        $("input[name='"+c+"']").val(parseInt($(".focus").width()/scale));
        $("input[name='"+d+"']").val(parseInt($(".focus").height()/scale));
     }
     $("#set1").click(function(){
         setxy("x1","y1","w1","h1"); 
         $("#timeocr").html("timeocr:"
            +" x_<i style='color:red'>"+$("input[name='x1']").val()
            +"</i> y_<i style='color:red'>"+$("input[name='y1']").val()
            +"</i> w_<i style='color:red'>"+$("input[name='w1']").val()                                        
            +"</i> h_<i style='color:red'>"+$("input[name='h1']").val()+"</i>")
     })
        
     $("#set2").click(function(){
         setxy("x2","y2","w2","h2");
           $("#scoreocr").html("scoreocr:"
            +" x_<i style='color:red'>"+$("input[name='x2']").val()
            +"</i> y_<i style='color:red'>"+$("input[name='y2']").val()
            +"</i> w_<i style='color:red'>"+$("input[name='w2']").val()                                      
            +"</i> h_<i style='color:red'>"+$("input[name='h2']").val()+"</i>")
     })	
     $("#set3").click(function(){
         setxy("x3","y3","w3","h3");
              $("#byocr").html("备用ocr:"
            +" x_<i style='color:red'>"+$("input[name='x3']").val()
            +"</i> y_<i style='color:red'>"+$("input[name='y3']").val()
            +"</i> w_<i style='color:red'>"+$("input[name='w3']").val()                                      
            +"</i> h_<i style='color:red'>"+$("input[name='h3']").val()+"</i>")
     }) 	
};


