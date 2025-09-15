var openWriteRENAL = false;  
  
function loadMarkupPlugin() {  
    if (getByid("MarkupImgParent")) return;  
    var span = document.createElement("SPAN");  
    span.id = "MarkupImgParent";  
    span.innerHTML = `  
     <img class="img" loading="lazy" altzhtw="3D" alt="3D" id="MarkupDrawerImg" src="../image/icon/lite/markup.png"  
          width="50" height="50">  
    <div id="MarkupDIv" class="drawer" style="position:absolute;left: 0;white-space:nowrap;z-index: 100;  
    width: 500; display: none;background-color: black;">`;  
    addIconSpan(span);  
    getByid("MarkupDrawerImg").onclick = function () {  
        if (this.enable == false) return;  
        hideAllDrawer("MarkupDIv");  
        invertDisplayById('MarkupDIv');  
        if (getByid("MarkupDIv").style.display == "none") getByid("MarkupImgParent").style.position = "";  
        else {  
            getByid("MarkupImgParent").style.position = "relative";  
        }  
    }  
}  
  
function loadWriteRENAL() {  
    loadMarkupPlugin();  
    var span = document.createElement("SPAN")  
    span.innerHTML =  
        `<img class="innerimg RENAL" alt="writeRENAL" onmouseover = "onElementOver(this);" onmouseleave = "onElementLeave();" id="writeRENAL" src="../image/icon/lite/tag_off.png" width="50" height="50">`;  
    if (getByid("MarkupDIv").childNodes.length > 0) getByid("MarkupDIv").appendChild(document.createElement("BR"));  
    getByid("MarkupDIv").appendChild(span);  
  
    var span = document.createElement("SPAN")  
    span.innerHTML =  
        `<img class="img RENAL" alt="saveRENAL" id="saveRENAL" onmouseover="onElementOver(this);" onmouseleave="onElementLeave();" src="../image/icon/lite/tag_off.png" width="50" height="50" style="display:none;" >`;  
    addIconSpan(span);  
  
    var span = document.createElement("SPAN")  
    span.innerHTML =  
        `<div id="RenalStyleDiv" style="background-color:#30306044;">  
        <span style="color: white;" id="medicalSpecialtyRenalSpan">Medical specialty：</span>  
        <select id="medicalSpecialtyRenal">  
        </select>  
      </div>`  
    getByid("page-header").appendChild(span);  
    getByid("RenalStyleDiv").style.display = "none";  
}  
loadWriteRENAL();  
  
function readRenalTags(url) {  
    let request = new XMLHttpRequest();  
    request.open('GET', url);  
    request.responseType = 'text';  
    request.send();  
    request.onload = function () {  
        if (request.readyState != 4) { return; }  
        var responseJson = JSON.parse(request.responseText);  
        let response = Object.entries(responseJson['medicalSpecialty']);  
  
        response.forEach(medicalSpecialityObject => {  
            let [key, value] = medicalSpecialityObject;  
  
            let medicalSpecialtyName = value['name'];  
            let selectField = document.getElementById("medicalSpecialtyRenal");  
            let opt = document.createElement('option');  
            opt.id = medicalSpecialtyName;  
            opt.textContent = medicalSpecialtyName;  
            selectField.appendChild(opt);  
  
            let tagDiv = document.getElementById("RenalStyleDiv");  
            let diseasesDiv = document.createElement('div');  
            diseasesDiv.id = medicalSpecialtyName + "_renal";  
            diseasesDiv.style.color = "white";  
            tagDiv.appendChild(diseasesDiv);  
  
            let diseases = Object.entries(value['diseases']);  
            diseases.forEach(diseaseObject => {  
                let [diseaseKey, diseaseValue] = diseaseObject;  
                let span = document.createElement("span");  
                let diseaseName = diseaseValue['name'];  
                span.id = "diseaseRenalSpan";  
                span.textContent = "Disease：" + diseaseName + " ";  
                diseasesDiv.appendChild(span);  
  
                let select = document.createElement('select');  
                select.id = "diseaseSelectorTag" + diseaseName.replace(/ /g, "").replace(/[()]/g, "");  
  
                let selectDiseaseTagNumber = document.querySelectorAll('[id^=diseaseSelectorTag]').length  
                if (selectDiseaseTagNumber > 0) {  
                    diseasesDiv.hidden = true;  
                }  
                diseasesDiv.appendChild(select);  
  
                diseaseValue['tags'].forEach(tag => {  
                    let opt = document.createElement('option');  
                    opt.id = tag;  
                    opt.textContent = tag;  
                    select.appendChild(opt);  
                });  
            });  
        });  
    }  
}  
readRenalTags("../data/imageTags_RENAL.json");  
  
