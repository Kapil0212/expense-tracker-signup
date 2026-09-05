# Expense Tracker - Signup Screen

React + JavaScript signup screen matching the supplied reference image, with Firebase Email/Password Authentication.

## 1. Install

```bash
npm install
```

## 2. Connect Firebase

Open `src/firebase.js` and replace the placeholder values with the Web App configuration from your Firebase project.

In Firebase Console, enable:

**Authentication -> Sign-in method -> Email/Password**

## 3. Run

```bash
npm run dev
```

Open the local Vite URL in your browser.

## 4. Where users are saved

After a successful signup, Firebase Authentication creates the account under:

**Firebase Console -> Authentication -> Users**

It is not automatically stored in Firestore.

## Assignment checks

- Email, password and confirm password are mandatory.
- Empty fields prevent submission.
- Password confirmation is validated.
- Firebase `createUserWithEmailAndPassword` creates the new user.
- Firebase errors are shown to the user.
- Successful signup logs exactly: `User has successfully signed up.`
