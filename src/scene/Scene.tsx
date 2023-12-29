import { Group, Euler, Texture, MeshPhysicalMaterial } from 'three'
import { Canvas } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { MeshTransmissionMaterial, Environment } from '@react-three/drei'

interface SceneProps {
    children: JSX.Element | null,
    dpr?: number
}

export function SceneCanvas({ children, dpr }: SceneProps) {
    // useEffect(() => {
    //     console.log(Date.now(), "Canvas Ready");
    // })

    return (
        <Canvas
            dpr={dpr || 1.25}
            camera={{ position: [0, 0, 2], fov: 35 }}
            frameloop="demand"
        >
            {children}
            <pointLight color={0xfff8f0} intensity={500} position={[-8, 10, 5]} />
            <pointLight color={0xf0edff} intensity={300} position={[8, -4, 8]} />
            <pointLight color={0xfff8e0} intensity={400} position={[-4, -15, 3]} />
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
        <Environment map={assets.mapEnvHDR} background={assets.mapBackground instanceof Texture} blur={1} />
    </>
}