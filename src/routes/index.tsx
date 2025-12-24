import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Root from "./root";
import { PATHS } from "./paths";
import PageLoader from "@/components/PageLoader";

// Lazy loading pages
const HomePage = lazy(() => import("@/pages/home/index"));
const LoginPage = lazy(() => import("@/pages/auth/login/index"));
const RegisterPage = lazy(() => import("@/pages/auth/register/index"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password/index"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password/index"));

const DashboardPage = lazy(() => import("@/pages/dashboard/index"));
const AssetsPage = lazy(() => import("@/pages/assets/index"));
const ProfilePage = lazy(() => import("@/pages/profile/index"));

import PrivateLayout from "@/layouts/PrivateLayout/index";
import PublicLayout from "@/layouts/PublicLayout/index";

export const router = createBrowserRouter([
    {
        path: PATHS.ROOT,
        element: (
            <Suspense fallback={<PageLoader />}>
                <Root />
            </Suspense>
        ),
        children: [
            {
                element: <PublicLayout />,
                children: [
                    {
                        path: PATHS.HOME,
                        element: <HomePage />
                    },
                    {
                        path: PATHS.LOGIN,
                        element: <LoginPage />
                    },
                    {
                        path: PATHS.REGISTER,
                        element: <RegisterPage />
                    },
                    {
                        path: PATHS.FORGOT_PASSWORD,
                        element: <ForgotPasswordPage />
                    },
                    {
                        path: PATHS.RESET_PASSWORD,
                        element: <ResetPasswordPage />
                    },
                ]
            },
            {
                element: <PrivateLayout />,
                children: [
                    {
                        path: PATHS.DASHBOARD,
                        element: <DashboardPage />
                    },
                    {
                        path: PATHS.ASSETS,
                        element: <AssetsPage />
                    },
                    {
                        path: PATHS.PROFILE,
                        element: <ProfilePage />
                    }
                ]
            },
            {
                path: PATHS.NOT_FOUND,
                element: <Navigate to={PATHS.ROOT} replace />
            }
        ]
    }
]);