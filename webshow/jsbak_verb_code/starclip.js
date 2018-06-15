$(document).ready(function(){
    // soccer stars's clip
let verblists = {};
console.log("sdfafafd===sdff=sadf=saf=")
startlist = ["扎戈耶夫", "托马斯穆勒", "克罗斯", "厄齐尔", "内马尔", "C罗", "梅西", "德布劳内", "阿扎尔", "莱万", "格林兹曼", "博格巴", "坎特", "姆巴佩", "拉莫斯", "皮克", "德赫亚", "席尔瓦", "格雷罗", "格拉尼特-扎卡", "哈里凯恩", "J罗", "法尔考", "埃尔南德斯", "苏亚雷斯", "卡瓦尼", "曼朱基奇", "拉基蒂奇", "莫德里奇", "本特纳", "埃里克森", "西古德蒙森", "纳瓦斯", "伊布", "拉特贝尔西", "萨拉赫", "塞内加尔", "萨达尔阿兹蒙", "马蒂奇", "穆萨", "伊希纳乔", "卡希尔", "香川真司", "贝纳蒂亚", "罗曼-托雷斯", "孙兴慜", "伊蒂哈德吉达"]

for(let i of startlist.sort()){
    $("#stars").append("<option>"+i+"</option>");  
}
function getresults(page,keyword){
    fetch("/mediainfo/",
        {
            method:"POST",
            body:JSON.stringify({
                perpage:8,
                page:page,
                taskid:"all",
                keyword:keyword,
                }) 
           }).then((res)=>res.json())
        .then((res)=>{
        
            if(res["status"]=="OK"){
                if(jsonlist[0][0]!=res["mediainfo"][0][0]|| jsonlist.length!=res["mediainfo"].length|| jsonlist[7]!=res["mediainfo"][7]){
            jsonlist = res["mediainfo"];
                    showresult();
                    refreshbar(res["pages"]);
                }
            }else{
                  alert(res["status"]);
                return;
            }
        }).catch(e=>$(".resultlist"));
}

$("#querystar").click(function(){
 let keyword = [$("#scenes").children("option:selected").val(),$("#stars").children("option:selected").val()];
 getresults(1,keyword);
})
$(document).on("click",".addthis",function(){
    jsonlist[this.value]
})
})