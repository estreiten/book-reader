const modeParagraph = async () => {
  status.mode = 'paragraph'
  bookmark = {
    page: status.lastPage,
    paragraph: status.lastParagraph
  }
  const book = document.querySelector('.book')
  book.classList.add('paragraph')
  const btn = document.getElementById('read')
  const prevBtn = document.getElementById('previous')
  const nextBtn = document.getElementById('next')
  const clearBtn = document.getElementById('clear')
  const saveBtn = document.getElementById('save')
  btn.innerHTML = 'Read'
  btn.onclick = () => {
    prevBtn.classList.add('hidden')
    nextBtn.classList.add('hidden')
    clearBtn.classList.add('hidden')
    saveBtn.classList.add('hidden')
    btn.innerHTML = 'Pause'
    btn.onclick = pause
    book.classList.remove('paused')
    book.classList.remove('paragraph')
    status.mode = 'reader'
    read(true)
  }
  prevBtn.classList.remove('hidden')
  nextBtn.classList.remove('hidden')
  clearBtn.classList.remove('hidden')
  saveBtn.classList.remove('hidden')
  highlights = await fetch(`/highlight`).then(res => res.json())
}

const isHighlighted = (line, word, myHighlights) => {
  const highlighted = myHighlights.find(highlight => (highlight.from.line < line || highlight.from.line === line && highlight.from.word <= word)
    && (highlight.to.line > line || highlight.to.line === line && highlight.to.word >= word))
  return highlighted !== undefined ? parseInt(highlighted.id) : undefined
}

const tokenizeLine = (line, lineIndex, myHighlights) => {
  return line.split(' ').map((word,index) => {
      const highlightedId = isHighlighted(lineIndex, index, myHighlights)
      return `<span line="${lineIndex}" word="${index}"
      class="highlight-item${highlightedId !== undefined ? ' highlighted' : ''}"
      onclick="${highlightedId !== undefined ? 'editHighlighted(' + highlightedId + ')': 'highlightStart(event)'}">${word}</span>`})
      .join('')
}

