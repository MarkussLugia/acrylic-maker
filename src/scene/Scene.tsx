import { Group, Euler, Texture, MeshPhysicalMaterial } from 'three'
import { Canvas } from '@react-three/fiber'
import { useRef, useEffect, useContext } from 'react'
import { MeshTransmissionMaterial, Environment } from '@react-three/drei'
import { SceneReadyContext } from '@/ReactContextBus'

interface SceneProps {
    setTargetCanvas?: (target: HTMLCanvasElement) => void,
    children: JSX.Element | null,
    dpr?: number
}

export function SceneCanvas({ children, dpr, setTargetCanvas }: SceneProps) {
    useEffect(() => {
        // console.log(Date.now(), "Canvas Ready");
        if (setTargetCanvas) setTargetCanvas(canvasRef.current as HTMLCanvasElement)
    })
    const canvasRef = useRef<HTMLCanvasElement>(null);
    return (
        <Canvas
            dpr={dpr || 1.25}
            camera={{ position: [0, 0.01, 1.75], fov: 35 }}
            frameloop="demand"
            gl={{ preserveDrawingBuffer: true }}
            ref={canvasRef}
        >
            {children}
            <pointLight color={0xffdfc0} intensity={54} position={[-4, 5, 2.5]} />
            <pointLight color={0xffd8c0} intensity={60} position={[4, -2, 4]} />
            <pointLight color={0xffdfc0} intensity={54} position={[-2, -7.5, 1.5]} />
        </Canvas>
    )
}

interface SceneContentProps {
    setTargetEuler?: (target: Euler) => void,
    setTargetMaterialLight?: (target: MeshPhysicalMaterial) => void,
    setTargetMaterialHeavy?: (target: MeshPhysicalMaterial) => void,
    assets: AssetsBundle
}

export function SceneContent({ assets, setTargetEuler, setTargetMaterialHeavy, setTargetMaterialLight }: SceneContentProps) {
    const readyListener = useContext(SceneReadyContext)
    const texPrintPlane = assets.matPrintPlane
    const texPrintDepth = assets.matPrintDepth
    const rotationGroupRef = useRef<Group>(null);
    useEffect(() => {
        // console.log(Date.now(), "Content Ready");
        if (setTargetEuler) setTargetEuler(rotationGroupRef.current!.rotation)
        if (setTargetMaterialLight) setTargetMaterialLight(texPrintPlane)
        if (setTargetMaterialHeavy) setTargetMaterialHeavy(texPrintDepth)
    })
    return <>
        <group ref={rotationGroupRef} dispose={null} position={[0, 0, 0.025]}>
            <group position={[0, 0, -0.025]}>
                <mesh geometry={assets.geoAcrylic}>
                    <MeshTransmissionMaterial {...assets.cfgAcrylicTransmission} />
                </mesh>
                <mesh
                    renderOrder={-100}
                    geometry={assets.geoAcrylic}
                    onUpdate={readyListener}
                >
                    <meshPhysicalMaterial {...assets.cfgAcrylicFront} />
                </mesh>
            </group>
            <group position={[0, 0, -0.01]}>
                <mesh
                    position={[0, 0, -0.0005]}
                    renderOrder={-10}
                    geometry={assets.geoPrintDepth}
                    material={texPrintDepth}
                />
                <mesh
                    position={[0, 0, 0]}
                    geometry={assets.geoPrintPlane}
                    material={texPrintPlane}
                />
            </group>
        </group>
        <Environment map={assets.mapEnvHDR} background={assets.mapBackground instanceof Texture} blur={0.5} />
    </>
}