// filepath: src/pages/Home.js
import React, { useState } from "react";
import "../scss/pages/_home.scss";
import UploadData from "../components/UploadData";
import ChooseData from "../components/ChooseData";
import HearingReport from"../components/HearingReport"; // 引入 HearingReport 組件
const Home = () => {
    const [patientData, setPatientData] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDataExtracted = (data) => {
        setPatientData(data);
        setIsModalOpen(true); // 打開彈跳視窗
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // 關閉彈跳視窗
    };

    const handleSubmit = (submitData) => {
        setSelectedData(submitData); // 儲存選擇的資料
        // 在這裡處理選擇的資料，例如發送到後端或更新狀態
    };

    return (
        <div className="home">
            <h1 className="home-title">患者資料管理</h1>
            <UploadData onDataExtracted={handleDataExtracted} />
            {isModalOpen && (
                <ChooseData
                    patientData={patientData}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                />
            )}
            {selectedData &&( <HearingReport onReset={()=>{setSelectedData(null)}} data={selectedData}/>)}
        </div>
    );
};

export default Home;