# PocketBase Setup for Quitters

## Quick Start

1. Download PocketBase from https://pocketbase.io/docs/
2. Run `./pocketbase serve`
3. Go to `http://127.0.0.1:8090/_/` to access the admin UI
4. Create an admin account

## Users Collection

The app expects these **additional fields** on the `users` collection (beyond the defaults):

| Field           | Type     | Required | Default |
|-----------------|----------|----------|---------|
| `username`      | Text     | No       | -       |
| `is_public`     | Boolean  | No       | true    |
| `last_use_date` | Date     | No       | null    |

The `last_use_date` field is automatically updated by PocketBase hooks whenever tracking entries change.

### To add these fields:

1. Go to Collections → users → Fields
2. Add each field with the settings above
3. Save the collection

## Tracking Entries Collection (NEW)

Create a **new collection** called `tracking_entries`:

| Field  | Type     | Required | Options                                    |
|--------|----------|----------|--------------------------------------------|
| `user` | Relation | Yes      | Single relation to `users` collection      |
| `date` | Text     | Yes      | Format: YYYY-MM-DD                         |
| `type` | Select   | Yes      | Options: `smoked`, `vaped`, `nicotine_replacement` |

### To create this collection:

1. Go to Collections → New Collection
2. Name: `tracking_entries`
3. Add the fields above
4. For the `user` field, select "Relation" and link to `users`
5. For the `type` field, select "Select" and add the three options

### API Rules for tracking_entries:

- **List/Search rule**: `user.is_public = true || user = @request.auth.id`
- **View rule**: `user.is_public = true || user = @request.auth.id`
- **Create rule**: `user = @request.auth.id`
- **Update rule**: `user = @request.auth.id`
- **Delete rule**: `user = @request.auth.id`

This ensures:
- Anyone can view entries from public users
- Users can only create/edit/delete their own entries

### API Rules for users (Optional):

- **List/Search rule**: `is_public = true || @request.auth.id = id`
- **View rule**: `is_public = true || @request.auth.id = id`
- **Update rule**: `@request.auth.id = id`

## Running the App

```bash
# Terminal 1: Start PocketBase (with hooks)
./pocketbase serve

# Terminal 2: Start Vue dev server
cd quitters
npm run dev
```

The app will be at `http://localhost:5173`

## Hooks Setup

The `pb_hooks` folder contains JavaScript hooks that automatically update each user's `last_use_date` field whenever they create, update, or delete a tracking entry.

To use the hooks:
1. Copy the `pb_hooks` folder to your PocketBase directory (next to the `pocketbase` executable)
2. Restart PocketBase

The hooks will run automatically — no additional configuration needed.

## How Tracking Works

- Users click dates on the calendar to log nicotine use
- Each entry records: date + type (smoked/vaped/NRT)
- The counter shows days since the MOST RECENT entry
- Calendar displays color-coded entries (red=smoked, orange=vaped, yellow=NRT)
