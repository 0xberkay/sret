import"./main-BL5B4fk3.js";/* empty css             */import"./three--EydoAg_.js";document.addEventListener("DOMContentLoaded",function(){const c="./blog",a=document.getElementById("blog-post-container"),d=document.getElementById("related-posts-container"),g=new URLSearchParams(window.location.search).get("id");async function m(){if(!g){s("No post ID specified");return}try{a.innerHTML=`
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p data-tr="Yükleniyor..." data-en="Loading...">Yükleniyor...</p>
                </div>
            `;const t=await h(),n=t.find(e=>e.id===g);if(!n){s("Post not found");return}const r=await p(n.markdown_file);u(n,r),f(n),w(n,t)}catch(t){console.error("Error loading blog post:",t),s("Failed to load blog post")}}async function h(){try{const t=await fetch(`${c}/posts.json`);if(!t.ok)throw new Error("Failed to load blog posts");return(await t.json()).posts||[]}catch(t){throw console.error("Error loading blog posts:",t),t}}async function p(t){try{const n=await fetch(`${c}/${t}`);if(!n.ok)throw new Error("Failed to load post content");return await n.text()}catch(n){throw console.error("Error loading post content:",n),n}}function u(t,n){const e=new Date(t.date).toLocaleDateString("tr-TR",{year:"numeric",month:"long",day:"numeric"}),i=t.tags.map(l=>`<span class="blog-card-tag">${l}</span>`).join(""),o=marked.parse(n),b=`
            <article class="blog-post">
                <header class="blog-post-header">
                    <h1 class="blog-post-title">${t.title}</h1>
                    <div class="blog-post-meta">
                        <div class="blog-post-date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>${e}</span>
                        </div>
                    </div>
                </header>
                
                <div class="blog-post-content">
                    ${o}
                </div>
                
                <div class="blog-post-tags">
                    ${i}
                </div>
                
                <div class="blog-post-nav">
                    <a href="blog.html" class="blog-post-nav-back">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span data-tr="Tüm Yazılar" data-en="All Posts">Tüm Yazılar</span>
                    </a>
                </div>
            </article>
        `;a.innerHTML=b,document.querySelectorAll("pre code").forEach(l=>{Prism.highlightElement(l)}),typeof updateLanguage=="function"&&updateLanguage(getCurrentLanguage()),v(t)}function f(t){document.title=`${t.title} | SRET Blog`;const n={description:t.excerpt,"og:title":t.title,"og:description":t.excerpt,"og:url":`https://sret.tr/blog-post.html?id=${t.id}`,"og:image":t.image?`https://sret.tr${t.image.startsWith(".")?t.image.substring(1):t.image}`:"https://sret.tr/src/assets/images/og-image.png","og:type":"article","og:site_name":"SRET","article:published_time":new Date(t.date).toISOString(),"article:modified_time":new Date(t.date).toISOString()};t.tags&&t.tags.length>0&&t.tags.forEach((e,i)=>{n[`article:tag:${i}`]=e}),n["twitter:card"]="summary_large_image",n["twitter:title"]=t.title,n["twitter:description"]=t.excerpt,n["twitter:image"]=t.image?`https://sret.tr${t.image.startsWith(".")?t.image.substring(1):t.image}`:"https://sret.tr/src/assets/images/twitter-card-image.png",Object.entries(n).forEach(([e,i])=>{let o;e.startsWith("og:")||e.startsWith("article:")?o=document.querySelector(`meta[property="${e}"]`):o=document.querySelector(`meta[name="${e}"]`),o||(o=document.createElement("meta"),e.startsWith("og:")||e.startsWith("article:")?o.setAttribute("property",e):o.setAttribute("name",e),document.head.appendChild(o)),o.setAttribute("content",i)});let r=document.querySelector('link[rel="canonical"]');r||(r=document.createElement("link"),r.setAttribute("rel","canonical"),document.head.appendChild(r)),r.setAttribute("href",`https://sret.tr/blog-post.html?id=${t.id}`)}function w(t,n){const r=n.filter(e=>e.id!==t.id).map(e=>{const i=e.tags.filter(o=>t.tags.includes(o));return{...e,relevance:i.length}}).filter(e=>e.relevance>0).sort((e,i)=>i.relevance-e.relevance).slice(0,3);if(r.length<3){const e=n.filter(i=>i.id!==t.id&&!r.some(o=>o.id===i.id)).sort((i,o)=>new Date(o.date)-new Date(i.date)).slice(0,3-r.length);r.push(...e)}if(r.length===0){document.getElementById("related-posts").style.display="none";return}d.innerHTML="",r.forEach(e=>{const i=y(e);d.appendChild(i)})}function y(t){const n=document.createElement("div");n.className="blog-card";const e=new Date(t.date).toLocaleDateString("tr-TR",{year:"numeric",month:"long",day:"numeric"});return n.innerHTML=`
            <div class="blog-card-image">
                <img src="${t.image}" alt="${t.title}">
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <div class="blog-card-date">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>${e}</span>
                    </div>
                </div>
                <h3>${t.title}</h3>
                <p>${t.excerpt.substring(0,100)}${t.excerpt.length>100?"...":""}</p>
                <a href="blog-post.html?id=${t.id}" class="blog-card-link" data-tr="Devamını Oku" data-en="Read More">Devamını Oku</a>
            </div>
        `,n}function s(t){a.innerHTML=`
            <div class="error-container">
                <p class="error-message" data-tr="Hata: ${t}" data-en="Error: ${t}">Hata: ${t}</p>
                <a href="blog.html" class="blog-card-link" data-tr="Blog Sayfasına Dön" data-en="Back to Blog">Blog Sayfasına Dön</a>
            </div>
        `}function v(t){const n=document.querySelector('script[type="application/ld+json"]');if(n)try{JSON.parse(n.textContent)["@type"]==="Article"&&n.remove()}catch{}const r={"@context":"https://schema.org","@type":"Article",mainEntityOfPage:{"@type":"WebPage","@id":`https://sret.tr/blog-post.html?id=${t.id}`},headline:t.title,image:[t.image?`https://sret.tr${t.image.startsWith(".")?t.image.substring(1):t.image}`:"https://sret.tr/src/assets/images/og-image.png"],datePublished:new Date(t.date).toISOString(),dateModified:new Date(t.date).toISOString(),author:{"@type":"Organization",name:"SRET"},publisher:{"@type":"Organization",name:"SRET",logo:{"@type":"ImageObject",url:"https://sret.tr/src/assets/images/logo.png"}},description:t.excerpt};t.tags&&t.tags.length>0&&(r.keywords=t.tags.join(", "));const e=document.createElement("script");e.type="application/ld+json",e.textContent=JSON.stringify(r,null,2),document.head.appendChild(e)}m()});