const showParagraph = () => {
  const book = document.querySelector('.book')
  const paragraph = pageData[status.lastParagraph || 0]
  const myHighlights = highlights.filter(highlight => highlight.page === status.lastPage && highlight.paragraph === status.lastParagraph)
  let output = paragraph.reduce((out, line, index) => line.type === 'text' ? out + tokenizeLine(line.value, index, myHighlights) + '<br>' : out, '')
  if (output.endsWith('<br>')) {
    output = output.slice(0, -4)
  }
  book.innerHTML = output
  const actionsEl = document.getElementById('highlightActions')
  actionsEl.style.display = 'none'
  if (!!bookmark && (bookmark.page < status.lastPage || (bookmark.page === status.lastPage && bookmark.paragraph < status.lastParagraph))) {
    document.getElementById('backward').classList.remove('hidden')
    document.getElementById('forward').classList.add('hidden')
  }
  if (!!bookmark && (bookmark.page > status.lastPage || (bookmark.page === status.lastPage && bookmark.paragraph > status.lastParagraph))) {
    document.getElementById('forward').classList.remove('hidden')
    document.getElementById('backward').classList.add('hidden')
  }
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

const goBack = async () => {
  if (bookmark.page !== status.lastPage) {
    await updatePage(bookmark.page)
  }
  status.lastParagraph = bookmark.paragraph
  document.getElementById('backward').classList.add('hidden')
  document.getElementById('forward').classList.add('hidden')
  showParagraph()
}

const highlightStart = (ev) => {
  const spanStart = ev.target
  spanStart.classList.add('highlight-start')
  const spans = Array.prototype.filter.call(spanStart.parentNode.children, child => child.tagName === 'SPAN')
  const startIndex = Array.prototype.indexOf.call(spans, spanStart)
  for (let index = startIndex+1; index < spans.length; index++) {
    const span = spans[index];
    span.classList.remove('highlight-start', 'highlight-over', 'highlight-selection')
    if (!span.classList.contains('highlighted')) {
      span.onmouseover = () => {
        highlightOver(startIndex, index)
      }
      span.onmouseleave = () => {
        resetHighlightOver(startIndex, index)
      }
      span.onclick = () => {
        highlightEnd(startIndex, index)
      }
    }
  }
  const actionsEl = document.getElementById('highlightActions')
  actionsEl.querySelector('#save').style.display = 'none'
  actionsEl.querySelector('#clear').style.display = 'block'
  actionsEl.querySelector('#toggleNote').style.display = 'none'
  actionsEl.querySelector('#note').classList.add('hidden')
  actionsEl.querySelector('#delete').classList.add('hidden')
  actionsEl.style.display = 'flex'
  actionsEl.style.top = spanStart.offsetTop
  actionsEl.style.left = spanStart.offsetLeft - actionsEl.offsetWidth
}

const highlightOver = (start, end) => {
  const spans = document.querySelectorAll('.highlight-item')
  for (let index = start; index <= end; index++) {
    const span = spans[index];
    span.classList.add('highlight-over')
  }
}

const resetHighlightOver = (start, end) => {
  const spans = document.querySelectorAll('.highlight-item')
  for (let index = start; index <= end; index++) {
    const span = spans[index];
    span.classList.remove('highlight-over')
  }
}

const highlightEnd = (start, end) => {
  const spans = document.querySelectorAll('.highlight-item')
  for (let index = start; index < spans.length; index++) {
    const span = spans[index];
    if (index <= end) {
      span.classList.add('highlight-selection')
    } else {
      span.classList.remove('highlight-selection')
    }
  }
  const actionsEl = document.getElementById('highlightActions')
  actionsEl.querySelector('#save').style.display = 'block'
  actionsEl.querySelector('#clear').style.display = 'block'
  actionsEl.querySelector('#toggleNote').style.display = 'block'
  actionsEl.querySelector('#delete').classList.add('hidden')
  actionsEl.style.top = spans[end].offsetTop
  actionsEl.style.left = spans[end].offsetLeft + spans[end].offsetWidth
}

const clearHighlight = () => {
  const spans = document.querySelectorAll('.highlight-item')
  for (let index = 0; index < spans.length; index++) {
    const span = spans[index];
    span.onmouseover = null
    span.onmouseleave = null
    if (!span.classList.contains('highlighted')) {
      span.onclick = highlightStart
    }
    span.classList.remove('highlight-start', 'highlight-over', 'highlight-selection')
  }
  const actionsEl = document.getElementById('highlightActions')
  actionsEl.style.display = 'none'
}

const saveHighlight = () => {
  const spans = document.querySelectorAll('.highlight-item')
  let startIndex = -1
  let data = {
    text: '',
    page: status.lastPage,
    paragraph: status.lastParagraph
  }
  for (let index = 0; index < spans.length; index++) {
    const span = spans[index];
    if (span.classList.contains('highlight-start')) {
      startIndex = index
      data.text += ' ' + span.innerHTML
      data.from = {
        line: parseInt(span.getAttribute('line')),
        word: parseInt(span.getAttribute('word'))
      }
    }
    if (startIndex > -1 && startIndex < index) {
      if (span.classList.contains('highlight-selection')) {
        data.text += ' ' + span.innerHTML
        data.to = {
          line: parseInt(span.getAttribute('line')),
          word: parseInt(span.getAttribute('word'))
        }
      } else {
        break
      }
    }
  }
  data.text = data.text.trim()
  const note = document.getElementById('note')
  if (!!note.innerHTML && note.innerHTML.length > 0) {
    data.note = note.innerHTML
  }
  fetch('/highlight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(res => res.json()
  ).then((newHighlight) => {
    for (let line = newHighlight.from.line; line <= newHighlight.to.line; line++) {
      const spans = document.querySelectorAll(`span[line="${line}"]`)
      for (let index = 0; index < spans.length; index++) {
        const span = spans[index];
        if (isHighlighted(line, parseInt(span.getAttribute('word')), [newHighlight]) !== undefined) {
          span.classList.add('highlighted')
          span.onclick = () => {
            editHighlighted(parseInt(newHighlight.id))
          }
        }
      }
    }
    // remove highlights contained in the new one
    highlights = highlights.filter(highlight =>
      highlight.from.line < newHighlight.from.line ||
      (highlight.from.line === newHighlight.from.line && highlight.from.word < newHighlight.from.word) ||
      highlight.to.line > newHighlight.to.line ||
      (highlight.to.line === newHighlight.to.line && highlight.to.word > newHighlight.to.word))
    highlights.push(newHighlight)
  }).catch((err) => {
    console.error('Highlight error!', err)
  }).finally(clearHighlight)
}

const editHighlighted = (highlightId) => {
  const highlight = highlights.find(highlight => highlight.id === highlightId)
  const spanEnd = document.querySelector(`span[line="${highlight.to.line}"][word="${highlight.to.word}"]`)
  const actionsEl = document.getElementById('highlightActions')
  actionsEl.querySelector('#save').style.display = 'none'
  actionsEl.querySelector('#clear').style.display = 'none'
  actionsEl.querySelector('#toggleNote').style.display = 'none'
  actionsEl.querySelector('#note').classList.add('hidden')
  actionsEl.querySelector('#delete').classList.remove('hidden')
  actionsEl.style.display = 'flex'
  actionsEl.style.top = spanEnd.offsetTop
  actionsEl.style.left = spanEnd.offsetLeft + spanEnd.offsetWidth
  actionsEl.querySelector('#delete').onclick = () => {
    deleteHighlight(highlightId)
  }
}

const deleteHighlight = (highlightId) => {
  fetch('/highlight', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({id: highlightId})
  }).then(() => {
    const highlight = highlights.find(highlight => highlight.id === highlightId)
    for (let line = highlight.from.line; line <= highlight.to.line; line++) {
      const spans = document.querySelectorAll(`span[line="${line}"]`)
      for (let index = 0; index < spans.length; index++) {
        const span = spans[index];
        if (isHighlighted(line, parseInt(span.getAttribute('word')), [highlight]) !== undefined) {
          span.classList.remove('highlighted')
        }
      }
    }
    highlights.splice(highlights.findIndex(item => item.id === parseInt(highlight.id)), 1)
  }).catch((err) => {
    console.error('Highlight delete error!', err)
  }).finally(clearHighlight)
}

const toggleNote = () => {
  const note = document.getElementById('note')
  const actions = document.getElementById('highlightActions')
  if (note.classList.contains('hidden')) {
    note.classList.remove('hidden')
    actions.style.left = `calc(${actions.style.left} - ${note.offsetWidth}px)`
  } else {
    actions.style.left = `calc(${actions.style.left} + ${note.offsetWidth}px)`
    note.classList.add('hidden')
    note.innerHTML = ''
  }
}