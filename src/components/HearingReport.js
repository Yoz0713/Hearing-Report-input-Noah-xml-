import React from "react";
import SpeechTest from "./SpeechTest";
import "../scss/components/_hearingReport.scss";
import Impedance from "./Impedance";
import PureTone from "./PureTone";
const HearingReport = ({ onReset, data }) => {
    const getAge = (birthDateStr) => {
        const today = new Date();
        const birthDate = new Date(birthDateStr);
      
        let age = today.getFullYear() - birthDate.getFullYear();
      
        // 若今年還沒過生日，要扣 1 歲
        const hasBirthdayPassed =
          today.getMonth() > birthDate.getMonth() ||
          (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
      
        if (!hasBirthdayPassed) {
          age--;
        }
      
        return age;
      }
    return (
        <div id="Wrap">
            {/* Main Content */}
            <main id="Center" role="main">
                <div id="Content">
                    <form id="MainForm">
                        {/* 客戶基本資料 */}
                        <div className="FormGroupWarp">
    <fieldset className="FormGroup FormElmt">
        <legend className="form_group_title"><span>客戶基本資料</span></legend>
        <div className="FrameStl2 horizontal">
            <div className="frame_block">
                <div className="label">客戶姓名：</div>
                <div className="value">{data?.patientName || "未提供"}</div>
            </div>
            <div className="frame_block">
                <div className="label">客戶生日：</div>
                <div className="value">{data?.birth || "未提供"}</div>
            </div>
            <div className="frame_block">
                <div className="label">檢查日期：</div>
                <div className="value">{data?.testDate || "未提供"}</div>
            </div>
            <div className="frame_block">
                <div className="label">店名：</div>
                <div className="value">{data?.storeName || "未提供"}</div>
            </div>
        </div>
    </fieldset>
</div>

                        {/* 中耳鼓室圖檢查 */}
                        <div className="FormGroupWarp">
                            <fieldset className="FormGroup FormElmt">
                                <legend className="form_group_title"><span>中耳鼓室圖檢查</span></legend>
                                <div className="FrameStl2"　>
                                    <div className="frame_block">
                                        <div className="legend" style={{color:"#008cd7",margin:"0 0 20px"}}>左耳</div>
                                        <Impedance data={data.impedance} ear={"left"}/>
                                    </div>
                                    <div className="frame_block">
                                        <div className="legend"  style={{color:"red",margin:"0 0 20px"}}>右耳</div>
                                        <Impedance data={data.impedance} ear={"right"}/>
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        {/* 純音聽力檢查 */}
                        <div className="FormGroupWarp PTAWrap">
                            <fieldset className="FormGroup FormElmt">
                                <legend className="form_group_title"><span>純音聽力檢查</span></legend>
                              <PureTone toneData={data.audiogram?.["pt:PublicData"]?.HIMSAAudiometricStandard?.ToneThresholdAudiogram} patientAge={getAge(data?.birth)}/>
                            </fieldset>
                        </div>

                        {/* 言語聽力檢查 */}
                        <div className="FormGroupWarp">
                            <fieldset className="FormGroup FormElmt">
                                <legend className="form_group_title"><span>言語聽力檢查</span></legend>
                                <div className="FrameStl2">
                                    <div className="frame_block">
                                        <div className="legend">左耳</div>
                                     <SpeechTest data={data.audiogram?.['pt:PublicData']?.['HIMSAAudiometricStandard']} ear={"left"}/>
                                    </div>
                                    <div className="frame_block">
                                        <div className="legend">右耳</div>
                                        <SpeechTest data={data.audiogram?.['pt:PublicData']?.['HIMSAAudiometricStandard']} ear={"right"}/>
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        {/* 提交按鈕 */}
                        <div className="BtnCommon large">
                        <button
                                type="button"
                                className="reset"
                                onClick={onReset}
                            >
                                <span>清除重填</span>
                            </button>
                            <button className="submit">
                                <span>列印報告</span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer id="Footer" role="contentinfo">
                <div>© 2023 大樹醫藥股份有限公司</div>
            </footer>
        </div>
    );
};

export default HearingReport;
