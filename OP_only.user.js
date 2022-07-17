// ==UserScript==
// @name         OP_Only
// @namespace    OP_Only
// @author       Arkel01
// @description  Affiche tous les messages de l'auteur d'un topic jeuxvideo.com. Github : https://github.com/Arkel01/OP_Only
// @icon         http://image.noelshack.com/fichiers/2022/25/3/1655854502-op-only-logo.png
// @version      1.1.1
// @license      MIT
// @downloadURL  https://github.com/Arkel01/OP_Only/raw/main/OP_only.user.js
// @updateURL    https://github.com/Arkel01/OP_Only/raw/main/OP_only.user.js
// @match        https://www.jeuxvideo.com/forums/42-*
// ==/UserScript==


function make_request(url) {
    // Requête xmlhttp qui extraie l'objet document associé à l'URL donnée en argument

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'document';
        xhr.open('GET', url);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

async function main() { // Fonction exécutée en appuyant sur le bouton

    return new Promise(async resolve => {

        // Extraction du nombre de pages
        let page_bloc = document.getElementsByClassName('bloc-liste-num-page')[0];
        let n_pages;
        (page_bloc.lastChild.textContent == '»') ? n_pages = page_bloc.lastChild.previousSibling.textContent : n_pages = page_bloc.lastChild.textContent; // Quand il y a beaucoup de pages, le nombre de pages est dans l'avant dernier élément, pas le dernier

        // Suppression des numéros de pages, qui pourraient laisser penser que le script affiche les résultats sur plusieurs pages
        document.getElementsByClassName('bloc-liste-num-page')[0].remove();
        document.getElementsByClassName('bloc-liste-num-page')[0].remove();

        // Suppression des tous les messages de la page
        let messages_main_page = document.getElementsByClassName('conteneur-messages-pagi')[0].getElementsByClassName('bloc-message-forum mx-2 mx-lg-0 '); // Array de tous les blocs de messages de la page initiale
        let messages_main_page_length = messages_main_page.length;
        for (let element = 0; element < messages_main_page_length - 1; element++) messages_main_page[0].remove();

        // Message en haut du topic indiquant la progression du script
        let progress = document.createElement('div');
        progress.id = 'progress';
        progress.style.textAlign = 'center';
        progress.textContent = 'OP_Only : début de la récupération des messages...';
        document.getElementsByClassName('conteneur-messages-pagi')[0].insertBefore(progress, document.getElementsByClassName('conteneur-messages-pagi')[0].firstChild);


        let author; // Pseudonyme de l'auteur

        for (let current_page_number = 1; current_page_number < parseInt(n_pages) + 1; current_page_number++) { // Itération sur chaque page du topic

            progress.textContent = 'OP Only : récupération des messages en cours : page ' + current_page_number + '/' + parseInt(n_pages); // Modification du message d'entête

            // Création de l'URL de la page suivante
            let url_split = document.URL.split('-');
            url_split[3] = current_page_number.toString();

            // Récupération du document de la nouvelle page à observer
            let current_page_document = await make_request(url_split.join('-').split('#')[0]);

            let messages = current_page_document.getElementsByClassName('bloc-message-forum mx-2 mx-lg-0 '); // Array de tous les blocs de messages de la page observée

            if (current_page_number == 1) { // Récupération du pseudonyme de l'auteur à la page 1
                // Les pseudo sont stockés sous la forme ''\n                            LeDiplodocul\n                        '. Le pseudo commence toujours au 30ème caractère, on l'obtient en l'extrayant de la chaîne de caractères
                author = messages[0].querySelectorAll('[class$=text-user]')[0].innerHTML.substring(29).split('\n')[0];
            }

            for (let messages_number = 0; messages_number < messages.length; messages_number++) { // Itération sur chaque message de la page
                let current_bloc_avatar = messages[messages_number].querySelectorAll('[class$=text-user]')[0]; // Bloc de l'avatar du message observé
                if (current_bloc_avatar != undefined) { // Quand l'auteur du message observé est banni, le bloc avatar associé n'existe pas. Ce n'est donc pas l'auteur
                    let current_author = current_bloc_avatar.innerHTML.substring(29).split('\n')[0]; // On récupère le pseudonyme de l'auteur du message comme précedemment
                    if (current_author == author) { // Si le message est observé est bien un message de l'auteur, l'afficher
                        let current_avatar = messages[messages_number].getElementsByClassName('user-avatar-msg js-lazy')[0]; // Les avatars sont déformés lors de la requête http (l'avatar passe de l'attribut 'src' à 'data-src' et doit être réattribué)
                        current_avatar.setAttribute('src', current_avatar.getAttribute('data-src'));
                        document.getElementsByClassName('conteneur-messages-pagi')[0].insertBefore(messages[messages_number], document.getElementsByClassName('bloc-message-forum-anchor')[1]);
                    }
                }
            }
        }

        // Modification du message d'entête et changement de la couleur du bouton pour signifier la fin du script
        progress.textContent = 'OP Only : récupération des messages terminée.';
        btn.style.borderColor = 'green';
        this.disabled = true;

        resolve();
    });
}

// Création du bouton permettant d'appeler le script, positionné à côté du bouton 'Liste des sujets'
let btn = document.createElement('button');
btn.id = 'btn';
btn.textContent = 'Messages de l\'auteur';

btn.classList.add('btn', 'btn-actu-new-list-forum');
btn.style.minWidth = '8.5rem'; // La largeur du bouton doit être légèrement plus grande que les autres pour pouvoir contenir le texte intérieur
document.getElementsByClassName('group-two')[0].appendChild(btn); // Ajout du bouton

btn.onclick = async function () {
    this.disabled = 'true';
    await main();
    this.style.border = '0.0625rem solid #c28507';
    this.style.background = '#f0a100';
    this.style.color = 'white';
    this.disabled = 'true';
}
