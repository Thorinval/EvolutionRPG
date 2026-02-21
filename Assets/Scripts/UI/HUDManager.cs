using UnityEngine;
using UnityEngine.UI;
using TMPro;
using EvolutionRPG.Player;

namespace EvolutionRPG.UI
{
    /// <summary>
    /// Manages the player HUD: health bar, mana bar, level, and experience display.
    /// </summary>
    public class HUDManager : MonoBehaviour
    {
        [Header("Health UI")]
        [SerializeField] private Slider healthSlider;
        [SerializeField] private TextMeshProUGUI healthText;

        [Header("Mana UI")]
        [SerializeField] private Slider manaSlider;
        [SerializeField] private TextMeshProUGUI manaText;

        [Header("Level & Experience UI")]
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private Slider experienceSlider;
        [SerializeField] private TextMeshProUGUI experienceText;

        private PlayerStats _playerStats;

        private void Start()
        {
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                _playerStats = player.GetComponent<PlayerStats>();
                SubscribeToEvents();
                RefreshAll();
            }
        }

        private void OnDestroy()
        {
            UnsubscribeFromEvents();
        }

        private void SubscribeToEvents()
        {
            if (_playerStats == null) return;
            _playerStats.OnHealthChanged += UpdateHealthUI;
            _playerStats.OnManaChanged += UpdateManaUI;
            _playerStats.OnLevelUp += UpdateLevelUI;
            _playerStats.OnExperienceGained += UpdateExperienceUI;
        }

        private void UnsubscribeFromEvents()
        {
            if (_playerStats == null) return;
            _playerStats.OnHealthChanged -= UpdateHealthUI;
            _playerStats.OnManaChanged -= UpdateManaUI;
            _playerStats.OnLevelUp -= UpdateLevelUI;
            _playerStats.OnExperienceGained -= UpdateExperienceUI;
        }

        private void RefreshAll()
        {
            UpdateHealthUI(_playerStats.CurrentHealth, _playerStats.MaxHealth);
            UpdateManaUI(_playerStats.CurrentMana, _playerStats.MaxMana);
            UpdateLevelUI(_playerStats.Level);
            UpdateExperienceUI(_playerStats.Experience);
        }

        private void UpdateHealthUI(int current, int max)
        {
            if (healthSlider != null) healthSlider.value = (float)current / max;
            if (healthText != null) healthText.text = $"{current} / {max}";
        }

        private void UpdateManaUI(int current, int max)
        {
            if (manaSlider != null) manaSlider.value = (float)current / max;
            if (manaText != null) manaText.text = $"{current} / {max}";
        }

        private void UpdateLevelUI(int level)
        {
            if (levelText != null) levelText.text = $"Lvl {level}";
        }

        private void UpdateExperienceUI(int experience)
        {
            if (experienceSlider != null)
            {
                experienceSlider.value = (float)experience / _playerStats.ExperienceToNextLevel;
            }
            if (experienceText != null)
            {
                experienceText.text = $"{experience} / {_playerStats.ExperienceToNextLevel} XP";
            }
        }
    }
}
