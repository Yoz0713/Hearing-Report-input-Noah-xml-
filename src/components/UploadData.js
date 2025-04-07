import React, { useState } from "react";

const UploadData= ({ onDataExtracted }) => {
    const [fileName, setFileName] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");

    // 處理檔案上傳
    const handleFileUpload = async (file) => {
        if (!file) return;

        setFileName(file.name);
        setUploadStatus("上傳中...");

        try {
            // 讀取檔案內容
            const fileContent = await file.text();

            // 發送到後端 API
            const response = await fetch("http://localhost:5000/post_xml_data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: fileContent }),
            });

            const result = await response.json();
            const patientData = result.parsedData["pt:NOAH_Patients_Export"]["pt:Patient"]["pt:Patient"];
            console.log(patientData);

            // 將 patientData 傳遞給父組件
            if (onDataExtracted) {
                onDataExtracted(patientData);
            }

            setUploadStatus(result.message || "上傳成功！");
        } catch (error) {
            console.error("上傳失敗：", error);
            setUploadStatus("上傳失敗，請重試！");
        }
    };

    // 處理檔案選擇
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        handleFileUpload(file);
    };

    // 處理拖放檔案
    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        handleFileUpload(file);
    };

    // 阻止拖放的預設行為
    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div
            style={{
                border: "2px dashed #ccc",
                padding: "20px",
                textAlign: "center",
                borderRadius: "10px",
                backgroundColor: "#f9f9f9",
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <h3>上傳 XML 檔案</h3>
            <input
                type="file"
                accept=".xml"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="fileInput"
            />
            <label
                htmlFor="fileInput"
                style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                點擊選擇檔案
            </label>
            <p style={{ marginTop: "10px" }}>或將檔案拖放到此區域</p>
            {fileName && <p>檔案名稱：{fileName}</p>}
            {uploadStatus && <p>狀態：{uploadStatus}</p>}
        </div>
    );
};

export default UploadData;