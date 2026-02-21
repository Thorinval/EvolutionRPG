using System;
using System.Collections.Generic;
using UnityEngine;

namespace EvolutionRPG.Inventory
{
    /// <summary>
    /// Defines the type/category of an inventory item.
    /// </summary>
    public enum ItemType
    {
        Weapon,
        Armor,
        Consumable,
        Quest,
        Misc
    }

    /// <summary>
    /// Represents a single item definition used throughout the game.
    /// </summary>
    [CreateAssetMenu(fileName = "NewItem", menuName = "EvolutionRPG/Item")]
    public class Item : ScriptableObject
    {
        [SerializeField] private string itemName;
        [SerializeField] private string description;
        [SerializeField] private ItemType itemType;
        [SerializeField] private Sprite icon;
        [SerializeField] private int maxStackSize = 1;
        [SerializeField] private bool isStackable = false;

        public string ItemName => itemName;
        public string Description => description;
        public ItemType ItemType => itemType;
        public Sprite Icon => icon;
        public int MaxStackSize => maxStackSize;
        public bool IsStackable => isStackable;
    }

    /// <summary>
    /// Represents a stack of items in the inventory.
    /// </summary>
    [Serializable]
    public class InventorySlot
    {
        public Item item;
        public int quantity;

        public InventorySlot(Item item, int quantity = 1)
        {
            this.item = item;
            this.quantity = quantity;
        }
    }

    /// <summary>
    /// Manages the player's inventory: adding, removing, and querying items.
    /// </summary>
    public class InventoryManager : MonoBehaviour
    {
        [Header("Inventory Settings")]
        [SerializeField] private int inventorySize = 20;

        private readonly List<InventorySlot> _slots = new List<InventorySlot>();

        public IReadOnlyList<InventorySlot> Slots => _slots;

        public event Action OnInventoryChanged;

        private void Awake()
        {
            _slots.Clear();
        }

        /// <summary>
        /// Adds an item to the inventory. Returns true on success.
        /// </summary>
        public bool AddItem(Item item, int quantity = 1)
        {
            if (item == null || quantity <= 0) return false;

            if (item.IsStackable)
            {
                InventorySlot existing = _slots.Find(s => s.item == item && s.quantity < item.MaxStackSize);
                if (existing != null)
                {
                    existing.quantity = Mathf.Min(existing.quantity + quantity, item.MaxStackSize);
                    OnInventoryChanged?.Invoke();
                    return true;
                }
            }

            if (_slots.Count >= inventorySize)
            {
                Debug.LogWarning("[InventoryManager] Inventory is full.");
                return false;
            }

            _slots.Add(new InventorySlot(item, quantity));
            OnInventoryChanged?.Invoke();
            return true;
        }

        /// <summary>
        /// Removes a quantity of an item from the inventory. Returns true on success.
        /// </summary>
        public bool RemoveItem(Item item, int quantity = 1)
        {
            if (item == null || quantity <= 0) return false;

            InventorySlot slot = _slots.Find(s => s.item == item);
            if (slot == null) return false;

            slot.quantity -= quantity;
            if (slot.quantity <= 0)
            {
                _slots.Remove(slot);
            }

            OnInventoryChanged?.Invoke();
            return true;
        }

        /// <summary>
        /// Returns true if the player has at least the specified quantity of the item.
        /// </summary>
        public bool HasItem(Item item, int quantity = 1)
        {
            if (item == null) return false;
            InventorySlot slot = _slots.Find(s => s.item == item);
            return slot != null && slot.quantity >= quantity;
        }
    }
}
