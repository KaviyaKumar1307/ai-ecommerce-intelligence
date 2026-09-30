# Relational Database Documentation

## Overview
The AI-Powered E-Commerce Intelligence System utilizes a normalized relational database design (MySQL 8.0+ / SQLite dual-mode) designed for high concurrency e-commerce transactions and real-time analytical feeds for the Python AI subsystem.

## Schema Architecture

```
                    +-------------------+
                    |       users       |
                    +---------+---------+
                              | 1
                              |
       +----------------------+----------------------+
       | 1                    | 1                    | 1
       v                      v                      v
+-------------+        +-------------+        +---------------+
|    carts    |        |   orders    |        |  user_events  |
+------+------+        +------+------+        +-------+-------+
       | 1                    | 1                     |
       v                      v                       v
+-------------+        +-------------+         (Behavioral ML)
| cart_items  |        | order_items |
+------+------+        +------+------+
       | N                    | N
       +----------+-----------+
                  |
                  v
       +--------------------+          +---------------------+
       |      products      |<---------+     categories      |
       +----------+---------+ 1      N +---------------------+
                  | 1
                  |
                  v N
       +--------------------+
       |  product_features  | (Structured JSON & AI Keyword Embeddings)
       +--------------------+
```

### Core Entities & Roles
1. **users**: Stores customer and administrator profiles with bcrypt-hashed credentials (`$2a$10$...`) and role enforcement (`CUSTOMER`, `ADMIN`).
2. **categories**: Product groupings with slugs and metadata.
3. **products**: Catalog items with pricing, inventory tracking, original MSRP, average rating, review count, and featured flags. Fulltext index enabled on `(name, description, brand)`.
4. **product_features**: Structured JSON specifications (`specs`) and preprocessed keyword tokens (`keywords`) engineered specifically for the TF-IDF Vectorizer and Semantic Search pipeline.
5. **carts** & **cart_items**: Persistent shopping cart state supporting quantity updates and checkout transitions.
6. **orders** & **order_items**: Immutable transactional records capturing finalized purchases, address, payment method, and unit prices.
7. **user_events**: Behavioral event stream tracking `PRODUCT_VIEW`, `SEARCH`, `ADD_TO_CART`, `REMOVE_FROM_CART`, `PURCHASE`, and `WISHLIST` with metadata (e.g. dwell time, referral source). This powers the hybrid recommendation scoring algorithm and customer segmentation.
8. **searches**: Search queries logged with timestamp and mode (`KEYWORD` vs `SEMANTIC`) to analyze user intent and compute search click-through patterns.
9. **recommendations**: Audit log tracking which algorithm (`HYBRID`, `CONTENT_BASED`, `BEHAVIORAL`, `COLD_START_POPULAR`) generated product suggestions to verify ML transparency.
10. **sales_daily**: Aggregated daily historical revenue, total orders, and unit volumes across 180+ days. Serves as ground truth for time-series feature engineering and the Random Forest sales forecasting model.

## Running Migrations & Seeding

### Option A: Via Docker MySQL (Recommended for Production)
```bash
docker compose up -d mysql
# The container automatically executes schema.sql and seed.sql from /docker-entrypoint-initdb.d
```

### Option B: Via Native MySQL CLI
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Option C: Built-in Dual-Mode Engine (Zero-Config Developer Mode)
The Node.js backend automatically detects whether MySQL is available. If `DB_DIALECT=sqlite`, it automatically creates and seeds `./database/ecommerce.sqlite` on first boot with identical tables and seed data!
