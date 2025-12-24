import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import { PATHS } from "../../routes/paths";

export default function PublicLayout() {
    const { login } = useAppSelector(state => state.app);

    if (login) {
        return <Navigate to={PATHS.DASHBOARD} replace />;
    }

    return <Outlet />;
}