const config = require('./config');
const express = require('express');
const pdfService = require('pdf-to-json');
const fs = require('fs')

const app = express();
app.use(express.static('public'))
app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))


app.get('/img', async (req, res) => {
  try {
    const imgData = await pdfService.getImg(config.book, parseInt(req.query.pageIndex), req.query.name)
    res.send(imgData)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.get('/page/:page', async (req, res) => {
  try {
    const data = await pdfService.parsePage(config.book, parseInt(req.params.page))
    res.status(200).send(data)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.post('/status', (req, res) => {
  try {
    if (!req.body.mode) {
      req.body.mode = 'reader'
    }
    fs.writeFileSync('status.json', JSON.stringify(req.body, null, 2))
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.post('/highlight', (req, res) => {
  try {
    let highlights = JSON.parse(fs.readFileSync('highlights.json', 'utf8'))
    const newHighlight = {
      id: highlights.length,
      ...req.body
    }
    // remove highlights contained in the new one
    highlights = highlights.filter(highlight => 
      highlight.from.line < newHighlight.from.line ||
      (highlight.from.line === newHighlight.from.line && highlight.from.word < newHighlight.from.word) ||
      highlight.to.line > newHighlight.to.line ||
      (highlight.to.line === newHighlight.to.line && highlight.to.word > newHighlight.to.word))
    highlights.push(newHighlight)
    fs.writeFileSync('highlights.json', JSON.stringify(highlights, null, 2))
    res.send(newHighlight)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.get('/highlight', (req, res) => {
  try {
    const highlights = JSON.parse(fs.readFileSync('highlights.json', 'utf8'))
    res.send(highlights)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.delete('/highlight', (req, res) => {
  try {
    let highlights = JSON.parse(fs.readFileSync('highlights.json', 'utf8'))
    const index = highlights.findIndex(highlight => highlight.id === parseInt(req.body.id))
    if (index > -1) {
      highlights.splice(index, 1)
      fs.writeFileSync('highlights.json', JSON.stringify(highlights, null, 2))
      res.sendStatus(200)
    } else {
      res.sendStatus(404)
    }
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.get('/highlights', (req, res) => {
  try {
    let html = fs.readFileSync('highlights.html', 'utf8')
    const highlights = JSON.parse(fs.readFileSync('highlights.json', 'utf8'))
    let mainHtml = ''
    for (let index = 0; index < highlights.length; index++) {
      const highlight = highlights[index]
      mainHtml += `<div class="highlight" onclick="goTo(${highlight.page},${highlight.paragraph})">
        <div class="highlight-text">${highlight.text}</div>`
      if (!!highlight.note) {
        mainHtml += `<div class="highlight-note">${highlight.note}</div>`
      }
        mainHtml += `<div class="highlight-page">page ${highlight.page}</div>
      </div>`
    }
    html = html.replace('<main>', '<main>' + mainHtml)
    res.status(200).send(html)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.get('/', async (req, res) => {
  try {
    const count = await pdfService.getPageCount(config.book)
    let html = fs.readFileSync('index.html', 'utf8')
    const status = JSON.parse(fs.readFileSync('status.json', 'utf8'))
    html = html.replace('<script>', `<script>const pageCount=${count}; const status=${JSON.stringify(status, null, 2)}`)
    res.status(200).send(html)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

const port = config.port || 80
app.listen(port, () => {
  console.log(`listening on ${port}`)
})