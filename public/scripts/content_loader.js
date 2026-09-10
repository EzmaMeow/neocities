import { Collapsibles } from '/lib/collapsibles.js'
import { FileLoader } from '/lib/file_loader.js'

//todo: may use html/text files for the posts and reserve tags or something for
//title and metadata. could add a split word like [html] and treat all at the start
//as json or have a few [title] [body] [data] that state the end of that segment

//this allow only the body(inner html) of a html file to be return
//for cases where one wants a standalone static post
export async function load_html_body(file) {
    //const html = await (await fetch(file)).text();
    const html = await fetch(file).then(
        result => {
            if (!result.ok) { return null }
            return result.text()
        }
    ).catch(
        error => { return null }
    );
    if (!html) { return null }
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.innerHTML;
}

export async function add_html_from_file(file, container = document.body_class_name, type = 'div') {
    if (container) {
        const body_html = await load_html_body(file);
        const element = (type) ? document.createElement(type) : container;
        if (element !== container) {
            container.appendChild(element);
        }
        element.innerHTML = body_html;
    }
    else {
        throw new Error("Container is not a vaild element.");
    }
}

//todo: remake the class to be used to make an instance so that the page can be reloaded
//also clean up the logic. most of the structure could be declared in a overridable function and most cases can be handle with a single load page/post function

export async function load_page(dir = '', files = [], container = document.body, element = document.createElement('div'), page = 0, max_posts = 20) {
    const page_start = page * max_posts;
    const page_end = (page + 1) * max_posts;
    for (let i = page_start; i < page_end; i++) {
        if (!(i >= 0 && i < files.length)) {
            break;
        }
        if (typeof files[i] === 'string') {
            const ext = ((/(?:\.([^.]+))?$/).exec(files[i])[1] || '').toLowerCase();
            if (ext === 'html') {
                const html = await load_html_body(dir + '/' + files[i])
                if (!html) { continue }
                //going to allow element to copy, string to create a generic element, or create a div if no else applies
                const post = element instanceof HTMLElement ? element.cloneNode(true) : typeof element === 'string' ? document.createElement(element) : document.createElement('div');
                post.innerHTML = html
                container.appendChild(post)
            }
            else if (ext === 'txt' || ext === 'md') {
                let postText = await fetch(dir + '/' + files[i]).then(
                    result => {
                        if (!result.ok) { return null }
                        return result.text()
                    }
                ).catch(
                    error => { return null }
                );
                if (!postText) { continue }
                let postData = postText.match(/<data>(.*?)<\/data>/s)[1];
                try {
                    postData = JSON.parse(postData) || {}
                } catch (err) {
                    postData = {}
                }
                postText = postText.replace(/<data>.*?<\/data>/s, "");
                const post = document.createElement('div');
                container.innerHTML = (`${container.innerHTML}                   
<div class="info_container collapsible">
	<div class="info_title collapsible_toggle">
		<h1>${postData.title || ''}</h1>
	</div>
	<div class="info_content post collapsible_content markdown">
        ${postText}
	</div>
</div>
                `)
            }
        }
    }
}

