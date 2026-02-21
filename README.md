# EvolutionRPG

Jeu RPG à la troisième personne développé en **C#** avec le moteur **Unity**.

## Technologies

- **Moteur** : Unity 2022.3 LTS (Universal Render Pipeline)
- **Langage** : C# (.NET)
- **Packages principaux** :
  - Unity Input System (contrôles joueur)
  - Cinemachine (caméra troisième personne)
  - TextMeshPro (interface utilisateur)
  - Universal Render Pipeline (rendu)

## Structure du projet

```
Assets/
├── Scenes/          # Scènes Unity (MainMenu, GameScene)
├── Scripts/
│   ├── Core/        # GameManager, logique centrale
│   ├── Player/      # PlayerStats, PlayerController
│   ├── Combat/      # CombatSystem, EnemyBase
│   ├── Inventory/   # InventoryManager, Item
│   └── UI/          # HUDManager
├── Prefabs/         # Prefabs réutilisables
├── Materials/       # Matériaux
└── Animations/      # Animations
ProjectSettings/     # Configuration Unity
Packages/            # Dépendances Unity Package Manager
```

## Architecture principale

| Script | Rôle |
|--------|------|
| `GameManager` | Singleton gérant l'état global du jeu (Menu, Jeu, Pause, GameOver) |
| `PlayerStats` | Stats RPG du joueur : PV, mana, niveau, XP, attributs |
| `PlayerController` | Déplacement et saut en troisième personne (Input System) |
| `CombatSystem` | Attaques, calcul des dégâts, détection des ennemis |
| `EnemyBase` | IA ennemie de base avec NavMesh, détection et attaque |
| `InventoryManager` | Gestion de l'inventaire (ajout, suppression, stack) |
| `HUDManager` | Affichage HUD : barres PV/Mana, niveau, XP |

## Prérequis

- Unity 2022.3 LTS ou supérieur
- Module **Universal Windows Platform** ou **PC, Mac & Linux Standalone**

## Lancer le projet

1. Cloner le dépôt
2. Ouvrir Unity Hub → *Add project from disk* → sélectionner le dossier racine
3. Ouvrir la scène `Assets/Scenes/GameScene.unity`
4. Appuyer sur **Play**

