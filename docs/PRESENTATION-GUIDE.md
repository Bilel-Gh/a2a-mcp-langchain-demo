# Guide de Présentation : Projet Travel Planner Multi-Agent

## 🎯 Contexte de la Présentation

**Durée** : 30 minutes
**Audience** :
- Manager Développeur (technique)
- Product Owner (moins technique, focus business/valeur)

**Objectif** : Présenter le système multi-agent avec les protocoles A2A et MCP

---

## 📋 Structure de la Présentation (30 min)

| Section | Durée | Contenu | Slides |
|---------|-------|---------|--------|
| **1. Introduction** | 3 min | Contexte et objectif du projet | 1-2 |
| **2. Démo Live** | 5 min | Montrer le système en action | - |
| **3. Architecture Globale** | 5 min | Vue d'ensemble du système | 3-4 |
| **4. Protocole A2A** | 5 min | Communication agent-à-agent | 5-6 |
| **5. Protocole MCP** | 4 min | Capacités étendues pour LLMs | 7-8 |
| **6. Cas d'Usage Concrets** | 4 min | Exemples pratiques | 9-10 |
| **7. Valeur & Bénéfices** | 3 min | ROI et avantages | 11 |
| **8. Questions/Réponses** | 1 min | Discussion | - |

---

## 📝 Script Détaillé

### Slide 1 : Introduction (1 min)

**Titre** : "Travel Planner : Système Multi-Agent avec A2A et MCP"

**Script** :

> "Bonjour à tous. Aujourd'hui, je vais vous présenter un projet de système multi-agent que j'ai développé. C'est un planificateur de voyages intelligent qui coordonne plusieurs agents spécialisés pour créer des itinéraires personnalisés.
>
> Ce projet démontre l'utilisation de deux protocoles innovants : A2A pour la communication entre agents, et MCP pour donner des capacités étendues aux intelligences artificielles.
>
> La présentation durera 30 minutes avec une démo live au début pour vous montrer concrètement ce que ça fait."

**Contenu du slide** :

```
Travel Planner Multi-Agent
━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Système de planification de voyages intelligent
✓ 5 agents spécialisés qui collaborent
✓ Protocoles : A2A + MCP
✓ Technologies : TypeScript, Node.js, Gemini AI

Démo → Architecture → Protocoles → Valeur
```

---

### Slide 2 : Problème & Solution (2 min)

**Titre** : "Le Problème et Notre Solution"

**Script** :

> "**Le problème** : Créer un itinéraire de voyage nécessite plusieurs compétences :
> - Rechercher des activités sur le web
> - Vérifier la météo
> - Calculer un budget précis
> - Générer un planning cohérent
> - Traduire dans la langue souhaitée
>
> Traditionnellement, on créerait un système monolithique qui fait tout. C'est complexe, difficile à maintenir, et pas réutilisable.
>
> **Notre solution** : Un système multi-agent où chaque agent est un spécialiste. Ils communiquent via des protocoles standardisés (A2A et MCP). C'est modulaire, extensible, et chaque agent peut être utilisé indépendamment."

**Contenu du slide** :

```
❌ PROBLÈME : Système Monolithique
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────┐
│   Application Monolithique     │
│                                 │
│  • Recherche web               │
│  • Météo                       │
│  • Calculs                     │
│  • Génération                  │
│  • Traduction                  │
│                                 │
│  → Complexe                    │
│  → Difficile à maintenir       │
│  → Non réutilisable            │
└─────────────────────────────────┘

✅ SOLUTION : Architecture Multi-Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        Orchestrateur
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
  Agent    Agent    Agent
  Météo    Web    Calculator

→ Modulaire
→ Extensible
→ Réutilisable
```

---

### DÉMO LIVE (5 min)

**Préparation avant la présentation** :

```bash
# Terminal 1 : Lancer tous les agents
npm run dev

# Terminal 2 : Prêt pour la démo client
npm run dev:demo
```

**Script pour la démo** :

