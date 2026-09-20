<data>{"title":"Text Parsers"}</data>

At the time of writing this (9/18/2026), I have four types of parsers I could used.
- A custom markdown parser currently with bbcode style extra.
- A parser that replace %varname with something else if it exists. Currently for a random float or the date.
- A inline function parser that looks for $functionName(args) and will run if it such function was added. 
- A (currently simple) math expresion parser that will treat the text pass in it as a math expresion and tries to solve it. It currently needs the inline function to work unless the text pass is expected to be a number or math expression.

I just notice after adding bbcode style stuff to the markdown that I could move the var replacer and inline function to it. I am not sure if I extend existing markdown parsers with what I can do with the custom one, so I may try to clean it up more and improve it so I can extend it to include the other parsers.

The issue with the inline function parser is I have to check the depth of the brackets to make sure I capture all the info in it. With the bbcode style, I just need to capture what is between the start and end block. 

I do need to think about spliting the types into groups since I might want to run the replacers first and then the inline function parser (and decided if I want and if I should handle nested inline functions). 

I probably should have the bbcode style stuff independent of the markdown parser, yet also allow it to extend (or be extended by) it. Unlike the ones it will replace, this one is expected to return a html formated text like the markdown so I have to figure out the order. It may be as simple of making a custom toHtml function in a file/class/object that extends it and merge the two there. 

I have ideas of using this logic for user formated iu like stuff or anything that allows user to input text. If I ever do pathfinder (or D&D) style stuff, then they will be used there to gain acess to properties of the character or anything exposed to the system. I might even decided to try to make a game base on that stuff...maybe.

(NOTE: I need to rember that bbcode style stuff should be parsed with normal text files as well as markdown(or see if there another file extention I should include))

[details][summary]Random thing I should add:[/summary]
- tooltips: the ability display info when hovering over text.
- a math element tag: Instead of caculating expresions directly, it will store the expression in the math tag. I kind of want to display it as a tooltip, but keeping the source could have other usages.
- tab: This might be added to the markdown, but make likes that start with 2-4 spaces be wrap in a tab class/element for each of those sets. How much spaces = a tab would be a const in the file, but I might use 2 if used with markdown. bbcode style may use it own, but would allow tabs anywhere instead of at the start (which idk would be a good idea meow).
- theme override: This one just wrap it in a class that may override the current theme, but require me to make themes (aka just diffrent css styles).
- Other focused styling such as text background color or font.
- spoiler or hidden text. I think hidden be easier to add since it just setting the color and backgound color the same, but having it be readible when selected. Idk there may be a element that dose it better that I do not know about.
[/details]