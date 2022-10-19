/*
  Provided by server on load:
  - pageCount: Number. Total book pages.
  - status: {
      lastPage: Number. Last page read.
      lastParagraph: Number. Last page read, zero-indexed.
      mode: String. It's "reader" by default, changes to "paragraph" when displaying paragraphs instead.
    }

  Set on page init
  - pageData: Array. List of paragraphs, which is a list of lines, which is a text sentence or an image.
*/
let pageData = []