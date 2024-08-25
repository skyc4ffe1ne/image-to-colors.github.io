import { useState, useRef, useEffect } from "react"


function handleOnLoad(canvas, approximateColor, img, ctx) {

  const aspectRatio = img.width / img.height
  const newWidth = canvas.width
  const newHeigth = canvas.width / aspectRatio
  canvas.height = newHeigth

  ctx.drawImage(img, 0, 0, newWidth, newHeigth)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  //data return an Uint8ClampedArray, the value rappresent a rgba color ([26,49,90,255,26,49,90,255....])
  //rgba(26,49,90,255)

  let colorPalette = {}
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const approxColor = approximateColor(r, g, b);

    colorPalette[approxColor] = (colorPalette[approxColor] || 0) + 1
    //[0,0,0] : 0
    //[0,0,0] : 0 + 1
    //[0,0,0] : 1 + 1
  }

  const sortedColors = Object.entries(colorPalette).sort((a, b) => b[1] - a[1]);
  //Object.entries return ["rgb(0,0,0)", "832"] sort only the first index

  let mostUsedColors = sortedColors.splice(0, 11)

  for (let i = 0; i < mostUsedColors.length; i++) {
    mostUsedColors[i] = { ...mostUsedColors[i] }
  }

  return mostUsedColors


}



export default function Canvas({ setPalette }) {

  const [picture, setPicture] = useState(null)

  let canvasRef = useRef(null)
  let inputRef = useRef(null)

  function handleFile() {
    const input = inputRef.current
    setPicture((p) => p = input.files[0])
  }

  function roundColorValue(value, interval) {
    return Math.round(value / interval) * interval;
  }

  function approximateColor(r, g, b, interval = 6) {
    return `rgb(${roundColorValue(r, interval)}, ${roundColorValue(g, interval)}, ${roundColorValue(b, interval)})`;
  }


  function handleDrop(e) {
    setPicture((p) => p = e.dataTransfer.files[0])
  }


  useEffect(function() {
    const canvas = canvasRef.current
    canvas.width = 700

    const ctx = canvas.getContext('2d')
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "White";
    ctx.fillText("Drop Image", 280, 75);

    if (picture) {
      const img = new Image()
      img.src = URL.createObjectURL(picture)

      img.onload = () => {
        let mostUsedColors = handleOnLoad(canvas, approximateColor, img, ctx)
        setPalette((p) => p = mostUsedColors)
      }
    }

  }, [picture])


  return (
    <div className="flex gap-16 mt-20 items-center ">
      <div>

        <h1 className="text-gray-200 text-6xl pb-8 text-left"> Visualize the colors from <br /> your favorite image</h1>

        <button className="border bg-gray-200 rounded-3xl cursor-pointer">
          <label htmlFor="filePicture" className=" px-4 py-2 inline-block text-neutral-800 cursor-pointer tracking-tight"> Upload Image</label>
        </button>

        <input type="file" className=" hidden" accept="image/png, image/jpeg, image/jpg" id="filePicture" ref={inputRef} onChange={(e) => handleFile(e)} />
        <div className="relative mt-16" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
          <input type="file" className="absolute top-0 left-0 w-full h-full opacity-0" accept="image/png, image/jpeg, image/jpg" onChange={(e) => handleFile(e)} />
          <canvas ref={canvasRef} className="border border-neutral-800 rounded-xl"></canvas>
        </div>

      </div>

    </div >

  )
}
