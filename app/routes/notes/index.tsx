import { DocumentAddIcon } from "@heroicons/react/outline";

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="text-2xl font-bold">Welcome to notes!</div>
      <div className="flex items-center">
        Create a new note with&nbsp;
        <DocumentAddIcon className="h-5 w-5 pointer-events-none group-hover:stroke-green-600 dark:group-hover:stroke-green-200 display-inline" />
      </div>
    </div>
  );
}
