;; quest-manager.clar
;; Clarity v2
;; EduQuest: Quest Manager Contract

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-QUEST-NOT-FOUND u101)
(define-constant ERR-QUEST-ALREADY-COMPLETED u102)
(define-constant ERR-NOT-OWNER u103)
(define-constant ERR-INVALID-REWARD u104)

(define-data-var admin principal tx-sender)

(define-map quests 
  uint
  {
    owner: principal,
    title: (string-utf8 64),
    reward: uint,
    completed-by: (list 100 principal)
  }
)

(define-map user-completions
  { quest-id: uint, user: principal }
  bool
)

(define-data-var next-id uint u1)

;; Private helper: is-admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)

;; Create a new quest
(define-public (create-quest (title (string-utf8 64)) (reward uint))
  (begin
    (asserts! (> reward u0) (err ERR-INVALID-REWARD))
    (let ((quest-id (var-get next-id)))
      (map-set quests quest-id {
        owner: tx-sender,
        title: title,
        reward: reward,
        completed-by: (list)
      })
      (var-set next-id (+ quest-id u1))
      (ok quest-id)
    )
  )
)

;; Complete a quest
(define-public (complete-quest (quest-id uint))
  (let (
    (quest (map-get? quests quest-id))
  )
    (match quest quest-data
      (begin
        (asserts! (is-none (map-get? user-completions { quest-id: quest-id, user: tx-sender })) (err ERR-QUEST-ALREADY-COMPLETED))
        (map-set user-completions { quest-id: quest-id, user: tx-sender } true)
        (let ((updated-list (cons tx-sender (get completed-by quest-data))))
          (map-set quests quest-id {
            owner: (get owner quest-data),
            title: (get title quest-data),
            reward: (get reward quest-data),
            completed-by: updated-list
          })
        )
        (ok true)
      )
      (err ERR-QUEST-NOT-FOUND)
    )
  )
)

;; Admin function to update quest reward
(define-public (update-reward (quest-id uint) (new-reward uint))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (let ((quest (map-get? quests quest-id)))
      (match quest quest-data
        (begin
          (map-set quests quest-id {
            owner: (get owner quest-data),
            title: (get title quest-data),
            reward: new-reward,
            completed-by: (get completed-by quest-data)
          })
          (ok true)
        )
        (err ERR-QUEST-NOT-FOUND)
      )
    )
  )
)

;; Read-only: get quest data
(define-read-only (get-quest (quest-id uint))
  (map-get? quests quest-id)
)

;; Read-only: has user completed
(define-read-only (has-completed (quest-id uint) (user principal))
  (ok (is-some (map-get? user-completions { quest-id: quest-id, user: user })))
)

;; Read-only: get next quest ID
(define-read-only (get-next-id)
  (ok (var-get next-id))
)

;; Read-only: get admin
(define-read-only (get-admin)
  (ok (var-get admin))
)
