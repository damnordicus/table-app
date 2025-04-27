
import { Welcome } from "./welcome";

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
  return <Welcome />;
}
