<data>{"title":"Lastest Updates"}</data>
Notices (Updated 8/14/26)
- Low Energy
- Food Issues
- Real life distractments
- Primary PC not working(~8/11/26)

[details]
[summary] Log (9/19/26) [/summary]
I decided I could merge most of the parsers into a markup parser base around bracket style formating `\[id] \[id=value]`. I use it with markdown (well after parsing it) since it replaces the bracket content instead of doing any fancy formating. I might need to check to make sure markdown ignore formating bracket contents it do not handle directly if it messes with feature. Truth is this parse is easier to work with than markdown.

Also I added the user varibles `\[%name=meow] where \[%name] should return meow after it`. functions like `\[calc= 5 + var:prev_rand]` should replace var:id with an exsiting var (prefixing the id with % for user defined var). Yeah seem like overkill, but I want to make a tool or system that make use of this stuff. If i decide on a way to handle how I should catch notepage input (so last entry could be restored) then I could use that as a writing tool. I still need to output the user var in the output and handle inputing it so there a way to set default values. I added a flag to limit only existing user var, but it is off now since I do not feel like thinking up a set of names to reserve. It is mostly something that could be useful if I need to limit possible size caused by user abuse(though being client side, it will only hurt them).
[spoiler]also I added a `\[spoiler]` tag meow. I should try not to abused them > : 3. Look like there is limits such as certain formating breaking it. A fix is to make a spoiler style version of each case if I feel like it.[/spoiler]
[/details]

[details]
[summary] Log (9/13/26) [/summary]
I decided to clear some of the old logs from here since that was the plan for this post. Also I change formating quite a bit and editing the old stuff would be a pain.
So I decided to use a markdown base and extend it with bbcode style formating for extra features. I still need to work on tab like feature for the markdown so I can have list function properly, but that is for later since it is a side project and all the features that I plan to use are covered.

Also I still need to convert the older posts. Meow just being lazy.
[/details]

[details]
[summary] Log (9/11/26) [/summary]
I manage to create a github for the neocities version of my site that also update the live version.
I also added an action that update the sitemap on push. 
I made the pages more static by making a python file that update files that uses these segments. This works well with the site being updated on push, but I did not added as an actions since it only ran when such elements are updated. I was going to inject the radio script, but I left it for the default_page.js to set up since the post loaders broke the ui so I assume it had to deal with load order or something.
I also worked on the markdown to allow details and summary by using ~~§TAG`value`§~~ update(9/13) \[tag] \[/tag] is used instead now. 

I notice the nav dropdowns might not seem clickable, but it just their clickbox is kind of narrow and I been having trouble fatting it up without messing up the poistioning or space it takes up.
[/details]

[details]
[summary] Log (9/8/26) [/summary]
I downloaded the whole site and ran it locally to do some structure redesigning...
and then got distracted looking at the posts loader since I want to improve it.
I added support of txt based posts instead of html based, but I still need to clean up the code
and change how post page types works (currently just a page) by allowing them to be loaded from a text file
but render in the sites defualt theme.  

Also there going to be a lot of extra files for a bit untill I feel like deleting the old ones.
[/details]

[details]
[summary] Log (8/14/26) [/summary]
I decided to make this page/post so I have a single place to post updates and notices without creating new dedicated posts or pages. I am not sure if I will be working on this site much mostly do to focus issues and because I am not sure what I want to work on here.

I need to continue with the js canvas rendering stuff so I can convert the fishing game to use canvas and maybe add other games. Currently I am having trouble staying focus on finishing the 2d animation implementation. I am also a bit distracted slowly working on coding tools for someone(but they did not give enough details, so I been working on something I can use to build on).

My main pc stop turning on a few days ago and I an not sure if the 3v battery reach a death state the broke the circit, some cap died, the power supply having issues, or something mess with it. So I lack a pc with dedicated graphics now and I am too lazy to use this pc battery to confirm if it is that or not (mostly because it a pain to get out of this pc). Also the location of where the good pc is starting to be risk and I cant really move it so I kind of do not want to fix it for something to come and mess with it when I am away.
[/details]

[details]
[summary] Current goals (Updated 8/31/26) [/summary]
- Survive
- Finish building a small js canvas lib and porting the fishing game to it.
- Making widgets of useful tools for someone.
- Making lib of code for the widgets and other future projects.
- Cleaning up this site
- Adding a way to redirect the posts to their source page and format the source page better.
[/details]

