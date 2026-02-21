# 🦍 EvolutionRPG

> Jeu 3D troisième personne RPG — du primate primitif à *Homo Sapiens*.

## Présentation

**EvolutionRPG** est un jeu de rôle d'exploration en 3D (vue troisième personne) développé avec [Three.js](https://threejs.org/) et [Vite](https://vitejs.dev/).

Vous incarnez un primate dans un monde ouvert.  
En collectant des ressources — fruits, pierres, bâtons, os et braises — votre personnage franchit cinq paliers d'évolution matérialisés par un arbre d'évolution, jusqu'à atteindre le stade final : **Homo Sapiens**.

---

## 🎮 Mécaniques de jeu

| Action | Contrôle |
|--------|----------|
| Déplacer | `W A S D` ou `↑ ↓ ← →` |
| Orienter la caméra | Mouvement de la souris (après clic pour capturer) |
| Collecter une ressource | S'approcher (rayon automatique) |
| Ouvrir l'arbre d'évolution | `E` |
| Libérer la souris | `Échap` |

### Ressources

| Icône | Ressource | Fréquence |
|-------|-----------|-----------|
| 🍎 | Fruit | Très fréquent |
| 🪨 | Pierre | Fréquent |
| 🪵 | Bâton | Commun |
| 🦴 | Os | Rare |
| 🔥 | Braise | Très rare (valeur ×3) |

---

## 🧬 Arbre d'évolution

| # | Stade | Ressources requises | Bonus |
|---|-------|---------------------|-------|
| 0 | 🦍 Australopithecus | — (départ) | — |
| 1 | 🪨 Homo Habilis | 20 total · 10 🍎 · 5 🪨 | +Vitesse · Outils |
| 2 | 🔥 Homo Erectus | 50 total · 20 🍎 · 15 🪨 · 10 🪵 | +Vitesse · Feu |
| 3 | 🏹 Homo Neanderthalensis | 100 total · 25 🪨 · 20 🪵 · 10 🦴 | +Force · Langage |
| 4 | 🧠 **Homo Sapiens** | 180 total · 30 🪨 · 20 🦴 · 10 🔥 | +Intellect · Art |

---

## 🏗️ Architecture

```
src/
├── main.js                    # Point d'entrée
├── style.css                  # Styles HUD & UI
├── core/
│   ├── Game.js                # Boucle principale (Three.js scene, renderer)
│   └── InputManager.js        # Clavier + pointer-lock souris
├── player/
│   ├── Player.js              # Déplacement, caméra troisième personne
│   └── PrimateCharacter.js    # Maillage du personnage (évolue visuellement)
├── world/
│   ├── World.js               # Génération procédurale du terrain et des arbres
│   └── ResourceItem.js        # Objets collectables (flottants, lumineux)
├── evolution/
│   └── EvolutionSystem.js     # Logique d'évolution + arbre des stades
└── ui/
    └── UI.js                  # HUD, barre de progression, notifications

tests/
└── evolution.test.js          # Tests unitaires (Node.js natif)
```

---

## 🚀 Installation & lancement

```bash
npm install
npm run dev       # Serveur de développement
npm run build     # Build de production
npm run test      # Tests unitaires
```

---

## 📸 Aperçu

Le monde est généré procéduralement avec :
- Un terrain multi-biomes coloré (eau, sable, herbe, forêt, roche)
- Des arbres distribués aléatoirement (hors zones aquatiques)
- Des ressources flottantes et animées dispersées dans le monde
- Un brouillard atmosphérique et un éclairage solaire avec ombres

L'apparence du personnage change à chaque stade : posture plus droite, peau plus claire, apparition d'outils (silex, lance), puis d'un pagne.
