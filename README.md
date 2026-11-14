# Smart Student Expense Tracker

An offline React Native application designed to help students manage their everyday expenses. Record spending on canteen meals, transportation, books, rent, and other daily needs.

The application uses a local SQLite database to store expense records directly on the device. It does not depend on public APIs or online databases for its core functionality.

## Overview

On the first launch, the application initializes a local SQLite database and inserts a sample student expense dataset.

Users can add, edit, delete, search, and filter expense records. The application also calculates spending summaries dynamically using the data stored in the local database.

All monetary values are displayed in Sri Lankan Rupees (Rs.).

## Features

- Six screens: Home, Tracker, Expenses, Expense Details, Expense Form, and Categories.
- Bottom tab navigation for the main sections and stack navigation for expense details and forms.
- Local SQLite database for storing categories and expenses.
- Sample categories and expenses inserted automatically when the database is first initialized.
- Search expenses by title, note, or category.
- Filter expenses by time period, category, and payment method.
- View individual expense details, including date, payment method, and note.
- Add, edit, and delete expense records.
- Monthly spending total and average expense calculations.
- Category-wise spending breakdown with percentages and visual progress bars.
- Recent expense records displayed on the Tracker screen.
- Data remains stored locally on the device.
- Core expense tracking features work without an internet connection after the application bundle has loaded.

## Project Structure

```text
App.tsx                              App entry point and database provider
src/
  db/
    initialize.ts                    Database initialization, tables, and sample data
    categories.ts                    Category queries and summaries
    expenses.ts                      Expense queries and dashboard summary
  navigation/
    RootNavigator.tsx                Bottom tabs and stack navigation
  screens/
    HomeScreen.tsx                   Home screen
    TrackerScreen.tsx                Monthly spending overview
    ExpensesScreen.tsx               Expense list, search, and filters
    ExpenseDetailScreen.tsx          Individual expense details
    ExpenseFormScreen.tsx            Add and edit expenses
    CategoriesScreen.tsx             Category-wise spending summary
  components/                        Shared buttons, fields, rows, and chips
  types/
    models.ts                         Shared data types
  utils/                              Date and currency helpers
```

## Requirements

- Node.js 20 or newer
- npm
- Expo Go on an Android or iPhone, or an Android emulator

**Recommended development environment:** Expo Go on an Android device or an Android emulator.

An iOS Simulator requires macOS and Xcode.

## Step-by-Step Setup

### 1. Install Node.js

Download and install Node.js from [https://nodejs.org](https://nodejs.org) if it is not already installed.

Check the installed versions using:

```bash
node -v
npm -v
```

### 2. Open the Project Folder

Open a terminal inside the project directory.

Alternatively, navigate to the project folder:

```bash
cd "your/project/path"
```

### 3. Install Dependencies

Run:

```bash
npm install
```

### 4. Start the Expo Development Server

Run:

```bash
npx expo start
```

### 5. Open the Application

Choose one of the following options:

- **Android phone:** Install Expo Go from the Google Play Store. Scan the QR code displayed in the terminal using Expo Go.
- **iPhone:** Install Expo Go from the App Store and scan the QR code using the Camera app.
- **Android emulator:** Press `a` in the Expo terminal. Android Studio and a configured virtual device must be installed.

For a physical device, the phone and computer should normally be connected to the same Wi-Fi network.

### 6. Stop the Development Server

Press `Ctrl + C` in the terminal.

The sample expenses are inserted when the local database is first initialized. Later launches retain saved expense records and user changes.

## How to Use the Application

1. **Home:** Introduces the application and provides access to the expense tracking features.
2. **Tracker:** Displays the current month's total spending, average expense, category breakdown, and recent expenses.
3. **Expenses:** Displays saved expense records. Use the search field and filters to find specific expenses.
4. **Expense Details:** Select an expense to view its complete information. You can edit or delete the selected record.
5. **Expense Form:** Add a new expense or edit an existing one by entering its title, amount, category, date, payment method, and optional note.
6. **Categories:** Displays spending totals for each category, including percentage breakdowns and progress bars. Select a category to view its related expenses.

## Local Data Management

The application uses SQLite to store data locally on the device.

Database initialization, table creation, and sample data insertion are handled in:

```text
src/db/initialize.ts
```

The database contains the following main tables:

| Table | Stored Information |
|---|---|
| `categories` | Category ID, name, and colour |
| `expenses` | Expense title, amount, category, date, payment method, note, and recorded time |

The initial sample dataset contains:

- 8 expense categories
- 18 sample expenses
- Expenses distributed across recent days, the current month, and older dates

This dataset allows users to explore the search and period-filtering features.

New and edited expense records are stored using parameterized SQL statements. Sample data is inserted only when the database is first initialized.

### Resetting the Sample Data

To see the original sample dataset again, clear the application's stored data or reinstall the application.

- **Expo Go:** Clear the relevant application data or reset the project data.
- **Android emulator:** Clear the application's stored data or reinstall the app.

Clearing application data removes locally stored expense records and user changes.

## Offline Behaviour

The application stores expense records in a local SQLite database.

The following features operate using locally stored data:

- Adding, editing, and deleting expenses
- Searching and filtering expenses
- Viewing expense details
- Calculating monthly totals and averages
- Displaying category-wise spending summaries

Expense records are not sent to an external server.

During development, Expo Go initially needs to connect to the computer to download the application bundle. Once the application has loaded, its core expense tracking functionality can operate without an internet connection.

## Available Scripts

| Command | Description |
|---|---|
| `npm install` | Installs project dependencies |
| `npx expo start` | Starts the Expo development server |
| `npm run android` | Starts the Android build target |
| `npm run web` | Starts the web preview, if configured |
| `npx tsc --noEmit` | Checks TypeScript without generating build files |

