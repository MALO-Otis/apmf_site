document.addEventListener('DOMContentLoaded', function() {
    // Données simulées (remplacer par un appel API en production)
    const blogPosts = [
        {
            id: 1,
            title: "10 Conseils pour Prévenir le Paludisme",
            date: "15 novembre 2023",
            status: "publié",
            views: 1245
        },
        {
            id: 2,
            title: "L'Importance de la Vaccination Infantile",
            date: "10 novembre 2023",
            status: "publié",
            views: 876
        }
    ];

    const adminPosts = document.getElementById('adminPosts');

    function displayPosts() {
        blogPosts.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'post-card';
            postEl.innerHTML = `
                <div class="post-info">
                    <h3>${post.title}</h3>
                    <p>${post.date} • ${post.status} • ${post.views} vues</p>
                </div>
                <div class="post-actions">
                    <a href="post-editor.html?id=${post.id}" class="btn"><i class="fas fa-edit"></i></a>
                    <button class="btn btn-danger"><i class="fas fa-trash"></i></button>
                </div>
            `;
            adminPosts.appendChild(postEl);
        });
    }

    displayPosts();
});