// import { useState } from 'react'
import './App.css'
import { useRef, useState, useEffect } from "react";
import { SceneWrapper } from './scene/SceneWrapper';
import { fileToDataURL, imageFileToPath, urlToReadyImage } from './scene/imageToPath';
// import { DefaultLoadingManager } from 'three'
import { saveCanvas } from './saveCanvas';
import { SceneReadyContext } from './ReactContextBus';
import { RadioInput } from './RadioInput';

declare global {
  interface BezierDirective {
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number
  }
  interface BezierPath {
    start: number[],
    path: BezierDirective[]
  }
  interface PathData {
    bezierPath: BezierPath,
    basicSize: number,
    strokeSize: number
  }
  interface SceneRawData extends PathData {
    imageFile: File
  }
}

const basicSize = 360

const strokeOptions = [
  { name: "更窄", value: 11 },
  { name: "较窄", value: 13 },
  { name: "中等", value: 15 },
  { name: "较宽", value: 17 },
  { name: "更宽", value: 19 },
]

let targetCanvas: HTMLCanvasElement = document.createElement("canvas")

// 是，App的代码有点 呃 不好看
export function App() {

  const [strokeWidth, setStrokeWidth] = useState(15)
  function strokeWidthChange(value: number) {
    setStrokeWidth(value)
    createRawData(value)
  }

  const [sceneData, setSceneData] = useState<SceneRawData | null>(null)

  // 0选取图片 1生成中 2生成完毕 
  const [currentState, setCurrentState] = useState<0 | 1 | 2>(0)
  function sceneReadyListener() {
    if (currentState == 1) {
      setTimeout(() => {
        setCurrentState(2)
      }, 240);
    }
  }


  const fileSelector = useRef(null)
  function selectFile() {
    //@ts-ignore
    fileSelector.current!.click()
  }
  function createRawData(sWidth = strokeWidth) {
    const inputEl = fileSelector.current! as HTMLInputElement
    // console.log(Date.now(), "file loaded");
    if (inputEl.files) {
      const file = inputEl.files[0]
      imageFileToPath(file, basicSize, sWidth).then(res => {
        setSceneData({
          bezierPath: res,
          basicSize,
          strokeSize: sWidth,
          imageFile: file
        })
      })
    }
  }

  function setTargetCanvas(canvas: HTMLCanvasElement) {
    targetCanvas = canvas
  }

  function captureCanvasImage() {
    saveCanvas(targetCanvas)
  }

  function startProcess() {
    setCurrentState(1)
  }

  function goBack() {
    setCurrentState(0)
  }

  return (
    <>
      <div className="container">
        <div id='canvas-container'>
          <ImgPreviewWrapper hidden={currentState == 2}>
            {sceneData && <ImgPreview data={sceneData} />}
          </ImgPreviewWrapper>
          <SceneReadyContext.Provider value={sceneReadyListener}>
            <SceneWrapper
              sceneData={(sceneData && currentState != 0) ? sceneData : null}
              setTargetCanvas={setTargetCanvas}
            />
          </SceneReadyContext.Provider>
        </div>
        <div className='config-area'>
          <input style={{ display: 'none' }} type="file" accept='image/*' ref={fileSelector} onChange={() => createRawData()} />

          {(currentState == 0 || currentState == 1) && <div className='config-image'>
            <div className='config-title'>正在预览2D形状。</div>
            <div className='config-settings-title'>描边宽度：</div>
            <RadioInput options={strokeOptions} onChange={strokeWidthChange} defaultValue={strokeWidth} disabled={currentState != 0} />

          </div>}
          {(currentState == 2) && <div className='config-three'>
            <div className='config-title'>正在查看3D模型。</div>
            <div className='config-subtitle'>划动显示区域以旋转模型。</div>
          </div>}
        </div>
        <div className='control-area'>
          {(currentState == 0 || currentState == 1) && <div className='control-flex'>
            <div
              className={`control ${sceneData ? "nogrow" : "grow"} pick`}
              onClick={selectFile}
            >{sceneData ? "更换图片" : "选取图片"}</div>
            {(currentState == 0 && sceneData) && <div className='control grow generate' onClick={startProcess}>
              生成亚克力模型
            </div>}
            {(currentState == 1) && <div className='control grow generating'>
              正在生成...
            </div>}
          </div>}
          {(currentState == 2) && <div className='control-flex'>
            <div className='control nogrow pick' onClick={goBack}>返回</div>
            <div className='control grow generate' onClick={captureCanvasImage}>拍摄并保存图片</div>
          </div>}
        </div>
        <div className='bottom-area'>
          <div className='copyright'><div>©2023</div><div>MarkussLugia / Siltra</div></div>
          <a href="https://github.com/MarkussLugia/acrylic-maker" target='_blank' style={{ display: "block" }}>
            <img src="img/github-mark-white.svg" style={{ height: "27px", margin: "2px 2px 0" }} alt="GitHub" />
          </a>
        </div>
      </div>
    </>
  )
}

