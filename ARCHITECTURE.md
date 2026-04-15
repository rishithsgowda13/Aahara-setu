# Aahara Setu | System Architecture

A high-level overview of the **Aahara Setu** role-based architecture and the **Aahara AI Matching Engine**.

---

## 🏗️ Technical Flow

```mermaid
graph TD
    %% User Entry Section
    User((User)) --> Login{Login / Signup}
    Login -- Mock (1/1) --> Receiver[Receiver Dashboard]
    Login -- Mock (2/2) --> Donor[Donor Portal]
    Login -- Real Email --> SupaAuth[Supabase Auth]
    SupaAuth -- Onboard --> ProfileDB[(Profiles Table)]

    %% Donor Flow
    Donor -->|Lists Food| FoodPool[[Global Food Listings]]
    
    %% AI Intelligence Layer
    subgraph Aahara_AI [Aahara AI Matching Engine]
        direction TB
        Logic[Deterministic Semantic Engine]
        Mapping[Meal Pair Dictionary: Rice-Sambar, Chapati-Sabji]
        Logic --> Mapping
    end

    FoodPool -->|Scan| Aahara_AI
    Receiver -.->|Has Claimed| Aahara_AI
    
    %% Receiver Flow
    Aahara_AI -->|Match Found| Notifications[Priority AI Match Alerts]
    Receiver -->|Browse| FoodPool
    Receiver -->|Claim| SelfPickup[Self-Pickup Workflow]
    
    %% Verification Cycle
    SelfPickup -->|Wait| ProofReq[Action: Upload Photos]
    ProofReq -->|Review| AdminApproval{Admin Review}
    AdminApproval -->|Reject| ProofReq
    AdminApproval -->|Approve| Completed[Verified Impact]
    
    %% Styling
    style Aahara_AI fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style Login fill:#f1f5f9,stroke:#64748b
    style Donor fill:#dcfce7,stroke:#22c55e
    style Receiver fill:#dcfce7,stroke:#22c55e
    style banner-danger fill:#fee2e2,stroke:#ef4444
```

---

## 🛠️ Components Breakdown

### 1. **Identity & Routing (`App.tsx`)**
The "Gatekeeper" of the system. It listens to `localStorage` changes to dynamically render the **Donor UI** or **Receiver UI**. It ensures that a Receiver can never access donor upload tools, preserving role integrity.

### 2. **Aahara AI Matching Engine (`AaharaAI.ts`)**
A pattern-recognition engine that identifies complementary nutrition.
- **Core-to-Complement Mapping**: Automatically links "Core" carbohydrates (Rice, Roti) with "Complementary" nutrients (Sambar, Sabji, Dal).
- **Match Alerts**: Triggers real-time UI badges ("Complete Meal Match Found") when a donor lists something that would complete a receiver's current meal.

### 3. **Verification Loop (`Receiver.tsx`)**
A trust-based system designed to prevent food waste.
- **2-Order Limit**: Reaching 2 unverified orders triggers an **Account Lock**.
- **Proof of Utilization**: Requires 3+ photos showing the food being consumed/distributed.
- **Admin Verification**: Moves items from `proof_submitted` to `completed` to unlock the account profile.

### 4. **Self-Pickup Logistics**
Replaced traditional "Delivery" tracking with a decentralized model where the **Receiver** is responsible for local pickup, supported by time-deadline indicators.

---

> [!TIP]
> **Extensibility**: This architecture is designed to swap the current `AaharaAI.ts` (deterministic logic) with a real-time **Gemini AI API** or **LLM** without changing the frontend UI components.
