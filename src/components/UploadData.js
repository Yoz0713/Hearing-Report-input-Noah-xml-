import React, { useState } from "react";
import "../scss/components/_uploadData.scss";

const UploadData = ({ onDataExtracted }) => {
    const [fileName, setFileName] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    console.log(BACKEND_URL)
    const handleFileUpload = async (file) => {
        if (!file) return;

        setFileName(file.name);
        setUploadStatus("上傳中...");

        try {
            const fileContent = await file.text();

            const response = await fetch(`${BACKEND_URL}/post_xml_data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/xml",
                },
                body: fileContent,
            });

            const result = await response.json();
            const patientData = result.parsedData?.["pt:NOAH_Patients_Export"]?.["pt:Patient"]["pt:Patient"];
            console.log(patientData);

            if (onDataExtracted) {
                onDataExtracted(patientData);
            }

            setUploadStatus(result.message || "上傳成功！");
        } catch (error) {
            console.error("上傳失敗：", error);
            setUploadStatus("上傳失敗，請重試！");
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        handleFileUpload(file);
    };

    return (
        <div className="upload-wrapper">
            <div className="upload-container">
                <h3 className="upload-title">上傳 XML 檔案</h3>
                <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="fileInput"
                />
                <label htmlFor="fileInput" className="upload-button">
                    選擇檔案
                </label>
                {fileName && <p className="upload-info">檔案名稱：{fileName}</p>}
                {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
            </div>
        </div>
    );
};

export default UploadData;
