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

app.post('/status', async (req, res) => {
  try {
    req.body.mode = 'reader'
    fs.writeFileSync('status.json', JSON.stringify(req.body, null, 2))
    res.sendStatus(200)
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