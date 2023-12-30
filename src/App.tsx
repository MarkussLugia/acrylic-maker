// import { useState } from 'react'
import './App.css'
import { useRef, useState, useEffect } from "react";
import { SceneWrapper } from './scene/SceneWrapper';
import { fileToDataURL, imageFileToPath, urlToReadyImage } from './scene/imageToPath';
// import { DefaultLoadingManager } from 'three'
import { saveCanvas } from './saveCanvas';
import { SceneReadyContext } from './ReactContextBus';
import bgTransparentGrid from '@/assets/bg-grid.svg'

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
type StrokeSize = "thin" | "small" | "medium" | "large" | "broad"
const strokeSizeIndex = {
  thin: 11,
  small: 13,
  medium: 15,
  large: 17,
  broad: 19,
}

let targetCanvas: HTMLCanvasElement = document.createElement("canvas")

export function App() {

  // const manager = DefaultLoadingManager;
  // manager.onLoad = () => {
  //   setTimeout(() => {
  //     setTimeout(() => {
  //       setTargetX(0.34)
  //       setTargetY(0.9)
  //     }, 1600);
  //     setTimeout(() => {
  //       setTargetX(0.26)
  //       setTargetY(0.55)
  //     }, 2700);
  //     setIsReady(true)
  //   }, 800);
  // };
  // manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  //   url;
  //   let width = 10;
  //   width += (itemsLoaded / itemsTotal) * 90;
  //   setProgress(width)
  // };

  // const [isReady, setIsReady] = useState(false)
  // const [progress, setProgress] = useState(10)
  // const [targetX, setTargetX] = useState(0.26)
  // const [targetY, setTargetY] = useState(0.55)

  // const [strokeWidth, setStrokeWidth] = useState<StrokeSize>("medium")
  const strokeWidth: StrokeSize = "medium"
  const [sceneData, setSceneData] = useState<SceneRawData | null>(null)

  // 0选取图片 1生成中 2生成完毕 
  const [currentState, setCurrentState] = useState<0 | 1 | 2>(0)
  function sceneReadyListener() {
    if (currentState == 1) {
      setTimeout(() => {
        setCurrentState(2)
      }, 200);
    }
  }


  const fileSelector = useRef(null)
  function inputFile() {
    const inputEl = fileSelector.current! as HTMLInputElement
    console.log(Date.now(), "file loaded");
    if (inputEl.files) {
      const file = inputEl.files[0]
      const strokeWidthTemp = strokeSizeIndex[strokeWidth]
      imageFileToPath(file, basicSize, strokeWidthTemp).then(res => {
        setSceneData({
          bezierPath: res,
          basicSize,
          strokeSize: strokeWidthTemp,
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
          <div className='file-selector'>
            <input type="file" accept='image/*' ref={fileSelector} onChange={() => inputFile()} />
          </div>
          <div onClick={captureCanvasImage}>拍摄</div>
          <div onClick={startProcess}>开始</div>
        </div>
        <div className='control-area'>
        </div>
        <div className='bottom-area'>
          <div>©2023 MarkussLugia / Siltra</div>
          <div><a href="">GitHub</a></div>
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
        style={{ backgroundImage: `url(${bgTransparentGrid})`, backgroundColor: "rgba(0,0,0,0.1)" }}
      ></div>
      <div className='preview-content'>
        {children}
      </div>
    </div>
  </div>
}


function ImgPreview({ data }: { data: SceneRawData }) {
  const { imageFile, basicSize, strokeSize, bezierPath } = data
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

    fileToDataURL(imageFile).then(res => {
      urlToReadyImage(res).then(fileImage => {
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
        const { start, path } = bezierPath
        const pathContext = strokeCanvas.getContext("2d") as CanvasRenderingContext2D
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
