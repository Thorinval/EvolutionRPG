using System;
using UnityEngine;

namespace EvolutionRPG.Player
{
    /// <summary>
    /// Holds and manages all RPG stats for the player (health, mana, experience, level, etc.).
    /// </summary>
    public class PlayerStats : MonoBehaviour
    {
        [Header("Level & Experience")]
        [SerializeField] private int currentLevel = 1;
        [SerializeField] private int currentExperience = 0;
        [SerializeField] private int experienceToNextLevel = 100;

        [Header("Health")]
        [SerializeField] private int maxHealth = 100;
        [SerializeField] private int currentHealth;

        [Header("Mana")]
        [SerializeField] private int maxMana = 50;
        [SerializeField] private int currentMana;

        [Header("Base Attributes")]
        [SerializeField] private int strength = 10;
        [SerializeField] private int dexterity = 10;
        [SerializeField] private int intelligence = 10;
        [SerializeField] private int constitution = 10;

        // Public read-only accessors
        public int Level => currentLevel;
        public int Experience => currentExperience;
        public int ExperienceToNextLevel => experienceToNextLevel;
        public int MaxHealth => maxHealth;
        public int CurrentHealth => currentHealth;
        public int MaxMana => maxMana;
        public int CurrentMana => currentMana;
        public int Strength => strength;
        public int Dexterity => dexterity;
        public int Intelligence => intelligence;
        public int Constitution => constitution;

        public event Action OnDeath;
        public event Action<int, int> OnHealthChanged;
        public event Action<int, int> OnManaChanged;
        public event Action<int> OnLevelUp;
        public event Action<int> OnExperienceGained;

        private void Awake()
        {
            currentHealth = maxHealth;
            currentMana = maxMana;
        }

        /// <summary>
        /// Applies damage to the player, clamped to valid range.
        /// </summary>
        public void TakeDamage(int damage)
        {
            if (damage <= 0) return;

            int previousHealth = currentHealth;
            currentHealth = Mathf.Clamp(currentHealth - damage, 0, maxHealth);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);

            if (currentHealth <= 0)
            {
                OnDeath?.Invoke();
                Debug.Log("[PlayerStats] Player has died.");
            }
        }

        /// <summary>
        /// Restores health to the player, clamped to max health.
        /// </summary>
        public void Heal(int amount)
        {
            if (amount <= 0) return;

            currentHealth = Mathf.Clamp(currentHealth + amount, 0, maxHealth);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
        }

        /// <summary>
        /// Consumes mana, returns false if not enough mana available.
        /// </summary>
        public bool UseMana(int amount)
        {
            if (amount <= 0 || currentMana < amount) return false;

            currentMana = Mathf.Clamp(currentMana - amount, 0, maxMana);
            OnManaChanged?.Invoke(currentMana, maxMana);
            return true;
        }

        /// <summary>
        /// Restores mana, clamped to max mana.
        /// </summary>
        public void RestoreMana(int amount)
        {
            if (amount <= 0) return;

            currentMana = Mathf.Clamp(currentMana + amount, 0, maxMana);
            OnManaChanged?.Invoke(currentMana, maxMana);
        }

        /// <summary>
        /// Adds experience points and triggers level-up if threshold is reached.
        /// </summary>
        public void GainExperience(int amount)
        {
            if (amount <= 0) return;

            currentExperience += amount;
            OnExperienceGained?.Invoke(currentExperience);
            Debug.Log($"[PlayerStats] Gained {amount} XP. Total: {currentExperience}/{experienceToNextLevel}");

            while (currentExperience >= experienceToNextLevel)
            {
                LevelUp();
            }
        }

        private void LevelUp()
        {
            currentExperience -= experienceToNextLevel;
            currentLevel++;
            experienceToNextLevel = Mathf.RoundToInt(experienceToNextLevel * 1.5f);

            // Scale stats on level up
            maxHealth += 10 + constitution;
            maxMana += 5 + intelligence / 2;
            strength += 2;
            dexterity += 2;
            intelligence += 2;
            constitution += 2;

            // Fully restore on level up
            currentHealth = maxHealth;
            currentMana = maxMana;

            OnLevelUp?.Invoke(currentLevel);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
            OnManaChanged?.Invoke(currentMana, maxMana);

            Debug.Log($"[PlayerStats] Level up! Now level {currentLevel}.");
        }
    }
}
