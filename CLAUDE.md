# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run lint          # Run ESLint
npm run preview       # Preview production build
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

No test framework is configured.

## Architecture

**Stack:** React 19 + Vite + Styled-components + React Router v7 + Axios + Firebase
**API Base URL:** `https://dev.wenivops.co.kr/services/mandarin`
**Design:** Mobile-first, max-width 390px

### Authentication Flow

`AuthContext` (`src/context/AuthContext.jsx`) manages auth state globally:

- On app mount, reads `localStorage.token` and calls `getMyInfo()` to validate
- `login(token, userData)` stores token + accountname in localStorage
- `logout()` clears localStorage and resets state
- `useAuth()` hook provides `{ user, isLoading, isAuthenticated, login, logout, updateUser }`

Routes are guarded by `PrivateRoute` / `PublicRoute` wrappers in `App.jsx`.

### Theme Mode

`ThemeModeContext` (`src/context/ThemeModeContext.jsx`) manages light/dark theme:

- `useThemeMode()` hook provides `{ isDark, toggleTheme }`
- Preference persisted to localStorage
- `lightTheme` / `darkTheme` objects exported from `src/styles/theme.js`

### API Layer

All requests go through `src/api/config.js` which exports a single Axios instance:

- **Request interceptor:** Auto-attaches `Authorization: Bearer <token>` from localStorage
- **Response interceptor:** On 401, clears localStorage and redirects to `/login`

API functions are organized by domain in `src/api/`:

- `auth.js` — login, register, profile, image upload, token check
- `user.js` — profile, follow/unfollow, search, user posts
- `post.js` — feed, CRUD, like/unlike, report
- `comment.js` — CRUD, report
- `product.js` — CRUD
- `ai.js` — AI product info generation (OpenAI wrapper; generates product name & description from image)

### Firebase (Real-time Chat)

`src/firebase/config.js` — Firebase initialization (Firestore, Analytics) via env vars.

`src/firebase/chat.js` — All chat logic (~26 functions):

- `getOrCreateChat()` — 1-on-1 chat creation
- `createGroupChat()` — group chat with title/image
- `subscribeToChats()`, `subscribeToMessages()` — real-time Firestore listeners
- `sendTextMessage()`, `sendImageMessage()` — message delivery
- `toggleReaction()` — heart/thumbs_up/star reactions per message
- Edit/delete messages, pin chats, save chat themes

### Styling

Styled-components with a shared theme (`src/styles/theme.js`). Access theme values via the `theme` prop in styled components:

- Primary color: `${({ theme }) => theme.colors.primary}` → `#F26E22`
- Error: `#EB5757`, Success: `#2EB48B`
- All colors, fonts, borderRadius, spacing, shadows, z-index levels are in the theme

`src/utils/format.js` provides shared utilities:

- `formatPrice` / `parsePrice` — Korean locale price formatting, input sanitization
- `formatTimeAgo` / `formatDate` — relative and absolute date formatting
- `getImageUrl` — converts relative API paths to absolute URLs
- `isValidImageUrl` — validates HTTP/relative image URLs
- `validateEmail`, `validateAccountname`, `validatePassword` — input validation
- `DEFAULT_PROFILE_IMAGE` — fallback avatar URL

Constants live in `src/constants/`:

- `url.js` — `BASE_URL`, `IMAGE_BASE_URL`
- `common.js` — `AI_DESC_SEPARATOR` (delimiter for parsing AI responses)

### Custom Hooks

`src/hooks/useForm.js` — Advanced form state management:

- Accepts field configs with validators and formatters
- Tracks dirty state, field-level errors, custom cross-field validation (e.g., password match)

### Page & Component Patterns

Pages use a consistent structure: fetch data on mount, show `<Spinner>` while loading, render content.

**Common layout components** (`src/components/common/`):

- `Header` — sticky top bar; 11 type variants (`"back-only"`, `"back-search"`, `"logo-search"`, `"search-input"`, etc.)
- `BottomTabNav` — fixed bottom navigation with 4 tabs; shows unread dot on Chat
- `BottomModal` — bottom sheet for action menus (edit/delete/report); items support `danger` flag
- `AlertModal` — centered confirmation dialog
- `Avatar` — circular profile image with fallback and click support
- `AuthInput` — bottom-border labeled input with error state
- `SubmitButton` — full-width primary button with disabled state
- `Spinner` — rotating ring loader
- `Divider` — configurable spacer
- `EmptyState` — empty list placeholder with optional icon/text
- `NotificationPanel` — full-page overlay showing posts with likes/comments
- `FullPagePanel` — reusable full-screen overlay panel with close button & title

**Feature components:**

- `PostCard` (`src/components/post/`) — post with image carousel (up to 3), pagination dots, like/comment, edit/delete/report modals
- `ProductCard` (`src/components/product/`) — product image, name, formatted price
- `UserItem` (`src/components/user/`) — user row with follow button and keyword highlight
- `ProfileInfo`, `ProfilePostSection`, `ProfileProductList`, `ProfileSettingsModal` (`src/components/profile/`) — modular sub-components used by the Profile page
- `GroupChatModal`, `InviteUserModal` (`src/components/chat/`) — group chat creation with user search

**Page list:**

| Page            | Route                                            |
| --------------- | ------------------------------------------------ |
| Splash          | `/`                                              |
| LoginMain       | `/login`                                         |
| LoginEmail      | `/login/email`                                   |
| SignUp          | `/signup`                                        |
| ProfileSetup    | `/signup/profile`                                |
| Feed            | `/feed`                                          |
| Search          | `/search`                                        |
| Profile         | `/profile/:accountname`                          |
| FollowList      | `/profile/:accountname/follower` · `/following`  |
| EditProfile     | `/profile/edit`                                  |
| ProductRegister | `/product/register` · `/product/edit/:productId` |
| PostCreate      | `/post/create` · `/post/edit/:postId`            |
| PostDetail      | `/post/:postId`                                  |
| ChatList        | `/chat`                                          |
| ChatRoom        | `/chat/:chatId`                                  |
| NotFound        | `/*`                                             |

`ProductRegister` and `PostCreate` accept an `isEdit` prop to switch between create and edit modes. Both pages include an **AI button** that calls `ai.js` to auto-generate product/post descriptions from an uploaded image.
