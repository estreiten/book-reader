//source: https://codepen.io/allandiego/pen/RwVGbyj
function addAlphaChannelToUnit8ClampedArray(unit8Array, imageWidth, imageHeight) {
  const newImageData = new Uint8ClampedArray(imageWidth * imageHeight * 4);

  for (let j = 0, k = 0, jj = imageWidth * imageHeight * 4; j < jj;) {
    newImageData[j++] = unit8Array[k++];
    newImageData[j++] = unit8Array[k++];
    newImageData[j++] = unit8Array[k++];
    newImageData[j++] = 255;
  }

  return newImageData;
}

const switchLights = (ev) => {
  if (document.body.classList.contains('dark')) {
    document.body.classList.remove('dark')
    ev.target.innerHTML = '😎'
  } else {
    document.body.classList.add('dark')
    ev.target.innerHTML = '💡'
  }
}

const saveStatus = async (includeMode) => {
  return new Promise((resolve, reject) => {
    let {mode, ...data} = status
    if (includeMode) {
      data.mode = mode
    }
    fetch('/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(resolve).catch(reject)
  })
}