;; quest-validator.clar
;; Clarity v2
;; EduQuest: Oracle-based Quest Completion Validator

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ALREADY-VALIDATED u101)
(define-constant ERR-NOT-FOUND u102)

(define-data-var admin principal tx-sender)
(define-map oracles principal bool)

;; Stores validation results for quests
(define-map quest-validations
  { user: principal, quest-id: uint }
  bool
)

;; Check if sender is an oracle
(define-private (is-oracle)
  (is-eq (default-to false (map-get? oracles tx-sender)) true)
)

;; Admin-only: add oracle
(define-public (add-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err ERR-NOT-AUTHORIZED))
    (map-set oracles oracle true)
    (ok true)
  )
)

;; Admin-only: remove oracle
(define-public (remove-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err ERR-NOT-AUTHORIZED))
    (map-delete oracles oracle)
    (ok true)
  )
)

;; Oracle marks quest as completed for user
(define-public (validate-quest (user principal) (quest-id uint))
  (begin
    (asserts! (is-oracle) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (is-validated? user quest-id)) (err ERR-ALREADY-VALIDATED))
    (map-set quest-validations { user: user, quest-id: quest-id } true)
    (ok true)
  )
)

;; Read-only: is quest validated?
(define-read-only (is-validated (user principal) (quest-id uint))
  (ok (is-validated? user quest-id))
)

;; Internal helper
(define-private (is-validated? (user principal) (quest-id uint))
  (default-to false (map-get? quest-validations { user: user, quest-id: quest-id }))
)

;; Admin transfer
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)
