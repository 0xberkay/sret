/**
 * SRET Blog System
 * Loads and displays blog posts from markdown files
 */

document.addEventListener('DOMContentLoaded', function() {
    // Blog configuration
    const BLOG_PATH = './blog';
    
    // Cache DOM elements
    const blogPostsContainer = document.getElementById('blog-posts-container');
    const blogSearch = document.getElementById('blog-search');
    const searchButton = document.getElementById('search-button');
    const tagElements = document.querySelectorAll('.tag');
    
    // Blog data
    let allPosts = [];
    let filteredPosts = [];
    let activeTag = 'all';
    let searchQuery = '';
    
    // Fetch blog posts metadata
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
            return [];
        }
    }
    
    // Initialize blog
    async function initBlog() {
        // Show loading state
        blogPostsContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p data-tr="Yükleniyor..." data-en="Loading...">Yükleniyor...</p>
            </div>
        `;
        
        // Load blog posts
        allPosts = await fetchBlogPosts();
        
        // Sort posts by date (newest first)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Apply initial filters
        applyFilters();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Apply filters (tag and search)
    function applyFilters() {
        // Filter posts based on tag and search query
        filteredPosts = allPosts.filter(post => {
            // Tag filter
            const matchesTag = activeTag === 'all' || post.tags.includes(activeTag);
            
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = searchQuery === '' || 
                                post.title.toLowerCase().includes(searchLower) || 
                                post.excerpt.toLowerCase().includes(searchLower) ||
                                post.tags.some(tag => tag.toLowerCase().includes(searchLower));
            
            return matchesTag && matchesSearch;
        });
        
        // Render filtered posts
        renderPosts();
    }
    
    // Render posts to the DOM
    function renderPosts() {
        // Clear container
        blogPostsContainer.innerHTML = '';
        
        if (filteredPosts.length === 0) {
            blogPostsContainer.innerHTML = `
                <div class="no-results">
                    <p data-tr="Gösterilecek blog yazısı bulunamadı." data-en="No blog posts found to display.">Gösterilecek blog yazısı bulunamadı.</p>
                </div>
            `;
            return;
        }
        
        // Create post cards for each post
        filteredPosts.forEach(post => {
            const postCard = createPostCard(post);
            blogPostsContainer.appendChild(postCard);
        });
        
        // Apply translations if language was already set
        if (typeof updateLanguage === 'function') {
            updateLanguage(getCurrentLanguage());
        }
    }
    
    // Create a blog post card
    function createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'blog-card';
        
        // Format date
        const postDate = new Date(post.date);
        const formattedDate = postDate.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create tag elements
        const tagElements = post.tags.map(tag => 
            `<span class="blog-card-tag">${tag}</span>`
        ).join('');
        
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
                <p>${post.excerpt}</p>
                <div class="blog-card-tags">${tagElements}</div>
                <a href="blog-post.html?id=${post.id}" class="blog-card-link" data-tr="Devamını Oku" data-en="Read More">Devamını Oku</a>
            </div>
        `;
        
        return card;
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Tag filtering
        tagElements.forEach(tagElement => {
            tagElement.addEventListener('click', function() {
                // Remove active class from all tags
                tagElements.forEach(el => el.classList.remove('active'));
                
                // Add active class to clicked tag
                this.classList.add('active');
                
                // Update active tag
                activeTag = this.getAttribute('data-tag');
                
                // Apply filters
                applyFilters();
            });
        });
        
        // Search functionality
        searchButton.addEventListener('click', function() {
            searchQuery = blogSearch.value.trim();
            applyFilters();
        });
        
        // Search on Enter key
        blogSearch.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchQuery = blogSearch.value.trim();
                applyFilters();
            }
        });
    }
    
    // Initialize the blog
    initBlog();
}); 