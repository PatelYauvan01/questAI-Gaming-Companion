import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Discover } from "./pages/Discover";
import { Favorites } from "./pages/Favorites";
import { GameDetails } from "./pages/GameDetails";
import { Home } from "./pages/Home";
import { Library } from "./pages/Library";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="discover" element={<Discover />} />
        <Route path="library" element={<Library />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="game/:id" element={<GameDetails />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
