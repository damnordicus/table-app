import type { LoaderFunctionArgs } from "react-router";
import { Outlet } from "react-router";

export default function Layout(){
    return(
        <div>
            <p>test</p>
            <Outlet />
        </div>
    )
}