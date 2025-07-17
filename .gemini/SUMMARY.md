### ✅ Implemented Onchain Profile Creation

- **Created Onchain Profile Logic**: Implemented a new function in `src/lib/onchainProfile.ts` that handles the creation of a user's profile on the Solana blockchain using the Honeycomb protocol.
- **Integrated with Auth Flow**: Updated `AuthContext.tsx` to automatically trigger the on-chain profile creation process when a user connects their wallet for the first time after logging in.
- **User-Friendly Feedback**: Added toast notifications to keep the user informed about the status of the on-chain profile creation, including loading, success, and error states.

#### 🧠 Key Decisions

- **Client-Side Trigger**: Decided to trigger the on-chain profile creation from the client-side within the `AuthContext` for simplicity and to ensure it happens immediately after wallet connection.
- **Session Storage Persistence**: Used `sessionStorage` to prevent the application from attempting to re-create an on-chain profile for the same user during the same session, which would result in unnecessary errors and network requests.
- **Honeycomb SDK**: Leveraged the Honeycomb SDK for creating and sending the transaction, abstracting away the complexities of Solana transaction creation and submission.

#### 📁 Files Affected

- `src/lib/onchainProfile.ts` (created)
- `src/contexts/AuthContext.tsx` (modified)
- `.gemini/TASKS.md` (updated)

---

⏭️ **Next**: Test the onchain profile creation and handle any errors.