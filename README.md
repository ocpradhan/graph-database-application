# Supply Chain Resilience Tracker (CognoDB + TypeScript)

An interactive graph database application built to simulate supply chain disruption impact in real-time.

## Tech Stack

- **Database:** CognoDB (Graph Database Instance)
- **Frameword:** Next.js (App Router, TypeScript)
- **Styling UI:** Tailwind CSS, shadcn/ui
- **Graph Canvas:** React Flow

## Graph DB vs Relational DB Justification

This application relies on multi-hop connectivity queries to compute downstream blast radiuses.
In a relational database, finding all affected end-products from a tier-3 supplier requires recursive `JOIN` queries that suffer from exponential performance degradation. CognoDB uses index-free adjacency to perform pointer traversals in $O(1)$ constant time per relationship hop.

## Local Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```
