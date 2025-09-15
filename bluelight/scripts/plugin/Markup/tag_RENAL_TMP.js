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

    download(xmlContent, sopUID + "_RENAL.xml", 'text/xml');
    getByid('MouseOperation').click();
}
