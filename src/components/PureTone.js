import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

// 圖片對應表

//藍色=#0B4CFF 紅色=#FF0B0B
const markerMap = {
  AirConductorRight: {
    normal: '/icons/circle.png',
    masked: '/icons/maskedRight.png',
  },
  AirConductorLeft: {
    normal: '/icons/crossrot.png',
    masked: '/icons/maskedLeft.png',
  },
  BoneConductorRight: {
    normal: '/icons/boneRight.png',
    masked: '/icons/maskedBoneRight.png',
  },
  BoneConductorLeft: {
    normal: '/icons/boneLeft.png',
    masked: '/icons/maskedBoneLeft.png',
  },
};

const calculateHearingImpairment = (dataSet, age) => {
  const targetFrequencies = ['500', '1000', '2000', '4000'];
  const getPTA = (earTypes) => {
    const earData = dataSet.find((item) =>
      earTypes.includes(item.AudMeasurementConditions.StimulusSignalOutput)
    );
    if (!earData) return null;
    const tones = earData.TonePoints.filter((tp) =>
      targetFrequencies.includes(tp.StimulusFrequency)
    );
    if (tones.length < 4) return null;
    const total = tones.reduce((sum, tp) => sum + Number(tp.StimulusLevel), 0);
    return total / 4;
  };

  const rightPTA = getPTA(['AirConductorRight', 'InsertPhoneRight']);
  const leftPTA = getPTA(['AirConductorLeft', 'InsertPhoneLeft']);
  if (rightPTA === null || leftPTA === null) return null;

  const calcPercent = (pta) => Math.max(0, Math.min((pta - 25) * 1.5, 100));
  const rightPercent = calcPercent(rightPTA);
  const leftPercent = calcPercent(leftPTA);
  const better = Math.min(rightPercent, leftPercent);
  const worse = Math.max(rightPercent, leftPercent);
  const totalPercent = ((better * 5) + worse) / 6;
  const qualified = age < 6 ? totalPercent >= 22.5 : totalPercent >= 45.0;

  return {
    rightPTA,
    leftPTA,
    rightPercent,
    leftPercent,
    totalPercent: Number(totalPercent.toFixed(1)),
    qualified,
  };
};

