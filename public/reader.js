const printPage = (page, pageIndex) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (let index = status.lastParagraph || 0; index < page.length; index++) {
        const paragraph = page[index]
        status.lastParagraph = index
        await saveStatus()
        await printParagraph(paragraph, pageIndex)
      }
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

const printParagraph = (paragraph, pageIndex) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        for (let index = 0; index < paragraph.length; index++) {
          const line = paragraph[index];
          await printLine(line, pageIndex)
        }
        resolve()
      } catch (err) {
        reject(err)
      }
    }, 2000)
  })
}

const printLine = (line, pageIndex) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (line.type === 'text') {
        const words = line.value.split(' ')
        document.body.style.fontSize = `${parseInt(line.height) + 4}pt`
        for (let index = 0; index < words.length; index++) {
          const word = words[index];
          await printWord(word)
        }
        resolve()
      } else {
        await fetch(`/img?pageIndex=${pageIndex}&name=${line.value}`)
          .then(res => res.json())
          .then((img) => {
            renderImg(img)
            const btn = document.getElementById('read')
            btn.innerHTML = 'Continue'
            btn.onclick = () => {
              btn.innerHTML = 'Pause'
              btn.onclick = pause
              resolve()
            }
          })
      }
    } catch (err) {
      reject(err)
    }
  })
}

const printWord = (word) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (status.mode === 'paragraph' || status.mode === 'highlight') {
        reject(status.mode)
      } else {
        const book = document.body.querySelector('.book')
        book.innerHTML = word
        if (book.classList.contains('paused')) {
          const btn = document.getElementById('read')
          const interval = setInterval(() => {
            if (status.mode === 'paragraph' || status.mode === 'highlight') {
              reject(status.mode)
            }
          }, 2000)
          btn.onclick = () => {
            clearInterval(interval)
            btn.innerHTML = 'Pause'
            btn.onclick = pause
            book.classList.remove('paused')
            resolve()
          }
        } else {
          setTimeout(resolve, word.endsWith('.') ? 1000 : 0)
        }
      }
    }, 500)
  })
}

const renderImg = (img) => {
  if (img.kind === 2) {
    const imageUint8ArrayWithAlphaChanel = addAlphaChannelToUnit8ClampedArray(img.data, img.width, img.height)
    const imgData = new ImageData(imageUint8ArrayWithAlphaChanel, img.width, img.height)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    document.body.querySelector('.book').innerHTML = ''
    document.body.querySelector('.book').appendChild(canvas)
    const ctx = canvas.getContext('2d')
    ctx.putImageData(imgData, 0, 0)
  }
}