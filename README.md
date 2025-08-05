# EduQuest

A blockchain-based Learn-and-Earn RPG platform where players level up by completing real-world educational challenges — earning tokens, NFTs, and credentials, all on-chain.

---

## Overview

EduQuest consists of ten core smart contracts that together power a gamified educational ecosystem with decentralized ownership, transparent rewards, and verifiable skill progression:

1. **Game Core Contract** – Manages characters, quests, and gameplay logic.
2. **EduToken Contract** – Issues and tracks the $EDU in-game currency.
3. **Quest Manager Contract** – Handles the creation, validation, and tracking of educational quests.
4. **Reward Distributor Contract** – Automates token and NFT rewards based on performance.
5. **NFT Item Factory Contract** – Mints collectible items and badges as NFTs.
6. **Player Profile Contract** – Stores player stats, history, and owned assets.
7. **DAO Governance Contract** – Enables community control over content, funding, and rules.
8. **Marketplace Contract** – Facilitates trading and renting of NFTs between players.
9. **Staking Contract** – Allows staking of $EDU and NFTs for passive rewards.
10. **Oracle Integration Contract** – Verifies off-chain learning activity and quiz outcomes.

---

## Features

- **Learn-to-earn mechanics** with real educational value  
- **Upgradeable characters** that evolve with knowledge and skills  
- **NFT-based items** earned through verified educational quests  
- **Decentralized marketplace** for trading in-game assets  
- **DAO-driven governance** for content creation and funding  
- **Token staking** for special rewards and benefits  
- **Skill verification** via off-chain oracles  
- **On-chain player reputation and history**  
- **Integration with educational platforms** (optional)  
- **Fully transparent reward distribution system**  

---

## Smart Contracts

### Game Core Contract
- Character creation, level-up logic
- Quest and challenge interactions
- XP tracking and class/ability management

### EduToken Contract
- Mint, burn, and transfer $EDU tokens
- Reward logic integration
- Token supply and inflation control

### Quest Manager Contract
- Quest creation, validation, and state tracking
- Dynamic quest content referencing off-chain metadata
- Proof-of-completion checks

### Reward Distributor Contract
- Calculates and distributes $EDU and NFTs
- Performance-based payout logic
- Integration with Player Profile and NFT contracts

### NFT Item Factory Contract
- Mints weapons, artifacts, and badges
- Metadata updates for evolving items
- Rarity class and upgrade logic

### Player Profile Contract
- Stores player experience, assets, skill proofs
- Syncs with Quest and Game Core contracts
- Links wallet address to in-game progress

### DAO Governance Contract
- Token-weighted voting for new quests or game features
- Proposal creation and execution
- DAO treasury fund allocation

### Marketplace Contract
- Lists, trades, and rents NFT items
- Sets royalty fees and trade restrictions
- Escrow mechanism for secure exchanges

### Staking Contract
- Stake $EDU or NFTs for passive income
- Unlock special items or quests
- Dynamic APR based on platform usage

### Oracle Integration Contract
- Verifies off-chain educational task results
- Connects to APIs like Coursera, GitHub, or Khan Academy
- Proof-of-skill integration using oracles or zkProofs

---

## Installation

1. Install [Clarinet CLI](https://docs.hiro.so/clarinet/getting-started)
2. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/eduquest.git
   ```
3. Run tests:
    ```bash
    npm test
    ```
4. Deploy contracts:
    ```bash
    clarinet deploy
    ```

## Usage

Each smart contract operates independently but interoperates with others to deliver a seamless RPG-based learning and earning experience.

Refer to individual contract folders for function signatures, parameters, and integration examples.

## License

MIT License