getByid("medicalSpecialtyRenal").onchange = function () {  
    let disabledDiseaseDiv = document.getElementById("RenalStyleDiv").querySelectorAll("div");  
    disabledDiseaseDiv.forEach((elem) => {  
        elem.hidden = true;  
    });  
  
    let enabledDiseaseDiv = document.querySelectorAll("div[id='" + this.value + "_renal']");  
    enabledDiseaseDiv.forEach((elem) => {  
        elem.hidden = false;  
    });  
}  
  
getByid("saveRENAL").onclick = function () {  
    getByid("saveRENAL").style.display = "none";  
    getByid("writeRENAL").onclick();  
}  
  
getByid("writeRENAL").onclick = function () {  
    cancelTools();  
    openWriteRENAL = !openWriteRENAL;  
    getByid("MarkupDIv").style.display = "none";  
    img2darkByClass("RENAL", !openWriteRENAL);  
    this.src = openWriteRENAL == true ? '../image/icon/lite/tag_on.png' : '../image/icon/lite/tag_off.png';  
    if (openWriteRENAL == true) {  
        getByid("saveRENAL").style.display = "";  
        getByid('RenalStyleDiv').style.display = '';  
        set_BL_model('writeRENAL');  
    } else getByid('RenalStyleDiv').style.display = 'none';  
    SetTable();  
    displayMark();  
    if (openWriteRENAL == true) return;  
  
    handleRENALTag();  
}  
  
function handleRENALTag() {  
    console.log("handleRENALTag");  
      
    // 獲取當前視窗的 SeriesInstanceUID 和 StudyInstanceUID  
    let index = SearchUid2Index(GetViewport().sop);  
    let i = index[0], j = index[1], k = index[2];  
    let sopUID = ImageManager.Study[i].Series[j].Sop[k].SOPInstanceUID;  
    let seriesUID = ImageManager.Study[i].Series[j].SeriesInstanceUID;  
    let studyUID = ImageManager.Study[i].StudyInstanceUID;  
  
    // 獲取三個選擇器的值  
    let eSelector = document.getElementById("diseaseSelectorTagEExophytic/endophytic");  
    let nSelector = document.getElementById("diseaseSelectorTagNNearnesstocollectingsystemorsinusmm");  
    let lSelector = document.getElementById("diseaseSelectorTagLLocationrelativetopolarlines");  
      
    let eValue = eSelector ? eSelector.value : "";  
    let nValue = nSelector ? nSelector.value : "";  
    let lValue = lSelector ? lSelector.value : "";  
  
    // XML escape function（使用 DOM 自動處理特殊字元）  
    function escapeXML(value) {  
        let div = document.createElement("div");  
        div.appendChild(document.createTextNode(value));  
        return div.innerHTML;  
    }  
  
    // 對值進行轉換，避免 < > & 等特殊字元破壞 XML  
    let eValueEscaped = escapeXML(eValue);  
    let nValueEscaped = escapeXML(nValue);  
    let lValueEscaped = escapeXML(lValue);  
  
    // 生成 XML 內容  
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>  
<file-format>  
    <meta-header xfer="1.2.840.10008.1.2.1" name="Little Endian Explicit">  
        <element tag="0002,0013" vr="SH" vm="1" len="10" name="ImplementationVersionName">BlueLight</element>  
    </meta-header>  
    <data-set xfer="1.2.840.10008.1.2.1" name="Little Endian Explicit">  
        <element tag="0004,1430" vr="CS" vm="1" len="6" name="DirectoryRecordType">IMAGE</element>  
        <element tag="0008,0018" vr="UI" vm="1" len="${sopUID.length}" name="SOPInstanceUID">${sopUID}</element>  
        <element tag="0020,000E" vr="UI" vm="1" len="${seriesUID.length}" name="SeriesInstanceUID">${seriesUID}</element>  
        <element tag="0020,000D" vr="UI" vm="1" len="${studyUID.length}" name="StudyInstanceUID">${studyUID}</element>  
        <element tag="0040,a043" vr="SQ" vm="1" name="ConceptNameCodeSequence">  
            <item>  
                <element tag="0008,0100" vr="SH" vm="1" len="${eValueEscaped.length}" name="RENAL_E">${eValueEscaped}</element>  
                <element tag="0008,0102" vr="SH" vm="1" len="${nValueEscaped.length}" name="RENAL_N">${nValueEscaped}</element>  
                <element tag="0008,0104" vr="LO" vm="1" len="${lValueEscaped.length}" name="RENAL_L">${lValueEscaped}</element>  
            </item>  
        </element>  
    </data-set>  
</file-format>`;  
  
    // 下載 XML 文件  
    function download(text, name, type) {  
        let a = document.createElement('a');  
        let file = new Blob([text], { type: type });  
        a.href = window.URL.createObjectURL(file);  
        a.download = name;  
        a.click();  
    }  
  
    download(xmlContent, sopUID + "_RENAL.xml", 'text/xml');  
    getByid('MouseOperation').click();  
}