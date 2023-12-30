const linkEl = document.createElement("a")

export function saveCanvas(canvas: HTMLCanvasElement) {
    const canvasData = canvas.toDataURL()
    const fileName = `acrylic-${getTimeString()}.png`
    const imageFile = dataURLtoFile(canvasData, fileName)
    linkEl.href = URL.createObjectURL(imageFile)
    linkEl.download = fileName
    linkEl.click()
    return canvasData
}

function dataURLtoFile(dataurl: string, filename: string) {
    let arr = dataurl.split(','),
        // @ts-ignore
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

function getTimeString() {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = now.getMonth().toString().padStart(2, "0")
    const date = now.getDate().toString().padStart(2, "0")
    const hour = now.getHours().toString().padStart(2, "0")
    const minute = now.getMinutes().toString().padStart(2, "0")
    const second = now.getSeconds().toString().padStart(2, "0")
    return `${year + month + date}-${hour + minute + second}`
}
