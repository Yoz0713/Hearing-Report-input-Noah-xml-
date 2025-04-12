const SpeechTest = ({ data, ear }) => {

    // 根據 StimulusSignalOutput 動態篩選數據
    const wrsData = data?.SpeechDiscriminationAudiogram?.find(
        item => item?.AudMeasurementConditions?.StimulusSignalOutput?.toLowerCase().includes(ear)
    )?.SpeechDiscriminationPoints;

    const srtData = data?.SpeechReceptionThresholdAudiogram?.find(
        item => item?.AudMeasurementConditions?.StimulusSignalOutput?.toLowerCase().includes(ear)
    )?.SpeechReceptionPoints;

    const mclData = data?.SpeechMostComfortableLevel?.find(
        item => item?.AudMeasurementConditions?.StimulusSignalOutput?.toLowerCase().includes(ear)
    )?.SpeechMostComfortablePoint;

    const speechValueColor = ear === "right" ? "red" : "#008cd7"; // 動態設定顏色

    return (
        <div className="SpeechTest">
            {/* 語音接受閾值 (SRT) */}
            <div className="speech-section">
                <h3 className="speech-title">語音接受閾值 (SRT)</h3>
                <div className="speech-content">
                    <p className="speech-item">
                        <span className="speech-label">施測音量：</span>
                        <span className="speech-value" style={{ color: speechValueColor }}>
                            {srtData?.StimulusLevel || "未測驗"}{srtData?.StimulusLevel ? " dB" : ""}
                        </span>
                    </p>
                </div>
            </div>

            {/* 語音舒適閾值 (MCL) */}
            <div className="speech-section">
                <h3 className="speech-title">語音舒適閾值 (MCL)</h3>
                <div className="speech-content">
                    <p className="speech-item">
                        <span className="speech-label">施測音量：</span>
                        <span className="speech-value" style={{ color: speechValueColor }}>
                            {mclData?.StimulusLevel || "未測驗"}{mclData?.StimulusLevel ? " dB" : ""}
                        </span>
                    </p>
                </div>
            </div>

            {/* 語音辨識分數 (WDS) */}
            <div className="speech-section">
                <h3 className="speech-title">語音辨識分數 (WDS)</h3>
                <div className="speech-content">
                    <p className="speech-item">
                        <span className="speech-label">施測音量：</span>
                        <span className="speech-value" style={{ color: speechValueColor }}>
                            {wrsData?.StimulusLevel || "未測驗"}{wrsData?.StimulusLevel ? " dB" : ""}
                        </span>
                    </p>
                    <p className="speech-item">
                        <span className="speech-label">測驗分數：</span>
                        <span className="speech-value" style={{ color: speechValueColor }}>
                            {wrsData?.ScorePercent || "未測驗"}{wrsData?.ScorePercent ? " %" : ""}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SpeechTest;