<data>{"title":"Markdown Support"}</data>

## About
~~WARNING this post will be a mess~~
For some reason I got distracted improving this little markdown lib and added more to it and fixed some things. So I may try to use it. I will keep the ability to extract html body from a post that is a html file, but I decided to try to use markdown files as the default to posts since they are easier to read and set up.
- meow
  - mew
    - meoow
      - merrow
I also added a few of my own things like more than 3 list depths, but currently lack adding paragraphs and other block
size stuff as part of the list. Now that I think about it, I lack ways to [color=blue]color[/color] text(I might use `\[color=value]` and `\[/color]`). I may think of something later. I did add limited support for html insde the markdown, but the arrows would need to be converted to `§` with the first needing the `TAG` Identifier and need to be just a tag like details. Well I am removing the `§` for a `[tag] and [/tag]` style approch to work with colors
>this is a quote
`this is an inline code block`
~~meow~~ ~mew~ meow ^merrow^
[details]
[summary]This is a detail block[/summary]
`\[details]`
`\[summary]` The summary that is always shows `\[/summary]`
The details that can be toggled on and off.
`\[/details]`
[/details]
There are other things, but I do not feel like listing them all meow.
[return to top](#About) 
~~the return to top might not work well due to the dynamic nature of the posts page.~~