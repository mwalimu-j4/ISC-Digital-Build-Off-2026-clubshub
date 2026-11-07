# ClubsHub entity relationship

The diagram covers the Stage 02 implemented schema. Authentication identities and
future modules are intentionally omitted.

```mermaid
erDiagram
    USER ||--o{ CLUB : creates
    USER ||--o{ CLUB_MEMBERSHIP : has
    CLUB ||--o{ CLUB_MEMBERSHIP : contains
    USER ||--o{ AUDIT_LOG : performs
    USER ||--o{ EVENT_REGISTRATION : registers
    EVENT ||--o{ EVENT_REGISTRATION : accepts
    CLUB ||--o{ EVENT : hosts
    CLUB ||--o{ ANNOUNCEMENT : publishes
    USER ||--o{ ANNOUNCEMENT : authors

    USER {
        uuid id PK
        string full_name
        string email UK
        string student_registration_id UK
        enum role
        enum status
        datetime created_at
        datetime updated_at
    }

    CLUB {
        uuid id PK
        string name UK
        string slug UK
        string description
        string category
        string logo_url
        uuid created_by_id FK
        enum status
        datetime created_at
        datetime updated_at
    }

    CLUB_MEMBERSHIP {
        uuid id PK
        uuid user_id FK
        uuid club_id FK
        enum role
        enum status
        datetime applied_at
        datetime approved_at
        datetime updated_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid actor_id FK
        string action
        string target_entity
        uuid target_entity_id
        json metadata
        datetime created_at
    }

    EVENT {
        uuid id PK
        uuid club_id FK
        string title
        datetime starts_at
        datetime ends_at
        int capacity
        enum status
    }

    EVENT_REGISTRATION {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        enum status
        datetime created_at
    }

    ANNOUNCEMENT {
        uuid id PK
        uuid club_id FK
        uuid author_id FK
        string title
        string body
        boolean pinned
        enum audience
        datetime created_at
    }
```

`USER` to `CLUB` membership is many-to-many through `CLUB_MEMBERSHIP`, with a
database-enforced unique `(user_id, club_id)` pair. `AUDIT_LOG.actor_id` is nullable
and uses `SET NULL` so historical records remain available if an account is removed.
