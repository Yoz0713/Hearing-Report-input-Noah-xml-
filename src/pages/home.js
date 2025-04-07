// filepath: src/pages/Home.js
import React, { useState } from "react";
import "../scss/pages/_home.scss";
import UploadData from"../components/UploadData";
import ChooseData from "../components/ChooseData";

const Home = () => {
    const [patientData, setPatientData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDataExtracted = (data) => {
        console.log("從子組件接收到的資料：", data);
        setPatientData(data);
        setIsModalOpen(true); // 打開彈跳視窗
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // 關閉彈跳視窗
    };

    const handleSubmit = (selectedData) => {
        console.log("選擇的資料：", selectedData);
        // 在這裡處理選擇的資料，例如發送到後端或更新狀態
    };

    return (
        <div className="home">
            <h1>首頁</h1>
            <p>歡迎來到首頁！</p>
            <UploadData onDataExtracted={handleDataExtracted} />
            {isModalOpen && (
                <ChooseData
                    patientData={patientData}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

export default Home;