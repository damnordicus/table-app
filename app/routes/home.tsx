
import { Outlet } from "react-router";

// export function meta({}: Route.MetaArgs) {
//   return [
//     { title: "New React Router App" },
//     { name: "description", content: "Welcome to React Router!" },
//   ];
// }

export const loader = async ({ params, request}) => {
 return {test: 'home'}
}

export default function Home() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
          </div>
        </header>
        <div className=" w-full space-y-6 px-4">
          <div className="rounded-xl ">
          </div>
        </div>
      </div>
      <Outlet />
    </main>
  );
}
