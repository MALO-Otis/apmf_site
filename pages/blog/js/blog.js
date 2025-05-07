document.addEventListener('DOMContentLoaded', function() {
    // Données simulées (remplacer par un appel API en production)
    const blogPosts = [
        {
            id: 1,
            title: "10 Conseils pour Prévenir le Paludisme",
            excerpt: "Découvrez les meilleures pratiques pour éviter le paludisme dans notre région...",
            content: "<p>Le paludisme reste un problème majeur de santé publique en Afrique. Voici 10 conseils éprouvés...</p>",
            author: "Dr. Aïcha Ouédraogo",
            date: "15 novembre 2023",
            category: "Prévention",
            images: [
                "./../assets/images/blog/malaria.jpeg",
                "./../assets/images/blog/malaria1.jpeg",
                "./../assets/images/blog/malaria2.jpeg",
                "./../assets/images/blog/malaria.jpeg",
            ]
        },
        {
            id: 2,
            title: "L'Importance de la Vaccination Infantile",
            excerpt: "Pourquoi vacciner vos enfants? Explications par nos spécialistes...",
            content: "<p>La vaccination sauve des millions de vies chaque année. Dans cet article...</p>",
            author: "Dr. Paul Zongo",
            date: "10 novembre 2023",
            category: "Conseils",
            images: [
                "./../assets/images/blog/vaccin1.jpeg",
                "./../assets/images/blog/vaccin2.jpeg",
                "./../assets/images/blog/vaccin2.jpeg",
                "./../assets/images/blog/vaccin1.jpeg",
            ]
        }
    ];

    const blogGrid = document.getElementById('blogGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let currentPage = 1;
    const postsPerPage = 6;

    // Afficher les articles
    function displayPosts(posts) {
        posts.forEach(post => {
            const postEl = document.createElement('article');
            postEl.className = 'blog-card';
            postEl.innerHTML = `
                <div class="blog-card-image">
                    <img src="${post.images[1]}" alt="${post.title}">
                </div>
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span>${post.date}</span>
                        <span class="tag">${post.category}</span>
                    </div>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <div class="blog-card-footer">
                        <span><i class="fas fa-user"></i> ${post.author}</span>
                        <a href="./blog/articles.html?id=${post.id}" class="btn btn-outline">Lire plus</a>
                    </div>
                </div>
            `;
            blogGrid.appendChild(postEl);
        });
        // Ajouter les gestionnaires d'événements
    document.querySelectorAll('.read-more').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.getAttribute('data-id');
            window.location.href = `./blog/articles.html?id=${postId}`;
        });
    });
    }

    // Charger plus d'articles
    function loadMorePosts() {
        currentPage++;
        const start = (currentPage - 1) * postsPerPage;
        const end = start + postsPerPage;
        const morePosts = blogPosts.slice(start, end);
        
        if (morePosts.length === 0) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = "Fin des articles";
            return;
        }
        
        displayPosts(morePosts);
    }

    // Initialisation
    displayPosts(blogPosts.slice(0, postsPerPage));

    // Événements
    loadMoreBtn.addEventListener('click', loadMorePosts);

    // LOGIQUE DU MENU BURGER (responsive mobile)
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-menu");

menuBtn.addEventListener("click", function () {
  navLinks.classList.toggle("active");
});


});