# Smart Student Expense Tracker

An offline React Native app for recording everyday student spending. Canteen meals, bus fare, books, rent, and smaller costs stay in a SQLite database on the device. The app does not call a public API or an online database.

## Overview

The first launch creates a local database and fills it with a sample student dataset. After that, the app reads and updates only that database. You can search expenses, filter them, open a full record, and add, edit, or delete expenses. Totals on the overview and category screens are calculated from the stored rows, so the figures change as the data changes.

Amounts are shown in Sri Lankan rupees (Rs.).

## Features

- Five screens: Overview, Expenses, Expense details, New/Edit expense, and Categories
- Bottom tabs for the main sections and a stack for details and the form
- Local SQLite database with categories and expenses
- Sample dataset created automatically the first time the database is opened
- Search by title, note, or category
- Filters for time period, category, and payment method
- Expense details with date, payment method, and note
- Add, edit, and delete expenses, with the lists refreshing when you return
- Monthly total, average, category breakdown, and recent expenses
- Works without an internet connection after the app bundle is loaded

## Project structure

```text
App.tsx                         App entry, safe area, and database provider
src/db/initialize.ts            Tables, indexes, and the sample dataset
src/db/categories.ts            Category queries
src/db/expenses.ts              Expense queries and the overview summary
src/navigation/RootNavigator.tsx  Tabs and stack navigation
src/screens/                    One file for each screen
src/components/                 Shared buttons, fields, rows, and chips
src/types/models.ts             Shared data types
src/utils/                      Date and currency helpers
```

## Requirements

- Node.js 20 or newer
- npm, which is installed with Node.js
- One of these ways to open the app:
  - Expo Go on an Android or iPhone, with the phone and computer on the same Wi-Fi network
  - An Android emulator
  - A desktop browser, for a quick preview

iOS Simulator requires a Mac. On Windows, use Expo Go, an Android emulator, or the browser preview.

## Step-by-step setup

1. Install Node.js from [https://nodejs.org](https://nodejs.org) if it is not already installed. Open a terminal and check the version:

   ```bash
   node -v
   npm -v
   ```

2. Open a terminal in the project folder:

   ```bash
   cd 'your\file\path'
   ```

3. Install the project packages:

   ```bash
   npm install
   ```

4. Start the Expo development server:

   ```bash
   npx expo start
   ```

5. Open the app with one of these options:
   - **Phone:** install Expo Go from the Play Store or App Store. In the terminal, scan the QR code. Android can scan it from inside Expo Go. iPhone can scan it with the Camera app.
   - **Android emulator:** press `a` in the Expo terminal. Android Studio and a virtual device must already be installed.
   - **Browser preview:** press `w` in the Expo terminal.

6. Stop the server with `Ctrl+C` when you are finished.

The sample expenses appear on the first launch. They are saved on the device, so later launches keep your edits.

## How to use the app

1. **Overview** shows this month’s total, the average expense, spending by category, and the five most recent expenses.
2. Tap **Add expense** to record a new item. Enter a title, amount, category, date (`YYYY-MM-DD`), payment method, and an optional note.
3. **Expenses** lists every saved record. Use the search box and the chips to narrow the list by period, category, or payment method.
4. Tap an expense to open **Expense details**. From there you can edit or delete it.
5. **Categories** shows the total stored against each category. Tap a category to open Expenses already filtered to that category.

## Local data

The database file is `student-expenses.db`.

| Table | What it stores |
| --- | --- |
| `categories` | Id, name, and colour |
| `expenses` | Title, amount, category, date, payment method, note, and the time it was recorded |

The sample set has 8 categories and 18 expenses spread across recent days, this month, and older dates, so the period filters have something to show. New and edited records are written with parameterized SQL statements. The sample data is inserted only when the database is first created.

To see the original sample data again, remove the app’s stored data:

- Expo Go: clear the app’s storage, or reinstall Expo Go’s data for this project
- Browser preview: clear the site data for the local Expo page, then reload

## Offline behaviour

Expense records are never sent to a server. Search, filters, totals, and edits all use the database on the device.

During development, Expo Go still needs to reach your computer once so it can download the JavaScript bundle. After the app is open, tracking works with the network turned off.

## Scripts

| Command | What it does |
| --- | --- |
| `npm install` | Installs dependencies |
| `npx expo start` | Starts the development server |
| `npm run android` | Opens the Android build target |
| `npm run web` | Opens the browser preview |
| `npx tsc --noEmit` | Checks TypeScript without producing a build |
