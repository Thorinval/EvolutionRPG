using UnityEngine;
using UnityEngine.InputSystem;

namespace EvolutionRPG.Player
{
    /// <summary>
    /// Handles third-person player movement, rotation, and jumping
    /// using Unity's Input System and CharacterController.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    [RequireComponent(typeof(PlayerStats))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float walkSpeed = 4f;
        [SerializeField] private float runSpeed = 8f;
        [SerializeField] private float jumpForce = 5f;
        [SerializeField] private float gravity = -19.62f;
        [SerializeField] private float rotationSpeed = 10f;

        [Header("Ground Check")]
        [SerializeField] private Transform groundCheck;
        [SerializeField] private float groundCheckRadius = 0.2f;
        [SerializeField] private LayerMask groundMask;

        [Header("Camera")]
        [SerializeField] private Transform cameraTransform;

        private CharacterController _characterController;
        private PlayerStats _playerStats;
        private Vector2 _moveInput;
        private Vector3 _velocity;
        private bool _isGrounded;
        private bool _isRunning;

        private void Awake()
        {
            _characterController = GetComponent<CharacterController>();
            _playerStats = GetComponent<PlayerStats>();

            if (cameraTransform == null && Camera.main != null)
            {
                cameraTransform = Camera.main.transform;
            }
        }

        private void OnEnable()
        {
            _playerStats.OnDeath += HandleDeath;
        }

        private void OnDisable()
        {
            _playerStats.OnDeath -= HandleDeath;
        }

        private void Update()
        {
            CheckGround();
            ApplyGravity();
            MovePlayer();
        }

        // Called by Unity's Input System via PlayerInput component
        public void OnMove(InputValue value)
        {
            _moveInput = value.Get<Vector2>();
        }

        public void OnRun(InputValue value)
        {
            _isRunning = value.isPressed;
        }

        public void OnJump(InputValue value)
        {
            if (_isGrounded)
            {
                _velocity.y = Mathf.Sqrt(jumpForce * -2f * gravity);
            }
        }

        private void CheckGround()
        {
            Vector3 checkPosition = groundCheck != null ? groundCheck.position : transform.position;
            _isGrounded = Physics.CheckSphere(checkPosition, groundCheckRadius, groundMask);

            if (_isGrounded && _velocity.y < 0f)
            {
                _velocity.y = -2f;
            }
        }

        private void ApplyGravity()
        {
            _velocity.y += gravity * Time.deltaTime;
            _characterController.Move(_velocity * Time.deltaTime);
        }

        private void MovePlayer()
        {
            if (_moveInput == Vector2.zero) return;

            float speed = _isRunning ? runSpeed : walkSpeed;

            Vector3 forward = cameraTransform != null
                ? Vector3.ProjectOnPlane(cameraTransform.forward, Vector3.up).normalized
                : transform.forward;

            Vector3 right = cameraTransform != null
                ? Vector3.ProjectOnPlane(cameraTransform.right, Vector3.up).normalized
                : transform.right;

            Vector3 moveDirection = (forward * _moveInput.y + right * _moveInput.x).normalized;
            _characterController.Move(moveDirection * speed * Time.deltaTime);

            // Smoothly rotate the player toward the movement direction
            if (moveDirection != Vector3.zero)
            {
                Quaternion targetRotation = Quaternion.LookRotation(moveDirection);
                transform.rotation = Quaternion.Slerp(
                    transform.rotation,
                    targetRotation,
                    rotationSpeed * Time.deltaTime
                );
            }
        }

        private void HandleDeath()
        {
            enabled = false;
            Debug.Log("[PlayerController] Player died — controller disabled.");
        }
    }
}
