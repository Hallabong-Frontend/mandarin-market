import FeedHeader from './FeedHeader';
import SearchHeader from './SearchHeader';
import StandardHeader from './StandardHeader';

// type: 'back-only' | 'back-search' | 'back-more' | 'back-title' | 'back-title-more' |
//       'back-title-upload' | 'back-title-save' | 'back-title-text' | 'logo-search' |
//       'search-input' | 'back-search-more'
const Header = ({ type = 'back-title', ...props }) => {
  if (type === 'logo-search') return <FeedHeader {...props} />;
  if (type === 'search-input') return <SearchHeader {...props} />;
  return <StandardHeader type={type} {...props} />;
};

export default Header;
