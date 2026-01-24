import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import { PATHS } from "../../routes/paths";
import Sidebar from "@/components/Navigation/Sidebar";
import Footer from "@/components/Footer";

export default function PrivateLayout() {
    const { login } = useAppSelector(state => state.app);

    if (!login) {
        return <Navigate to={PATHS.HOME} replace />;
    }

    return (
        <div className="private-layout min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500/30">
            <Sidebar />
            <div className="content-wrapper flex flex-col min-h-screen transition-all duration-300">
                <main className="flex-1 pb-12 pt-8 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}