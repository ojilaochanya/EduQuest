;; edu-token.clar
;; Clarity v2
;; EduQuest: EduToken Contract ($EDU)

(define-constant TOKEN-NAME "EduQuest Token")
(define-constant TOKEN-SYMBOL "EDU")
(define-constant TOKEN-DECIMALS u6)
(define-constant MAX-SUPPLY u100000000000000) ;; 100 million * 10^6

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ZERO-ADDRESS u101)
(define-constant ERR-INSUFFICIENT-BALANCE u102)
(define-constant ERR-PAUSED u103)
(define-constant ERR-MAX-SUPPLY u104)

;; Admin and paused state
(define-data-var admin principal tx-sender)
(define-data-var paused bool false)

;; Token state
(define-data-var total-supply uint u0)
(define-map balances principal uint)
(define-set authorized-minters principal)

;; Private helpers
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

(define-private (ensure-not-paused)
  (asserts! (not (var-get paused)) (err ERR-PAUSED))
)

(define-private (valid-address (who principal))
  (not (is-eq who 'SP000000000000000000002Q6VF78))
)

;; Admin Functions

(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (valid-address new-admin) (err ERR-ZERO-ADDRESS))
    (var-set admin new-admin)
    (ok true)
  )
)

(define-public (set-paused (pause bool))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set paused pause)
    (ok pause)
  )
)

(define-public (add-minter (minter principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (set-insert authorized-minters minter)
    (ok true)
  )
)

(define-public (remove-minter (minter principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (set-delete authorized-minters minter)
    (ok true)
  )
)

;; Token Logic

(define-public (mint (to principal) (amount uint))
  (begin
    (asserts! (set-member? authorized-minters tx-sender) (err ERR-NOT-AUTHORIZED))
    (asserts! (valid-address to) (err ERR-ZERO-ADDRESS))
    (let ((new-supply (+ (var-get total-supply) amount)))
      (asserts! (<= new-supply MAX-SUPPLY) (err ERR-MAX-SUPPLY))
      (map-set balances to (+ amount (default-to u0 (map-get? balances to))))
      (var-set total-supply new-supply)
      (ok true)
    )
  )
)

(define-public (burn (amount uint))
  (begin
    (ensure-not-paused)
    (let ((balance (default-to u0 (map-get? balances tx-sender))))
      (asserts! (>= balance amount) (err ERR-INSUFFICIENT-BALANCE))
      (map-set balances tx-sender (- balance amount))
      (var-set total-supply (- (var-get total-supply) amount))
      (ok true)
    )
  )
)

(define-public (transfer (recipient principal) (amount uint))
  (begin
    (ensure-not-paused)
    (asserts! (valid-address recipient) (err ERR-ZERO-ADDRESS))
    (let ((sender-bal (default-to u0 (map-get? balances tx-sender))))
      (asserts! (>= sender-bal amount) (err ERR-INSUFFICIENT-BALANCE))
      (map-set balances tx-sender (- sender-bal amount))
      (map-set balances recipient (+ amount (default-to u0 (map-get? balances recipient))))
      (ok true)
    )
  )
)

;; Read-only Functions

(define-read-only (get-balance (owner principal))
  (ok (default-to u0 (map-get? balances owner)))
)

(define-read-only (get-total-supply)
  (ok (var-get total-supply))
)

(define-read-only (get-admin)
  (ok (var-get admin))
)

(define-read-only (is-paused)
  (ok (var-get paused))
)

(define-read-only (is-authorized-minter (who principal))
  (ok (set-member? authorized-minters who))
)
