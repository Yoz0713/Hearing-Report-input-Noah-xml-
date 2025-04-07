import React, { useState } from "react";
import "../scss/components/_chooseData.scss"; // 引入 SCSS 樣式

const ChooseData = ({ patientData, onClose, onSubmit }) => {
    const [selectedAudiogram, setSelectedAudiogram] = useState(null);
    const [selectedImpedance, setSelectedImpedance] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 控制下拉選單顯示

    if (!patientData) {
        return null; // 如果沒有資料，則不顯示彈跳視窗
    }

    // 過濾並排序 pt:Actions 陣列中的 Audiogram 和 Impedance measurements
    const audiogramActions = patientData["pt:Actions"]["pt:Action"]
        .filter((action) => action["pt:TypeOfData"] === "Audiogram")
        .sort((a, b) => new Date(b["pt:ActionDate"]) - new Date(a["pt:ActionDate"])); // 日期從近到遠

    const impedanceActions = patientData["pt:Actions"]["pt:Action"]
        .filter((action) => action["pt:TypeOfData"] === "Impedance measurements")
        .sort((a, b) => new Date(b["pt:ActionDate"]) - new Date(a["pt:ActionDate"])); // 日期從近到遠

    // 處理耳朵標記（假設 Description 中包含耳朵資訊）
    const getEarLabel = (description) => {
        if (description.toLowerCase().includes("left")) {
            return "左耳";
        } else if (description.toLowerCase().includes("right")) {
            return "右耳";
        }
        return "未知耳";
    };

    // 處理複選框的變更
    const handleImpedanceChange = (action) => {
        setSelectedImpedance((prevSelected) => {
            if (prevSelected.includes(action)) {
                // 如果已選中，則取消選中
                return prevSelected.filter((item) => item !== action);
            } else if (prevSelected.length < 2) {
                // 如果未選中，且選擇數量小於 2，則新增到選中列表
                return [...prevSelected, action];
            }
            return prevSelected; // 如果已選擇兩個，則不新增
        });
    };

    // 處理送出按鈕的點擊事件
    const handleSubmit = () => {
        const selectedData = {
            audiogram: audiogramActions.find(
                (action) => action["pt:ActionDate"] === selectedAudiogram
            ),
            impedance: selectedImpedance,
        };

        if (onSubmit) {
            onSubmit(selectedData); // 將選擇的資料傳遞給父組件
        }

        onClose(); // 關閉彈跳視窗
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* 第一部分：患者基本資料 */}
                <div className="section">
                    <h3>患者基本資料</h3>
                    <p>
                        姓名：{patientData["pt:LastName"]} {patientData["pt:FirstName"]}
                    </p>
                    <p>生日：{patientData["pt:DateofBirth"]}</p>
                </div>

                {/* 第二部分：選擇 Audiogram */}
                <div className="section">
                    <h3>Audiogram</h3>
                    <select
                        value={selectedAudiogram || ""}
                        onChange={(e) => setSelectedAudiogram(e.target.value)}
                        className="dropdown"
                    >
                        <option value="" disabled>
                            請選擇 Audiogram
                        </option>
                        {audiogramActions.map((action, index) => (
                            <option key={index} value={action["pt:ActionDate"]}>
                                {action["pt:ActionDate"]}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 第三部分：選擇 Impedance measurements */}
                <div className="section">
                    <h3>Impedance measurements</h3>
                    <div className="custom-dropdown">
                        <button
                            className="dropdown-trigger"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {selectedImpedance.length > 0
                                ? `已選擇 ${selectedImpedance.length} 項`
                                : "請選擇 Impedance measurements"}
                        </button>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                {impedanceActions.map((action, index) => (
                                    <label key={index} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            value={action["pt:ActionDate"]}
                                            checked={selectedImpedance.includes(action)}
                                            onChange={() => handleImpedanceChange(action)}
                                            disabled={
                                                !selectedImpedance.includes(action) &&
                                                selectedImpedance.length >= 2
                                            } // 禁用超過兩個的選項
                                        />
                                        {action["pt:ActionDate"]} ({getEarLabel(action["pt:Description"])})
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 按鈕區域 */}
                <div className="section buttons">
                    <button className="close-button" onClick={onClose}>
                        關閉
                    </button>
                    <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={!selectedAudiogram || selectedImpedance.length === 0} // 禁用按鈕，直到選擇完成
                    >
                        送出
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChooseData;