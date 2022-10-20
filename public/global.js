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

  Set on paragraph mode init
  - bookmark: { // marks the current progress, to go back with a single button click
    page: N,
    paragraph: N
  }
  - highlights: Array. List of highlight objects. Each highlight object has:
    {
      "text": "highlighted text",
      "page": N,
      "paragraph": N,
      "from": {
        "line": N (zero-indexed),
        "word": N (zero-indexed)
      },
      "to": {
        "line": N (zero-indexed),
        "word": N (zero-indexed)
      }
    }
*/
let pageData = []
let highlights = []