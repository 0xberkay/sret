/**
 * SRET Blog Post System
 * Loads and renders individual blog posts from markdown files
 */

document.addEventListener('DOMContentLoaded', function() {
    // Blog configuration
    const BLOG_PATH = './blog';
    
    // Cache DOM elements
    const blogPostContainer = document.getElementById('blog-post-container');
    const relatedPostsContainer = document.getElementById('related-posts-container');
    
    // Get post ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    // Initialize post
    async function initPost() {
        if (!postId) {
            showErrorMessage('No post ID specified');
            return;
        }
        
        try {
            // Show loading state
            blogPostContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p data-tr="Yükleniyor..." data-en="Loading...">Yükleniyor...</p>
                </div>
            `;
            
            // 1. Fetch post metadata
            const allPosts = await fetchBlogPosts();
            const postData = allPosts.find(post => post.id === postId);
            
            if (!postData) {
                showErrorMessage('Post not found');
                return;
            }
            
            // 2. Fetch the post content (markdown)
            const postContent = await fetchPostContent(postData.markdown_file);
            
            // 3. Render the post
            renderPost(postData, postContent);
            
            // 4. Update page metadata
            updatePageMetadata(postData);
            
            // 5. Load related posts
            loadRelatedPosts(postData, allPosts);
            
        } catch (error) {
            console.error('Error loading blog post:', error);
            showErrorMessage('Failed to load blog post');
        }
    }
    
    // Fetch all blog posts metadata
    async function fetchBlogPosts() {
        try {
            const response = await fetch(`${BLOG_PATH}/posts.json`);
            if (!response.ok) {
                throw new Error('Failed to load blog posts');
            }
            const data = await response.json();
            return data.posts || [];
        } catch (error) {
            console.error('Error loading blog posts:', error);
            throw error;
        }
    }
    
    // Fetch post content (markdown)
    async function fetchPostContent(markdownFile) {
        try {
            const response = await fetch(`${BLOG_PATH}/${markdownFile}`);
            if (!response.ok) {
                throw new Error('Failed to load post content');
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading post content:', error);
            throw error;
        }
    }
    
    // Render the blog post
    function renderPost(postData, markdownContent) {
        // Format date
        const postDate = new Date(postData.date);
        const formattedDate = postDate.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create tag elements
        const tagElements = postData.tags.map(tag => 
            `<span class="blog-card-tag">${tag}</span>`
        ).join('');
        
        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownContent);
        
        // Create post structure
        const postHtml = `
            <article class="blog-post">
                <header class="blog-post-header">
                    <h1 class="blog-post-title">${postData.title}</h1>
                    <div class="blog-post-meta">
                        <div class="blog-post-date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>${formattedDate}</span>
                        </div>
                    </div>
                </header>
                
                <div class="blog-post-content">
                    ${htmlContent}
                </div>
                
                <div class="blog-post-tags">
                    ${tagElements}
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
        `;
        
        // Replace the loading state with the post content
        blogPostContainer.innerHTML = postHtml;
        
        // Apply syntax highlighting to code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            Prism.highlightElement(block);
        });
        
        // Apply translations if language was already set
        if (typeof updateLanguage === 'function') {
            updateLanguage(getCurrentLanguage());
        }
        
        // Add JSON-LD Structured Data
        generateAndInjectArticleJsonLd(postData);
    }
    
    // Update page metadata for SEO
    function updatePageMetadata(postData) {
        // Update title
        document.title = `${postData.title} | SRET Blog`;
        
        // Prepare meta tags
        const metaTags = {
            'description': postData.excerpt,
            'og:title': postData.title,
            'og:description': postData.excerpt,
            'og:url': `https://sret.tr/blog-post.html?id=${postData.id}`,
            'og:image': postData.image ? `https://sret.tr${postData.image.startsWith('.') ? postData.image.substring(1) : postData.image}` : 'https://sret.tr/src/assets/images/og-image.png',
            'og:type': 'article',
            'og:site_name': 'SRET',
            'article:published_time': new Date(postData.date).toISOString(),
            'article:modified_time': new Date(postData.date).toISOString(), // Assuming same as published for now
        };
        if (postData.tags && postData.tags.length > 0) {
            postData.tags.forEach((tag, index) => {
                metaTags[`article:tag:${index}`] = tag; // Changed to avoid duplicate meta tags with same name
            });
        }
        
        // Twitter card specific tags (already good, just ensure image URL is absolute)
        metaTags['twitter:card'] = 'summary_large_image';
        metaTags['twitter:title'] = postData.title;
        metaTags['twitter:description'] = postData.excerpt;
        metaTags['twitter:image'] = postData.image ? `https://sret.tr${postData.image.startsWith('.') ? postData.image.substring(1) : postData.image}` : 'https://sret.tr/src/assets/images/twitter-card-image.png';
        // 'twitter:site' is likely already in blog-post.html statically, which is fine.

        // Apply meta tag updates
        Object.entries(metaTags).forEach(([key, content]) => {
            let metaTag;
            if (key.startsWith('og:') || key.startsWith('article:')) {
                metaTag = document.querySelector(`meta[property="${key}"]`);
            } else {
                metaTag = document.querySelector(`meta[name="${key}"]`);
            }
            
            if (!metaTag) {
                metaTag = document.createElement('meta');
                if (key.startsWith('og:') || key.startsWith('article:')) {
                    metaTag.setAttribute('property', key);
                } else {
                    metaTag.setAttribute('name', key);
                }
                document.head.appendChild(metaTag);
            }
            metaTag.setAttribute('content', content);
        });

        // Update Canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', `https://sret.tr/blog-post.html?id=${postData.id}`);
    }
    
    // Load related posts
    function loadRelatedPosts(currentPost, allPosts) {
        // Find posts with similar tags (excluding the current post)
        const relatedPosts = allPosts
            .filter(post => post.id !== currentPost.id)
            .map(post => {
                // Calculate relevance score based on matching tags
                const matchingTags = post.tags.filter(tag => currentPost.tags.includes(tag));
                return {
                    ...post,
                    relevance: matchingTags.length
                };
            })
            .filter(post => post.relevance > 0) // Only include posts with at least one matching tag
            .sort((a, b) => b.relevance - a.relevance) // Sort by relevance (most relevant first)
            .slice(0, 3); // Take the top 3 most related posts
        
        // If we don't have enough related posts, add some recent posts
        if (relatedPosts.length < 3) {
            const recentPosts = allPosts
                .filter(post => post.id !== currentPost.id && !relatedPosts.some(rp => rp.id === post.id))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3 - relatedPosts.length);
            
            relatedPosts.push(...recentPosts);
        }
        
        // Render related posts
        if (relatedPosts.length === 0) {
            document.getElementById('related-posts').style.display = 'none';
            return;
        }
        
        // Clear container
        relatedPostsContainer.innerHTML = '';
        
        // Create post cards for each related post
        relatedPosts.forEach(post => {
            const postCard = createRelatedPostCard(post);
            relatedPostsContainer.appendChild(postCard);
        });
    }
    
    // Create a related post card
    function createRelatedPostCard(post) {
        const card = document.createElement('div');
        card.className = 'blog-card';
        
        // Format date
        const postDate = new Date(post.date);
        const formattedDate = postDate.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        card.innerHTML = `
            <div class="blog-card-image">
                <img src="${post.image}" alt="${post.title}">
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
                        <span>${formattedDate}</span>
                    </div>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt.substring(0, 100)}${post.excerpt.length > 100 ? '...' : ''}</p>
                <a href="blog-post.html?id=${post.id}" class="blog-card-link" data-tr="Devamını Oku" data-en="Read More">Devamını Oku</a>
            </div>
        `;
        
        return card;
    }
    
    // Show error message
    function showErrorMessage(message) {
        blogPostContainer.innerHTML = `
            <div class="error-container">
                <p class="error-message" data-tr="Hata: ${message}" data-en="Error: ${message}">Hata: ${message}</p>
                <a href="blog.html" class="blog-card-link" data-tr="Blog Sayfasına Dön" data-en="Back to Blog">Blog Sayfasına Dön</a>
            </div>
        `;
    }
    
    // Generate and inject JSON-LD for Article schema
    function generateAndInjectArticleJsonLd(postData) {
        // Remove existing Article JSON-LD script if any
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            try {
                const jsonData = JSON.parse(existingScript.textContent);
                if (jsonData['@type'] === 'Article') {
                    existingScript.remove();
                }
            } catch (e) {
                // Not a valid JSON or not an Article, leave it.
            }
        }

        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "Article",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://sret.tr/blog-post.html?id=${postData.id}`
            },
            "headline": postData.title,
            "image": [
                postData.image ? `https://sret.tr${postData.image.startsWith('.') ? postData.image.substring(1) : postData.image}` : 'https://sret.tr/src/assets/images/og-image.png'
            ],
            "datePublished": new Date(postData.date).toISOString(),
            "dateModified": new Date(postData.date).toISOString(), // Assuming same for now
            "author": {
                "@type": "Organization",
                "name": "SRET"
            },
            "publisher": {
                "@type": "Organization",
                "name": "SRET",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://sret.tr/src/assets/images/logo.png" // Assuming you have a logo here
                }
            },
            "description": postData.excerpt
        };
        
        if (postData.tags && postData.tags.length > 0) {
            jsonLd.keywords = postData.tags.join(', ');
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(jsonLd, null, 2); // null, 2 for pretty print, optional
        document.head.appendChild(script);
    }
    
    // Initialize the post
    initPost();
}); 