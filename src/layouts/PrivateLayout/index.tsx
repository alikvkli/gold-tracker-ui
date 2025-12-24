import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import { PATHS } from "../../routes/paths";

export default function PrivateLayout() {
    const { login } = useAppSelector(state => state.app);

    if (!login) {
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    return <Outlet />;
}