// import { useState } from 'react'
import './App.css'
import { SceneWrapper } from './scene/SceneWrapper';
import { useRef, useState } from "react";
import { DefaultLoadingManager } from 'three'

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

  const [isReady, setIsReady] = useState(false)
  const [progress, setProgress] = useState(10)
  const [targetX, setTargetX] = useState(0.26)
  const [targetY, setTargetY] = useState(0.55)

  const [file, setFile] = useState<File | null>(null)
  const fileSelector = useRef(null)

  function inputFile() {
    const inputEl = fileSelector.current! as HTMLInputElement
    console.log(Date.now(),"file loaded");
    if (inputEl.files) setFile(inputEl.files[0])
  }
  
  return (
    <>
      <div className="container">
        <div id='container-inner'>
          <div id='canvas-container'>
            <div>
              {file && <SceneWrapper targetX={targetX} targetY={targetY} imageFile={file} />}
            </div>
          </div>
          <div className='file-selector'>
            <input type="file" accept='image/*' ref={fileSelector} onChange={() => inputFile()} />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