const PureTone = ({ toneData, patientAge = 60 }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [editableType, setEditableType] = useState('AirConductorRight');
  const [dataSet, setDataSet] = useState(toneData);

  const frequencies = ['125', '250', '500', '750', '1000', '1500', '2000', '3000', '4000', '6000', '8000'];

  const createResizedImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 24, 24);
        resolve(canvas); // 直接返回 canvas 元素
      };
      img.src = window.location.origin + src;
    });
  };

  useEffect(() => {
    if (!chartRef.current) {
      console.error('❌ Chart ref is null');
      return;
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) {
      console.error('❌ Canvas context is null');
      return;
    }
  
    const loadImages = async () => {
      console.log('🔄 開始載入所有圖片...');
      const images = {};
      const imagePromises = [];
      
      // 準備所有圖片載入的 Promise
      for (const key in markerMap) {
        const normalPromise = createResizedImage(markerMap[key].normal, 24)
          .then(img => {
            if (!images[key]) images[key] = {};
            images[key].normal = img;
            return img;
          })
          .catch(err => {
            console.warn(`⚠️ 無法載入 ${key} normal 圖片:`, err);
            return null;
          });
          
        const maskedPromise = createResizedImage(markerMap[key].masked, 24)
          .then(img => {
            if (!images[key]) images[key] = {};
            images[key].masked = img;
            return img;
          })
          .catch(err => {
            console.warn(`⚠️ 無法載入 ${key} masked 圖片:`, err);
            return null;
          });
          
        imagePromises.push(normalPromise, maskedPromise);
      }
      
      // 等待所有圖片載入完成
      await Promise.all(imagePromises);
      console.log('✅ 所有圖片載入完成', images);
      return images;
    };
  
    loadImages().then((images) => {
      if (!toneData || toneData.length === 0) {
        console.error('❌ toneData 為空');
        return;
      }
      
      console.log('🔄 準備創建圖表數據集...');
  
      const datasets = dataSet.map((item) => {
        const { StimulusSignalOutput } = item.AudMeasurementConditions;
        const normalizedOutput = StimulusSignalOutput.replace('InsertPhone', 'AirConductor');
        const marker = images[normalizedOutput];
        
        // 計算實際偏移量（使用固定像素值而不是相對值）
        const offset = 0.4; // 使用較小的固定偏移量

        // 先定義頻率映射表，用於確保正確的排序和位置
        const frequencyMap = {
          '125': 0,
          '250': 1,
          '500': 2,
          '750': 3,
          '1000': 4,
          '1500': 5,
          '2000': 6,
          '3000': 7,
          '4000': 8,
          '6000': 9,
          '8000': 10
        };
      
        // 在 datasets.map 中修改排序邏輯
        const sortedPoints = [...item.TonePoints].sort((a, b) => {
          const indexA = frequencyMap[a.StimulusFrequency];
          const indexB = frequencyMap[b.StimulusFrequency];
          return indexA - indexB;
        });
      
        const points = sortedPoints.map((tp) => {
          const freqIndex = frequencyMap[tp.StimulusFrequency];
          if (freqIndex === undefined) {
            console.warn(`未找到頻率對應的索引: ${tp.StimulusFrequency}`);
            return null;
          }
      
          let xPos = freqIndex;
          // 只對骨導聽力進行偏移
          if (StimulusSignalOutput.includes('BoneConductor')) {
            if (StimulusSignalOutput.includes('Right')) {
              xPos -= offset;
            } else if (StimulusSignalOutput.includes('Left')) {
              xPos += offset;
            }
          }
      
          return {
            x: xPos,
            originalX: freqIndex,
            y: Number(tp.StimulusLevel),
            masked: tp.MaskingFrequency ? true : false,
            frequency: tp.StimulusFrequency // 保存原始頻率值
          };
        }).filter(Boolean); // 過濾掉無效的點
      
        return {
          label: StimulusSignalOutput,
          data: points,
          borderColor: StimulusSignalOutput.includes('Right') ? '#FF0B0B' : '#0B4CFF',
          borderDash: StimulusSignalOutput.includes('BoneConductor') ?[10,10] : [], // 設置骨導為虛線
          borderWidth: 2,
          tension: 0,
          pointRadius: 8,
          pointHoverRadius: 10,
          showLine: true,
          segment: {
            borderWidth: 2,
            borderColor: context => {
              const ctx = context.chart.ctx;
              const prevPoint = context.p0;
              const currPoint = context.p1;
              
              // 創建正確方向的漸變
              const gradient = ctx.createLinearGradient(
                prevPoint.x,
                prevPoint.y,
                currPoint.x,
                currPoint.y
              );
          
              // 設置漸變的起始和結束位置
              const offset = 0.16; // 保持原來的偏移量
              const transitionSpeed = 0.00001; // 設置更小的過渡區間，讓變化更快
              const color = context.p0.options.borderColor;
              
              // 設置更極端的漸變效果
              gradient.addColorStop(0, 'transparent');
              gradient.addColorStop(offset - transitionSpeed, 'transparent');
              gradient.addColorStop(offset, color); // 瞬間變成實色
              gradient.addColorStop(1 - offset, color); // 保持實色
              gradient.addColorStop(1 - offset + transitionSpeed, 'transparent');
              gradient.addColorStop(1, 'transparent');
              
              return gradient;
            }
          }
        };
      });
  
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
  
      console.log('🔄 創建圖表...');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: frequencies,
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false }
          },
          elements: {
            line: {
              tension: 0, // 使用直線
              capBezierPoints: false // 確保線段不會超出端點
            },
            point: {
              pointStyle: function(context) {
                const { datasetIndex, dataIndex } = context;
                const dataset = context.chart.data.datasets[datasetIndex];
                const point = dataset.data[dataIndex];
                const output = dataset.label;
                const marker = images[output.replace('InsertPhone', 'AirConductor')];
                
                if (!marker) {
                  console.warn(`No marker found for ${output}`);
                  return 'circle';
                }
                
                return point.masked ? marker.masked : marker.normal;
              },
              hitRadius: 10, // 增加點的可點擊區域
              radius: 8
            }
          },
          scales: {
            x: {
              type: 'linear',
              title: { display: true, text: '頻率 (Hz)' },
              ticks: {
                callback: (value) => {
                  const index = Math.round(value);
                  return frequencies[index] || '';
                },
                stepSize: 1,
                autoSkip: false
              },
              grid: {
                drawOnChartArea: true,
                drawTicks: true
              },
              min: 0,
              max: frequencies.length ,
              offset: true // 確保刻度線對齊
            },
            y: {
              title: { display: true, text: '音量 (dB HL)' },
              ticks: { stepSize: 10 },
              min: -10,
              max: 120,
              reverse: true,
              grid: { drawOnChartArea: true },
            },
          },
        },
      });
      console.log('✅ 圖表創建完成');
    });
  
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [dataSet]);

  const result = calculateHearingImpairment(dataSet, patientAge);

  return (
    <div className="pta-section" style={{ width: '100%' }}>
      <h2>純音聽力圖（PureTone Audiogram）</h2>

      <label>選擇可調整標記類型：</label>
      <select
        value={editableType}
        onChange={(e) => setEditableType(e.target.value)}
        style={{ marginBottom: '20px', padding: '5px' }}
      >
        <option value="AirConductorRight">AirConductorRight</option>
        <option value="AirConductorLeft">AirConductorLeft</option>
        <option value="BoneConductorRight">BoneConductorRight</option>
        <option value="BoneConductorLeft">BoneConductorLeft</option>
      </select>

      {/* Chart 區塊 */}
      <div className="pta-container">
        <div className="pta-chart">
          <canvas ref={chartRef} width="600" height="400"></canvas>
        </div>
        <div className="pta-summary">
          {result && (
            <div className="pta-summary-results">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>項目</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>左耳</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>右耳</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>PTA (dB)</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{result.leftPTA.toFixed(1)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{result.rightPTA.toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>障礙比率 (%)</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{result.leftPercent.toFixed(1)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{result.rightPercent.toFixed(1)}</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>雙耳障礙比率 (%)</td>
                    <td colSpan="2" style={{ border: '1px solid #ccc', padding: '8px' }}>
                      <strong>{result.totalPercent}%</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {result.qualified ? '✅ 符合申請殘障手冊資格' : '❌ 未達到申請標準'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PureTone;
