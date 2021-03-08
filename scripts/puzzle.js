var grids = 3;
var hpair, vpair, disOrder, idOrder;
var hOrderSet, vOrderSet;
var article_W, article_H;
var img_small, elmt_puzzle;
var steps = 0;
var startTime, nowTime;

//初始化 小图块的相邻关系集合
function initilizeOrderSet() {
    getIDOrderArray(true);
    getIDPairArray();
    hOrderSet = new Set(hpair);
    vOrderSet = new Set(vpair);
}

//获取小图块的顺序（分 原始和当前）
function getIDOrderArray(origin=false) {
    let i, k;
    k = grids * grids;
    idOrder = new Array(k);
    for(i = 0; i < k; i++) {
        if(origin){
            idOrder[i] = i;
        }
        else {
            idOrder[i] = elmt_puzzle.childNodes[i].id;
        }
    }
}

//分析得到各小图块的相互位置关系对
function getIDPairArray() {
    let i, j, k, m;
    k = grids * grids;
    hpair = Array((grids - 1) * grids);
    m = 0;
    for(i = 0; i < k; i = i + grids) {
        for(j=i; j< i+grids-1; j++){
            hpair[m] = idOrder[j] + "-" + idOrder[j+1]
            m++
        }
    }

    vpair = Array((grids - 1) * grids);
    m = 0;
    for(i = 0; i < grids; i++) {
        for(j = 0; j < grids - 1; j++){
            vpair[m] = idOrder[i + j*grids] + "-" + idOrder[i + (j+1)*grids]
            m++
        }
    }
}

//更改游戏级别
function changeLevel(level) {
    grids = level;
    initilizeOrderSet();
    updatePuzzleDisplay();//重新加载图片
}

//浏览器大小改变的时候， 更新游戏区的显示
function updatePuzzleDisplay() {
    let img_W, img_H;
    let ratio_W, ratio_H, ratio_WH;

    img_small = document.getElementById('thumb');
    img_W = img_small.naturalWidth;
    img_H = img_small.naturalHeight;

    findDimensions();

    ratio_W = img_W / article_W;
    ratio_H = img_H / article_H;
    if (ratio_H > ratio_W) {
        ratio_WH = ratio_H;
    }
    else {
        ratio_WH = ratio_W;
    }

    article_W = Math.floor(img_W / ratio_WH);
    article_H = Math.floor(img_H / ratio_WH);
    
    hideShowThumb(-1);
    showImageInGrids();
}

//函数：获取工作区尺寸
function findDimensions() 
{    
    if (document.documentElement)
    {
        let winHeight = document.documentElement.clientHeight;
        let winWidth = document.documentElement.clientWidth;
        let header_H = document.getElementById("header").clientHeight;
        let footer_H = document.getElementById("footer").clientHeight;
        let aside_W = document.getElementById("aside").clientWidth;
        article_W = winWidth - aside_W;
        article_H = winHeight - header_H - footer_H - 2;
    }
    else {
        article_W = 400;
        article_H = 300;
    }
}

//切换缩略图显示： 清晰和模糊
function hideShowThumb(mode=0){
    img_small = document.getElementById('thumb');
    switch(mode){
        case 1:
            img_small.style.filter='none';
            break;
        case -1:
            img_small.style.filter = "blur(10px)";
            break;
        case 0:
            if(img_small.style.filter !='none') {
                img_small.style.filter='none';
            }
            else {
                img_small.style.filter = "blur(10px)";
            }
    }    
}

//初始化分块显示拼图
function showImageInGrids() {
    let blk, xpos, ypos, percentage;
    let block;

    percentage = 100 / (grids - 1);
    elmt_puzzle = document.getElementById("puzzle_area");
    img_small = document.getElementById('thumb');
    
    elmt_puzzle.style.width = article_W + "px";
    elmt_puzzle.style.height = article_H + "px";
    elmt_puzzle.innerHTML = '';
    for(blk = 0; blk < grids*grids; blk++){
        block = document.createElement('li');
        block.id = blk;

        block.style.backgroundImage = 'url(' + img_small.src + ')';
        block.style.width = article_W / grids + "px";
        block.style.height = article_H / grids + "px";
        block.style.backgroundSize = (grids * 100) + '%';
        xpos = (percentage * (blk % grids)) + '%';
        ypos = (percentage * Math.floor(blk / grids)) + '%';
        block.style.backgroundPosition = xpos + ' ' + ypos;
        block.setAttribute('draggable', 'true');
        block.onclick = (event) => {
            /*event.target.style.transform = "rotate(0.5turn)"; */
            let st = window.getComputedStyle(event.target, null);
            let tr = st.getPropertyValue("transform");
            if( tr == "none" ) {
                event.target.style.transform = "rotate(0.5turn)";
            }
            else {
                event.target.style.transform = "";
            }
            recordYourAction();
            checkPuzzleStatus();
        } 
        block.ondragstart = (event) => event.dataTransfer.setData('nID', event.target.id);
        block.ondragover = (event) => event.preventDefault();
        block.ondrop = (event) => {
            let nx = event.dataTransfer.getData('nID');
            let ny = event.target.id;
            switchNode(nx, ny, true);
            checkPuzzleStatus();       
        }
        block.setAttribute('dragstart', 'true');
        elmt_puzzle.appendChild(block);   
    }
    blockShuffle();
}

