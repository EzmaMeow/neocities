<data>{"title":"My 'fake' Singletons"}</data>[tab]In JS I started using the export default as a shared object across a project and import it in any file that need to access it. I am not a fan of true singleton and the approach I used allow these modules to act similarly like a singleton or have multiple instances of it. The primary reason is for cases where I may need a system that represent several apps and each app can have their own fake global space. The system would need to be design differently, but the modules won't necessarily need to change.

An example of the module:
```
export class ClassName{

}
export default new ClassName();
```
and I can import it as 
```
import globalInstanceName from "/modules/class_name.js"
``` 
if I want a single project instance or 
```
import { ClassName } from "/modules/class_name.js"
```
if I want to use the class to make as many instances as I wish. 

[tab]Most of the cases I would use the first approach unless the project need to handle several versions of it and trying to design the single instance approach to handle that becomes a headache and just creating a new instance for each case becomes easier. For example, my rendering object manager handles layering, but a project now has two canvases with two different worlds. The layering was designed to help split the load of layered levels but to have it also handle multiple worlds becomes much more extra work. Instead, it be easier to redesign it, so each canvas has its own rendering and physics managers at the cost of having everything that need access to it a way to find out what scope it is in.

[tab]This way of thinking may seem odd or a waste, but it is to keep core module short, simple, and be able to be used in various cases instead of being forced to follow a single design.