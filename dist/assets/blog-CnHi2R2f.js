import"./main-DmGjC8lB.js";/* empty css             */import"./three--EydoAg_.js";document.addEventListener("DOMContentLoaded",function(){const u="./blog",s=document.getElementById("blog-posts-container"),g=document.getElementById("blog-search"),a=document.getElementById("search-button"),e=document.querySelectorAll(".tag");let d=[],o=[],l="all",i="";async function m(){try{const t=await fetch(`${u}/posts.json`);if(!t.ok)throw new Error("Failed to load blog posts");return(await t.json()).posts||[]}catch(t){return console.error("Error loading blog posts:",t),[]}}async function f(){s.innerHTML=`
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p data-tr="Yükleniyor..." data-en="Loading...">Yükleniyor...</p>
            </div>
        `,d=await m(),d.sort((t,n)=>new Date(n.date)-new Date(t.date)),c(),w()}function c(){o=d.filter(t=>{const n=l==="all"||t.tags.includes(l),v=i.toLowerCase(),p=i===""||t.title.toLowerCase().includes(v)||t.excerpt.toLowerCase().includes(v)||t.tags.some(y=>y.toLowerCase().includes(v));return n&&p}),h()}function h(){if(s.innerHTML="",o.length===0){s.innerHTML=`
                <div class="no-results">
                    <p data-tr="Gösterilecek blog yazısı bulunamadı." data-en="No blog posts found to display.">Gösterilecek blog yazısı bulunamadı.</p>
                </div>
            `;return}o.forEach(t=>{const n=r(t);s.appendChild(n)}),typeof updateLanguage=="function"&&updateLanguage(getCurrentLanguage())}function r(t){const n=document.createElement("div");n.className="blog-card";const p=new Date(t.date).toLocaleDateString("tr-TR",{year:"numeric",month:"long",day:"numeric"}),y=t.tags.map(b=>`<span class="blog-card-tag">${b}</span>`).join("");return n.innerHTML=`
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
                        <span>${p}</span>
                    </div>
                </div>
                <h3>${t.title}</h3>
                <p>${t.excerpt}</p>
                <div class="blog-card-tags">${y}</div>
                <a href="blog-post.html?id=${t.id}" class="blog-card-link" data-tr="Devamını Oku" data-en="Read More">Devamını Oku</a>
            </div>
        `,n}function w(){e.forEach(t=>{t.addEventListener("click",function(){e.forEach(n=>n.classList.remove("active")),this.classList.add("active"),l=this.getAttribute("data-tag"),c()})}),a.addEventListener("click",function(){i=g.value.trim(),c()}),g.addEventListener("keyup",function(t){t.key==="Enter"&&(i=g.value.trim(),c())})}f()});(function(){let u=null,s=!0;window.addEventListener("load",function(){setTimeout(g,500)}),document.addEventListener("visibilitychange",function(){s=document.visibilityState==="visible",s&&!u&&animate()});function g(){const a=document.getElementById("matrix-canvas");if(!a){console.error("Matrix canvas not found!");return}const e=a.getContext("2d",{alpha:!1});if(!e){console.error("Could not get canvas context!");return}const d="01";let o=Math.max(10,Math.min(16,window.innerWidth/100)),l=0,i=[],m;window.addEventListener("resize",function(){clearTimeout(m),m=setTimeout(f,200)});function f(){a.width=window.innerWidth,a.height=window.innerHeight,o=Math.max(10,Math.min(16,window.innerWidth/100));const h=window.innerWidth<768?1.5:1;l=Math.floor(a.width/(o*h)),i=Array(l).fill(0).map(()=>Math.floor(Math.random()*a.height/o)-Math.floor(Math.random()*100))}f();function c(){if(!s){u=null;return}e.fillStyle="rgba(0, 0, 0, 0.1)",e.fillRect(0,0,a.width,a.height);const h=window.innerWidth<768?3:2;e.font=`${o}px Orbitron, monospace`;for(let r=0;r<l;r++){if(r%h!==0||Math.random()>.8)continue;const w=d.charAt(Math.floor(Math.random()*d.length));Math.random()>.98?(e.fillStyle="rgba(255, 255, 255, 0.6)",e.shadowColor="rgba(0, 255, 170, 0.7)",e.shadowBlur=8):(e.fillStyle="rgba(0, 255, 170, 0.3)",e.shadowBlur=0),e.fillText(w,r*o,i[r]*o),i[r]+=.7,i[r]*o>a.height&&Math.random()>.975&&(i[r]=0)}u=requestAnimationFrame(c)}c()}})();
