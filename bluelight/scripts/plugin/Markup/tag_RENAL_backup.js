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
            //onElementLeave();
        }
    }
}

function loadWriteRENALTAG() {
    loadMarkupPlugin();
    var span = document.createElement("SPAN")
    span.innerHTML =
        `<img class="innerimg RENALTAG" alt="writeRENALTAG" onmouseover = "onElementOver(this);" onmouseleave = "onElementLeave();" id="writeRENALTAG" src="../image/icon/lite/tag_off.png" width="50" height="50">`;
    if (getByid("MarkupDIv").childNodes.length > 0) getByid("MarkupDIv").appendChild(document.createElement("BR"));
    getByid("MarkupDIv").appendChild(span);

    var span = document.createElement("SPAN")
    span.innerHTML =
        `<img class="img RENALTAG" alt="saveRENALTAG" id="saveRENALTAG" onmouseover="onElementOver(this);" onmouseleave="onElementLeave();" src="../image/icon/lite/tag_off.png" width="50" height="50" style="display:none;" >`;
    addIconSpan(span);

    var span = document.createElement("SPAN")
    span.innerHTML =
        `<div id="RENALTagStyleDiv" style="background-color:#30306044;">
        <span style="color: white;" id="RENALmedicalSpecialtyTagSpan">R.E.N.A.L. Nephrometry Score：</span>
        <div id="RENALTagContent" style="color: white;">
            <div id="R.E.N.A.L.">
                <span id="diseaseTagSpan">E(Exophytic/endophytic)：</span>
                <select id="diseaseSelectorTagE(Exophytic/endophytic)"></select>
                <br>
                <span id="diseaseTagSpan">N(Nearness to collecting system or sinus (mm))：</span>
                <select id="diseaseSelectorTagN(Nearnesstocollectingsystemorsinus(mm))"></select>
                <br>
                <span id="diseaseTagSpan">L(Location relative to polar lines)：</span>
                <select id="diseaseSelectorTagL(Locationrelativetopolarlines)"></select>
            </div>
        </div>
      </div>`;
    getByid("page-header").appendChild(span);
    getByid("RENALTagStyleDiv").style.display = "none";
}
loadWriteRENALTAG();

function readRENALImageTags(url) {
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
            
            // 為 RENAL 專用選擇器添加選項
            let selectField = document.getElementById("RENALmedicalSpecialtyTag");
            if (selectField) {
                let opt = document.createElement('option');
                opt.id = value['name'];
                opt.textContent = value['name'];
                selectField.appendChild(opt);
            }

            // 動態生成疾病選項
            let diseases = Object.entries(value['diseases']);
            diseases.forEach(diseaseObject => {
                let [diseaseKey, diseaseValue] = diseaseObject;
                let diseaseName = diseaseValue['name'];
                let select = document.getElementById("RENALdiseaseSelectorTag" + diseaseName.replace(/[ \()]/g, ""));
                
                if (!select) {
                    // 若選擇器不存在，創建新的
                    let span = document.createElement("span");
                    span.id = "RENALdiseaseTagSpan";
                    span.textContent = "Disease：" + diseaseName + " ";
                    document.getElementById("RENALTagContent").appendChild(span);
                    
                    select = document.createElement('select');
                    select.id = "RENALdiseaseSelectorTag" + diseaseName.replace(/[ \()]/g, "");
                    document.getElementById("RENALTagContent").appendChild(select);
                }
                
                // 添加標籤選項
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

// 綁定 RENAL 專用的事件監聽
getByid("RENALmedicalSpecialtyTag").onchange = function () {
    let contentDiv = document.getElementById("RENALTagContent");
    if (contentDiv) {
        contentDiv.querySelectorAll("span, select").forEach(elem => {
            elem.style.display = "none";
        });
    }
};

readRENALImageTags("../data/imageTags_RENAL.json");

getByid("saveRENALTAG").onclick = function () {
    getByid("saveRENALTAG").style.display = "none";
    img2darkByClass("RENALTAG", true);
    getByid('RENALTagStyleDiv').style.display = 'none';
    SetTable();
    displayMark();
    
    handleRENALTag();
    
    getByid('MouseOperation').click();
}

getByid("writeRENALTAG").onclick = function () {
    cancelTools();

    getByid("MarkupDIv").style.display = "none";
    img2darkByClass("RENALTAG", false);
    
    if (true) {
        getByid("saveRENALTAG").style.display = "";
        getByid('RENALTagStyleDiv').style.display = '';
    }
    SetTable();
    displayMark();
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
    let eSelector = document.getElementById("diseaseSelectorTagE(Exophytic/endophytic)");
    let nSelector = document.getElementById("diseaseSelectorTagN(Nearnesstocollectingsystemorsinus(mm))");
    let lSelector = document.getElementById("diseaseSelectorTagL(Locationrelativetopolarlines)");

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

    // 如果配置了 Xml2Dcm，則使用該功能
    if (typeof ConfigLog !== 'undefined' && ConfigLog.Xml2Dcm && ConfigLog.Xml2Dcm.enableXml2Dcm == true) {
        function download2(text, name, type) {
            let a = document.createElement('a');
            let file = new File([text], name + ".xml", {
                type: type
            });
            var xhr = new XMLHttpRequest();

            xhr.open('POST', ConfigLog.Xml2Dcm.Xml2DcmUrl, true);
            xhr.setRequestHeader("enctype", "multipart/form-data");
            var formData = new FormData();
            formData.append("files", file);
            xhr.send(formData);
            xhr.onload = function () {
                if (xhr.status == 200) {
                    let data = JSON.parse(xhr.responseText);
                    for (let url of data) {
                        window.open(url);
                    }
                }
            }
        }
        download2(xmlContent, "" + CreateRandom(), 'text/plain');
    } else {
        download(xmlContent, sopUID + "_RENAL.xml", 'text/xml');
    }
    
    getByid('MouseOperation').click();
}