import NotFound from './pages/NotFound/NotFound';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Spinner from './components/common/Spinner';

// Pages
import Splash from './pages/Splash/Splash';
import LoginMain from './pages/Login/LoginMain';
import LoginEmail from './pages/Login/LoginEmail';
import SignUp from './pages/SignUp/SignUp';
import ProfileSetup from './pages/SignUp/ProfileSetup';
import Feed from './pages/Feed/Feed';
import Search from './pages/Search/Search';
import Profile from './pages/Profile/Profile';
import FollowList from './pages/FollowList/FollowList';
import EditProfile from './pages/EditProfile/EditProfile';
import ProductRegister from './pages/ProductRegister/ProductRegister';
import PostCreate from './pages/PostCreate/PostCreate';
import PostDetail from './pages/PostDetail/PostDetail';
import ChatList from './pages/Chat/ChatList';
import ChatRoom from './pages/Chat/ChatRoom';

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
  );
};

export default App;
