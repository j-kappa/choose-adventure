import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StoryProvider } from './context/StoryContext';
import { FontSizeProvider } from './context/FontSizeContext';
import { FontFamilyProvider } from './context/FontFamilyContext';
import { Layout } from './components/Layout';
import { StoryLibrary } from './components/StoryLibrary';
import { StoryReader } from './components/StoryReader';
import { Terms } from './components/Terms';

import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <FontFamilyProvider>
        <FontSizeProvider>
          <StoryProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<StoryLibrary />} />
                  <Route path="story/:storyId" element={<StoryReader />} />
                  <Route path="terms" element={<Terms />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </StoryProvider>
        </FontSizeProvider>
      </FontFamilyProvider>
    </ThemeProvider>
  );
}

export default App;
