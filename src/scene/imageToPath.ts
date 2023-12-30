import { BitMatrix } from '@/modules/MiraX/src/PixelMatrix'
import { tracePath } from '@/modules/MiraX/src/PixelTrace'

export async function imageFileToPath(file: File, basicSize = 384, strokeWidth = 16): Promise<BezierPath> {
    const basicCanvas = new OffscreenCanvas(basicSize, basicSize)

    const fileData = await fileToDataURL(file)
    const fileImage = await urlToReadyImage(fileData)

    const { width, height } = basicCanvas
    const context = basicCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    const { naturalWidth, naturalHeight } = fileImage
    const longerSide = naturalWidth > naturalHeight ? naturalWidth : naturalHeight
    const drawWidth = Math.ceil(naturalWidth * width / longerSide)
    const drawHeight = Math.ceil(naturalHeight * height / longerSide)
    const left = Math.floor((width - drawWidth) / 2)
    const top = Math.floor((height - drawHeight) / 2)
    // const top = height - drawHeight
    context.drawImage(fileImage, left, top, drawWidth, drawHeight)
    const imageData = context?.getImageData(0, 0, width, height)
    const imageMatrix = new BitMatrix(imageData as ImageData)
    imageMatrix.extend(strokeWidth)
        .stroke(strokeWidth)
        .smooth3()
        .smooth5()
        .smooth5()
    return tracePath(imageMatrix.data)
}

export function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
    })
}

type Image = HTMLImageElement
export function urlToReadyImage(url: string): Promise<Image> {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            resolve(img)
        }
        img.src = url
    })
}