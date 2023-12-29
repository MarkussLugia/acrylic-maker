import { Euler, MeshPhysicalMaterial } from 'three'
import { invalidate } from '@react-three/fiber'
import { SceneCanvas, SceneContent } from "./Scene"
import { useEffect, useState } from 'react'
import { imageToThreeAssets } from './imageToAssets'

import {
    calcEase,
    calcOpacity,
    calcAlignDegs
} from "./calculations"

interface RotationWrapperProps {
    targetX?: number,
    targetY?: number,
    imageFile: File
}

let isDown = false
let isOverride = false
let isFirstFrameSet = false
let lastX = 0
let lastY = 0
let targetX = 0
let targetY = 0
let multiplier = 0.01
let lastAnimate = Date.now()


let targetEuler: Euler | undefined = undefined
let targetLightM: MeshPhysicalMaterial | undefined = undefined
let targetHeavyM: MeshPhysicalMaterial | undefined = undefined

export function SceneWrapper(props: RotationWrapperProps) {

    function setTargetEuler(target: Euler) {
        targetEuler = target
    }
    function setTargetMaterialLight(target: MeshPhysicalMaterial) {
        targetLightM = target
    }
    function setTargetMaterialHeavy(target: MeshPhysicalMaterial) {
        targetHeavyM = target
    }

    function animate() {
        let msNow = Date.now()
        let msDelta = msNow - lastAnimate
        lastAnimate = msNow

        if (targetEuler) {
            if (!isFirstFrameSet) {
                targetEuler.x = targetX;
                targetEuler.y = targetY;
                isFirstFrameSet = true;
                return;
            }
            if (targetX == targetEuler.x && targetY == targetEuler.y) return;

            let speedArg = msDelta / (1000 / 60) //以60帧为基准速度
            if (speedArg > 3) speedArg = 3
            if (speedArg < 0) speedArg = 0

            let deltaX = calcEase(targetX - targetEuler.x) * speedArg;
            let deltaY = calcEase(targetY - targetEuler.y) * speedArg;
            targetEuler.x = ((deltaX < 0.00001 && deltaX > -0.00001) ? targetX : targetEuler.x + deltaX)
            targetEuler.y = ((deltaY < 0.00001 && deltaY > -0.00001) ? targetY : targetEuler.y + deltaY)
            let dx = calcAlignDegs(targetEuler.x + Math.PI / 2);
            let dy = calcAlignDegs(targetEuler.y + Math.PI / 2);
            dx = dx > 1 ? 1 : dx;
            dy = dy > 1 ? 1 : dy;
            // let closeD = dx < dy ? dx : dy;
            let closeD = dx * dy;
            const opacity = calcOpacity(closeD);
            if (targetLightM) {
                targetLightM.opacity = opacity[0];
            }
            if (targetHeavyM) {
                targetHeavyM.opacity = opacity[1] * 0.4;
            }
            invalidate()
        }
    }

    function dragStartHandler(e: any) {
        e.preventDefault();

        isDown = true;
        isOverride = true;
        let rect = e.target.getBoundingClientRect()
        multiplier = 6 / (rect.width < rect.height ? rect.width : rect.height)

        let target = e;
        if (typeof e.clientX != "number") {
            target = e.changedTouches[0];
        }
        lastX = target.clientX;
        lastY = target.clientY;
        setDpr(1)
        invalidate()
        setTimeout(() => { invalidate }, 200)
    }

    function dragOnHandler(e: any) {
        e.preventDefault();
        e.stopPropagation()
        isOverride = true;
        if (isDown) {
            let target = e;
            if (typeof e.clientX != "number") {
                target = e.changedTouches[0];
            }
            targetY += (target.clientX - lastX) * multiplier;
            targetX += (target.clientY - lastY) * multiplier;

            lastX = target.clientX;
            lastY = target.clientY;
        }
    }

    function dragEndHandler() {
        isDown = false;
        setDpr(4)
        invalidate()
    }

    useEffect(() => {
        console.log(Date.now(), "Wrapper Ready");
        window.screenAnimateFunction = animate
        if (!isOverride) {
            if (typeof props.targetX == "number") {
                targetX = props.targetX
            }
            if (typeof props.targetY == "number") {
                targetY = props.targetY
            }
        }
    })

    const [dpr, setDpr] = useState(1)
    const [assets, setAssets] = useState<AssetsBundle | null>(null)

    useEffect(() => {
        imageToThreeAssets(props.imageFile)
            .then(res => setAssets(res))
    }, [props.imageFile])

    return <div
        style={{ width: "100%", height: "100%", touchAction: "none" }}
        onMouseDown={dragStartHandler}
        onTouchStart={dragStartHandler}
        onMouseMove={dragOnHandler}
        onTouchMove={dragOnHandler}
        onBlur={dragEndHandler}
        onMouseLeave={dragEndHandler}
        onMouseUp={dragEndHandler}
        onTouchEnd={dragEndHandler}
    >
        <SceneCanvas dpr={dpr}>
            {assets && <SceneContent
                setTargetEuler={setTargetEuler}
                setTargetMaterialLight={setTargetMaterialLight}
                setTargetMaterialHeavy={setTargetMaterialHeavy}
                assets={assets}
            />}
        </SceneCanvas>
    </div>

}