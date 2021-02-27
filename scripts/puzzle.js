let todo
let grids = 3
let article_W = 0;
let article_H = 0;
let img_small;
let img_W = 0;
let img_H = 0;
let ratio_WH = 0;
let elmt_puzzle;
let steps = 0;
let lasting = 0;
let startTime, nowTime;
let idOrder;
let hpair, vpair, disOrder;
let hOrderSet, vOrderSet;

function initilizeOrderSet() {
    getIDOrderArray(true);
    getIDPairArray();
    hOrderSet = new Set(hpair);
    vOrderSet = new Set(vpair);
}


function changeLevel(level) {
    grids = level;
    initilizeOrderSet();
    updateInfo();//重新加载图片
}

function about() {
    alert('Developed by Felix Lin. \nEnjoy it!');
}

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

function selectNewPicture() {
    let selected = document.getElementById("selectPicture").files;
    if (!selected || !selected[0]) {
        return;
    }

    img_small = document.getElementById('thumb');
    let reader = new FileReader();
    reader.onload = function (evt) {
        todo = evt.target.result;
        img_small.src = todo;
    }
    reader.readAsDataURL(selected[0]);
}

function findDimensions() //函数：获取工作区尺寸
{    
    //通过深入Document内部对body进行检测，获取窗口大小
    if (document.documentElement) //&& document.documentElement.clientHeight && document.documentElement.clientWidth
    {
        var winHeight = document.documentElement.clientHeight;
        var winWidth = document.documentElement.clientWidth;
        var header_H = document.getElementById("header").clientHeight;
        var footer_H = document.getElementById("footer").clientHeight;
        var aside_W = document.getElementById("aside").clientWidth;
        article_W = winWidth - aside_W;
        article_H = winHeight - header_H - footer_H - 2;
    }
    else {
        winHeight = "Not existing: document.documentElement";
        winWidth = "Not existing: document.documentElement";
    }
}

function updateInfo() {
    img_small = document.getElementById('thumb');
    img_W = img_small.naturalWidth;
    img_H = img_small.naturalHeight;
    findDimensions();
    let ratio_W = img_W / article_W;
    let ratio_H = img_H / article_H;
    if (ratio_H > ratio_W) {
        ratio_WH = ratio_H;
    }
    else {
        ratio_WH = ratio_W;
    }

    article_W = Math.floor(img_W / ratio_WH);
    article_H = Math.floor(img_H / ratio_WH);
    //document.getElementById("info").value = "iW:" +img_W + "iH:" + img_H + " AW:" + article_W + " AH:" + article_H;
    hideShowThumb(-1);
    showImageInGrids();
}

function showImageInGrids() {
    let  percentage = 100 / (grids - 1);
    let xpos;
    let ypos;
    let block;
    elmt_puzzle = document.getElementById("puzzle_area");
    elmt_puzzle.style.width = article_W + "px";
    elmt_puzzle.style.height = article_H + "px";
    elmt_puzzle.innerHTML = '';
    for(let blk = 0; blk < grids*grids; blk++){
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
        block.ondragstart = (event) => event.dataTransfer.setData('nID', event.target.id);
        block.ondragover = (event) => event.preventDefault();
        block.ondrop = (event) => {
            let nx = event.dataTransfer.getData('nID');
            let ny = event.target.id;
            switchNode(nx, ny, true);
            if(verifyOrderOfID()) {
                hideShowThumb(1);
                alert('恭喜你，拼得漂亮！');
            }        
        }
        block.setAttribute('dragstart', 'true');
        elmt_puzzle.appendChild(block);   
    }
    blockShuffle();
}

function blockShuffle_new() {
    var i, j, k, m, n;
    j = 20;
    k = elmt_puzzle.children.length;
    for (i = 0; i < j; i++) {
        m = Math.floor(Math.random() * k);
        n = Math.floor(Math.random() * k);
        if( m != n) {
            switchNode(m, n);
        }        
    }
    hideShowThumb(-1);

    steps = 0;
    lasting = 0;
    startTime = new Date().getTime();
    updatePazzleInfo(steps, lasting);
}

function blockShuffle() {
    var i, j, k;
    k = grids * grids;
    for (i = 0; i < k; i++) {
        j = Math.floor(Math.random() * k);
        if( i != j) {
            idx = elmt_puzzle.childNodes[i].id
            idy = elmt_puzzle.childNodes[j].id
            switchNode(idx, idy);
        }        
    }

    fullyShuffleBlocks();
    hideShowThumb(-1);

    steps = 0;
    lasting = 0;
    startTime = new Date().getTime();
    updatePazzleInfo(steps, lasting);
}

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
        nowTime = new Date().getTime();
        ltime = parseInt((nowTime - startTime) / 1000, 10);
        updatePazzleInfo(++steps, ltime);
    }

}

function updatePazzleInfo(step, ltime) {
    document.getElementById('stepCount').textContent = step ;
    document.getElementById('timeLasting').textContent = ltime ;
}

function verifyOrderOfID() {
    var i, j, k;
    k = elmt_puzzle.children.length;
    for (i = 0; i < k; i++) {
        if(elmt_puzzle.childNodes[i].id != i){
            return false;
        }
    }
    return true;
}

function findDisorderPair() {
    getIDOrderArray(false);
    getIDPairArray();
    var i, j, k;
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
    console.log(disOrder);
}

function getIDOrderArray(origin=false) {
    var i, k;
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

function getIDPairArray() {
    var i, j, k, m;
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

function fullyShuffleBlocks() {
    let i, k = 1;
    let disblk;
    while (k > 0) {
        findDisorderPair();

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

initilizeOrderSet();
window.onresize=updateInfo;