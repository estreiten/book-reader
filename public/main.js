const updatePage = async (pageIndex, keepStatus) => {
  pageData = await fetch(`/page/${pageIndex}`).then(res => res.json())
  document.body.querySelector('.status').innerHTML = `PAGE ${pageIndex} OF ${pageCount} (${Math.floor((pageIndex / pageCount) * 100)}%)`
  status.lastPage = pageIndex
  if (!keepStatus) {
    await saveStatus()
  }
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

const pause = () => {
  document.querySelector('.book').classList.add('paused')
  document.getElementById('read').innerHTML = 'Continue'
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!!pageCount && !!status) {
    if (status.mode === 'reader') {
      read()
    } else {  // mode === 'paragraph'
      await updatePage(status.lastPage)
      await modeParagraph()
      showParagraph()
    }
  }
})