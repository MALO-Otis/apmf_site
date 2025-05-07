document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'ID de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // Données simulées (remplacer par un appel API en production)
    const blogPosts = [
        {
            id: 1,
            title: "10 Conseils pour Prévenir le Paludisme",
            excerpt: "Découvrez les meilleures pratiques pour éviter le paludisme...",
            content: `
                <h2>Introduction</h2>
                <p>Le paludisme reste une menace majeure pour la santé en Afrique subsaharienne. Chaque année, des millions de personnes sont infectées...</p>
                
                <h2>Les symptômes à reconnaître</h2>
                <p>Les premiers symptômes incluent :</p>
                <ul>
                    <li>Fièvre élevée</li>
                    <li>Frissons</li>
                    <li>Maux de tête intenses</li>
                    <li>Douleurs musculaires</li>
                </ul>
                
                <h2>Nos 10 conseils de prévention</h2>
                <ol>
                    <li>Utilisez des moustiquaires imprégnées d'insecticide</li>
                    <li>Appliquez un répulsif anti-moustiques</li>
                    <li>Portez des vêtements couvrants le soir</li>
                    <!-- ... autres conseils ... -->
                </ol>
                
                <h2>Conclusion</h2>
                <p>En suivant ces conseils et en consultant rapidement un médecin en cas de symptômes...</p>
            `,
            author: "Dr. Aïcha Ouédraogo",
            date: "15 novembre 2023",
            category: "Prévention",
            images: [
                "./../../assets/images/blog/vaccin1.jpeg",
                "./../../assets/images/blog/vaccin2.jpeg",
                "./../../assets/images/blog/vaccin2.jpeg",
                "./../../assets/images/blog/vaccin1.jpeg",
            ]
        }
    ];

    // Afficher l'article avec slider
    function displayArticle() {
        const article = blogPosts.find(post => post.id === parseInt(postId));
        
        if (!article) {
            document.getElementById('articleContent').innerHTML = `
                <div class="article-not-found">
                    <h2>Article non trouvé</h2>
                    <p>L'article que vous recherchez n'existe pas ou a été supprimé.</p>
                    <a href="./../blog.html" class="btn">Retour au blog</a>
                </div>
            `;
            return;
        }

        // Créer le HTML du slider
        const sliderHTML = `
            <div class="swiper">
                <div class="swiper-wrapper">
                    ${article.images.map(img => `
                        <div class="swiper-slide">
                            <img src="${img}" alt="${article.title}">
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
        `;

        // Afficher tout l'article
        document.getElementById('articleContent').innerHTML = `
            <header class="article-header">
                <div class="article-meta">
                    <span class="article-date"><i class="far fa-calendar"></i> ${article.date}</span>
                    <span class="article-category tag">${article.category}</span>
                </div>
                <h1 class="article-title">${article.title}</h1>
                <div class="article-author">
                    <i class="fas fa-user"></i> ${article.author}
                </div>
            </header>
            
            <div class="article-gallery">
                ${sliderHTML}
            </div>
            
            <div class="article-body">
                ${article.content}
            </div>
            
            <footer class="article-footer">
                <a href="./../blog.html" class="btn"><i class="fas fa-arrow-left"></i> Retour aux articles</a>
            </footer>
        `;

        // Initialiser le slider
        new Swiper('.swiper', {
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    displayArticle();
});