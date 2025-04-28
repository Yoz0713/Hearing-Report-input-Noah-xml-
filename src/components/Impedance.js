import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";

const Impedance = ({ data, ear }) => {
    const chartRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState(""); // 用於顯示錯誤訊息
    const [impedanceData, setImpedanceData] = useState(null); // 用於存儲 impedanceData

    useEffect(() => {
        const ctx = chartRef.current.getContext("2d");

        // 清除之前的圖表實例（如果存在）
        if (Chart.getChart(chartRef.current)) {
            Chart.getChart(chartRef.current).destroy();
        }

        // 確保 data 是陣列
        if (!Array.isArray(data)) {
            console.error("data is not an array:", data);
            setErrorMessage("未測試");
            return;
        }

        // 根據 ear 選擇對應的數據
        const selectedData = data.find(item => {
            if (ear === "right") {
                return item['pt:Description'] === "Tympanometry Right";
            } else if (ear === "left") {
                return item['pt:Description'] === "Tympanometry Left";
            }
            return false;
        });

        if (!selectedData) {
            console.error("No matching data found for ear:", ear);
            setErrorMessage("未測試");
            return;
        }

        setErrorMessage(""); // 清除錯誤訊息
        setImpedanceData(selectedData?.['pt:PublicData']?.AcousticImpedanceCompleteMeasurement?.TympanogramTest); // 保存數據到狀態

        // 提取數據並排序
        const compliancePoints = selectedData?.['pt:PublicData']?.AcousticImpedanceCompleteMeasurement?.TympanogramTest?.ComplianceCurve?.CompliancePoint || [];
        const sortedPoints = compliancePoints.sort((a, b) => parseFloat(a.Pressure) - parseFloat(b.Pressure)); // 按 Pressure 升序排序
        const xData = sortedPoints.map(point => parseFloat(point.Pressure)); // x 軸數據 (Pressure)
        const yData = sortedPoints.map(point => parseFloat(point.Compliance.ArgumentCompliance1) / 100); // y 軸數據

        // 計算 y 軸的動態範圍
        const yMin = Math.min(...yData) - 0.1; // 最小值減去一點緩衝
        const yMax = Math.max(...yData) + 0.1; // 最大值加上一點緩衝

        // 初始化 Chart.js 折線圖
        new Chart(ctx, {
            type: "line",
            data: {
                labels: xData, // 使用排序後的 Pressure 作為 x 軸數據
                datasets: [
                    {
                        label: "",
                        data: yData, // y 軸數據
                        borderColor: ear === "right" ? "red" : "#008cd7",
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        pointRadius: 0, // 隱藏點
                        pointBackgroundColor: ear === "right" ? "red" : "#008cd7",
                        tension: 0.4, // 平滑曲線
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false, // 隱藏圖例
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Pressure (dapa)",
                        },
                        ticks: {
                            stepSize: 5, // 可根據需求調整步進
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Compliance (mmho)",
                        },
                        min: 0, // 動態最小值
                        max: 1.5, // 動態最大值
                        ticks: {
                            stepSize: 0.2, // 動態步進
                        },
                    },
                },
            },
        });
    }, [data, ear]);

    return (
        <div style={{ width: "100%" }}>
            {errorMessage ? (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    {errorMessage}
                </div>
            ) : (
                <div id="impedance-container">
                    <canvas ref={chartRef}></canvas>
                    <div className="summary-container">
                        <div>
                            <strong>類型:</strong>
                            <span style={{ color: ear === "right" ? "red" : "#008cd7" }}>
                                {(() => {
                                    const compliance = impedanceData?.ComplianceCurve?.CompliancePoint?.find(
                                        point => parseFloat(point.Pressure) === parseFloat(impedanceData?.Pressure)
                                    )?.Compliance?.ArgumentCompliance1 / 100;

                                    const pressure = parseFloat(impedanceData?.Pressure);

                                    if (compliance >= 0.3 && compliance <= 1.5 && pressure >= -100 && pressure <= 100) {
                                        return "A";
                                    } else if (compliance > 0.1 && pressure < -100) {
                                        return "C";
                                    } else if (compliance > 0.1 && pressure > 100) {
                                        return "正壓";
                                    } else if (compliance >= 0.1 && compliance <= 0.29 && pressure >= -100 && pressure <= 100) {
                                        return "As";
                                    } else if (compliance > 1.5 && pressure >= -100 && pressure <= 100) {
                                        return "Ad";
                                    } else if (compliance < 0.1) {
                                        return "B";
                                    } else {
                                        return "N/A";
                                    }
                                })()}
                            </span>
                        </div>
                        <div>
                            <strong>耳道容積 (ml):</strong>
                            <span style={{ color: ear === "right" ? "red" : "#008cd7" }}>
                                {impedanceData?.CanalVolume?.ComplianceValue?.ArgumentCompliance1/100}
                            </span>
                        </div>
                        <div>
                            <strong>峰值壓力 (dapa):</strong>
                            <span style={{ color: ear === "right" ? "red" : "#008cd7" }}>
                                {impedanceData?.Pressure || "N/A"}
                            </span>
                        </div>
                        <div>
                            <strong>峰值聲導抗 (ml):</strong>
                            <span style={{ color: ear === "right" ? "red" : "#008cd7" }}>
                                {impedanceData?.ComplianceCurve?.CompliancePoint?.find(
                                    point => parseFloat(point.Pressure) === parseFloat(impedanceData?.Pressure)
                                )?.Compliance?.ArgumentCompliance1 / 100 || "N/A"}
                            </span>
                        </div>
                    </div>
                    </div>
            )}
        </div>
    );
};

export default Impedance;