//todo: this works (at least for loading the posts page with posts), but need to do the same with media
//a static media page vs one that uses post manager but change the getposthtml to use the media post html
//and a md file of the image link. also could handle image ext, but the files wull lack alt and other features
// may add a post type that decided html stying and such
export class PostManager {
    page = 0;
    max_posts = 20;
    postDataExpression = /<data>(.*?)<\/data>/s;
    directory = '';
    loadedPosts = [];
    container = document.body;
    getPostData(rawPost = '') {
        let postData = rawPost.match(this.postDataExpression);
        try {
            postData = JSON.parse(postData[1]) || {}
        } catch (err) {
            postData = {}
        }
        return postData;
    }
    getPostHtml(content = '', postData = {}, ext = '') {
        if (ext === 'html') {
            return `<div class="info_container collapsible">${content}</div>`
        }
        return `
<div class="info_container collapsible">
	<div class="info_title collapsible_toggle">
		<h1>${postData.title || ''}</h1>
	</div>
	<div class="info_content post collapsible_content ${ext === 'md' || ext === 'markdown' ? 'markdown' : ''}">
        ${content}
	</div>
</div>
        `
    }
    getPostContent(rawPost = '', ext = '') {
        if (ext === 'html') {
            const doc = new DOMParser().parseFromString(rawPost, "text/html");
            return doc.body.innerHTML;
        }
        return rawPost.replace(/<data>.*?<\/data>/s, "");
    }
    async getRawPost(postSource = '') {
        if (!postSource) { return '' };
        let rawPost = await fetch(this.directory + '/' + postSource).then(
            result => {
                if (!result.ok) { return '' }
                return result.text()
            }
        ).catch(
            error => { return '' }
        );
        return rawPost;
    }
    async createPost(postSource, container = document.body) {
        const ext = ((/(?:\.([^.]+))?$/).exec(postSource)[1] || '').toLowerCase();
        const rawPost = await this.getRawPost(postSource);
        const postData = this.getPostData(rawPost);
        const postContent = this.getPostContent(rawPost, ext);
        console.log(ext)
        const postHtml = this.getPostHtml(postContent, postData, ext);
        container.innerHTML = `${container.innerHTML} ${postHtml}`
    }
    async loadPage(files = [], page = this.page, max_posts = this.max_posts || 1, container = this.container) {
        if (!container || !files) { return }
        const page_start = page * max_posts;
        const page_end = (page + 1) * max_posts;
        if (this.loadedPosts.length > 0) {
            for (let post of this.loadedPosts) {
                if (post) { post.remove() }
            }
            this.loadedPosts.length = 0;
        }

        for (let i = page_start; i < page_end; i++) {
            if (!(i >= 0 && i < files.length)) {
                break;
            }
            await this.createPost(files[i], container);
        }

    }
}

//should make a load content funtion instead of fighting with below
//that use the sitemap approch or that brute force approch
//would need pageing, async, and anding invalid types
//sitemap mostly need to ignore index0 if an object, then
//loop from page start to page end or untill all elements are used up (also ignoring fail cases)
//brute force just check for file name plus i plus format untill one fails to load or page end

export class Post_Page_Loader {
    static post_container;
    static load_count = 0;
    static post_class_name = "info_container collapsible";
    static title_class_name = "info_title collapsible_toggle";
    static body_class_name = "info_content post collapsible_content";
    static page = 0;
    static max_posts = 20;
    static type = 'posts';
    static group = 'default';
    //the data use to load posts either a map of groups or an array of links depending on the logic used
    //may create an array of links in the future so group is not needed. 
    static data;

    static create_post(data) {
        const post = document.createElement('div');
        const title = document.createElement('div');
        const body = document.createElement('div');
        post.className = this.post_class_name;
        title.className = this.title_class_name;
        body.className = this.body_class_name;
        title.innerHTML = data.title;
        body.innerHTML = data.text;
        this.post_container.appendChild(post);
        post.appendChild(title);
        post.appendChild(body);
        return post;
    }
    //this is a check to see if a page exists. mostly to be used for displaying
    //page buttons
    static has_page(page = 0) {
        //this will need to change if the logic related how data is handle changes
        return page >= 0 && page * this.max_posts < this.data[this.group].length
    }
    static async load_page(type = 'posts', group = 'default', page = 0, max_posts = this.max_posts, body = 'body_container', data = {}) {
        //NOTE: pgae and max posts are not in use yet
        let post_count = max_posts;
        //stroing the load data in the class to have a way to know how the page was last loaded
        this.page = parseInt(page);
        this.max_posts = parseInt(max_posts);
        this.type = type;
        this.group = group;
        const page_start = this.page * this.max_posts;
        const page_end = (this.page + 1) * this.max_posts;
        this.post_container = document.getElementById('body_container');

        //TODO: use the sitemap to locate the files in pages/posts and support txt, md, or html
        //where txt/md may have a <data></data> block that holds a json string that state meta data such as title
        //and if there is no title, then the media post style may be used or a style with no title
        const map_data = await (await fetch('/data/' + type + '_map.json')).json();
        this.data = map_data;
        for (let i = page_start; i < page_end; i++) {
            if (!(i >= 0 && i < map_data[this.group].length)) {
                break;
            }
            const post = map_data[this.group][i]
            if (post_count <= 0) {
                break;
            }
            if (post.path) {
                post_count -= 1;
                const text = await (await fetch(post.path)).text();
                post.text = text
                this.create_post(post)

            }
            else if (post.text) {
                post_count -= 1;
                this.create_post(post)
            }
        }
    }
}