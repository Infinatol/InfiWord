# InfiWord

InfiWord est un logiciel de traitement de texte complet, entièrement indépendant et open source, conçu pour fonctionner localement sur votre ordinateur sans aucune dépendance au Cloud.

## Fonctionnalités Principales

- **Édition de texte riche** : Gras, italique, souligné, barré.
- **Mise en forme avancée** : Changement de police, taille, couleurs de texte et de surbrillance.
- **Paragraphes et listes** : Alignements (gauche, centré, droite, justifié) et listes (à puces et numérotées).
- **Insertion** : Images locales, création de tableaux et caractères spéciaux.
- **Gestion de fichiers multi-formats** : Sauvegarde aux formats `.infiword` (qui conserve toute la mise en forme) et `.txt` (texte brut).
- **Export PDF et Impression** : Export direct en document PDF via le menu natif, ou impression locale.
- **Interface Moderne** : Menu intuitif, barre d'outils complète, et mode sombre / clair intégré.
- **Rechercher et Remplacer** : Un outil puissant pour trouver et modifier le contenu de votre document.

## Prérequis

- Node.js (version 14 ou supérieure recommandée)
- NPM (inclus avec Node.js)

## Installation et Lancement

1. Assurez-vous d'avoir bien extrait ou cloné le dossier `InfiWord`.
2. Ouvrez un terminal (ou l'invite de commande) dans le dossier du projet.
3. Installez les dépendances nécessaires (notamment Electron) avec la commande :
   ```bash
   npm install
   ```
4. Lancez l'application avec la commande :
   ```bash
   npm start
   ```

## Structure du Code

Le projet est conçu de manière modulaire et est entièrement commenté pour être compréhensible par des développeurs juniors à intermédiaires.

- `main.js` : Point d'entrée du processus principal (backend Electron). Gère la création de la fenêtre native, et l'accès au système de fichier local (via le module `fs`) pour ouvrir, enregistrer et exporter en PDF.
- `preload.js` : Le script de préchargement. Il expose une API sécurisée (`window.api`) au monde web (le renderer) en utilisant `contextBridge`.
- `index.html` : Définit la structure de l'interface graphique (barre de menu, barre d'outils, zone d'édition) et inclut les boîtes de dialogue modales.
- `styles.css` : Contient toute la mise en forme visuelle. Il inclut des variables CSS pour permettre de basculer facilement entre le thème clair et le mode sombre (Data-theme).
- `renderer.js` : Le fichier logique de l'interface. Gère l'éditeur de texte (`document.execCommand`), les boutons, les menus, et la communication IPC avec le processus principal.

## Licence et Évolutions

InfiWord est open source. L'absence totale d'appels serveurs et de bases de données distantes garantit la confidentialité totale de vos documents. La structure HTML/CSS/JS sous Electron permet une évolution très simple (ex: ajout de plugins, amélioration de l'interface ou intégration de nouveaux formats d'exportation).
