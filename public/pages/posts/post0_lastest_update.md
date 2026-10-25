<data>{"title":"Lastest Updates"}</data>
Notices (Updated 8/14/26)
- Low Energy
- Food Issues
- Real life distractments
- Primary PC not working(~8/11/26)

[details]
[summary] Log (10/24/26) [/summary]
I decided I needed to make an audio manager and then came close of converting to a audio context approach. I stop myself and just change the name oof play and stop to represent use for Audio(). One day I will work on a audio context system, but for now I only need a share space that manage a few different audio play and a way to restart them without sending out errors occasionly in the console.

Also learn that I did not handle monkey patching the event listerners for the asset extended media elements, so I remove it for now, but dispose is still handled as an event. There seem to be a way to add custom event listerners, so I did a lazy way of adding it, but currenly I have no assets being disposed so it may be a while before I get to see if it actually works and if it as simple of dispatching a vaild event object (I mean it should, but I been around and know sometimes such things are too good to be true).

Meow I still have to clean up more, but at this point it is moving things to their correct owners and deleting useless words. Oddly it still require me to be able to focus. Too much could break if I am not careful when reconnecting. I already broke the radio player for fishing (but it because the local server code is really out of date of the neocity one since it the local of the github page. I just fixed it(the initRadio was not being called))

(Mew I decided to move the code to the local neocities location which means it will be push to the site. It is still very messy on the code side, but I think it should function almost)
[/details]


[details]
[summary] Log (10/23/26) [/summary]
I am still slowly cleaning up the canvas verion of the fishing game offsite. The lastest update is just changing the tags used in the pages (except fishing since I am lazy). Also added some of the tags to the markup allowed tags, but I have yet to make use of them but I feel they could be useful in rare cases.

Note: The tag use is probably not the best, but I think it better than using only div with ids meow.
[/details]

[details]
[summary] Log (10/12/26) [/summary]
I took a break after slow working on the conversion of the fishing game. All progress is still local with some back up to my github.
Today I was able to mirror most stuff in canvas, but the design of the fishing game is kind of rushed and too much stuff was dependent on how the level implement it.
So the most recent bug might only be solvable changing how the fish is loaded in and creating signals for the fish so it can handle its own onclick event. I also should change it all. World(basicly a global or the game, could be call game or anything that represent the session) could be a singleton and everything else be a generic object that can be chain (like in a node system) as needed. I can use dedicated system to do things and have them configured to work together. 
[/details]


[details]
[summary] Log (10/6/26) [/summary]
I been distracted working on the rendering framework. I belive I am at the point where I can use it or migrate the fishing game to it. 
Today and yesterday I spent fixing the actual matrix math and render pipeline since I notice I mess it up when starting the convertion of the fishing game. So there are chances otherthings need to be fixed. Also the animation is hardcoded and I should finish designing the data structure for it or at least before I have more than one animation.
Mew is a slow cat. I also should try to make a character or me as a character, but I have not felt like doing art mew.
[/details]


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

