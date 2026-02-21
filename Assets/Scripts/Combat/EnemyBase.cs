using UnityEngine;

namespace EvolutionRPG.Combat
{
    /// <summary>
    /// Base class for all enemies in the game.
    /// Implements ICombatant and provides basic AI behaviour.
    /// </summary>
    [RequireComponent(typeof(UnityEngine.AI.NavMeshAgent))]
    public class EnemyBase : MonoBehaviour, ICombatant
    {
        [Header("Stats")]
        [SerializeField] private string enemyName = "Enemy";
        [SerializeField] private int maxHealth = 50;
        [SerializeField] private int attackDamage = 10;
        [SerializeField] private float attackRange = 1.5f;
        [SerializeField] private float detectionRange = 10f;
        [SerializeField] private float attackCooldown = 1.5f;
        [SerializeField] private int experienceReward = 30;

        private int _currentHealth;
        private float _lastAttackTime = -Mathf.Infinity;
        private Transform _playerTransform;
        private UnityEngine.AI.NavMeshAgent _navAgent;

        public bool IsAlive => _currentHealth > 0;

        private void Awake()
        {
            _currentHealth = maxHealth;
            _navAgent = GetComponent<UnityEngine.AI.NavMeshAgent>();
        }

        private void Start()
        {
            GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null)
            {
                _playerTransform = playerObj.transform;
            }
        }

        private void Update()
        {
            if (!IsAlive || _playerTransform == null) return;

            float distToPlayer = Vector3.Distance(transform.position, _playerTransform.position);

            if (distToPlayer <= detectionRange)
            {
                _navAgent.SetDestination(_playerTransform.position);
            }

            if (distToPlayer <= attackRange && Time.time >= _lastAttackTime + attackCooldown)
            {
                AttackPlayer();
            }
        }

        public void TakeDamage(int damage)
        {
            if (!IsAlive || damage <= 0) return;

            _currentHealth = Mathf.Max(0, _currentHealth - damage);
            Debug.Log($"[EnemyBase] {enemyName} took {damage} damage. HP: {_currentHealth}/{maxHealth}");

            if (!IsAlive)
            {
                Die();
            }
        }

        private void AttackPlayer()
        {
            Player.PlayerStats playerStats = _playerTransform.GetComponent<Player.PlayerStats>();
            if (playerStats != null)
            {
                playerStats.TakeDamage(attackDamage);
                _lastAttackTime = Time.time;
                Debug.Log($"[EnemyBase] {enemyName} attacked player for {attackDamage} damage.");
            }
        }

        private void Die()
        {
            Debug.Log($"[EnemyBase] {enemyName} died. Rewarding {experienceReward} XP.");

            Player.PlayerStats playerStats = _playerTransform?.GetComponent<Player.PlayerStats>();
            playerStats?.GainExperience(experienceReward);

            Destroy(gameObject);
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, detectionRange);
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, attackRange);
        }
    }
}
