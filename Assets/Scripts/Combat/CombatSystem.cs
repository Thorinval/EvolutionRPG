using UnityEngine;

namespace EvolutionRPG.Combat
{
    /// <summary>
    /// Represents any entity (player or enemy) that can participate in combat.
    /// </summary>
    public interface ICombatant
    {
        void TakeDamage(int damage);
        bool IsAlive { get; }
    }

    /// <summary>
    /// Handles combat interactions: attacking enemies, calculating damage with stat modifiers.
    /// Attach to the Player GameObject.
    /// </summary>
    public class CombatSystem : MonoBehaviour
    {
        [Header("Attack Settings")]
        [SerializeField] private int baseAttackDamage = 15;
        [SerializeField] private float attackRange = 2f;
        [SerializeField] private float attackCooldown = 1f;
        [SerializeField] private LayerMask enemyMask;

        private Player.PlayerStats _playerStats;
        private float _lastAttackTime = -Mathf.Infinity;

        private void Awake()
        {
            _playerStats = GetComponent<Player.PlayerStats>();
        }

        /// <summary>
        /// Attempts to attack the nearest enemy within range.
        /// Triggered by player input.
        /// </summary>
        public void TryAttack()
        {
            if (Time.time < _lastAttackTime + attackCooldown)
            {
                Debug.Log("[CombatSystem] Attack on cooldown.");
                return;
            }

            Collider[] hits = Physics.OverlapSphere(transform.position, attackRange, enemyMask);
            if (hits.Length == 0) return;

            // Target the closest enemy
            Collider closest = GetClosestCollider(hits);
            ICombatant target = closest.GetComponent<ICombatant>();
            if (target == null || !target.IsAlive) return;

            int damage = CalculateDamage();
            target.TakeDamage(damage);
            _lastAttackTime = Time.time;
            Debug.Log($"[CombatSystem] Attacked {closest.name} for {damage} damage.");
        }

        private int CalculateDamage()
        {
            int bonus = _playerStats != null ? _playerStats.Strength / 5 : 0;
            return baseAttackDamage + bonus + Random.Range(0, 6);
        }

        private Collider GetClosestCollider(Collider[] colliders)
        {
            Collider closest = colliders[0];
            float minDist = Vector3.Distance(transform.position, closest.transform.position);

            for (int i = 1; i < colliders.Length; i++)
            {
                float dist = Vector3.Distance(transform.position, colliders[i].transform.position);
                if (dist < minDist)
                {
                    minDist = dist;
                    closest = colliders[i];
                }
            }

            return closest;
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, attackRange);
        }
    }
}
