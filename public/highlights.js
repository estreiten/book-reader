let status = {}

const goTo = (page, paragraph) => {
  status = {
    lastPage: page,
    lastParagraph: paragraph,
    mode: 'paragraph'
  }
  saveStatus(true).then(() => {
    location.href = '/'
  })
}