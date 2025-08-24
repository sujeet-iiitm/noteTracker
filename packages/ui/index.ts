// packages/ui/index.ts
export * from "./contexts/AuthContext";
export * from "./contexts/ThemeContext";

export { default as LoginPage } from "./components/Auth/LoginPage";
export { default as SignupPage } from "./components/Auth/SignupPage";
export { default as ProtectedRoute } from "./components/Auth/ProtectedRoute";

export { default as DashboardLayout } from "./components/Layout/DashboardLayout";
export { default as Header } from "./components/Layout/Header";

export { default as Home } from "./components/Pages/Home";
export { default as Notes } from "./components/Pages/Notes";
export { default as User } from "./components/Pages/User";
export { Button } from "./components/Auth/Button";

