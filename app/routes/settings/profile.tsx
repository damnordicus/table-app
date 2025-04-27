import type { Route } from "../+types/home";

export default function Profile({loaderData}: Route.ComponentProps){
    const { test } = loaderData;
    return (
        <div>
            <p>test profile</p>
        </div>
    )
}