function ImgPreviewWrapper({ hidden, children }: { hidden: boolean, children: JSX.Element | null }) {
  return <div
    className={`preview-wrapper ${hidden && "active"}`}
    style={{ backgroundImage: `linear-gradient(to top, #eee 0%, #ddd 20%, #aaa 40%, #999 100%)` }}
  >
    <div className='preview-mask'>
      <img
        src="data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%221%22%20width%3D%221%22%20%2F%3E"
        style={{ height: "100%", opacity: 0 }}
      />
      <div className='preview-wrapper-grid-bg'
        style={{ backgroundImage: `url(img/bg-grid.svg)`, backgroundColor: "rgba(0,0,0,0.1)" }}
      ></div>
      <div className='preview-content'>
        {children}
      </div>
    </div>
  </div>
}


function ImgPreview({ data }: { data: SceneRawData }) {
  const { imageFile, basicSize, strokeSize } = data
  const fullSize = basicSize + strokeSize * 2
  const imagePercentage = 100 * basicSize / fullSize
  const offsetPercentage = 100 * strokeSize / fullSize

  const strokeCanvasRef = useRef(null)
  const imageCanvasRef = useRef(null)

  useEffect(() => {
    //@ts-ignore
    const strokeCanvas = strokeCanvasRef.current as HTMLCanvasElement
    //@ts-ignore
    const imageCanvas = imageCanvasRef.current as HTMLCanvasElement

    console.log("IPDraw");

    fileToDataURL(imageFile).then(res => {
      urlToReadyImage(res).then(fileImage => {
        imageCanvas.width = imageCanvas.width
        strokeCanvas.width = strokeCanvas.width
        const { width, height } = imageCanvas
        const context = imageCanvas.getContext("2d") as CanvasRenderingContext2D
        const { naturalWidth, naturalHeight } = fileImage
        const longerSide = naturalWidth > naturalHeight ? naturalWidth : naturalHeight
        const drawWidth = Math.ceil(naturalWidth * width / longerSide)
        const drawHeight = Math.ceil(naturalHeight * height / longerSide)
        const left = Math.floor((width - drawWidth) / 2)
        const top = Math.floor((height - drawHeight) / 2)
        context.drawImage(fileImage, left, top, drawWidth, drawHeight)

        const scaleRatio = width / fullSize
        const pathContext = strokeCanvas.getContext("2d") as CanvasRenderingContext2D
        const { start, path } = data.bezierPath
        pathContext.lineWidth = 16
        pathContext.moveTo(start[0] * scaleRatio, start[1] * scaleRatio)
        for (let index = 0; index < path.length; index++) {
          const direction = path[index];
          const { cp1x, cp1y, cp2x, cp2y, x, y } = direction
          pathContext.bezierCurveTo(cp1x * scaleRatio, cp1y * scaleRatio, cp2x * scaleRatio, cp2y * scaleRatio, x * scaleRatio, y * scaleRatio)
        }

        pathContext.closePath()
        pathContext.strokeStyle = "#b0b0b0"
        pathContext.stroke()
        pathContext.fillStyle = "#989898"
        pathContext.fill()
      })
    })
  }, [data])

  return <>
    <canvas
      className='preview-canvas stroke'
      width="1440"
      height="1440"
      style={{ width: "100%", height: "100%" }}
      ref={strokeCanvasRef}
    ></canvas>
    <canvas
      className='preview-canvas image'
      width="1440"
      height="1440"
      style={{ width: `${imagePercentage}%`, height: `${imagePercentage}%`, left: `${offsetPercentage}%`, top: `${offsetPercentage}%` }}
      ref={imageCanvasRef}
    ></canvas>
  </>
}