> "Maintenant, voyons ça en action. J'ai déjà lancé les 5 agents en arrière-plan.
>
> **[Montrer Terminal 1]** Vous voyez ici les logs des différents agents qui tournent : Weather Agent sur le port 4000, Translator sur 4001, etc.
>
> **[Lancer le client - Terminal 2]**
>
> Je vais maintenant lancer le client et lui demander de planifier un voyage.
>
> **[Entrer les informations]**
> - Destination : Tokyo
> - Départ : Paris
> - Langue : French
>
> **[Pendant l'exécution, commenter les logs]**
>
> Regardez les logs dans le premier terminal. On voit le Travel Planner qui orchestre :
> - Il appelle d'abord le Web Search Agent pour trouver des activités à Tokyo
> - Puis le Weather Agent pour la météo
> - Ensuite le Calculator Agent pour calculer un budget
> - Il génère un itinéraire avec Gemini AI
> - Et enfin, il traduit tout en français via le Translator Agent
>
> **[Résultat affiché]**
>
> Et voilà ! En quelques secondes, nous avons un itinéraire complet en français avec activités, météo, et budget. Chaque agent a contribué sa spécialité.
>
> C'est ce que nous allons décortiquer dans les prochaines slides."

**Points à souligner pendant la démo** :

1. **Logs structurés** : montrer comment on suit l'orchestration
2. **Rapidité** : tout se fait en quelques secondes
3. **Résultat complet** : activités + météo + budget + traduction
4. **Mode mock disponible** : pour développer sans API keys

---

### Slide 3 : Architecture Globale (3 min)

**Titre** : "Architecture du Système"

**Script** :

> "Voici l'architecture globale du système que vous venez de voir en action.
>
> **[Pointer le schéma]**
>
> Au centre, nous avons le **Travel Planner Agent**, c'est l'orchestrateur. Il reçoit la requête de l'utilisateur et coordonne tous les autres agents.
>
> Autour, nous avons **5 agents spécialisés** :
> - **Weather Agent** : interroge OpenWeatherMap pour la météo
> - **Translator Agent** : utilise Gemini AI pour traduire
> - **Web Search Agent** : recherche des activités via Brave Search
> - **Calculator Agent** : effectue des calculs précis via un serveur MCP
> - **Travel Planner** : génère l'itinéraire final
>
> **[Pour le PO]** Pensez à chaque agent comme un micro-service avec une responsabilité unique. C'est comme avoir une équipe d'experts où chacun fait sa partie du travail.
>
> **[Pour le Dev Manager]** Tous communiquent via le protocole A2A (agent-to-agent). Le Calculator Agent utilise en plus MCP pour accéder à des outils mathématiques précis. On va voir ça en détail."

**Contenu du slide** :

```
ARCHITECTURE SYSTÈME
━━━━━━━━━━━━━━━━━━━━

           Client Demo
           (Interface)
                │
                │ A2A Protocol
                ▼
         Travel Planner
         (Orchestrateur)
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐  ┌────────┐  ┌────────┐
│Weather │  │  Web   │  │Calculator│
│Agent   │  │ Search │  │  Agent  │
└────────┘  └────────┘  └───┬────┘
                             │ MCP
    ┌────────┐               ▼
    │Trans-  │         ┌──────────┐
    │lator   │         │Math MCP  │
    └────────┘         │Server    │
                       └──────────┘

5 agents spécialisés
Communication standardisée (A2A)
Outils précis via MCP
```

---

### Slide 4 : Technologies Utilisées (2 min)

**Titre** : "Stack Technique"

**Script** :

> "Rapidement sur la stack technique pour le manager développeur.
>
> **Langage** : TypeScript avec Node.js - pour le typage fort et la maintenabilité
>
> **Protocoles** :
> - **A2A** (Agent-to-Agent) : standard Anthropic pour la communication entre agents
> - **MCP** (Model Context Protocol) : pour donner des capacités aux LLMs
>
> **Frameworks** :
> - **@a2a-js/sdk** : SDK officiel pour implémenter des agents A2A
> - **LangChain/LangGraph** : pour orchestrer les LLMs et les outils
>
> **LLMs** :
> - **Google Gemini** : pour génération de texte et traduction
>
> **APIs** :
> - OpenWeatherMap pour la météo
> - Brave Search pour la recherche web
>
> **[Pour le PO]** Ce sont toutes des technologies standard et open-source, pas de vendor lock-in. On pourrait facilement changer de LLM (passer à Claude ou GPT) grâce aux abstractions."

**Contenu du slide** :

```
STACK TECHNIQUE
━━━━━━━━━━━━━━━

Langage
  • TypeScript + Node.js

Protocoles
  • A2A (Agent-to-Agent)
  • MCP (Model Context Protocol)

Frameworks
  • @a2a-js/sdk (agents)
  • LangChain/LangGraph (LLMs)

LLMs
  • Google Gemini AI

APIs
  • OpenWeatherMap
  • Brave Search

✓ Standards ouverts
✓ Pas de vendor lock-in
✓ Modulaire et extensible
```

---

### Slide 5 : Protocole A2A (3 min)

**Titre** : "Protocole A2A : Communication Agent-à-Agent"

**Script** :

> "Parlons maintenant du protocole A2A - Agent-to-Agent.
>
> **[Pour le PO]** Imaginez que vous avez plusieurs équipes dans votre entreprise : comptabilité, RH, marketing. A2A est comme un langage commun qui permet à ces équipes de communiquer entre elles de manière standardisée, même si elles ne connaissent pas les détails internes de chaque équipe.
>
> **[Pour le Dev Manager]** A2A est un protocole HTTP standardisé par Anthropic. Chaque agent expose :
> - Une **Agent Card** : métadonnées (nom, capacités, exemples)
> - Des **routes HTTP** : pour envoyer/recevoir des messages
> - Des **messages structurés** : format JSON standardisé
>
> **Avantages** :
> 1. **Découverte** : un agent peut découvrir les capacités d'un autre via sa carte
> 2. **Interopérabilité** : n'importe quel agent A2A peut communiquer avec n'importe quel autre
> 3. **Orchestration** : facile de coordonner plusieurs agents
>
> **Exemple concret** : Le Travel Planner ne sait pas comment fonctionne le Weather Agent en interne. Il consulte juste sa carte, voit qu'il peut demander la météo, et lui envoie un message standard."

**Contenu du slide** :

```
PROTOCOLE A2A
━━━━━━━━━━━━━

Qu'est-ce que c'est ?
  Standard de communication entre agents autonomes

Composants
  • Agent Card : métadonnées (nom, capacités)
  • Messages : communication structurée
  • Tasks : gestion tâches asynchrones

Exemple : Travel Planner → Weather Agent

1. Travel Planner consulte Agent Card
   → "Weather Agent peut donner la météo"

2. Envoie message standardisé
   → "What is the weather in Tokyo?"

3. Reçoit réponse structurée
   → "Temperature: 22°C, Condition: Partly cloudy"

✓ Découverte automatique
✓ Communication standardisée
✓ Agents autonomes
```

---

### Slide 6 : Exemple Code A2A (2 min)

**Titre** : "A2A en Code (Exemple Simplifié)"

**Script** :

> "**[Pour le Dev Manager]** Voici à quoi ressemble le code pour appeler un agent via A2A. C'est très simple.
>
> **[Pour le PO]** Vous n'avez pas besoin de comprendre chaque ligne, juste l'idée générale : 3 lignes de code pour appeler un agent distant.
>
> **Étape 1** : Se connecter à l'agent via son URL
> **Étape 2** : Envoyer un message
> **Étape 3** : Recevoir la réponse
>
> C'est aussi simple qu'envoyer un email. Pas besoin de connaître l'infrastructure de l'agent, juste son adresse (URL)."

**Contenu du slide** :

```typescript
EXEMPLE CODE : Appeler un Agent via A2A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 1. Se connecter à l'agent
const weatherAgent = await A2AClient.fromCardUrl(
  "http://localhost:4000/.well-known/agent-card.json"
);

// 2. Envoyer un message
const response = await weatherAgent.sendMessage({
  message: {
    role: "user",
    parts: [{ kind: "text", text: "What is the weather in Tokyo?" }]
  },
  configuration: { blocking: true }
});

// 3. Recevoir la réponse
console.log(response.result);
// → "Temperature: 22°C, Condition: Partly cloudy"

✓ 3 lignes pour appeler un agent
✓ Communication standardisée
✓ Abstraction de la complexité
```

**Fichier à montrer si questions** : `src/agents/travel-planner-agent/executor.ts` (méthode `callAgent()`)

---

### Slide 7 : Protocole MCP (3 min)

**Titre** : "Protocole MCP : Capacités pour les LLMs"

**Script** :

> "Maintenant, parlons de MCP - Model Context Protocol.
>
> **[Pour le PO]** Imaginez que vous avez un assistant très intelligent (l'IA) mais qui ne peut que parler. MCP, c'est comme lui donner des outils : une calculatrice, un accès à internet, un accès à une base de données. Maintenant il peut faire des actions concrètes, pas juste discuter.
>
> **Problème** : Les LLMs comme ChatGPT sont excellents pour comprendre et générer du texte, mais :
> - Ils font des erreurs de calcul (15 × 7 = 102 ?)
> - Ils n'ont pas accès à des données en temps réel
> - Ils ne peuvent pas exécuter de code
>
> **Solution MCP** : On donne au LLM des **outils** (tools) qu'il peut appeler :
> - Tool "calculer" : pour des calculs précis
> - Tool "rechercher" : pour chercher sur internet
> - Tool "lire_base_de_données" : pour accéder aux données
>
> **Dans notre projet** : Le Calculator Agent utilise MCP pour avoir accès à 3 outils mathématiques :
> - `add` : additionner
> - `multiply` : multiplier
> - `calculate_trip_budget` : calculer budget voyage
>
> L'IA (Gemini) décide automatiquement quel outil utiliser selon la question."

**Contenu du slide** :

```
PROTOCOLE MCP
━━━━━━━━━━━━━

Problème : LLMs seuls
  ❌ Erreurs de calcul
  ❌ Pas de données temps réel
  ❌ Pas d'actions concrètes

Solution MCP : Donner des outils au LLM
  ✓ Tools pour calculs précis
  ✓ Tools pour accès données
  ✓ Tools pour actions

Exemple : Calculator Agent

Question utilisateur :
  "Calculate trip budget for 7 nights
   at $150/night with $25/day meals"

LLM raisonne :
  "Je dois utiliser le tool
   calculate_trip_budget"

Tool exécute :
  7 × $150 + 7 × $25 = $1225

LLM répond :
  "The total budget is $1225"

✓ Précision garantie
✓ LLM choisit le bon outil
```

---

### Slide 8 : MCP vs A2A (1 min)

**Titre** : "A2A vs MCP : Différences Clés"

**Script** :

> "Une question naturelle : quelle est la différence entre A2A et MCP ?
>
> **A2A** : communication **horizontale** entre agents autonomes
> - Agent 1 parle à Agent 2
> - Agents = intelligents, autonomes
> - Exemple : Travel Planner demande la météo au Weather Agent
>
> **MCP** : augmentation **verticale** d'un LLM avec des outils
> - LLM utilise des outils
> - Outils = fonctions passives
> - Exemple : Gemini utilise un tool mathématique
>
> **[Pour le PO]** Pensez A2A comme des équipes qui collaborent, et MCP comme donner des outils à une personne.
>
> **Dans notre projet** : On utilise les deux !
> - A2A pour orchestrer les agents (Travel Planner ↔ autres agents)
> - MCP pour donner des capacités précises (Calculator avec outils math)"

**Contenu du slide** :

```
A2A vs MCP : Complémentaires
━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────────────┐
│ A2A : Communication Horizontale        │
│                                        │
│  Agent 1 ←→ Agent 2 ←→ Agent 3        │
│  (autonomes)                           │
│                                        │
│  Exemple : Travel Planner ↔ Weather   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ MCP : Augmentation Verticale           │
│                                        │
│         LLM (Gemini)                   │
│           │                            │
│           ├── Tool 1 (add)             │
│           ├── Tool 2 (multiply)        │
│           └── Tool 3 (budget)          │
│        (passifs)                       │
│                                        │
│  Exemple : Calculator Agent + Math    │
└────────────────────────────────────────┘

Notre Projet : A2A + MCP
  → Orchestration d'agents (A2A)
  → Capacités précises (MCP)
```

---

### Slide 9 : Cas d'Usage 1 - Calculator (2 min)

**Titre** : "Cas Concret : Calculator Agent"

**Script** :

> "Prenons un exemple concret : le Calculator Agent.
>
> **Problème** : L'utilisateur demande 'Calculate trip budget for 7 nights at $150/night with $25/day meals'
>
> **Sans MCP** : Gemini calculerait approximativement : 'environ 1200-1300 dollars' - imprécis
>
> **Avec MCP** :
> 1. Gemini analyse la requête
> 2. Gemini décide : 'Je dois utiliser le tool calculate_trip_budget'
> 3. Le tool exécute le calcul : 7×150 + 7×25 = 1225
> 4. Gemini formule : 'Le budget total est exactement $1225'
>
> **Valeur** :
> - **Précision** : calculs exacts, pas d'approximations
> - **Automatique** : pas besoin de programmer la logique de choix
> - **Extensible** : facile d'ajouter d'autres calculs (remises, taxes, etc.)
>
> **[Montrer le code si le Dev Manager est intéressé]**"

**Contenu du slide** :

```
CAS CONCRET : Calculator Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Requête utilisateur :
  "Calculate trip budget for 7 nights
   at $150/night with $25/day meals"

Flow MCP :

  1. Gemini analyse
     → "Besoin d'un calcul de budget"

  2. Gemini choisit tool
     → calculate_trip_budget(7, 150, 25)

  3. Math Server exécute
     → Accommodation: 7 × 150 = 1050
     → Meals: 7 × 25 = 175
     → Total: 1225

  4. Gemini répond
     → "Total budget: $1225"

Valeur
  ✓ Précision : calculs exacts
  ✓ Automatique : pas de if/else
  ✓ Extensible : ajout facile de tools
```

**Fichiers à montrer si questions** :
- `src/mcp-servers/math-server.ts` : le serveur MCP avec les tools
- `src/agents/calculator-agent/executor.ts` : l'agent qui utilise MCP

---

### Slide 10 : Cas d'Usage 2 - Orchestration (2 min)

**Titre** : "Cas Concret : Orchestration Travel Planner"

**Script** :

> "Maintenant, voyons comment tout s'orchestre avec le Travel Planner.
>
> **Entrée utilisateur** : 'Tokyo, Paris, French'
>
> **Orchestration** (le Travel Planner coordonne) :
>
> **Étape 1 - Recherche activités** :
> - Travel Planner → Web Search Agent (A2A)
> - Résultat : 'Tokyo offers incredible attractions...'
>
> **Étape 2 - Météo** :
> - Travel Planner → Weather Agent (A2A)
> - Résultat : 'Temperature: 22°C, partly cloudy'
>
> **Étape 3 - Budget** :
> - Travel Planner → Calculator Agent (A2A)
> - Calculator Agent → Math Server (MCP)
> - Résultat : 'Total budget: $1225'
>
> **Étape 4 - Génération itinéraire** :
> - Travel Planner utilise Gemini avec tout le contexte
> - Résultat : itinéraire structuré en anglais
>
> **Étape 5 - Traduction** :
> - Travel Planner → Translator Agent (A2A)
> - Résultat : itinéraire en français
>
> **[Pour le PO]** C'est comme un chef de projet qui coordonne différentes équipes. Chaque équipe fait sa partie, le chef assemble le tout.
>
> **[Pour le Dev Manager]** Tout est asynchrone et parallélisable. On pourrait appeler Weather et Web Search en parallèle pour gagner du temps."

**Contenu du slide** :

```
CAS CONCRET : Orchestration Complète
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input : "Tokyo, Paris, French"

1. Web Search Agent (A2A)
   → Activités à Tokyo

2. Weather Agent (A2A)
   → Météo actuelle

3. Calculator Agent (A2A → MCP)
   → Budget voyage

4. Génération avec Gemini
   → Itinéraire structuré (EN)

5. Translator Agent (A2A)
   → Traduction français

Output : Itinéraire complet en français
  ✓ Activités recommandées
  ✓ Prévisions météo
  ✓ Budget calculé
  ✓ Planning matin/après-midi/soir

Temps total : ~10 secondes
5 agents coordonnés automatiquement
```

**Fichier à montrer** : `src/agents/travel-planner-agent/executor.ts` (méthode `execute()`)

---

### Slide 11 : Valeur & Bénéfices (3 min)

**Titre** : "Valeur Business & Technique"

**Script** :

> "Pour conclure, parlons de la valeur de cette approche.
>
> **[Pour le PO - Valeur Business]** :
>
> **1. Modularité = ROI à long terme**
> - Chaque agent peut évoluer indépendamment
> - Réutilisable dans d'autres projets (Weather Agent pour une app méteo, Calculator pour une app finance)
> - Moins de coûts de maintenance
>
> **2. Scalabilité**
> - Facile d'ajouter de nouveaux agents (Hotel Agent, Flight Agent)
> - Pas besoin de tout reconstruire, juste ajouter un nouveau micro-service
>
> **3. Vendor Independence**
> - Pas de lock-in avec un fournisseur
> - Protocoles open-source (A2A, MCP)
> - Facile de changer de LLM (Gemini → Claude → GPT)
>
> **[Pour le Dev Manager - Valeur Technique]** :
>
> **1. Standards & Best Practices**
> - Utilise des protocoles standardisés (A2A par Anthropic, MCP open-source)
> - Architecture micro-services moderne
> - TypeScript pour la maintenabilité
>
> **2. Developer Experience**
> - SDK bien documenté (@a2a-js/sdk)
> - Pattern clair (3 fichiers par agent)
> - Tests isolés (chaque agent testable séparément)
> - Mode mock pour développer sans API keys
>
> **3. Performance & Précision**
> - LLMs pour créativité et compréhension
> - MCP Tools pour précision (calculs, données structurées)
> - Async/parallélisable (optimisable facilement)
>
> **Comparaison** :
> - Approche monolithique : 1 gros système complexe
> - Notre approche : 5 agents simples + 1 orchestrateur = plus maintenable"

**Contenu du slide** :

```
VALEUR & BÉNÉFICES
━━━━━━━━━━━━━━━━━

Business (PO)
  ✓ Modularité → ROI long terme
  ✓ Réutilisabilité entre projets
  ✓ Scalabilité facile (ajout agents)
  ✓ Pas de vendor lock-in
  ✓ Time-to-market rapide

Technique (Dev)
  ✓ Standards ouverts (A2A, MCP)
  ✓ Architecture micro-services
  ✓ Developer Experience ++
  ✓ Testabilité (agents isolés)
  ✓ Performance optimisable

Comparaison
  ┌────────────────────────────┐
  │ Monolithique               │
  │ 1 système complexe         │
  │ Difficile à maintenir      │
  │ Couplage fort              │
  └────────────────────────────┘

  ┌────────────────────────────┐
  │ Multi-Agent                │
  │ 5 agents simples           │
  │ Facile à maintenir         │
  │ Découplage total           │
  └────────────────────────────┘
```

---

### Questions/Réponses (1 min)

**Questions Fréquentes à Anticiper** :

#### Question 1 : "C'est pas overkill pour un simple planificateur de voyage ?"

**Réponse** :

> "Excellente question ! Oui, pour UN SEUL cas d'usage (voyage), ça pourrait sembler complexe. Mais l'intérêt est la **réutilisabilité** :
>
> - Le Weather Agent peut servir dans une app météo, un dashboard IoT, etc.
> - Le Calculator Agent peut être réutilisé dans une app finance, e-commerce, etc.
> - Le Translator Agent peut servir partout où on a besoin de traduction
>
> C'est un **investissement** : on construit des briques réutilisables, pas un système jetable."

#### Question 2 : "Quels sont les coûts d'infrastructure ?"

**Réponse** :

> "Bon point. Les coûts principaux :
>
> **APIs externes** :
> - Gemini AI : environ $0.10 pour 1000 requêtes (très raisonnable)
> - OpenWeatherMap : gratuit jusqu'à 1000 calls/jour
> - Brave Search : gratuit en développement
>
> **Infrastructure** :
> - Chaque agent = petit service Node.js (~50 MB RAM)
> - 5 agents = environ 250 MB RAM total
> - Peut tourner sur une petite VM (2 GB RAM suffit)
> - Pas de base de données nécessaire
>
> Coût mensuel estimé : < 50€ pour quelques milliers d'utilisateurs"

#### Question 3 : "Temps de développement pour ajouter un agent ?"

**Réponse** :

> "Avec le SDK A2A et le pattern établi :
>
> **Agent simple** (comme Weather) : 2-4 heures
> - agent-card.ts : 30 min
> - executor.ts : 1-2h (logique métier)
> - server.ts : 30 min
> - Tests : 1h
>
> **Agent complexe** (comme Calculator avec MCP) : 1-2 jours
> - Créer le serveur MCP : 4h
> - Intégrer avec LangChain : 4h
> - Tests complets : 4h
>
> Une fois qu'on a le pattern, c'est très rapide."

#### Question 4 : "Sécurité et authentification ?"

**Réponse** :

> "Excellent point. Actuellement c'est une démo, donc pas d'auth. En production :
>
> **Options** :
> 1. **API Keys** : chaque agent a une clé
> 2. **OAuth 2.0** : pour authentification utilisateur
> 3. **mTLS** : pour communication inter-agents sécurisée
> 4. **Rate limiting** : éviter les abus
>
> Le SDK A2A supporte tout ça via headers HTTP standards. C'est du HTTP classique, donc tous les patterns de sécurité web s'appliquent."

#### Question 5 : "Performance : temps de réponse ?"

**Réponse** :

> "Actuellement en séquentiel (un agent après l'autre) : ~10 secondes
>
> **Optimisations possibles** :
> 1. **Parallélisation** : appeler Weather et Web Search en même temps → gain 3-4 secondes
> 2. **Cache** : mettre en cache les résultats fréquents (météo de Paris) → gain 5 secondes
> 3. **LLM plus rapide** : Gemini Flash au lieu de Pro → gain 2 secondes
>
> Potentiel : **< 3 secondes** avec optimisations
>
> Pour info : ChatGPT met environ 5-10 secondes pour générer un itinéraire simple sans agents."

---

## 🎬 Parties de Code à Montrer

### Si le Dev Manager Veut Voir du Code

#### 1. Agent Card Simple

**Fichier** : `src/agents/weather-agent/agent-card.ts`

```typescript
export const weatherAgentCard: AgentCard = {
  name: "Weather Agent",
  description: "Weather forecast agent using OpenWeatherMap API",
  skills: [
    {
      name: "get_weather",
      description: "Get weather information for a specific location",
      tags: ["weather", "forecast"],
      examples: [
        "What is the weather in Paris?",
        "Tell me the weather forecast for Tokyo"
      ]
    }
  ],
  url: `http://localhost:${process.env.WEATHER_AGENT_PORT || 4000}`,
  protocolVersion: "1.0"
};
```

**Commentaire** :

> "Voici une Agent Card. C'est comme une carte de visite de l'agent : nom, description, ce qu'il sait faire, où le contacter. N'importe quel autre agent peut lire cette carte et savoir comment interagir avec lui."

#### 2. Appel A2A Simple

**Fichier** : `src/agents/travel-planner-agent/executor.ts` (ligne ~80)

```typescript
private async callAgent(
  client: A2AClient,
  agentName: string,
  query: string
): Promise<string> {
  console.log(`[Travel Planner] Calling ${agentName}`);

  const params: MessageSendParams = {
    message: {
      messageId: uuidv4(),
      role: "user",
      parts: [{ kind: "text", text: query }],
      kind: "message"
    }
  };

  const stream = client.sendMessageStream(params);
  let finalResponse = "";

  for await (const event of stream) {
    if (event.kind === "message" && event.role === "agent") {
      const text = event.parts
        .filter(p => p.kind === "text")
        .map(p => p.text)
        .join(" ");
      if (text) finalResponse = text;
    }
  }

  return finalResponse;
}
```

**Commentaire** :

> "C'est la méthode qui appelle n'importe quel agent via A2A. Créer un message, envoyer via le SDK, récupérer la réponse. Le SDK gère toute la complexité HTTP, SSE, etc."

#### 3. Définition d'un Tool MCP

**Fichier** : `src/mcp-servers/math-server.ts` (ligne ~30)

```typescript
{
  name: "calculate_trip_budget",
  description: "Calculate total trip budget including accommodation and meals",
  inputSchema: {
    type: "object",
    properties: {
      nights: { type: "number", description: "Number of nights" },
      pricePerNight: { type: "number", description: "Price per night" },
      mealsPerDay: { type: "number", description: "Meals cost per day" }
    },
    required: ["nights", "pricePerNight", "mealsPerDay"]
  }
}
```

**Commentaire** :

> "Voici la définition d'un tool MCP. On décrit ce qu'il fait, quels paramètres il accepte. Le LLM lit cette description et décide s'il doit utiliser ce tool."

#### 4. Handler du Tool MCP

**Fichier** : `src/mcp-servers/math-server.ts` (ligne ~90)

```typescript
if (name === "calculate_trip_budget") {
  const { nights, pricePerNight, mealsPerDay } = args;

  // Calculs
  const accommodationCost = nights * pricePerNight;
  const mealsCost = nights * mealsPerDay;
  const totalCost = accommodationCost + mealsCost;

  return {
    content: [
      {
        type: "text",
        text: `Total trip budget: $${totalCost} (Accommodation: $${accommodationCost}, Meals: $${mealsCost})`
      }
    ]
  };
}
```

**Commentaire** :

> "Et voici l'exécution du tool. Code JavaScript classique : on fait les calculs, on retourne le résultat. Rien de magique, juste des maths. La magie est que le LLM décide quand appeler ça."

---

## 💡 Conseils pour la Présentation

### Avant la Présentation

1. **Tester la démo** :
   ```bash
   # Tester 2-3 fois pour vérifier que tout marche
   npm run dev
   npm run dev:demo
   ```

2. **Préparer des exemples variés** :
   - Tokyo, Paris, French (principal)
   - London, Berlin, English (backup)
   - Rome, Madrid, Spanish (si temps)

3. **Screenshots de backup** :
   - Au cas où la démo crash, avoir des captures d'écran

4. **Répéter le timing** :
   - Chronométrer chaque section
   - S'assurer de tenir 30 minutes

### Pendant la Présentation

#### Pour le Product Owner (simplifier)

- ✅ Utiliser des **métaphores business** : "comme une équipe", "comme un chef de projet"
- ✅ Focus sur la **valeur** : réutilisabilité, ROI, scalabilité
- ✅ **Diagrammes visuels** plutôt que code
- ✅ **Démo** : montrer le résultat, pas le processus

#### Pour le Dev Manager (détails techniques)

- ✅ Mentionner les **standards** : A2A (Anthropic), MCP (open-source)
- ✅ Parler **architecture** : micro-services, découplage
- ✅ Montrer du **code** si intéressé
- ✅ Discuter **performance** et optimisations

#### Gestion du Temps

| Section | Min | Max | Ajustement |
|---------|-----|-----|------------|
| Intro | 2 | 3 | Peut skipper slide 2 si manque temps |
| Démo | 4 | 6 | CRUCIAL, prendre le temps |
| Architecture | 4 | 6 | Peut accélérer si dev pas intéressé |
| A2A | 4 | 6 | Essentiel |
| MCP | 3 | 5 | Peut simplifier si PO confus |
| Cas d'usage | 3 | 5 | Peut n'en montrer qu'un |
| Valeur | 2 | 4 | Important pour PO |
| Q&A | 5 | 10 | Garder du temps |

### Gestion des Questions Difficiles

#### "C'est pas juste du hype autour de l'IA ?"

**Réponse** :

> "Je comprends le scepticisme. Ce projet n'est pas juste 'ajouter de l'IA pour faire tendance'. C'est résoudre un problème réel : **orchestrer des services spécialisés de manière modulaire**. L'IA (Gemini) est juste un des composants, pas le centre.
>
> Les protocoles A2A et MCP existeraient et seraient utiles même sans IA : ce sont des standards de communication entre services."

#### "Pourquoi pas utiliser juste des APIs REST classiques ?"

**Réponse** :

> "Excellente question ! On **pourrait** utiliser des APIs REST custom. Mais :
>
> **Avec REST custom** :
> - Chaque agent a son propre format de requête/réponse
> - Pas de découverte automatique (il faut lire la doc de chaque API)
> - Pas de standardisation
>
> **Avec A2A** :
> - Format standardisé (tout agent A2A parle le même langage)
> - Découverte automatique via Agent Card
> - Interopérabilité : n'importe quel agent A2A peut appeler n'importe quel autre
>
> C'est comme demander 'pourquoi GraphQL au lieu de REST ?' - c'est un niveau d'abstraction supérieur qui apporte de la valeur."

#### "Temps de développement total du projet ?"

**Réponse honnête** :

> "Environ **40 heures** au total pour le POC complet :
> - Setup SDK et infrastructure : 4h
> - Weather Agent (premier) : 6h (learning curve)
> - Autres agents simples : 3-4h chacun (12h total)
> - Calculator Agent + MCP : 8h
> - Travel Planner orchestrateur : 6h
> - Tests, debugging, docs : 8h
>
> Avec l'expérience acquise, un nouveau projet similaire prendrait **~20 heures**."

---

## 🎯 Checklist Avant Présentation

### Technique

- [ ] Tous les agents démarrent sans erreur (`npm run dev`)
- [ ] Client demo fonctionne (`npm run dev:demo`)
- [ ] API keys sont dans `.env` (ou mode mock activé)
- [ ] Tester avec 2-3 exemples différents
- [ ] Vérifier les logs sont propres

### Contenu

- [ ] Slides préparés (11 slides)
- [ ] Script répété au moins 2 fois
- [ ] Timing vérifié (~30 min)
- [ ] Screenshots de backup prêts
- [ ] Questions/réponses préparées

### Matériel

- [ ] Laptop chargé
- [ ] Projecteur testé
- [ ] Backup sur clé USB
- [ ] Connexion internet (si besoin d'APIs live)

---

## 🎉 Conclusion

Cette présentation vous permettra de :

✅ **Démo** : montrer le système en action (concret)
✅ **Expliquer** : architecture et protocoles (compréhension)
✅ **Convaincre** : valeur business et technique (adoption)

**Bonne chance pour votre présentation !** 🚀

---

**Temps de préparation recommandé** : 2-3 heures
**Temps de répétition recommandé** : 3-4 fois

Si vous avez des questions sur la présentation, n'hésitez pas !
