import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
export default function App() {
  return (
    <BrowserRouter>
      <div className="page-shell">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/about"
              element={
                <PlaceholderPage
                  title="About the Project"
                  description="The National Legislation Tracker helps researchers, legislators, and the public discover and compare state-level policy across four research themes."
                />
              }
            />
            <Route
              path="/bills/:id"
              element={
                <PlaceholderPage
                  title="Bill Detail"
                  description="Individual bill pages are not part of this prototype yet. The selected card route is reserved for a future detail layout."
                />
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
