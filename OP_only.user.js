// ==UserScript==
// @name         OP_Only
// @namespace    OP_Only
// @author       Arkel01
// @description  Affiche tous les messages de l'auteur d'un topic jeuxvideo.com. Github : https://github.com/Arkel01/OP_Only
// @icon         http://image.noelshack.com/fichiers/2022/25/3/1655854502-op-only-logo.png
// @version      1.0.0
// @license      MIT
// @downloadURL  https://github.com/Arkel01/OP_Only/raw/main/OP_Only.user.js
// @updateURL    https://github.com/Arkel01/OP_Only/raw/main/OP_Only.user.js
// @match        http://www.jeuxvideo.com/forums/42-*
// @match        https://www.jeuxvideo.com/forums/42-*
// @match        http://www.jeuxvideo.com/forums/1-*
// @match        https://www.jeuxvideo.com/forums/1-*

// ==/UserScript==

(function() {
    'use strict';

    function makeRequest (url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = "document";
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
    } // Requête xmlhttp qui extraie l'objet document associé à l'URL donnée en argument

    async function main() { // Fonction exécutée en appuyant sur le bouton

        // Suppression des numéros de pages, qui pourraient laisser penser que le script affiche les résultats sur plusieurs pages
        document.getElementsByClassName("bloc-liste-num-page")[0].remove();
        document.getElementsByClassName("bloc-liste-num-page")[0].remove();

        // Suppression des tous les messages de la page (sauf le 1er, nécessairement de l'auteur)
        let messages_main_page=document.getElementsByClassName("bloc-message-forum mx-2 mx-lg-0 "); // HTMLCollection de tous les blocs de messages de la page initiale
        let n_messages_to_del=messages_main_page.length; // On doit stocker le nombre de messages à supprimer car messages_main_page.length var varier à chaque itération, et ne peut donc pas directement être utilisé
        for(let i=0; i<n_messages_to_del;i++) messages_main_page[0].remove();

        // Message en haut du topic indiquant la progression du script
        let progress = document.createElement("div");
        progress.id="progress";
        progress.style.position = "relative";
        progress.style.left = "28%";
        progress.style.top = "50%";
        document.getElementsByClassName("conteneur-messages-pagi")[0].insertBefore(progress,document.getElementsByClassName("bloc-pagi-default px-3 px-lg-0")[0]);

        progress.innerHTML="Début de la récupération des messages...";

        let last_page=document.getElementsByClassName("xXx pagi-fin-actif icon-next2")[0]; // Vaut undefined s'il n'y a qu'une page
        let n_pages;

        /* L'URL d'un topic s'écrit : "https://www.jeuxvideo.com/forums/XX-XX-XXXXXXXX-?-0-1-0-titre-du-topic.htm". Le "?" correspond à la page du topic
        On récupère l'URL associée au bouton de la dernière page (i.e l'URL de la dernière page), puis on récupère le "?", qui est donc le nombre de pages. */
        (last_page==undefined) ? n_pages=1 : n_pages=parseInt(last_page.href.split('-')[3]);

        let current_page_document; // Document de la page observée dans la boucle
        let current_author; // Pseudo du message observé dans la boucle
        let current_avatar; // Avatar de l'auteur du message observé dans la boucle
        let current_bloc_avatar; // Bloc de l'avatar du message observé
        let author; // Pseudo de l'auteur

        for (let current_page_number = 1; current_page_number < n_pages+1; current_page_number++) { // Itération sur chaque page du topic

            progress.innerHTML="Récupération des messages en cours : page " + current_page_number + "/" + n_pages; // Modification du message d'entête

            // Création de l'URL de la page suivante en modifiant le "?"
            let url_split=document.URL.split('-');
            url_split[3]=current_page_number.toString();

            // Récupération du document de la nouvelle page à observer
            current_page_document = await makeRequest(url_split.join('-'))
                .then(function (document) {
                return document;
            })
                .catch(function (err) {
                console.error('Error in OP Only script (xmlhttpRequest did not resolve).', err.statusText);
            });

            let messages=current_page_document.getElementsByClassName("bloc-message-forum mx-2 mx-lg-0 "); // HTMLCollection de tous les blocs de messages de la page observée

            if(current_page_number==1){ // Récupération du pseudo de l'auteur à la page 1
                // Les pseudo sont stockés sous la forme ''\n                            LeDiplodocul\n                        '. Le pseudo commence toujours au 30ème caractère, on l'obtient en l'extrayant de la chaîne de caractères
                author=messages[0].querySelectorAll("[class$=text-user]")[0].innerHTML.substring(29).split('\n')[0];
            }

            for(let messages_number=0; messages_number<messages.length; messages_number++){ // Itération sur chaque message de la page
                current_bloc_avatar=messages[messages_number].querySelectorAll("[class$=text-user]")[0]; // Bloc de l'avatar du message observé
                if(current_bloc_avatar!=undefined){ // Quand l'auteur du message observé est banni, le bloc avatar associé n'existe pas. Ce n'est donc pas l'auteur
                    current_author=current_bloc_avatar.innerHTML.substring(29).split('\n')[0]; // On récupère le pseudo de l'auteur du message comme précedemment
                    if(current_author==author){ // Si le message est observé est bien un message de l'auteur, l'afficher
                        current_avatar=messages[messages_number].getElementsByClassName("user-avatar-msg js-lazy")[0]; // Les avatars sont déformés lors de la requête http (l'avatar passe de l'attribut 'src' à 'data-src' et doit être réattribué)
                        current_avatar.setAttribute('src',current_avatar.getAttribute('data-src'));
                        document.getElementsByClassName("conteneur-messages-pagi")[0].insertBefore(messages[messages_number],document.getElementsByClassName("bloc-message-forum-anchor")[1]);
                    }
                }
            }
        }

        // Modification du message d'entête et changement de la couleur du bouton pour signifier la fin du script
        progress.innerHTML="Récupération des messages terminée.";
        progress.style.left = "32%";
        btn.style.borderColor="green";
        this.disabled=true;
    }

    // Création du bouton permettant d'appeler le script, positionné à côté du bouton "Liste des sujets"
    let btn = document.createElement("button");
    btn.id="btn";
    btn.innerHTML = "Messages de l'auteur";

    btn.classList.add("btn","btn-actu-new-list-forum");
    btn.style.setProperty("min-width","8.5rem"); // La largeur du bouton doit être légèrement plus grande que les autres pour pouvoir contenir le texte intérieur
    document.getElementsByClassName("group-two")[0].appendChild(btn); // Ajout du bouton

    btn.onclick=main;

})();
