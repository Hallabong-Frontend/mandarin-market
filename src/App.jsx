import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Spinner from './components/common/Spinner';

// Pages (코드 스플리팅)
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const Splash = lazy(() => import('./pages/Splash/Splash'));
const LoginMain = lazy(() => import('./pages/Login/LoginMain'));
const LoginEmail = lazy(() => import('./pages/Login/LoginEmail'));
const SignUp = lazy(() => import('./pages/SignUp/SignUp'));
const ProfileSetup = lazy(() => import('./pages/SignUp/ProfileSetup'));
const Feed = lazy(() => import('./pages/Feed/Feed'));
const Search = lazy(() => import('./pages/Search/Search'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const FollowList = lazy(() => import('./pages/FollowList/FollowList'));
const EditProfile = lazy(() => import('./pages/EditProfile/EditProfile'));
const ProductRegister = lazy(() => import('./pages/ProductRegister/ProductRegister'));
const PostCreate = lazy(() => import('./pages/PostCreate/PostCreate'));
const PostDetail = lazy(() => import('./pages/PostDetail/PostDetail'));
const ChatList = lazy(() => import('./pages/Chat/ChatList'));
const ChatRoom = lazy(() => import('./pages/Chat/ChatRoom'));

// 인증 필요한 라우트
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner padding="40vh 0" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// 인증한 상태에서 접근 불가한 라우트 (로그인/회원가입)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner padding="40vh 0" />;
  if (isAuthenticated) return <Navigate to="/feed" replace />;
  return children;
};

const App = () => {
  return (
    <main>
      <Suspense fallback={<Spinner padding="40vh 0" />}>
        <Routes>
          {/* 스플래시 */}
          <Route path="/" element={<Splash />} />

          {/* 공개 라우트 */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginMain />
              </PublicRoute>
            }
          />
          <Route
            path="/login/email"
            element={
              <PublicRoute>
                <LoginEmail />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/signup/profile"
            element={
              <PublicRoute>
                <ProfileSetup />
              </PublicRoute>
            }
          />

          {/* 인증 필요 라우트 */}
          <Route
            path="/feed"
            element={
              <PrivateRoute>
                <Feed />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <Search />
              </PrivateRoute>
            }
          />

          {/* 프로필 */}
          <Route
            path="/profile/edit"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:accountname"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:accountname/follower"
            element={
              <PrivateRoute>
                <FollowList type="follower" />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:accountname/following"
            element={
              <PrivateRoute>
                <FollowList type="following" />
              </PrivateRoute>
            }
          />

          {/* 상품 */}
          <Route
            path="/product/register"
            element={
              <PrivateRoute>
                <ProductRegister />
              </PrivateRoute>
            }
          />
          <Route
            path="/product/edit/:productId"
            element={
              <PrivateRoute>
                <ProductRegister isEdit />
              </PrivateRoute>
            }
          />

          {/* 게시글 */}
          <Route
            path="/post/create"
            element={
              <PrivateRoute>
                <PostCreate />
              </PrivateRoute>
            }
          />
          <Route
            path="/post/edit/:postId"
            element={
              <PrivateRoute>
                <PostCreate isEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <PrivateRoute>
                <PostDetail />
              </PrivateRoute>
            }
          />

          {/* 채팅 */}
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatList />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <PrivateRoute>
                <ChatRoom />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
  );
};

export default App;
