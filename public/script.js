const updatePage = async (pageIndex) => {
  pageData = await fetch(`/page/${pageIndex}`).then(res => res.json())
  document.body.querySelector('.status').innerHTML = `PAGE ${pageIndex} OF ${pageCount} (${Math.floor((pageIndex / pageCount) * 100)}%)`
  status.lastPage = pageIndex
  await saveStatus()
}

const read = async (force) => {
  try {
    const fromPage = status.lastPage || 1
    if (!isNaN(fromPage) && fromPage > 0 && fromPage < pageCount) {
      if (force === undefined) {
        pause()
      }
      for (let index = fromPage; index < pageCount; index++) {
        await updatePage(index)
        await printPage(pageData, index)
      }
    }
  } catch (err) {
    if (err === 'paragraph') {
      showParagraph()
    }
  }
}

const saveStatus = async () => {
  return new Promise((resolve, reject) => {
    const {mode, ...data} = status
    fetch('/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(resolve).catch(reject)
  })
}

const pause = () => {
  document.querySelector('.book').classList.add('paused')
  document.getElementById('read').innerHTML = 'Continue'
}

const modeParagraph = () => {
  status.mode = 'paragraph'
  const book = document.querySelector('.book')
  const btn = document.getElementById('read')
  const prevBtn = document.getElementById('previous')
  const nextBtn = document.getElementById('next')
  btn.innerHTML = 'Read'
  btn.onclick = () => {
    prevBtn.classList.add('hidden')
    nextBtn.classList.add('hidden')
    btn.innerHTML = 'Pause'
    btn.onclick = pause
    book.classList.remove('paused')
    status.mode = 'reader'
    read(true)
  }
  prevBtn.classList.remove('hidden')
  nextBtn.classList.remove('hidden')
}

const showParagraph = () => {
  const book = document.querySelector('.book')
  const paragraph = pageData[status.lastParagraph || 0]
  const output = paragraph.reduce((out, line) => line.type === 'text' ? out + '<br>' + line.value : out, '')
  book.innerHTML = output
  
}

const prevParagraph = async () => {
  status.lastParagraph = status.lastParagraph || 0
  if (status.lastParagraph > 0) {
    status.lastParagraph--
    showParagraph()
  } else {
    if (status.lastPage > 1) {
      await updatePage(status.lastPage - 1)
      status.lastParagraph = pageData.length - 1
      showParagraph()
    }
  }
}

const nextParagraph = async () => {
  status.lastParagraph = status.lastParagraph || 0
  if (status.lastParagraph < pageData.length - 1) {
    status.lastParagraph++
    showParagraph()
  } else {
    if (status.lastPage < pageCount) {
      await updatePage(status.lastPage + 1)
      status.lastParagraph = 0
      showParagraph()
    }
  }
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

document.addEventListener('DOMContentLoaded', () => {
  if (!!pageCount) {
    read()
  }
})