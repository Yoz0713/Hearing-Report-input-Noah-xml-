import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

// 自定義文字標記用的函數
const customChar = (char, color) => {
  return (ctx) => {
    const { x, y } = ctx;
    const size = 14;
    ctx.save();
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(char, x, y);
    ctx.restore();
  };
};

const markerMap = {
  AirConductorRight: {
    normal: 'circle',
    masked: 'triangle',
    color: 'red',
    borderColor: 'red',
    backgroundColor: 'transparent',
    lineStyle: 'solid'
  },
  AirConductorLeft: {
    normal: 'crossRot',
    masked: 'rectRot',
    color: 'blue',
    borderColor: 'blue',
    backgroundColor: 'transparent',
    lineStyle: 'solid'
  },
  BoneConductorRight: {
    normal: customChar('<', 'red'),
    masked: customChar('[', 'red'),
    color: 'red',
    borderColor: 'red',
    backgroundColor: 'transparent',
    lineStyle: 'dashed'
  },
  BoneConductorLeft: {
    normal: customChar('>', 'blue'),
    masked: customChar(']', 'blue'),
    color: 'blue',
    borderColor: 'blue',
    backgroundColor: 'transparent',
    lineStyle: 'dashed'
  }
};

const sortByFreq = (a, b) => Number(a.StimulusFrequency) - Number(b.StimulusFrequency);

const getPTA = (earTypes, dataSet, targetFrequencies) => {
  const earData = dataSet.find(
    (item) =>
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

const calculateHearingImpairment = (dataSet, age) => {
  if (!Array.isArray(dataSet)) {
    console.error("Invalid dataSet: Expected an array but got", dataSet);
    return null;
  }

  const targetFrequencies = ['500', '1000', '2000', '4000'];

  const rightPTA = getPTA(['AirConductorRight', 'InsertPhoneRight'], dataSet, targetFrequencies);
  const leftPTA = getPTA(['AirConductorLeft', 'InsertPhoneLeft'], dataSet, targetFrequencies);

  if (rightPTA === null || leftPTA === null) return null;

  const calcPercent = (pta) => Math.max(0, Math.min(((pta - 25) * 1.5), 100));

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
    qualified
  };
};

const PureTone = ({ toneData, patientAge = 60 }) => {
  const [editableType, setEditableType] = useState('AirConductorRight');
  const [dataSet, setDataSet] = useState(toneData);

  const frequencies = ['125', '250', '500', '750', '1000', '1500', '2000', '3000', '4000', '6000', '8000'];

  const buildChartData = () => {
    const datasets = [];

    dataSet.forEach((item, datasetIndex) => {
      const { StimulusSignalOutput } = item.AudMeasurementConditions;

      const normalizedOutput = StimulusSignalOutput.replace('InsertPhone', 'AirConductor');
      const marker = markerMap[normalizedOutput];
      if (!marker) return;

      const points = [...item.TonePoints]
        .sort(sortByFreq)
        .map((tp, index) => ({
          x: tp.StimulusFrequency,
          y: Number(tp.StimulusLevel),
          pointStyle: tp.MaskingFrequency ? marker.masked : marker.normal,
          backgroundColor: marker.backgroundColor ?? marker.color,
          borderColor: marker.borderColor,
          radius: 10,
          index: index,
          datasetIndex: datasetIndex
        }));

      datasets.push({
        label: StimulusSignalOutput,
        data: points,
        borderColor: marker.color,
        borderWidth: 2,
        pointRadius: 10,
        tension: 0,
        borderDash: marker.lineStyle === 'dashed' ? [5, 5] : [],
        showLine: true,
        segment: {
          borderDash: marker.lineStyle === 'dashed' ? [5, 5] : [],
          borderWidth: 2,
          borderColor: marker.color,
          draw: (ctx, { p0, p1 }) => {
          const dx = p1.x - p0.x;
          const dy = p1.y - p0.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const markerRadius = 10; // 標記半徑
          const gap = 10; // 標記外圍間距
          const totalOffset = markerRadius + gap;
          
          if (distance > totalOffset * 2) {
            // 計算單位向量
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            // 計算起點和終點偏移後的座標
            const startX = p0.x + unitX * totalOffset;
            const startY = p0.y + unitY * totalOffset;
            const endX = p1.x - unitX * totalOffset;
            const endY = p1.y - unitY * totalOffset;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
          }
        }
      });
    });

    return { datasets };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    plugins: {
      legend: null
    },
    scales: {
      x: {
        type: 'category',
        labels: frequencies,
        title: {
          display: true,
          text: '頻率 (Hz)'
        },
        ticks: {
          callback: (val, index) => frequencies[index],
        },
        grid: {
          drawOnChartArea: true
        }
      },
      y: {
        title: {
          display: true,
          text: '音量 (dB HL)'
        },
        ticks: {
          stepSize: 10
        },
        min: 0,
        max: 120,
        reverse: true,
        grid: {
          drawOnChartArea: true
        }
      }
    },
    onClick: (event, elements, chart) => {
      const points = chart.getElementsAtEventForMode(event.native, 'nearest', { intersect: true }, true);
      if (points.length > 0) {
        const { datasetIndex, index } = points[0];
        const selectedDataset = dataSet[datasetIndex];

        const isEditable = selectedDataset.AudMeasurementConditions.StimulusSignalOutput === editableType;
        if (!isEditable) return;

        const newLevel = prompt('Enter new StimulusLevel (dB HL):');
        if (newLevel !== null && !isNaN(Number(newLevel))) {
          const updatedTonePoints = [...selectedDataset.TonePoints];
          updatedTonePoints[index].StimulusLevel = Number(newLevel);

          const updatedDataSet = [...dataSet];
          updatedDataSet[datasetIndex] = {
            ...selectedDataset,
            TonePoints: updatedTonePoints
          };
          setDataSet(updatedDataSet);
        }
      }
    }
  };

  const result = calculateHearingImpairment(dataSet, patientAge);

  return (
    <div className='pta-section' style={{ width: '100%'}}>
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
      <div className='pta-container'>
        <div className='pta-chart'>
          <Line data={buildChartData()} options={options}/>
        </div>
        <div className='pta-summary'>
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
