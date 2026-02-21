using UnityEngine;

namespace EvolutionRPG.Core
{
    /// <summary>
    /// Manages the overall game state and serves as the central controller.
    /// This is a singleton that persists across scene loads.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game State")]
        [SerializeField] private GameState currentState = GameState.MainMenu;

        public GameState CurrentState => currentState;

        public delegate void GameStateChangedHandler(GameState newState);
        public event GameStateChangedHandler OnGameStateChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            SetGameState(GameState.MainMenu);
        }

        /// <summary>
        /// Changes the current game state and notifies subscribers.
        /// </summary>
        public void SetGameState(GameState newState)
        {
            currentState = newState;
            OnGameStateChanged?.Invoke(newState);
            Debug.Log($"[GameManager] Game state changed to: {newState}");
        }

        public void StartNewGame()
        {
            SetGameState(GameState.Playing);
        }

        public void PauseGame()
        {
            if (currentState == GameState.Playing)
            {
                SetGameState(GameState.Paused);
                Time.timeScale = 0f;
            }
        }

        public void ResumeGame()
        {
            if (currentState == GameState.Paused)
            {
                SetGameState(GameState.Playing);
                Time.timeScale = 1f;
            }
        }

        public void GameOver()
        {
            SetGameState(GameState.GameOver);
            Time.timeScale = 0f;
        }
    }

    public enum GameState
    {
        MainMenu,
        Playing,
        Paused,
        GameOver
    }
}
