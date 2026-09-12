
//This is the script most pages will run.
//TODO: move all the init logic to a function and call it
//that should allow the gc to clean uptemp var instead of keeping them loaded as private var
//Note: such var need to be declare in init funct and not globally though

export const defaultRadioHtml = `
    <b>Radio Player</b><br>
    <audio id="radioAudio" preload="none"></audio>
    <button id="toggleRadio">Waiting</button>
    <details>
        <summary>Radio Options</summary><br>
        <label>Use Local Storage: <input type="checkbox" class="radioOptions" data-property="useLocalStorage" title="Uses localStorage to store options untill cleared."></label><br>
        <label>Autoplay: <input type="checkbox" class="radioOptions" data-property="autoplay"></label><br><br>
            Volume: <input type="range" min="0" max="1" step="0.01" value="0.5" class="radioOptions"
                data-property="volume" style="width: 75%;"><br><br>
            Url: <input type="text" id="streamUrl"
                placeholder="Enter stream URL (e.g. http://...) or radio garden channel id"
                value="https://radio.garden/listen/wcpe-the-classical-station/dNa5l6AK" style="width:75%;"
                class="radioOptions" data-property="src">
            <button id="radioDefaultStation">⟲</button>   
        </details>
`
//an object for storing objects created to manage elements
const handlers = {}

//exporting incase I need to rerun it, but reruning it may not be a good idea
export async function init() {
    const onload = [];

    const pageType = document.querySelector('meta[name="page-type"]')?.content || 'pages';
    const pageId = document.querySelector('meta[name="page-id"]')?.content || 'page';

    //load a radio player if one exists
    const radioPlayerElement = document.getElementById('radio-player');
    if (radioPlayerElement) {
    //    radioPlayerElement.innerHTML = defaultRadioHtml;
        const { initRadio } = await import('/widgets/radio_player.js');
        onload.push(() => {
            handlers.radioPlayer = initRadio()
        })
    }

    //handle page types such as type of post which may have post type: posts or media
    //let pageType = document.querySelector('meta[name="page-type"]')?.content || 'page';

    if (pageType === 'posts-loader') {

        const body_container = document.getElementById('body_container');
        //const oldDisplay = body_container.style.display;
        //body_container.style.display = 'none';
        //onload.push(() => {
        //    body_container.style.display = oldDisplay;
        //})

        const { PostManager } = await import('/scripts/content_loader.js');
        const module = await import('/lib/sitemap.js');
        handlers.sitemap = module.default;
        handlers.postManager = new PostManager();
        //using hash to be client side only (neocities may server ancient files elsewise)
        const params = new URLSearchParams(window.location.hash.slice(1));
        //const TYPES = {POSTS:'posts',MEDIA:'media',PROJECTS:'projects'} //may not use. type is the dir or map name. group is the sub dir name or key in the map(group is not really needed)
        //  TODO: remove only the page type/id from params since using static pages to declare them is more responsive
        //but need to leep the page and max posts
        const type = params.has('type') ? params.get('type') : pageId 
        const group = params.has('group') ? params.get('group') : 'default'
        const page = params.has('page') ? params.get('page') : 0;
        const max_posts = params.has('max_posts') ? params.get('max_posts') : 20;
        //const active_tab = document.getElementById(type + '_tab');
        const next_button = document.getElementById('next_button');
        const back_button = document.getElementById('back_button');

        window.addEventListener("hashchange", () => {
            location.reload();
        });

        await handlers.sitemap.load();

        const dir = handlers.sitemap.getDir(`pages/${type}`);

        handlers.postManager.directory = `/pages/${type}`;
        handlers.postManager.type = type;
        await handlers.postManager.loadPage(dir, page, max_posts, body_container);

        const next_page = parseInt(page) + 1;
        const back_page = parseInt(page) - 1;
        const total = typeof dir[0] === 'object' ? dir.length - 1 : dir.length;
        document.title = type.charAt(0).toUpperCase() + type.slice(1);
        if (next_page >= 0 && (next_page) * max_posts < total) {
            console.log('has next page')
            next_button.hidden = false
            next_button.addEventListener("click", (event) => {
                window.location.href = `posts.html#type=${type}&group=${group}&page=${next_page}&max_posts=${max_posts}`
            });
        }
        if (back_page >= 0 && (back_page) * max_posts < total) {
            console.log('has before page')
            back_button.hidden = false
            back_button.addEventListener("click", (event) => {
                window.location.href = `posts.html#type=${type}&group=${group}&page=${back_page}&max_posts=${max_posts}`
            });
        }
        
    }

    if (document.querySelector('.markdown')) {
        const { markdownToHtml } = await import('/lib/inline_parsers/markdown_parser.js');
        document.head.innerHTML = `${'<link rel="stylesheet" href="/styles/markdown.css">'} ${document.head.innerHTML}`
        onload.push(() => {
            const markdownElements = document.querySelectorAll('.markdown');
            markdownElements.forEach((element) => {
                element.innerHTML = markdownToHtml(element.textContent)
            });
        });

    }

    if (document.querySelector('.collapsible')) {
        const { Collapsibles } = await import('/lib/collapsibles.js');
        onload.push(() => {
            Collapsibles.register()
        });
    }


    //this is to help with cases of things not being loaded yet
    if (!window.loaded) {
        onload.forEach((fn) => fn());
    }
    else {
        window.onload = function () {
            onload.forEach((fn) => fn());
        };
    }
}

await init();