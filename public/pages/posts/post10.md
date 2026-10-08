<data>{"title":"Rendering Nonsense"}</data>

Meow I sometimes feel dumb when working on stuff. I know little about rendering pipelines and such. Pretty much I just knew things had scopes, but never had to build anything close to a render pipeline before this year.
So the last few days I was fixing my Mat4 based rendering system with js canvas. I kept messing up at points due to only reading parts. I actually inverted the pipeline since I was hoping to cache caculations per render loop. Well seems clip space and screen space (as well as model view) needs to be caculated for each rendering object. 


- model * view = model view
- projection * model view  = clipspace
- viewport * clipspace  = screenspace


The order is based on my Mat4.multiply code, so `viewport projection view model` may be less misleading. Prety much common knowlege for anyone majoring in rendering...which I am not (I focus more on building game mechanics and systems not focus on rendering). Also I kind of just started jumping into matrices and well Mat3 and Mat4 in rendering have row or column relationships which made working with them a bit odder. For example I needed a projection and a view mat4 for the camera and trying to simplify it in one failed due to the projection using translation so I could not use it for the camera positioning. Truth is I probably could convert some of these matrices into vectors, but all that may save is maybe one row off the view and maybe a row and column off the viewport. Leaving both as mat4 means I could do silly stuff in the unused slots and maybe even have am actual use I do not know of yet. I mean I am rendering as 2d and z is basicly just a meta for depth that I might be able to abuse later.


Mew also this is not just rendering. I also support onclick events for my rendering system. The render object manager handles it so I have to make sure it also can recreate the screen matrix so the object aabb can return a bounds that is correct. So I made a render_lib.js that hold the getScreenMatrix which takes a transformation and an optional object that holds the context such as the view, viewport, and projection as well as a place to set the other three matrices (it only return the last one). I could have add it to the renderer.js, but I rather have a lib act as a middle man if two moduals may import from each other (currently the renderer dose not import render object manager, but I might later so the export default object would work out of the box as a complete rendering system. Only need to add assets and rendering objects).


I think I finish everything to try to convert the fishing game to js canvas, but I need to want to deal with all the possible bugs of switching. I currenly have a canvas below it that draws the background. The real chalange is making sure I can manage world space bounds correcly (for the fishing area). It may be smple and I am over reacting meow. I should redesign the framework, but I kind of do not want to rebuild it. I might be able to do some changes during or after the merge.
I should make a diffrent game with this for that was the reason I decided to make my own rendering system, but i kind of need to make assets for it and I have not been in a digital drawing mood.