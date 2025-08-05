;; player-profile.clar
;; Clarity v2
;; EduQuest: Player Profile System

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-USERNAME-TAKEN u101)
(define-constant ERR-NOT-REGISTERED u102)
(define-constant ERR-ALREADY_REGISTERED u103)

(define-data-var admin principal tx-sender)

;; Profile structure
(define-map profiles
  principal
  {
    username: (buff 32),
    xp: uint,
    level: uint,
    reputation: int
  }
)

;; Username uniqueness
(define-map usernames (buff 32) principal)

;; Private helper
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Register a new player (one-time)
(define-public (register-player (username (buff 32)))
  (begin
    (asserts! (not (map-get? profiles tx-sender)) (err ERR-ALREADY_REGISTERED))
    (asserts! (not (map-get? usernames username)) (err ERR-USERNAME-TAKEN))

    (map-set profiles tx-sender {
      username: username,
      xp: u0,
      level: u1,
      reputation: 0
    })
    (map-set usernames username tx-sender)
    (ok true)
  )
)

;; Admin can grant XP and update level
(define-public (grant-xp (player principal) (amount uint))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (let ((profile (map-get? profiles player)))
      (match profile p
        (let (
          (new-xp (+ (get xp p) amount))
          (new-level (+ u1 (div new-xp u1000)))
        )
          (map-set profiles player {
            username: (get username p),
            xp: new-xp,
            level: new-level,
            reputation: (get reputation p)
          })
          (ok true)
        )
        (err ERR-NOT-REGISTERED)
      )
    )
  )
)

;; Admin can modify reputation (+ or -)
(define-public (adjust-reputation (player principal) (delta int))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (let ((profile (map-get? profiles player)))
      (match profile p
        (map-set profiles player {
          username: (get username p),
          xp: (get xp p),
          level: (get level p),
          reputation: (+ (get reputation p) delta)
        })
        (ok true)
        (err ERR-NOT-REGISTERED)
      )
    )
  )
)

;; Read-only: get full profile
(define-read-only (get-profile (user principal))
  (map-get? profiles user)
)

;; Read-only: resolve username
(define-read-only (get-by-username (username (buff 32)))
  (map-get? usernames username)
)

;; Admin transfer
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)
