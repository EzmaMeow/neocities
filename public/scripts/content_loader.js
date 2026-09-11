
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
    type = 'post';
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
	<div class="info_content ${this.type} collapsible_content ${ext === 'md' || ext === 'markdown' ? 'markdown' : ''}">
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
