;; reward-distributor.clar
;; Clarity v2
;; EduQuest: Reward Distributor Contract
;; Handles reward distribution for successful quest completions.

(use-trait ft-trait 
  'SP3FT9A9A3KF6T1T4Y8H8M2B7F1V6KP9A3H9K5S6A.token-trait)

(use-trait nft-trait 
  'SP3FT9A9A3KF6T1T4Y8H8M2B7F1V6KP9A3H9K5S6A.nft-trait)

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-NOT-REGISTERED-REWARD u101)
(define-constant ERR-ALREADY-CLAIMED u102)

(define-data-var admin principal tx-sender)

;; Registered reward events (external modules populate this)
(define-map reward-events
  { event-id: uint }
  {
    recipient: principal,
    ft-contract: (optional trait_reference),
    nft-contract: (optional trait_reference),
    ft-amount: (optional uint),
    nft-id: (optional uint),
    claimed: bool
  }
)

;; Private helper
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Admin can register a reward event
(define-public (register-reward (event-id uint)
                                (recipient principal)
                                (ft-contract (optional trait_reference))
                                (ft-amount (optional uint))
                                (nft-contract (optional trait_reference))
                                (nft-id (optional uint)))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (map-set reward-events { event-id: event-id } {
      recipient: recipient,
      ft-contract: ft-contract,
      ft-amount: ft-amount,
      nft-contract: nft-contract,
      nft-id: nft-id,
      claimed: false
    })
    (ok true)
  )
)

;; Claim reward (one-time)
(define-public (claim-reward (event-id uint))
  (let ((entry (map-get? reward-events { event-id: event-id })))
    (match entry reward
      (begin
        (asserts! (is-eq (get recipient reward) tx-sender) (err ERR-NOT-AUTHORIZED))
        (asserts! (not (get claimed reward)) (err ERR-ALREADY-CLAIMED))

        ;; Transfer FT
        (if (is-some (get ft-contract reward))
            (match (get ft-contract reward)
              ft
              (match (get ft-amount reward)
                amount
                (contract-call? ft transfer amount tx-sender tx-sender) ;; pseudo: mint to self
                (ok true)
              )
              (ok true)
            )
            (ok true)
        )

        ;; Transfer NFT
        (if (is-some (get nft-contract reward))
            (match (get nft-contract reward)
              nft
              (match (get nft-id reward)
                nftid
                (contract-call? nft transfer nftid tx-sender tx-sender)
                (ok true)
              )
              (ok true)
            )
            (ok true)
        )

        ;; Mark as claimed
        (map-set reward-events { event-id: event-id } {
          recipient: (get recipient reward),
          ft-contract: (get ft-contract reward),
          ft-amount: (get ft-amount reward),
          nft-contract: (get nft-contract reward),
          nft-id: (get nft-id reward),
          claimed: true
        })

        (ok true)
      )
      (err ERR-NOT-REGISTERED-REWARD)
    )
  )
)

;; Read-only: has reward been claimed?
(define-read-only (is-claimed (event-id uint))
  (match (map-get? reward-events { event-id: event-id })
    r (ok (get claimed r))
    (ok false)
  )
)

;; Read-only: get reward info
(define-read-only (get-reward (event-id uint))
  (map-get? reward-events { event-id: event-id })
)

;; Admin transfer
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)
