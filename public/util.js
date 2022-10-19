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