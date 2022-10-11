- text in same paragraph: same "transform" 6th - last - param
- text in new paragraph: first with different "transform" 6th. Get the difference to obtain line height. It will be used later too.
If that difference is more than 2*"height", it's considered a new paragraph. (line-height = 2)
- image space: distance between paragraphs is more than half of the img height

SPECIAL CASE
- avoid first paragraph with "str" = '/'

Algorithm to interpret page items
- put all the page's images in a stack
- Read item
- If the item is the first and "str"="/" or "str"="" or "height"=0, read next
- Else
  - if there's last item
    - if "transform"[5] is 2*"height" greater than last items'
      - item is part of a new paragraph
      - get the "height" of the first image of the stack
      - if "transform"[5] is (image's "height")/2 greater than last items'
        - this image is located between this paragraph and the previous
        - remove the image from the stack
    - else
      - item is part of the current paragraph
  - else
    - the item is the start of the first paragraph
  - keep item's height and "transform"[5] as last item

Algorithm to render page
- Param: list of paragraphs (made of lines with their height -> made of words) and images, in order of appearance.

- set different delays: after a word, after a line, after a paragraph
- Start rendering the first paragraph/image following the previous delays
  + when rendering an image, pause and display a "continue" button
- Render each line using its own height