//更新步数和时间
function recordYourAction() {
    let lt;
    nowTime = new Date().getTime();
    lt = parseInt((nowTime - startTime) / 1000, 10);
    updateProgressInfo(++steps, lt);
}

//更新步数和时间显示
function updateProgressInfo(step, ltime) {
    document.getElementById('stepCount').textContent = step ;
    document.getElementById('timeLasting').textContent = ltime ;
    if(step == 0 && ltime == 0) {
        steps = 0; 
        startTime = new Date().getTime();
    }
}

//检查是否完成任务
function checkPuzzleStatus() {
    if(verifyOrderOfID()) {
        hideShowThumb(1);
        document.getElementById("tipinfo").textContent = "世界重归和平，感谢你！";
    }    
}

//检查小图块的旋转状态和先后顺序
function verifyOrderOfID() {
    let i, j, k;
    let st, tr;
    k = elmt_puzzle.children.length;
    for (i = 0; i < k; i++) {
        if(elmt_puzzle.childNodes[i].id != i){
            return false;
        }
        st = window.getComputedStyle(elmt_puzzle.childNodes[i], null);
        tr = st.getPropertyValue("transform");
        if( tr != "none" ) {
            return false;
        }        
    }
    return true;
}

//交换两个小图块的位置
function switchNode(xID, yID, count=false) {
    if(xID == yID){
        return;
    }

    let nodex = document.getElementById(xID);
    let nodey = document.getElementById(yID);
    let nodexn = nodex.nextSibling;
    let nodeyn = nodey.nextSibling;

    if(nodexn) {
        if(nodexn == nodey){
            elmt_puzzle.insertBefore(nodey, nodex);
        }
        else {
            elmt_puzzle.insertBefore(nodex, nodey);
            elmt_puzzle.insertBefore(nodey, nodexn);
        }        
    }
    else {
        if(nodeyn == nodex){
            elmt_puzzle.insertBefore(nodex, nodey);
        }
        else {
            elmt_puzzle.insertBefore(nodey, nodex);
            elmt_puzzle.insertBefore(nodex, nodeyn);
        }
    }

    if(count) {
        recordYourAction();
    }
}

//关于
function about() {
    alert('Developed by Felix Lin. \nEnjoy it!');
}

//选择新的图片
function selectNewPicture() {
    let selected = document.getElementById("selectPicture").files;
    if (!selected || !selected[0]) {
        return;
    }

    img_small = document.getElementById('thumb');
    let reader = new FileReader();
    reader.onload = function (evt) {
        let todo = evt.target.result;
        img_small.src = todo;
    }
    reader.readAsDataURL(selected[0]);
}

//重排图片
function blockShuffle() {
    let i, j, k, r;
    k = grids * grids;
    for (i = 0; i < k; i++) {
        r = Math.random();
        if(r >= 0.3) {
            elmt_puzzle.childNodes[i].style.transform = "rotate(0.5turn)";
        }
        j = Math.floor(r * k);
        if( i != j) {
            idx = elmt_puzzle.childNodes[i].id
            idy = elmt_puzzle.childNodes[j].id
            switchNode(idx, idy);
        }        
    }

    fullyShuffleBlocks();
    hideShowThumb(-1);
    document.getElementById("tipinfo").textContent = "来，拯救这个世界！";
    updateProgressInfo(0, 0);
}

//将小图块完全打乱
function fullyShuffleBlocks() {
    let i, k = 1;
    let disblk;
    while (k > 0) {
        findNotShuffledPair();
        k = disOrder.length;
        if(k == 0) {
            break;
        }
        for(i=0; i < k; i++) {
            disblk = disOrder[i].split("-");
            switchNode(disblk[0], disblk[1]);
        }
    }
}

//寻找没有打乱的小图块
function findNotShuffledPair() {
    let i, j, k;
    getIDOrderArray(false);
    getIDPairArray();
    k = vpair.length;
    disOrder = new Array();
    for(i=0; i<k; i++) {
        if(vOrderSet.has(vpair[i])) {
            disOrder.push(vpair[i]);
        }
    }
    for(i=0; i<k; i++) {
        if(hOrderSet.has(hpair[i])) {
            disOrder.push(hpair[i]);
        }
    }
}

initilizeOrderSet();
window.onresize=updatePuzzleDisplay;