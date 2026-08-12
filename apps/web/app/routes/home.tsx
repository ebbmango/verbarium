import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verbarium" },
    {
      name: "description",
      content: "Learn Literary and Classical Chinese with Verbarium.",
    },
  ];
}

export default function Home() {
  return (
    <main>
      <h1>Verbarium</h1>
    </main>
  );
}
