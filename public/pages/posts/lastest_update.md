<data>{"title":"Lastest Updates"}</data>
Notices (Updated 8/14/26)
- Low Energy
- Food Issues
- Real life distractments
- Primary PC not working(~8/11/26)


§TAGdetails§
§TAGsummary§ Log (9/11/26) §TAG/summary§
I manage to create a github for the neocities version of my site that also update the live version.
I also added an action that update the sitemap on push. 
I made the pages more static by making a python file that update files that uses these segments. This works well with the site being updated on push, but I did not added as an actions since it only ran when such elements are updated. I was going to inject the radio script, but I left it for the default_page.js to set up since the post loaders broke the ui so I assume it had to deal with load order or something.
I also worked on the markdown to allow details and summary by using §TAG`value`§ 

I notice the nav dropdowns might not seem clickable, but it just their clickbox is kind of narrow and I been having trouble fatting it up without messing up the poistioning or space it takes up.
§TAG/details§

§TAGdetails§
§TAGsummary§ Log (9/8/26) §TAG/summary§
I downloaded the whole site and ran it locally to do some structure redesigning...
and then got distracted looking at the posts loader since I want to improve it.
I added support of txt based posts instead of html based, but I still need to clean up the code
and change how post page types works (currently just a page) by allowing them to be loaded from a text file
but render in the sites defualt theme.  

Also there going to be a lot of extra files for a bit untill I feel like deleting the old ones.
§TAG/details§


§TAGdetails§
§TAGsummary§ Log (9/7/26) §TAG/summary§

I spent some time making a share script for most of the pages to help with updating them.
I also added a sitemap that used the sitemap json just because I have it. The issue is I needed 
I add stuff to the sitemap json still or well I do not have to since the sitemap page is kind of hidden.
§TAG/details§



§TAGdetails§
§TAGsummary§ Log (9/6/26) §TAG/summary§

I been slowly working on the markdown parser to added more missing features and restructering it so it can be extended upon or build diffrently.
It still lacks some features or well how it handles lists is a bit limited by line. I am not sure if I will improve on that or not. Also there might be a 
lib I should used instead, unless there none extendable and light that add the bulk of markdown expectations (also I rather use open source or public domain type lib)

Also there may be another project I might help with that uses the parsers but for a game probably teaches or help with html, css, and js. Though I am not sure if it be a thing.
I could help with the code since a lot seem possible and more so if preventing self hacking and cheating is not a major focus (or the scope is smalle enough that I could redirect the allowed functions).
I really should continue my projects, though my focus been bad.
§TAG/details§



§TAGdetails§
§TAGsummary§ Log (8/31/26) (This is a bit of a mess) §TAG/summary§
        I been working on one of the widgets as well as working on random things (well it currently is a seed based random number generator since I notice Math did not have a way to do that).
        The widget is a recipe converter while it was suppose to be a unit converter. I realize mass and volumn is a bit deep and decied to focus on it. It also allow scaling it and could be used 
        as a recipy builder since it have optional feilds for title, info, and directions. I also ended up getting a markdown lib as well as building a inline function parser, a inline calc function,
        and a inline varible lib so the users fields can be formated and inclued additional feature. Also the value inputs use just the inline calc function so one can do simple math(or complex if I expand it)
        in the field. I do need to close the inline func and var in a class/object since I feel it limiting having one registry and there might be cases where I want to use a more limited registry. Mostly it is 
        locating the registry to a class, init the class and store that object as varible and change the major export function to use it (also move the functions dependent on state in the class). I mean I do not need to,
        but this allow one not to need to manually create a default instance and one will be created if none is defined. I could do something with statics, but that would require the state to be passed where I rather the
        state not be exposed as a parameter so I wont have to add unnessary type checks.

        Also I might add markdown support to these posts as well as other things oneday. I can use css classes to state what need parsing (and with markdown, this would also help with styling). The other inline stuff may not
        be used for posts and only the inline varible one have potential use for the post. They do have use for any page that support user text input, but I do not really have such pages made yet.

        ### `This is a markdown test`

&gt; Markdown is picky and the editor includes tab or at least as space and can mess up formating. In this case markdown is best done without tabing when including inside a html file. Well this is mostly for block level markdown like headers and quotes
            
- ~~Note to self: I should create a generic page script that handles all basic scripts. The issue I would need to solve is to have these scripts run after the setup scripts(or use two scripts)~~
- ~~Also I could move collapsables as a markdown or custom inline type. Extending markdown would be better since it need html element, but I would need to figure out a way to identify it while being markdown like.~~
- ~~The issue with markdown script is that it do not process html(I probably could add a cases that allow it, but too lazy). This is not really an issue since I could wrap markdown in span or p, though there may be cases where this would break styling though proper styling should prevent it.~~
§TAG/details§
      

Log (8/14/26)

        I decided to make this page/post so I have a single place to post updates and notices without creating new dedicated posts or pages.
        I am not sure if I will be working on this site much mostly do to focus issues and because I am not sure what I want to work on here.


        I need to continue with the js canvas rendering stuff so I can convert the fishing game to use canvas and maybe add other games. Currently 
        I am having trouble staying focus on finishing the 2d animation implementation. I am also a bit distracted slowly working on coding tools for someone
        (but they did not give enough details, so I been working on something I can use to build on).


        My main pc stop turning on a few days ago and I an not sure if the 3v battery reach a death state the broke the circit, some cap died, the power supply having issues, or something mess with it.
        So I lack a pc with dedicated graphics now and I am too lazy to use this pc battery to confirm if it is that or not (mostly because it a pain to get out of this pc).
        Also the location of where the good pc is starting to be risk and I cant really move it so I kind of do not want to fix it for something to come and mess with it when I am away.

      Current goals (Updated 8/31/26)
- Survive
- Finish building a small js canvas lib and porting the fishing game to it.
- Making widgets of useful tools for someone.
- Making lib of code for the widgets and other future projects.
- Cleaning up this site
- Adding a way to redirect the posts to their source page and format the source page better.


