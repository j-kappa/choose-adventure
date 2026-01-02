import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StoryProvider } from './context/StoryContext';
import { FontSizeProvider } from './context/FontSizeContext';
import { FontFamilyProvider } from './context/FontFamilyContext';
import { Layout } from './components/Layout';
import { StoryLibrary } from './components/StoryLibrary';
import { StoryReader } from './components/StoryReader';
import { StoryBuilder } from './components/StoryBuilder';
import { Terms } from './components/Terms';
import { Admin } from './components/Admin';
import { ScrollToTop } from './components/ScrollToTop';

import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <FontFamilyProvider>
        <FontSizeProvider>
          <StoryProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<StoryLibrary />} />
                  <Route path="story/:storyId" element={<StoryReader />} />
                  <Route path="terms" element={<Terms />} />
                </Route>
                <Route path="builder" element={<StoryBuilder />} />
                <Route path="admin" element={<Admin />} />
              </Routes>
            </BrowserRouter>
          </StoryProvider>
        </FontSizeProvider>
      </FontFamilyProvider>
    </ThemeProvider>
  );
}

export default App;
