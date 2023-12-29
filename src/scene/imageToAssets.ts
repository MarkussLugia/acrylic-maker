import {
    Shape,
    ExtrudeGeometry,
    PlaneGeometry,
    Color,
    TextureLoader,
    EquirectangularReflectionMapping,
    MeshPhysicalMaterial,
    FrontSide,
    // BackSide,
    DoubleSide,
    DataTexture
} from "three";


// import { MeshPhysicalMaterialProps } from '@react-three/fiber'

import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { imageFileToPath, fileToDataURL } from "./imageToPath";


const textureLoader = new TextureLoader();
const texRGBELoader = new RGBELoader()

const mapEnvHDR = texRGBELoader.load('textures/hotel_room_1k.hdr', function () {
    mapEnvHDR.mapping = EquirectangularReflectionMapping;
});

const mapBackground = new Color("#ffffff")

export const cfgAcrylicTransmission = {
    transmissionSampler: false,
    // samples: 32,// { value: 10, min: 1, max: 32, step: 1 },
    transmissionMap: mapEnvHDR,
    background: mapBackground,
    backside: true,
    resolution: 600,// { value: 2048, min: 256, max: 2048, step: 256 },
    transmission: 1,// { value: 1, min: 0, max: 1 },
    roughness: 0.02,// { value: 0.0, min: 0, max: 1, step: 0.01 },
    thickness: 0.02,// { value: 3.5, min: 0, max: 10, step: 0.01 },
    ior: 1.8,// { value: 1.5, min: 1, max: 5, step: 0.01 },
    chromaticAberration: 0.75,// { value: 0.06, min: 0, max: 1 },
    anisotropy: 0.05,// { value: 0.1, min: 0, max: 1, step: 0.01 },
    distortion: 0.85,// { value: 0.0, min: 0, max: 1, step: 0.01 },
    distortionScale: 0.05,// { value: 0.3, min: 0.01, max: 1, step: 0.01 },
    temporalDistortion: 0,// { value: 0.5, min: 0, max: 1, step: 0.01 },
    clearcoat: 1,// { value: 1, min: 0, max: 1 },
    envMap: mapEnvHDR,
    envMapIntensity: 0.3,
    reflectivity: 1,
    attenuationDistance: 10,// { value: 0.5, min: 0, max: 10, step: 0.01 },
    attenuationColor: '#ffffff',
    color: 0xe0e0e0,
}

export const cfgAcrylicFront = {
    color: 0xffffff,
    transparent: true,
    opacity: 0.05,
    // envMap: mapEnvHDR,
    envMapIntensity: 0,
    side: FrontSide,
    depthTest: false,
};
export const cfgPrintDepth = {
    color: 0x483b30,
    // color: 0xffffff,
    transparent: true,
    opacity: 0,
    envMap: mapEnvHDR,
    envMapIntensity: 1,
    side: DoubleSide,
    depthTest: false,
};

export async function imageToThreeAssets(imageFile: File):Promise<AssetsBundle> {
    const basicSize = 300
    const strokeSize = 13

    const totalSize = basicSize + strokeSize * 2

    // create shape
    const shapeAcrylic = new Shape();
    const { start, path } = await imageFileToPath(imageFile, basicSize, strokeSize)
    console.log(Date.now(),"Path Ready");
    shapeAcrylic.moveTo(start[0] / totalSize - 0.5, start[1] / -totalSize + 0.5)
    for (const directive of path) {
        const { cp1x, cp1y, cp2x, cp2y, x, y } = directive
        shapeAcrylic.bezierCurveTo(
            cp1x / totalSize - 0.5,
            cp1y / -totalSize + 0.5,
            cp2x / totalSize - 0.5,
            cp2y / -totalSize + 0.5,
            x / totalSize - 0.5,
            y / -totalSize + 0.5
        )
    }

    // create print texture
    const cfgPrintPlane = {
        color: 0xffffff,
        map: textureLoader.load(await fileToDataURL(imageFile)),
        // specularIntensity: 0,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        reflectivity: 0.5,
        opacity: 1,
        transparent: true,
        // flatShading:true,
        side: DoubleSide,
        envMap: mapEnvHDR,
        envMapIntensity: 0.5,
        // precision: "highp",
        // dithering: true,
        // toneMapped: true,
        // depthTest: false,
    };

    // create print plane
    const geoPrintPlane = new PlaneGeometry(basicSize / totalSize, basicSize / totalSize)

    const geoAcrylic = new ExtrudeGeometry(shapeAcrylic,
        {
            depth: 0.04,
            bevelEnabled: true,
            bevelSize: 0.005,
            bevelThickness: 0.005,
            bevelSegments: 3
        }
    )

    const geoPrintDepth = new ExtrudeGeometry(shapeAcrylic,
        {
            depth: 0.001,
            bevelEnabled: false
        }
    );

    console.log(Date.now(),"Assets Ready");
    return {
        mapEnvHDR,
        mapBackground,

        shapeAcrylic,

        cfgPrintPlane,
        matPrintPlane:new MeshPhysicalMaterial(cfgPrintPlane),
        geoPrintPlane,

        cfgPrintDepth,
        matPrintDepth:new MeshPhysicalMaterial(cfgPrintDepth),
        geoPrintDepth,

        cfgAcrylicTransmission,
        cfgAcrylicFront,
        geoAcrylic
    }
}
declare global {
    interface AssetsBundle {
        mapEnvHDR: DataTexture,
        mapBackground: Color,

        shapeAcrylic: Shape,

        cfgPrintPlane: any,
        matPrintPlane: MeshPhysicalMaterial,
        geoPrintPlane: PlaneGeometry,

        cfgPrintDepth: any,
        matPrintDepth: MeshPhysicalMaterial,
        geoPrintDepth: ExtrudeGeometry,

        cfgAcrylicTransmission: any,
        cfgAcrylicFront: any,
        geoAcrylic: ExtrudeGeometry
    }
}
