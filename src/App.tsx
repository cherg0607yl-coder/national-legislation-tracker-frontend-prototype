import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { BillDetailPage } from "./pages/BillDetailPage";
import { PolicyExplorationPage } from "./pages/PolicyExplorationPage";
import { NcPolicyDesignPage } from "./pages/NcPolicyDesignPage";
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
              path="/policy-exploration"
              element={<PolicyExplorationPage />}
            />
            <Route path="/policy-design" element={<NcPolicyDesignPage />} />
            <Route path="/bills/:id" element={<BillDetailPage />} />
            <Route
              path="/about"
              element={
                <PlaceholderPage
                  title="About the Project"
                  description="The National Legislation Tracker helps researchers, legislators, and the public discover and compare state-level policy across four research themes."
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
