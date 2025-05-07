document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'éditeur de texte riche
    tinymce.init({
        selector: '#postContent',
        plugins: 'link lists image table code',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
        height: 500
    });

    // Gestion de l'upload d'images
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        
        if (files.length < 4) {
            alert('Veuillez sélectionner au moins 4 images');
            return;
        }
        
        imagePreview.innerHTML = '';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) continue;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-image';
                imgContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Prévisualisation">
                    <button class="remove-image"><i class="fas fa-times"></i></button>
                `;
                imagePreview.appendChild(imgContainer);
            }
            reader.readAsDataURL(file);
        }
    });

    // Sauvegarder ou publier l'article
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    document.getElementById('publishBtn').addEventListener('click', publishPost);
    
    function saveDraft() {
        const postData = getPostData();
        console.log('Brouillon enregistré:', postData);
        alert('Brouillon enregistré avec succès!');
    }
    
    function publishPost() {
        const postData = getPostData();
        
        if (validatePost(postData)) {
            console.log('Article publié:', postData);
            alert('Article publié avec succès!');
            window.location.href = "index.html";
        }
    }
    
    function getPostData() {
        return {
            title: document.getElementById('postTitle').value,
            excerpt: document.getElementById('postExcerpt').value,
            content: tinymce.get('postContent').getContent(),
            category: document.getElementById('postCategory').value,
            author: document.getElementById('postAuthor').value,
            images: Array.from(fileInput.files)
        };
    }
    
    function validatePost(post) {
        if (!post.title || !post.excerpt || !post.content) {
            alert('Veuillez remplir tous les champs obligatoires');
            return false;
        }
        
        if (post.images.length < 4) {
            alert('Veuillez ajouter au moins 4 images');
            return false;
        }
        
        return true;
    }
});